from rest_framework import serializers
from .models import CustomCakeRequest

class CustomCakeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomCakeRequest
        fields = [
            'id', 'request_number', 'customer', 'customer_name', 'customer_phone', 'customer_email',
            'occasion', 'cake_size', 'cake_flavor', 'cake_type', 'cake_tiers',
            'color_preference', 'custom_message', 'design_description',
            'reference_image', 'reference_image_url', 'delivery_type', 'delivery_date',
            'delivery_time', 'delivery_address', 'quotation_status', 'quotation_amount',
            'admin_notes', 'customer_feedback', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'request_number', 'created_at', 'updated_at']


class CustomCakeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomCakeRequest
        fields = [
            'customer_name', 'customer_phone', 'customer_email',
            'occasion', 'cake_size', 'cake_flavor', 'cake_type', 'cake_tiers',
            'color_preference', 'custom_message', 'design_description',
            'reference_image_url', 'delivery_type', 'delivery_date',
            'delivery_time', 'delivery_address'
        ]


class AdminSendQuotationSerializer(serializers.Serializer):
    quotation_amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=1)
    admin_notes = serializers.CharField(required=False, allow_blank=True, default='')


class CustomerRespondQuotationSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['accept', 'reject'])
    feedback = serializers.CharField(required=False, allow_blank=True, default='')
