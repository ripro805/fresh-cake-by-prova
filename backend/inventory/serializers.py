from rest_framework import serializers
from .models import Ingredient, FinishedGoodStock, StockMovement

class IngredientSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'category', 'unit', 'current_stock', 'min_threshold', 'unit_cost', 'is_low_stock', 'created_at', 'updated_at']


class FinishedGoodStockSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_category = serializers.CharField(source='product.category.name', read_only=True)
    available_quantity = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = FinishedGoodStock
        fields = ['id', 'product', 'product_name', 'product_category', 'current_quantity', 'reserved_quantity', 'available_quantity', 'min_threshold', 'is_low_stock', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.SerializerMethodField()

    class Meta:
        model = StockMovement
        fields = ['id', 'ingredient', 'finished_good', 'item_name', 'movement_type', 'quantity', 'reference', 'notes', 'created_at']

    def get_item_name(self, obj):
        if obj.ingredient:
            return f"Raw: {obj.ingredient.name}"
        if obj.finished_good:
            return f"Product: {obj.finished_good.product.name}"
        return "Unknown"
