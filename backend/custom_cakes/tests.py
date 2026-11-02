import datetime
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from catalog.models import Category, Product
from custom_cakes.models import CustomCakeRequest
from orders.models import DeliveryZone, Order

class CustomCakesTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            phone='01722223333',
            password='Password123!',
            full_name='Cake Lover',
            email='cakelover@example.com'
        )

        self.customer2 = User.objects.create_user(
            phone='01744445555',
            password='Password123!',
            full_name='Other Person'
        )

        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )

        cat = Category.objects.create(name='Base', slug='base')
        self.product = Product.objects.create(
            category=cat,
            name='Default Artisan Cake',
            slug='default-artisan-cake',
            base_price=Decimal('1000.00'),
            is_available=True
        )

        self.zone = DeliveryZone.objects.create(
            name='Inside Kushtia Town',
            code='INSIDE_KUSHTIA',
            fee=Decimal('50.00'),
            is_active=True
        )

    def test_custom_cake_submission(self):
        payload = {
            'customer_name': 'Birthday Boy',
            'customer_phone': '01799998888',
            'occasion': '1st Birthday Celebration',
            'cake_size': '2 Pound',
            'cake_flavor': 'Vanilla Berry',
            'color_preference': 'Pastel Blue',
            'design_description': 'Teddy bear themed artisan fondant cake',
            'delivery_type': 'delivery',
            'delivery_date': str(datetime.date.today() + datetime.timedelta(days=3))
        }
        response = self.client.post('/api/v1/custom-cakes/requests/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('request_number', response.data)
        self.assertEqual(response.data['quotation_status'], 'Pending Review')

    def test_admin_send_quotation(self):
        req = CustomCakeRequest.objects.create(
            request_number='CR-20261026-1111',
            customer_name='Cake Buyer',
            customer_phone='01799998888',
            occasion='Anniversary',
            cake_size='2 Pound',
            cake_flavor='Red Velvet',
            color_preference='Ruby Red',
            design_description='Rose petals cascade',
            delivery_date=datetime.date.today() + datetime.timedelta(days=2)
        )

        # Non-admin cannot send quotation
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/custom-cakes/requests/{req.id}/send-quotation/', {
            'quotation_amount': '2500.00',
            'admin_notes': 'Custom sugar flowers included'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can send quotation
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/v1/custom-cakes/requests/{req.id}/send-quotation/', {
            'quotation_amount': '2500.00',
            'admin_notes': 'Custom sugar flowers included'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.quotation_status, CustomCakeRequest.QuotationStatus.QUOTATION_SENT)
        self.assertEqual(req.quotation_amount, Decimal('2500.00'))

    def test_customer_accept_and_convert_to_order(self):
        """Accepted quotation can be converted into an official order."""
        req = CustomCakeRequest.objects.create(
            request_number='CR-20261026-2222',
            customer=self.customer,
            customer_name='Cake Lover',
            customer_phone='01722223333',
            occasion='Wedding Reception',
            cake_size='3 Tier (5 Pound)',
            cake_flavor='Belgian Truffle',
            color_preference='Ivory & Gold',
            design_description='Gold leaf accents',
            delivery_date=datetime.date.today() + datetime.timedelta(days=5),
            delivery_type=CustomCakeRequest.DeliveryType.DELIVERY,
            delivery_address='Disha Tower, Kushtia',
            quotation_status=CustomCakeRequest.QuotationStatus.QUOTATION_SENT,
            quotation_amount=Decimal('5500.00')
        )

        # 1. Customer accepts quotation
        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/custom-cakes/requests/{req.id}/respond/', {
            'action': 'accept',
            'feedback': 'Looks fantastic! Proceed please.'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        req.refresh_from_db()
        self.assertEqual(req.quotation_status, CustomCakeRequest.QuotationStatus.ACCEPTED)

        # 2. Convert to Order
        order_res = self.client.post(f'/api/v1/custom-cakes/requests/{req.id}/create-order/', {
            'payment_method': 'cod',
            'delivery_zone_code': 'INSIDE_KUSHTIA'
        }, format='json')
        self.assertEqual(order_res.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', order_res.data)

        # Order totals check: 5500 + 50 (delivery) = 5550.00
        created_order = Order.objects.get(order_number=order_res.data['order_number'])
        self.assertEqual(created_order.subtotal, Decimal('5500.00'))
        self.assertEqual(created_order.delivery_fee, Decimal('50.00'))
        self.assertEqual(created_order.total, Decimal('5550.00'))

        # Request status becomes Completed
        req.refresh_from_db()
        self.assertEqual(req.quotation_status, CustomCakeRequest.QuotationStatus.COMPLETED)

    def test_unaccepted_quotation_cannot_be_ordered(self):
        """
        SECURITY & BUSINESS RULE:
        Orders CANNOT be placed for unaccepted custom cake quotations (e.g. Pending Review).
        """
        req = CustomCakeRequest.objects.create(
            request_number='CR-20261026-3333',
            customer=self.customer,
            customer_name='Cake Lover',
            customer_phone='01722223333',
            occasion='Graduation',
            cake_size='1 Pound',
            cake_flavor='Vanilla',
            color_preference='Blue',
            design_description='Cap and diploma',
            delivery_date=datetime.date.today() + datetime.timedelta(days=2),
            quotation_status=CustomCakeRequest.QuotationStatus.PENDING,
            quotation_amount=None
        )

        self.client.force_authenticate(user=self.customer)
        response = self.client.post(f'/api/v1/custom-cakes/requests/{req.id}/create-order/', {
            'payment_method': 'cod'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Cannot create order', response.data['error'])
