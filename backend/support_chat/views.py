import os
import hmac
import hashlib
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from audit.models import AuditLog
from .models import (
    SupportConversation,
    SupportMessage,
    WhatsAppConfiguration,
    ConversationStatus,
    MessageSenderType,
    MessageDeliveryStatus
)
from .serializers import (
    SupportConversationSerializer,
    SupportConversationCreateSerializer,
    SupportMessageSerializer,
    SupportMessageCreateSerializer,
    WhatsAppConfigurationSerializer
)
from .whatsapp_service import WhatsAppService

class SupportConversationViewSet(viewsets.GenericViewSet):
    """
    Customer & Guest Support Conversation Management.
    Provides session-isolated chat creation, message posting, and live reply polling.
    """
    queryset = SupportConversation.objects.prefetch_related('messages').all()
    serializer_class = SupportConversationSerializer
    permission_classes = [permissions.AllowAny]

    def get_conversation_for_request(self, lookup_val, request):
        """Lookup conversation ensuring strict customer session isolation."""
        conv = SupportConversation.objects.filter(
            reference__iexact=lookup_val
        ).first() or SupportConversation.objects.filter(id=lookup_val).first()

        if not conv:
            return None

        # Check permissions: Owner Admin has access to all
        if request.user.is_authenticated and getattr(request.user, 'role', '') == 'OWNER_ADMIN':
            return conv

        # Authenticated customer
        if request.user.is_authenticated and conv.customer == request.user:
            return conv

        # Guest with session_key
        req_session = (
            request.headers.get('X-Support-Session-Key')
            or request.META.get('HTTP_X_SUPPORT_SESSION_KEY')
            or request.query_params.get('session_key')
            or (request.data.get('session_key') if isinstance(request.data, dict) else None)
        )
        if conv.session_key and req_session and conv.session_key == req_session:
            return conv

        return None

    @extend_schema(summary="Create a new support conversation with initial enquiry")
    def create(self, request):
        serializer = SupportConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        config = WhatsAppService.get_config()
        ref = SupportConversation.generate_unique_reference()

        customer = request.user if request.user.is_authenticated else None
        guest_name = data.get('guest_name', '')
        guest_phone = data.get('guest_phone', '')
        guest_email = data.get('guest_email', '')
        session_key = (
            data.get('session_key')
            or request.headers.get('X-Support-Session-Key')
            or request.META.get('HTTP_X_SUPPORT_SESSION_KEY')
            or ''
        )

        conv = SupportConversation.objects.create(
            reference=ref,
            customer=customer,
            guest_name=guest_name,
            guest_phone=guest_phone,
            guest_email=guest_email,
            session_key=session_key,
            assigned_whatsapp_number=config.destination_admin_number,
            status=ConversationStatus.OPEN
        )

        # Initial message
        msg_text = data['initial_message'].strip()
        msg = SupportMessage.objects.create(
            conversation=conv,
            sender_type=MessageSenderType.CUSTOMER,
            sender_name=conv.customer_display_name,
            text=msg_text,
            delivery_status=MessageDeliveryStatus.SENT
        )

        # Forward to Owner Admin's WhatsApp
        WhatsAppService.forward_customer_message(conv, msg)

        return Response(SupportConversationSerializer(conv).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Retrieve conversation details and messages")
    def retrieve(self, request, pk=None):
        conv = self.get_conversation_for_request(pk, request)
        if not conv:
            return Response(
                {"detail": "Conversation not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(SupportConversationSerializer(conv).data)

    @extend_schema(summary="Post additional customer message to active conversation")
    @action(detail=True, methods=['post'], url_path='messages')
    def add_message(self, request, pk=None):
        conv = self.get_conversation_for_request(pk, request)
        if not conv:
            return Response(
                {"detail": "Conversation not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = SupportMessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        text = serializer.validated_data['text'].strip()

        msg = SupportMessage.objects.create(
            conversation=conv,
            sender_type=MessageSenderType.CUSTOMER,
            sender_name=conv.customer_display_name,
            text=text,
            delivery_status=MessageDeliveryStatus.SENT
        )

        conv.last_message_at = timezone.now()
        conv.status = ConversationStatus.OPEN
        conv.save(update_fields=['last_message_at', 'status'])

        # Forward to admin's WhatsApp
        WhatsAppService.forward_customer_message(conv, msg)

        return Response(SupportMessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Poll for latest messages (real-time chat synchronization)")
    @action(detail=True, methods=['get'], url_path='poll')
    def poll_messages(self, request, pk=None):
        conv = self.get_conversation_for_request(pk, request)
        if not conv:
            return Response(
                {"detail": "Conversation not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = conv.messages.all().order_by('created_at')
        return Response({
            "status": conv.status,
            "last_message_at": conv.last_message_at,
            "messages": SupportMessageSerializer(messages, many=True).data
        })


class AdminSupportViewSet(viewsets.ModelViewSet):
    """
    Owner Admin Conversation Management Hub.
    Full visibility over all customer support threads, WhatsApp routing, and resolution state.
    """
    queryset = SupportConversation.objects.prefetch_related('messages').select_related('customer').all()
    serializer_class = SupportConversationSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    def get_queryset(self):
        qs = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param and status_param != 'all':
            qs = qs.filter(status=status_param.upper())
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                reference__icontains=search
            ) | qs.filter(
                guest_name__icontains=search
            ) | qs.filter(
                guest_phone__icontains=search
            ) | qs.filter(
                customer__full_name__icontains=search
            )
        return qs

    @extend_schema(summary="Admin sends direct reply message from dashboard")
    @action(detail=True, methods=['post'], url_path='reply')
    def admin_reply(self, request, pk=None):
        conv = self.get_object()
        text = request.data.get('text', '').strip()
        if not text:
            return Response({"error": "Message text is required."}, status=status.HTTP_400_BAD_REQUEST)

        msg = SupportMessage.objects.create(
            conversation=conv,
            sender_type=MessageSenderType.ADMIN,
            sender_name="Owner Admin (Dashboard)",
            text=text,
            delivery_status=MessageDeliveryStatus.DELIVERED
        )
        conv.last_message_at = timezone.now()
        conv.save(update_fields=['last_message_at'])

        return Response(SupportMessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Mark conversation as resolved")
    @action(detail=True, methods=['post'], url_path='resolve')
    def mark_resolved(self, request, pk=None):
        conv = self.get_object()
        conv.status = ConversationStatus.RESOLVED
        conv.save(update_fields=['status'])
        return Response({"status": "Conversation marked as resolved."})

    @extend_schema(summary="Reopen conversation")
    @action(detail=True, methods=['post'], url_path='reopen')
    def reopen(self, request, pk=None):
        conv = self.get_object()
        conv.status = ConversationStatus.OPEN
        conv.save(update_fields=['status'])
        return Response({"status": "Conversation reopened."})


class WhatsAppSettingsView(APIView):
    """
    Owner Admin WhatsApp Live Chat Settings.
    Controls destination admin number, support hours, and welcome/offline messaging.
    """
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    def get(self, request):
        config = WhatsAppService.get_config()
        serializer = WhatsAppConfigurationSerializer(config)
        return Response(serializer.data)

    def patch(self, request):
        config = WhatsAppService.get_config()
        old_number = config.destination_admin_number
        serializer = WhatsAppConfigurationSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_config = serializer.save(updated_by=request.user)

        new_number = updated_config.destination_admin_number
        if old_number != new_number:
            AuditLog.objects.create(
                action='UPDATE_WHATSAPP_NUMBER',
                model_name='WhatsAppConfiguration',
                object_id=str(config.id),
                changes={
                    'previous_number': old_number,
                    'new_number': new_number,
                    'note': 'Future customer support messages will route to the new WhatsApp number.'
                },
                user=request.user
            )

        return Response(WhatsAppConfigurationSerializer(updated_config).data)


class WhatsAppWebhookView(APIView):
    """
    Meta WhatsApp Cloud API Webhook Endpoint.
    GET: Handles Meta Webhook Verification Challenge.
    POST: Processes incoming WhatsApp replies and delivery updates from the Owner Admin.
    """
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        mode = request.query_params.get('hub.mode')
        token = request.query_params.get('hub.verify_token')
        challenge = request.query_params.get('hub.challenge')

        expected_token = os.getenv('WHATSAPP_VERIFY_TOKEN', 'freshcake_webhook_token_2026')

        if mode == 'subscribe' and token == expected_token:
            return HttpResponse(challenge, content_type='text/plain')
        return HttpResponse('Verification token mismatch', status=403)

    def post(self, request):
        payload = request.data

        # Optional Meta HMAC signature verification
        app_secret = os.getenv('WHATSAPP_APP_SECRET')
        if app_secret:
            sig_header = request.headers.get('X-Hub-Signature-256', '')
            if sig_header.startswith('sha256='):
                raw_body = request.body
                expected_sig = 'sha256=' + hmac.new(
                    app_secret.encode('utf-8'),
                    raw_body,
                    hashlib.sha256
                ).hexdigest()
                if not hmac.compare_digest(sig_header, expected_sig):
                    return Response({"error": "Signature verification failed."}, status=status.HTTP_403_FORBIDDEN)

        res = WhatsAppService.process_incoming_webhook(payload)
        return Response(res, status=status.HTTP_200_OK)
