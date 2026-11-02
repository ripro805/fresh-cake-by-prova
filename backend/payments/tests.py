from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from orders.models import Order
from payments.models import PaymentSubmission, CashCollection

class PaymentsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )

        self.customer = User.objects.create_user(
            phone='01733334444',
            password='Password123!',
            full_name='Test Buyer'
        )

        self.order = Order.objects.create(
            order_number='ORD-PAY-001',
            customer=self.customer,
            customer_name='Test Buyer',
            customer_phone='01733334444',
            delivery_address='Kushtia Town',
            subtotal=Decimal('1200.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('1250.00'),
            payment_method=Order.PaymentMethod.BKASH,
            payment_status=Order.PaymentStatus.PENDING,
            order_status=Order.OrderStatus.PLACED
        )

    def test_payment_submission_creation(self):
        payload = {
            'order': str(self.order.id),
            'provider': PaymentSubmission.Provider.BKASH,
            'transaction_id': 'BKASH987654321',
            'sender_phone': '01733334444',
            'amount': '1250.00'
        }
        response = self.client.post('/api/v1/payments/submissions/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], PaymentSubmission.Status.PENDING)

    def test_admin_payment_verification(self):
        submission = PaymentSubmission.objects.create(
            order=self.order,
            provider=PaymentSubmission.Provider.BKASH,
            transaction_id='BKASH11223344',
            sender_phone='01733334444',
            amount=Decimal('1250.00'),
            status=PaymentSubmission.Status.PENDING
        )

        # Non-admin forbidden
        self.client.force_authenticate(user=self.customer)
        res = self.client.post(f'/api/v1/payments/submissions/{submission.id}/verify/', {
            'action': 'verify'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Admin verifies payment
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/v1/payments/submissions/{submission.id}/verify/', {
            'action': 'verify'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        submission.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(submission.status, PaymentSubmission.Status.VERIFIED)
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.VERIFIED)
        self.assertEqual(self.order.order_status, Order.OrderStatus.CONFIRMED)
        self.assertEqual(self.order.payment_trx_id, 'BKASH11223344')

    def test_admin_payment_rejection(self):
        submission = PaymentSubmission.objects.create(
            order=self.order,
            provider=PaymentSubmission.Provider.NAGAD,
            transaction_id='NAGAD00000000',
            sender_phone='01733334444',
            amount=Decimal('1250.00'),
            status=PaymentSubmission.Status.PENDING
        )

        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/v1/payments/submissions/{submission.id}/verify/', {
            'action': 'reject',
            'rejection_reason': 'TrxID does not exist on statement'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        submission.refresh_from_db()
        self.order.refresh_from_db()

        self.assertEqual(submission.status, PaymentSubmission.Status.REJECTED)
        self.assertEqual(self.order.payment_status, Order.PaymentStatus.FAILED)

    def test_cash_collection_workflow(self):
        cod_order = Order.objects.create(
            order_number='ORD-COD-001',
            customer_name='Cash Customer',
            customer_phone='01855556666',
            delivery_address='Thana Mor',
            subtotal=Decimal('600.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('650.00'),
            payment_method=Order.PaymentMethod.COD,
            payment_status=Order.PaymentStatus.PENDING,
            order_status=Order.OrderStatus.PREPARING
        )

        self.client.force_authenticate(user=self.admin)
        payload = {
            'order': str(cod_order.id),
            'amount_collected': '650.00',
            'collected_by': 'Rider Shakib',
            'notes': 'Exact change received'
        }
        res = self.client.post('/api/v1/payments/cash-collections/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        cod_order.refresh_from_db()
        self.assertEqual(cod_order.payment_status, Order.PaymentStatus.VERIFIED)
        self.assertEqual(cod_order.order_status, Order.OrderStatus.DELIVERED)
