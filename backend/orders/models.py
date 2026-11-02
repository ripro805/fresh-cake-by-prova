import uuid
import datetime
import random
from decimal import Decimal
from django.db import models
from django.conf import settings
from catalog.models import Product, ProductVariant

class DeliveryZone(models.Model):
    class ZoneCode(models.TextChoices):
        PICKUP = 'PICKUP', 'Store Pickup (Kushtia Bakery Point - ৳0)'
        INSIDE_KUSHTIA = 'INSIDE_KUSHTIA', 'Inside Kushtia Town (Standard Delivery)'
        OUTSIDE_KUSHTIA = 'OUTSIDE_KUSHTIA', 'Outside Kushtia Town (Surrounding Suburbs)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50, choices=ZoneCode.choices, unique=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    estimated_time = models.CharField(max_length=100, default='Same Day / 2-4 Hours')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order', 'fee']

    def __str__(self):
        return f"{self.name} (৳{self.fee})"


class Order(models.Model):
    class OrderStatus(models.TextChoices):
        PLACED = 'Order Placed', 'Order Placed'
        CONFIRMED = 'Order Confirmed', 'Order Confirmed'
        PREPARING = 'Preparing', 'Preparing in Kitchen'
        READY = 'Ready for Delivery', 'Ready for Delivery / Pickup'
        OUT_FOR_DELIVERY = 'Out for Delivery', 'Out for Delivery'
        DELIVERED = 'Delivered', 'Delivered'
        CANCELLED = 'Cancelled', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        COD = 'cod', 'Cash on Delivery (COD)'
        BKASH = 'bkash', 'bKash (Personal / Merchant)'
        NAGAD = 'nagad', 'Nagad'
        BANK = 'bank', 'Bank Transfer'

    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending Verification'
        VERIFIED = 'verified', 'Payment Verified'
        FAILED = 'failed', 'Payment Failed / Rejected'

    class DeliveryType(models.TextChoices):
        DELIVERY = 'delivery', 'Home / Doorstep Delivery'
        PICKUP = 'pickup', 'Bakery Store Pickup'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=40, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=25, db_index=True)
    customer_email = models.EmailField(blank=True, null=True)

    delivery_type = models.CharField(
        max_length=20,
        choices=DeliveryType.choices,
        default=DeliveryType.DELIVERY
    )
    delivery_zone = models.ForeignKey(
        DeliveryZone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='orders'
    )
    delivery_address = models.TextField(blank=True, default='')
    delivery_area = models.CharField(max_length=150, blank=True, default='')
    delivery_instructions = models.TextField(blank=True, default='')
    order_notes = models.TextField(blank=True, default='')

    # Monetary values
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total = models.DecimalField(max_digits=12, decimal_places=2)

    # Payment details
    payment_method = models.CharField(
        max_length=20,
        choices=PaymentMethod.choices,
        default=PaymentMethod.COD
    )
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )
    payment_trx_id = models.CharField(max_length=100, blank=True, default='')
    payment_sender_phone = models.CharField(max_length=30, blank=True, default='')

    # Status & Life cycle
    order_status = models.CharField(
        max_length=50,
        choices=OrderStatus.choices,
        default=OrderStatus.PLACED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.order_number} - {self.customer_name} (৳{self.total})"

    @classmethod
    def generate_order_number(cls):
        date_str = datetime.date.today().strftime('%Y%m%d')
        rand_suffix = ''.join(random.choices('0123456789', k=4))
        candidate = f"FC-{date_str}-{rand_suffix}"
        while cls.objects.filter(order_number=candidate).exists():
            rand_suffix = ''.join(random.choices('0123456789', k=4))
            candidate = f"FC-{date_str}-{rand_suffix}"
        return candidate


class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name='order_items')
    product_name_snapshot = models.CharField(max_length=255)
    variant_snapshot = models.CharField(max_length=150, blank=True, default='')
    flavor_snapshot = models.CharField(max_length=150, blank=True, default='')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.product_name_snapshot} ({self.variant_snapshot})"


class OrderTimelineItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='timeline')
    status = models.CharField(max_length=100)
    timestamp = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.order.order_number} - {self.status} at {self.timestamp}"
