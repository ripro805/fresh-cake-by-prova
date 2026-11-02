import uuid
import datetime
import random
from decimal import Decimal
from django.db import models
from django.conf import settings

class CustomCakeRequest(models.Model):
    class QuotationStatus(models.TextChoices):
        PENDING = 'Pending Review', 'Pending Review'
        QUOTATION_SENT = 'Quotation Sent', 'Quotation Sent'
        ACCEPTED = 'Accepted', 'Accepted by Customer'
        REJECTED = 'Rejected', 'Rejected'
        COMPLETED = 'Completed', 'Completed / Converted to Order'

    class DeliveryType(models.TextChoices):
        DELIVERY = 'delivery', 'Home Delivery (Kushtia)'
        PICKUP = 'pickup', 'Bakery Store Pickup'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    request_number = models.CharField(max_length=32, unique=True, db_index=True)
    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='custom_cake_requests'
    )
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=25, db_index=True)
    customer_email = models.EmailField(blank=True, default='')

    # Cake Specs
    occasion = models.CharField(max_length=150)
    cake_size = models.CharField(max_length=100)
    cake_flavor = models.CharField(max_length=150)
    cake_type = models.CharField(max_length=150, default='Custom Artisan Cake')
    cake_tiers = models.CharField(max_length=50, default='Single Tier')
    color_preference = models.CharField(max_length=150)
    custom_message = models.CharField(max_length=255, blank=True, default='')
    design_description = models.TextField()
    reference_image = models.ImageField(upload_to='custom_cakes/', blank=True, null=True)
    reference_image_url = models.CharField(max_length=500, blank=True, default='')

    # Delivery & Schedule
    delivery_type = models.CharField(
        max_length=20,
        choices=DeliveryType.choices,
        default=DeliveryType.DELIVERY
    )
    delivery_date = models.DateField()
    delivery_time = models.CharField(max_length=50, blank=True, default='Afternoon (2 PM - 6 PM)')
    delivery_address = models.TextField(blank=True, default='')

    # Quotation & Admin Section
    quotation_status = models.CharField(
        max_length=50,
        choices=QuotationStatus.choices,
        default=QuotationStatus.PENDING
    )
    quotation_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    admin_notes = models.TextField(blank=True, default='')
    customer_feedback = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.request_number} - {self.customer_name} ({self.occasion})"

    @classmethod
    def generate_request_number(cls):
        date_str = datetime.date.today().strftime('%Y%m%d')
        rand_suffix = ''.join(random.choices('0123456789', k=4))
        candidate = f"CR-{date_str}-{rand_suffix}"
        while cls.objects.filter(request_number=candidate).exists():
            rand_suffix = ''.join(random.choices('0123456789', k=4))
            candidate = f"CR-{date_str}-{rand_suffix}"
        return candidate
