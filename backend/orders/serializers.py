from decimal import Decimal
from rest_framework import serializers
from .models import DeliveryZone, Order, OrderItem, OrderTimelineItem
from catalog.models import Product, ProductVariant

class DeliveryZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryZone
        fields = ['id', 'name', 'code', 'fee', 'estimated_time', 'is_active', 'sort_order']


class OrderTimelineItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderTimelineItem
        fields = ['id', 'status', 'timestamp', 'note']


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name_snapshot', 'variant_snapshot',
            'flavor_snapshot', 'unit_price', 'quantity', 'line_total'
        ]


class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.CharField()
    variant_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    variant_name = serializers.CharField(required=False, allow_blank=True, default='')
    flavor_name = serializers.CharField(required=False, allow_blank=True, default='')
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField(min_value=1)


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    timeline = OrderTimelineItemSerializer(many=True, read_only=True)
    delivery_zone_details = DeliveryZoneSerializer(source='delivery_zone', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_name', 'customer_phone',
            'customer_email', 'delivery_type', 'delivery_zone', 'delivery_zone_details',
            'delivery_address', 'delivery_area', 'delivery_instructions', 'order_notes',
            'subtotal', 'delivery_fee', 'discount', 'total',
            'payment_method', 'payment_status', 'payment_trx_id', 'payment_sender_phone',
            'order_status', 'timeline', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(max_length=255)
    customer_phone = serializers.CharField(max_length=25)
    customer_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    delivery_type = serializers.ChoiceField(choices=Order.DeliveryType.choices, default=Order.DeliveryType.DELIVERY)
    delivery_zone_code = serializers.CharField(required=False, allow_blank=True, default='INSIDE_KUSHTIA')
    delivery_address = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_area = serializers.CharField(required=False, allow_blank=True, default='')
    delivery_instructions = serializers.CharField(required=False, allow_blank=True, default='')
    order_notes = serializers.CharField(required=False, allow_blank=True, default='')
    payment_method = serializers.ChoiceField(choices=Order.PaymentMethod.choices, default=Order.PaymentMethod.COD)
    payment_trx_id = serializers.CharField(required=False, allow_blank=True, default='')
    payment_sender_phone = serializers.CharField(required=False, allow_blank=True, default='')
    coupon_code = serializers.CharField(required=False, allow_blank=True, default='')
    items = OrderItemCreateSerializer(many=True)

    def validate(self, attrs):
        if not attrs.get('items'):
            raise serializers.ValidationError({"items": "Order must contain at least one item."})
        
        # If delivery, require address
        if attrs.get('delivery_type') == Order.DeliveryType.DELIVERY:
            if not attrs.get('delivery_address', '').strip():
                raise serializers.ValidationError({"delivery_address": "Delivery address is required for home delivery."})

        # If bKash or Nagad, TrxID is required
        payment_method = attrs.get('payment_method')
        if payment_method in ['bkash', 'nagad']:
            if not attrs.get('payment_trx_id', '').strip():
                raise serializers.ValidationError({"payment_trx_id": f"Transaction ID (TrxID) is required for {payment_method.upper()} payment."})
            if not attrs.get('payment_sender_phone', '').strip():
                raise serializers.ValidationError({"payment_sender_phone": f"Sender phone number is required for {payment_method.upper()} payment."})

        return attrs


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.OrderStatus.choices)
    note = serializers.CharField(required=False, allow_blank=True, default='')
