import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from orders.models import Order

class PaymentSubmission(models.Model):
    class Provider(models.TextChoices):
        BKASH = 'BKASH', 'bKash'
        NAGAD = 'NAGAD', 'Nagad'
        BANK = 'BANK', 'Bank Transfer'
        COD = 'COD', 'Cash on Delivery'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending Verification'
        VERIFIED = 'VERIFIED', 'Verified & Confirmed'
        REJECTED = 'REJECTED', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payment_submissions')
    provider = models.CharField(max_length=20, choices=Provider.choices)
    transaction_id = models.CharField(max_length=100, db_index=True)
    sender_phone = models.CharField(max_length=30)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    receipt_image = models.ImageField(upload_to='receipts/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.provider} - TrxID: {self.transaction_id} (৳{self.amount}) [{self.status}]"


class CashCollection(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='cash_collection')
    amount_collected = models.DecimalField(max_digits=12, decimal_places=2)
    collected_by = models.CharField(max_length=150, help_text="Delivery rider or counter cashier name")
    collected_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Cash Collection for {self.order.order_number}: ৳{self.amount_collected}"
