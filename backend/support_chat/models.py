import uuid
import random
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _

class ConversationStatus(models.TextChoices):
    OPEN = 'OPEN', _('Open')
    RESOLVED = 'RESOLVED', _('Resolved')
    CLOSED = 'CLOSED', _('Closed')

class MessageSenderType(models.TextChoices):
    CUSTOMER = 'CUSTOMER', _('Customer')
    ADMIN = 'ADMIN', _('Owner Admin')
    SYSTEM = 'SYSTEM', _('System Notice')

class MessageDeliveryStatus(models.TextChoices):
    PENDING = 'PENDING', _('Pending')
    SENT = 'SENT', _('Sent')
    DELIVERED = 'DELIVERED', _('Delivered')
    READ = 'READ', _('Read')
    FAILED = 'FAILED', _('Failed')


class WhatsAppConfiguration(models.Model):
    """
    Singleton configuration for WhatsApp Live Customer Support.
    Stores owner admin destination number, hours, and dynamic messages.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    destination_admin_number = models.CharField(
        max_length=30,
        default='+8801308516242',
        help_text=_("Admin WhatsApp destination number in E.164 format (+880...)")
    )
    is_enabled = models.BooleanField(default=True, help_text=_("Enable/disable two-way WhatsApp live support"))
    support_hours = models.CharField(
        max_length=150,
        default='10:00 AM - 10:00 PM (Daily)',
        help_text=_("Display hours for live bakery customer support")
    )
    welcome_message = models.TextField(
        default='Welcome to FRESH CAKE by PROVA live bakery support! How can we make your celebration special today?',
        help_text=_("Initial greeting shown to customer in the chat window")
    )
    offline_message = models.TextField(
        default='Our bakery studio is currently closed for the night. Please leave your details and we will reply promptly in the morning!',
        help_text=_("Notice shown when enquiry is sent outside business support hours")
    )
    auto_response_enabled = models.BooleanField(default=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_whatsapp_configs'
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('WhatsApp Support Configuration')
        verbose_name_plural = _('WhatsApp Support Configurations')

    def __str__(self):
        status = "Active" if self.is_enabled else "Disabled"
        return f"WhatsApp Support [{status}] -> {self.destination_admin_number}"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        return obj


class SupportConversation(models.Model):
    """
    A two-way live customer support conversation thread.
    Synchronized between customer on the website and owner admin on WhatsApp.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text=_("Unique conversation reference tag, e.g. FC-1024")
    )
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='support_conversations'
    )
    guest_name = models.CharField(max_length=150, blank=True)
    guest_phone = models.CharField(max_length=30, blank=True)
    guest_email = models.CharField(max_length=255, blank=True)
    session_key = models.CharField(
        max_length=64,
        db_index=True,
        blank=True,
        help_text=_("Cryptographic session secret for guest customer message isolation")
    )
    status = models.CharField(
        max_length=20,
        choices=ConversationStatus.choices,
        default=ConversationStatus.OPEN,
        db_index=True
    )
    assigned_whatsapp_number = models.CharField(
        max_length=30,
        help_text=_("Snapshot of destination admin WhatsApp number routing this conversation")
    )
    last_message_at = models.DateTimeField(auto_now_add=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _('Support Conversation')
        verbose_name_plural = _('Support Conversations')
        ordering = ['-last_message_at']

    def __str__(self):
        name = self.customer_display_name
        return f"{self.reference} ({name}) [{self.status}]"

    @property
    def customer_display_name(self):
        if self.customer:
            return self.customer.full_name or self.customer.phone
        return self.guest_name or "Bakery Guest"

    @property
    def customer_contact(self):
        if self.customer:
            return self.customer.phone or self.customer.email or ""
        return self.guest_phone or self.guest_email or ""

    @classmethod
    def generate_unique_reference(cls):
        while True:
            num = random.randint(1000, 9999)
            ref = f"FC-{num}"
            if not cls.objects.filter(reference=ref).exists():
                return ref


class SupportMessage(models.Model):
    """
    Individual message in a support conversation.
    Tracks sender, content, delivery status, and Meta WhatsApp Cloud API message ID.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        SupportConversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender_type = models.CharField(
        max_length=20,
        choices=MessageSenderType.choices,
        db_index=True
    )
    sender_name = models.CharField(max_length=150, blank=True)
    text = models.TextField()
    external_whatsapp_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True,
        help_text=_("Meta WhatsApp Cloud API wamid message ID for deduplication and status tracking")
    )
    delivery_status = models.CharField(
        max_length=20,
        choices=MessageDeliveryStatus.choices,
        default=MessageDeliveryStatus.SENT,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        verbose_name = _('Support Message')
        verbose_name_plural = _('Support Messages')
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.sender_type}] {self.conversation.reference}: {self.text[:30]}"


class WhatsAppWebhookLog(models.Model):
    """
    Audit log of raw incoming Meta WhatsApp webhook events.
    Guarantees replay protection, idempotency, and debugging visibility.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event_type = models.CharField(max_length=100)
    sender_phone = models.CharField(max_length=30, blank=True)
    raw_payload = models.JSONField(default=dict)
    signature_verified = models.BooleanField(default=False)
    is_processed = models.BooleanField(default=False)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('WhatsApp Webhook Log')
        verbose_name_plural = _('WhatsApp Webhook Logs')
        ordering = ['-created_at']

    def __str__(self):
        return f"Webhook {self.event_type} at {self.created_at}"
