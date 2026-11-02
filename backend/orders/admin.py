from django.contrib import admin
from .models import DeliveryZone, Order, OrderItem, OrderTimelineItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name_snapshot', 'variant_snapshot', 'flavor_snapshot', 'unit_price', 'quantity', 'line_total')

class OrderTimelineInline(admin.TabularInline):
    model = OrderTimelineItem
    extra = 1

@admin.register(DeliveryZone)
class DeliveryZoneAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'fee', 'estimated_time', 'is_active', 'sort_order')
    list_editable = ('fee', 'is_active', 'sort_order')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'customer_phone', 'total', 'payment_method', 'payment_status', 'order_status', 'created_at')
    list_filter = ('order_status', 'payment_status', 'payment_method', 'delivery_type')
    search_fields = ('order_number', 'customer_name', 'customer_phone', 'payment_trx_id')
    readonly_fields = ('order_number', 'created_at', 'updated_at')
    inlines = [OrderItemInline, OrderTimelineInline]
