from django.contrib import admin
from .models import StoreSettings, HeroBanner

@admin.register(StoreSettings)
class StoreSettingsAdmin(admin.ModelAdmin):
    list_display = ('store_name', 'brand_signature', 'phone', 'is_store_open', 'updated_at')

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'badge', 'sort_order', 'is_active')
    list_editable = ('sort_order', 'is_active')
