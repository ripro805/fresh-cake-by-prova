import uuid
from decimal import Decimal
from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    tagline = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    image_url = models.CharField(max_length=500, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['sort_order', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    class StockMode(models.TextChoices):
        MADE_TO_ORDER = 'MADE_TO_ORDER', 'Made to Order / Freshly Baked'
        STOCK_CONTROLLED = 'STOCK_CONTROLLED', 'Stock Controlled / Daily Batch'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    cake_type = models.CharField(max_length=100, blank=True, help_text="e.g. Celebration Cakes, Tub Cakes, Mart Cakes")
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    prep_time = models.CharField(max_length=100, blank=True, default='Same Day / 4 Hours')
    stock_mode = models.CharField(
        max_length=30,
        choices=StockMode.choices,
        default=StockMode.MADE_TO_ORDER
    )
    current_stock = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('5.00'))
    review_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-is_bestseller', '-created_at']

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    @property
    def price(self):
        """Current effective price (discount_price if available, else base_price)."""
        return self.discount_price if self.discount_price is not None else self.base_price

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class ProductImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=255, blank=True)
    is_primary = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['-is_primary', 'sort_order']

    def __str__(self):
        return f"Image for {self.product.name}"

    @property
    def url(self):
        if self.image:
            return self.image.url
        return self.image_url


class ProductVariant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100, help_text="e.g. 1 Pound (Serves 4-6), Box of 6")
    price = models.DecimalField(max_digits=10, decimal_places=2)
    sku = models.CharField(max_length=50, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta:
        ordering = ['price']

    def __str__(self):
        return f"{self.product.name} - {self.name} (৳{self.price})"


class ProductFlavor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='flavors')
    name = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.product.name})"
