from rest_framework import serializers
from .models import ExpenseCategory, Expense

class ExpenseCategorySerializer(serializers.ModelSerializer):
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, required=False)

    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'total_expenses']


class ExpenseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Expense
        fields = ['id', 'category', 'category_name', 'title', 'amount', 'payment_method', 'date', 'receipt_image', 'notes', 'created_at']
