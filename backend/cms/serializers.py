from rest_framework import serializers
from .models import StoreSettings, HeroBanner

class StoreSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreSettings
        fields = [
            'store_name', 'brand_signature', 'tagline', 'announcement_bar',
            'phone', 'whatsapp_number', 'email', 'address',
            'baking_house_address', 'pickup_point_address',
            'currency', 'delivery_charge_inside', 'delivery_charge_outside', 'delivery_charge_pickup',
            'bkash_number', 'nagad_number', 'bank_details',
            'is_store_open', 'social_instagram', 'social_facebook', 'updated_at'
        ]


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = ['id', 'badge', 'title', 'subtitle', 'cta_text', 'cta_link', 'secondary_cta_text', 'secondary_cta_link', 'image_url', 'is_active', 'sort_order']
