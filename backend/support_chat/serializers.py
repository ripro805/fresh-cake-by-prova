from rest_framework import serializers
from .models import (
    SupportConversation,
    SupportMessage,
    WhatsAppConfiguration,
    MessageSenderType,
    ConversationStatus
)

class SupportMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportMessage
        fields = [
            'id',
            'sender_type',
            'sender_name',
            'text',
            'delivery_status',
            'created_at'
        ]
        read_only_fields = ['id', 'delivery_status', 'created_at']


class SupportConversationSerializer(serializers.ModelSerializer):
    messages = SupportMessageSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer_display_name', read_only=True)
    customer_contact = serializers.ReadOnlyField()

    class Meta:
        model = SupportConversation
        fields = [
            'id',
            'reference',
            'customer_name',
            'customer_contact',
            'status',
            'assigned_whatsapp_number',
            'last_message_at',
            'created_at',
            'messages'
        ]
        read_only_fields = [
            'id',
            'reference',
            'assigned_whatsapp_number',
            'last_message_at',
            'created_at'
        ]


class SupportConversationCreateSerializer(serializers.Serializer):
    guest_name = serializers.CharField(required=False, allow_blank=True, default='')
    guest_phone = serializers.CharField(required=False, allow_blank=True, default='')
    guest_email = serializers.EmailField(required=False, allow_blank=True, default='')
    session_key = serializers.CharField(required=False, allow_blank=True, default='')
    initial_message = serializers.CharField(required=False, allow_blank=True, default='')
    message = serializers.CharField(required=False, allow_blank=True, default='')

    def validate(self, attrs):
        msg = attrs.get('initial_message') or attrs.get('message')
        if not msg or not msg.strip():
            raise serializers.ValidationError({"message": "Message text is required."})
        attrs['initial_message'] = msg.strip()
        return attrs


class SupportMessageCreateSerializer(serializers.Serializer):
    text = serializers.CharField(required=True)
    session_key = serializers.CharField(required=False, allow_blank=True, default='')


class WhatsAppConfigurationSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppConfiguration
        fields = [
            'destination_admin_number',
            'is_enabled',
            'support_hours',
            'welcome_message',
            'offline_message',
            'auto_response_enabled',
            'updated_at'
        ]
        read_only_fields = ['updated_at']

    def validate_destination_admin_number(self, value):
        cleaned = value.strip().replace(' ', '').replace('-', '')
        if not cleaned:
            raise serializers.ValidationError("WhatsApp destination number cannot be empty.")
        if not cleaned.startswith('+') and not cleaned.startswith('880') and not cleaned.startswith('01'):
            raise serializers.ValidationError("Please provide a valid E.164 phone number, e.g. +8801700000000.")
        return value
