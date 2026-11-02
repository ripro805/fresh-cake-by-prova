from rest_framework import serializers
from .models import PaymentSubmission, CashCollection

class PaymentSubmissionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    customer_name = serializers.CharField(source='order.customer_name', read_only=True)
    customer_phone = serializers.CharField(source='order.customer_phone', read_only=True)
    order_total = serializers.DecimalField(source='order.total', max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PaymentSubmission
        fields = [
            'id', 'order', 'order_number', 'customer_name', 'customer_phone',
            'order_total', 'provider', 'transaction_id', 'sender_phone', 'amount',
            'receipt_image', 'status', 'verified_at', 'rejection_reason', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'verified_at', 'rejection_reason', 'created_at']


class VerifyPaymentSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=['verify', 'reject'])
    rejection_reason = serializers.CharField(required=False, allow_blank=True, default='')


class CashCollectionSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)

    class Meta:
        model = CashCollection
        fields = ['id', 'order', 'order_number', 'amount_collected', 'collected_by', 'collected_at', 'notes']
