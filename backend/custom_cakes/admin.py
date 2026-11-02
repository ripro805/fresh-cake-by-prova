from django.contrib import admin
from .models import CustomCakeRequest

@admin.register(CustomCakeRequest)
class CustomCakeRequestAdmin(admin.ModelAdmin):
    list_display = ('request_number', 'customer_name', 'customer_phone', 'occasion', 'cake_size', 'delivery_date', 'quotation_status', 'quotation_amount')
    list_filter = ('quotation_status', 'occasion', 'delivery_type')
    search_fields = ('request_number', 'customer_name', 'customer_phone', 'design_description')
    readonly_fields = ('request_number', 'created_at', 'updated_at')
