import uuid
from decimal import Decimal
from django.db import models
from django.utils import timezone

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage (%)'
        FIXED = 'FIXED', 'Fixed Amount (৳)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices, default=DiscountType.PERCENTAGE)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    used_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == self.DiscountType.PERCENTAGE else '৳'})"

    def is_valid_for(self, amount: Decimal):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is currently inactive."
        if self.valid_from and now < self.valid_from:
            return False, "This coupon has not started yet."
        if self.valid_until and now > self.valid_until:
            return False, "This coupon has expired."
        if self.usage_limit and self.used_count >= self.usage_limit:
            return False, "This coupon usage limit has been reached."
        if amount < self.min_order_amount:
            return False, f"Minimum order amount for this coupon is ৳{self.min_order_amount}."
        return True, "Coupon is valid."

    def calculate_discount(self, amount: Decimal) -> Decimal:
        if self.discount_type == self.DiscountType.PERCENTAGE:
            calc = (amount * (self.discount_value / Decimal('100.00'))).quantize(Decimal('0.01'))
            if self.max_discount_amount and calc > self.max_discount_amount:
                return self.max_discount_amount
            return calc
        else:
            return min(self.discount_value, amount)
