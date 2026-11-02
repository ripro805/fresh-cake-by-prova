import uuid
from decimal import Decimal
from django.db import models
from catalog.models import Product, ProductVariant

class Ingredient(models.Model):
    class Unit(models.TextChoices):
        KG = 'kg', 'Kilogram (kg)'
        G = 'g', 'Gram (g)'
        L = 'l', 'Liter (L)'
        ML = 'ml', 'Milliliter (ml)'
        PCS = 'pcs', 'Pieces (pcs)'
        BOX = 'box', 'Boxes (box)'
        PKT = 'pkt', 'Packets (pkt)'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=150, unique=True)
    category = models.CharField(max_length=100, default='Baking Essentials')
    unit = models.CharField(max_length=20, choices=Unit.choices, default=Unit.KG)
    current_stock = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    min_threshold = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('5.00'))
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), help_text="Cost per unit in BDT")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.current_stock} {self.unit})"

    @property
    def is_low_stock(self):
        return self.current_stock <= self.min_threshold


class FinishedGoodStock(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.OneToOneField(Product, on_delete=models.CASCADE, related_name='inventory_stock')
    current_quantity = models.PositiveIntegerField(default=10)
    reserved_quantity = models.PositiveIntegerField(default=0)
    min_threshold = models.PositiveIntegerField(default=3)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Finished Goods Stocks'

    def __str__(self):
        return f"{self.product.name} - Stock: {self.available_quantity}"

    @property
    def available_quantity(self):
        return max(0, self.current_quantity - self.reserved_quantity)

    @property
    def is_low_stock(self):
        return self.available_quantity <= self.min_threshold


class StockMovement(models.Model):
    class MovementType(models.TextChoices):
        RESTOCK = 'RESTOCK', 'Restock / Purchase In'
        PRODUCTION = 'PRODUCTION', 'Used in Production'
        ORDER_DISPATCH = 'ORDER_DISPATCH', 'Order Dispatched'
        SPOILAGE = 'SPOILAGE', 'Spoilage / Quality Discard'
        ADJUSTMENT = 'ADJUSTMENT', 'Inventory Adjustment'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True, related_name='movements')
    finished_good = models.ForeignKey(FinishedGoodStock, on_delete=models.CASCADE, null=True, blank=True, related_name='movements')
    movement_type = models.CharField(max_length=30, choices=MovementType.choices)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    reference = models.CharField(max_length=150, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        item_name = self.ingredient.name if self.ingredient else (self.finished_good.product.name if self.finished_good else "Unknown")
        return f"{self.movement_type}: {self.quantity} for {item_name} at {self.created_at}"
