from decimal import Decimal
from django.db.models import Sum, Count
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from orders.models import Order
from payments.models import CashCollection
from .models import ExpenseCategory, Expense
from .serializers import ExpenseCategorySerializer, ExpenseSerializer

class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('category').all()
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    @extend_schema(summary="Get complete bakery financial P&L summary")
    @action(detail=False, methods=['get'])
    def summary(self, request):
        # 1. Total recognized revenue (orders with payment verified or status delivered)
        revenue_qs = Order.objects.filter(
            payment_status=Order.PaymentStatus.VERIFIED
        )
        total_revenue = revenue_qs.aggregate(total=Sum('total'))['total'] or Decimal('0.00')

        # 2. Total all placed orders gross value
        all_orders_value = Order.objects.exclude(order_status='Cancelled').aggregate(total=Sum('total'))['total'] or Decimal('0.00')

        # 3. Cash collected directly
        total_cash_collected = CashCollection.objects.aggregate(total=Sum('amount_collected'))['total'] or Decimal('0.00')

        # 4. Total expenses
        total_expenses = Expense.objects.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # 5. Expenses by category
        categories_breakdown = []
        for cat in ExpenseCategory.objects.all():
            cat_sum = cat.expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            categories_breakdown.append({
                'id': str(cat.id),
                'name': cat.name,
                'amount': str(cat_sum)
            })

        # 6. Profit metrics
        net_profit = total_revenue - total_expenses

        # 7. Operational order metrics
        order_counts = Order.objects.values('order_status').annotate(count=Count('id'))
        status_counts = {item['order_status']: item['count'] for item in order_counts}
        total_order_count = Order.objects.count()

        return Response({
            'recognized_revenue': str(total_revenue),
            'all_orders_gross_value': str(all_orders_value),
            'cash_collected': str(total_cash_collected),
            'total_expenses': str(total_expenses),
            'net_profit': str(net_profit),
            'categories_breakdown': categories_breakdown,
            'total_orders': total_order_count,
            'status_counts': status_counts,
            'currency': '৳'
        })
