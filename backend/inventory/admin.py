from django.contrib import admin
from .models import Ingredient, FinishedGoodStock, StockMovement

@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'current_stock', 'unit', 'min_threshold', 'unit_cost')
    list_filter = ('category', 'unit')
    search_fields = ('name',)

@admin.register(FinishedGoodStock)
class FinishedGoodStockAdmin(admin.ModelAdmin):
    list_display = ('product', 'current_quantity', 'reserved_quantity', 'min_threshold')

@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ('movement_type', 'quantity', 'reference', 'created_at')
    list_filter = ('movement_type',)
