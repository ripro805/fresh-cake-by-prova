import os
import re
import json
import logging
import urllib.request
import urllib.error
from django.utils import timezone
from .models import (
    WhatsAppConfiguration,
    SupportConversation,
    SupportMessage,
    MessageSenderType,
    MessageDeliveryStatus,
    ConversationStatus,
    WhatsAppWebhookLog
)

logger = logging.getLogger(__name__)

class WhatsAppService:
    """
    Service implementing Meta WhatsApp Business Cloud API integration.
    Handles:
    1. Forwarding customer website messages to the configured Owner Admin WhatsApp number.
    2. Processing incoming webhook replies from the Owner Admin directly via WhatsApp.
    3. Parsing conversation references (e.g., 'FC-1024 | reply text') and matching to conversations.
    """

    @classmethod
    def get_config(cls) -> WhatsAppConfiguration:
        return WhatsAppConfiguration.get_solo()

    @classmethod
    def normalize_phone(cls, phone: str) -> str:
        """Strip spaces, dashes, parentheses and ensure consistent digits."""
        digits = re.sub(r'\D', '', phone)
        # Normalize Bangladesh numbers: 017... -> 88017...
        if digits.startswith('01') and len(digits) == 11:
            digits = '88' + digits
        return digits

    @classmethod
    def is_admin_phone(cls, phone: str) -> bool:
        """Check if incoming phone number matches authorized admin WhatsApp destination number."""
        config = cls.get_config()
        configured_norm = cls.normalize_phone(config.destination_admin_number)
        incoming_norm = cls.normalize_phone(phone)
        return (
            configured_norm == incoming_norm or 
            incoming_norm.endswith(configured_norm[-10:])
        )

    @classmethod
    def forward_customer_message(cls, conversation: SupportConversation, message: SupportMessage) -> bool:
        """
        Forward a customer's website chatbot message to the Owner Admin's WhatsApp.
        """
        config = cls.get_config()
        if not config.is_enabled:
            logger.info("WhatsApp live support is disabled in store settings.")
            return False

        destination_number = cls.normalize_phone(config.destination_admin_number)
        customer_name = conversation.customer_display_name
        customer_contact = conversation.customer_contact or "Website Guest"

        # Outbound notification format with explicit conversation reference
        text_body = (
            f"🎂 *[FRESH CAKE by PROVA — Customer Support]*\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"📌 *Ref:* `{conversation.reference}`\n"
            f"👤 *Customer:* {customer_name}\n"
            f"📞 *Contact:* {customer_contact}\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"💬 *Customer Message:*\n"
            f"\"{message.text}\"\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"👉 *To Reply Directly:* Send message starting with:\n"
            f"*{conversation.reference} | Your reply here*"
        )

        # Meta WhatsApp Cloud API credentials
        api_token = os.getenv('WHATSAPP_ACCESS_TOKEN', '').strip()
        phone_number_id = os.getenv('WHATSAPP_PHONE_NUMBER_ID', '').strip()
        api_version = os.getenv('WHATSAPP_API_VERSION', 'v21.0').strip()

        if not api_token or not phone_number_id:
            logger.info(f"Meta WhatsApp Cloud API credentials not configured in .env. Message {conversation.reference} stored in PostgreSQL.")
            message.delivery_status = MessageDeliveryStatus.SENT
            message.save(update_fields=['delivery_status'])
            return False

        url = f"https://graph.facebook.com/{api_version}/{phone_number_id}/messages"
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": destination_number,
            "type": "text",
            "text": {
                "preview_url": False,
                "body": text_body
            }
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "Authorization": f"Bearer {api_token}",
                    "Content-Type": "application/json"
                },
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                wamid = res_data.get('messages', [{}])[0].get('id')
                message.external_whatsapp_id = wamid
                message.delivery_status = MessageDeliveryStatus.DELIVERED
                message.save(update_fields=['external_whatsapp_id', 'delivery_status'])
                logger.info(f"Successfully forwarded message to admin WhatsApp [{destination_number}], wamid: {wamid}")
                return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message via Meta Cloud API: {e}")
            message.delivery_status = MessageDeliveryStatus.FAILED
            message.save(update_fields=['delivery_status'])
            return False

    @classmethod
    def process_incoming_webhook(cls, payload: dict) -> dict:
        """
        Process incoming webhook from Meta WhatsApp Business Cloud API.
        Extracts admin replies and maps them to customer conversations.
        """
        WhatsAppWebhookLog.objects.create(
            event_type='meta_webhook_received',
            raw_payload=payload,
            signature_verified=True,
            is_processed=False
        )

        entries = payload.get('entry', [])
        processed_count = 0

        for entry in entries:
            changes = entry.get('changes', [])
            for change in changes:
                value = change.get('value', {})
                
                # 1. Handle incoming messages
                messages = value.get('messages', [])
                for msg in messages:
                    sender = msg.get('from', '')
                    msg_id = msg.get('id', '')
                    msg_type = msg.get('type', '')

                    # Deduplication check
                    if SupportMessage.objects.filter(external_whatsapp_id=msg_id).exists():
                        logger.info(f"Duplicate WhatsApp message {msg_id} already processed. Skipping.")
                        continue

                    # Text messages only
                    if msg_type == 'text':
                        text = msg.get('text', {}).get('body', '').strip()

                        # Verify sender is authorized admin WhatsApp number
                        if not cls.is_admin_phone(sender):
                            logger.warning(f"Unauthorized sender {sender} attempted to post admin reply. Ignored.")
                            continue

                        # Extract conversation reference: 'FC-1024 | reply' or 'FC-1024: reply' or 'FC-1024 - reply'
                        match = re.match(r'^(FC-\d+)\s*[|:\-]\s*(.+)$', text, re.DOTALL | re.IGNORECASE)
                        if match:
                            ref = match.group(1).upper()
                            reply_text = match.group(2).strip()

                            conv = SupportConversation.objects.filter(reference=ref).first()
                            if conv:
                                SupportMessage.objects.create(
                                    conversation=conv,
                                    sender_type=MessageSenderType.ADMIN,
                                    sender_name="Owner Admin (WhatsApp)",
                                    text=reply_text,
                                    external_whatsapp_id=msg_id,
                                    delivery_status=MessageDeliveryStatus.DELIVERED
                                )
                                conv.last_message_at = timezone.now()
                                conv.status = ConversationStatus.OPEN
                                conv.save(update_fields=['last_message_at', 'status'])
                                processed_count += 1
                                logger.info(f"Admin WhatsApp reply successfully routed to conversation {ref}!")
                        else:
                            logger.info(f"Admin WhatsApp message did not contain reference format (e.g. FC-1024 | reply). Content: {text}")

                # 2. Handle delivery status updates
                statuses = value.get('statuses', [])
                for status_item in statuses:
                    wamid = status_item.get('id')
                    status_val = status_item.get('status')
                    if wamid and status_val:
                        mapped_status = None
                        if status_val == 'delivered':
                            mapped_status = MessageDeliveryStatus.DELIVERED
                        elif status_val == 'read':
                            mapped_status = MessageDeliveryStatus.READ
                        elif status_val == 'failed':
                            mapped_status = MessageDeliveryStatus.FAILED

                        if mapped_status:
                            SupportMessage.objects.filter(external_whatsapp_id=wamid).update(
                                delivery_status=mapped_status
                            )

        return {"status": "success", "processed_replies": processed_count}
