import uuid
from django.db import models
from catalog.models import Product

class ProductReview(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    customer_name = models.CharField(max_length=150)
    customer_phone = models.CharField(max_length=30, blank=True, default='')
    rating = models.PositiveSmallIntegerField(default=5)
    comment = models.TextField()
    is_verified = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.customer_name} on {self.product.name} ({self.rating}★)"
