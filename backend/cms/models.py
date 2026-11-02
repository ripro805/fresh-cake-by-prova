import uuid
from decimal import Decimal
from django.db import models

class StoreSettings(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    store_name = models.CharField(max_length=100, default='FRESH CAKE')
    brand_signature = models.CharField(max_length=100, default='by PROVA')
    tagline = models.CharField(max_length=255, default='Every Celebration Deserves a Sweeter Story.')
    announcement_bar = models.CharField(max_length=255, default='Freshly Baked in Kushtia — Order Artisan Cakes, Brioche Donuts & Hot Momos!')
    phone = models.CharField(max_length=30, default='01308516242')
    whatsapp_number = models.CharField(max_length=30, default='01308516242')
    email = models.EmailField(default='contact@freshcakebyprova.com')
    address = models.CharField(max_length=255, default='Upazila Road, Indra Mor, Kushtia, Bangladesh')
    baking_house_address = models.CharField(max_length=255, default='Upazila Road, Indra Mor, Kushtia, Bangladesh')
    pickup_point_address = models.CharField(max_length=255, default='Upazila Mor, Disha Tower, Kushtia, Bangladesh')
    currency = models.CharField(max_length=10, default='৳')
    delivery_charge_inside = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('50.00'))
    delivery_charge_outside = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('150.00'))
    delivery_charge_pickup = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    bkash_number = models.CharField(max_length=30, default='01308516242')
    nagad_number = models.CharField(max_length=30, default='01308516242')
    bank_details = models.TextField(blank=True, default='City Bank / Eastern Bank (Available upon request)')
    is_store_open = models.BooleanField(default=True)
    social_instagram = models.URLField(blank=True, default='https://instagram.com/')
    social_facebook = models.URLField(blank=True, default='https://facebook.com/')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Store Settings'
        verbose_name_plural = 'Store Settings'

    def __str__(self):
        return f"{self.store_name} {self.brand_signature} Settings"

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(id='00000000-0000-0000-0000-000000000001')
        return settings


class HeroBanner(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    badge = models.CharField(max_length=100, default='Artisan Patisserie & Bakery')
    title = models.CharField(max_length=255)
    subtitle = models.TextField()
    cta_text = models.CharField(max_length=50, default='Order Fresh Cake')
    cta_link = models.CharField(max_length=100, default='/shop')
    secondary_cta_text = models.CharField(max_length=50, default='Custom Cake Wizard')
    secondary_cta_link = models.CharField(max_length=100, default='/custom-cake')
    image_url = models.CharField(max_length=500, default='/images/hero_cake.jpg')
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.title
