import datetime
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from finance.models import ExpenseCategory, Expense
from orders.models import Order

class FinanceTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )
        self.customer = User.objects.create_user(
            phone='01755556666',
            password='Password123!',
            full_name='Regular Customer'
        )

        # 1. Verified Order Revenue (৳2500)
        Order.objects.create(
            order_number='ORD-REV-1',
            customer_name='Buyer 1',
            customer_phone='01711111111',
            delivery_address='Kushtia',
            subtotal=Decimal('2450.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('2500.00'),
            payment_status=Order.PaymentStatus.VERIFIED,
            order_status=Order.OrderStatus.CONFIRMED
        )

        # 2. Unverified/Pending Order (৳1000) - Should NOT count in recognized revenue
        Order.objects.create(
            order_number='ORD-REV-2',
            customer_name='Buyer 2',
            customer_phone='01722222222',
            delivery_address='Kushtia',
            subtotal=Decimal('950.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('1000.00'),
            payment_status=Order.PaymentStatus.PENDING,
            order_status=Order.OrderStatus.PLACED
        )

        # 3. Expenses (৳800 + ৳300 = ৳1100)
        self.cat_dairy = ExpenseCategory.objects.create(name='Dairy & Butter')
        self.cat_packaging = ExpenseCategory.objects.create(name='Cake Boxes & Packaging')

        Expense.objects.create(
            category=self.cat_dairy,
            title='Anchor Butter 2kg',
            amount=Decimal('800.00'),
            date=datetime.date.today()
        )
        Expense.objects.create(
            category=self.cat_packaging,
            title='Gold Cake Boards 50pcs',
            amount=Decimal('300.00'),
            date=datetime.date.today()
        )

    def test_finance_summary_p_and_l(self):
        """
        FINANCIAL INTEGRITY TEST:
        Recognized Revenue = ৳2500.00
        Total Expenses = ৳1100.00
        Net Profit = 2500.00 - 1100.00 = ৳1400.00
        """
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/finance/expenses/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.data['recognized_revenue'], '2500.00')
        self.assertEqual(response.data['total_expenses'], '1100.00')
        self.assertEqual(response.data['net_profit'], '1400.00')

    def test_customer_cannot_access_finance(self):
        """Non-admin customer must be forbidden from accessing financial metrics."""
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/v1/finance/expenses/summary/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
