from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from catalog.models import Category, Product
from orders.models import Order, OrderItem
from reviews.models import ProductReview

class ReviewsTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            phone='01777778888',
            password='Password123!',
            full_name='Verified Buyer'
        )

        cat = Category.objects.create(name='Puffs', slug='puffs')
        self.product = Product.objects.create(
            category=cat,
            name='Lotus Biscoff Dream Tub Cake',
            slug='lotus-biscoff-dream-tub-cake',
            base_price=Decimal('650.00'),
            is_available=True
        )

    def test_review_verified_purchase_true(self):
        # Create a delivered order for this customer with this product
        order = Order.objects.create(
            order_number='ORD-DELIV-1',
            customer=self.customer,
            customer_name='Verified Buyer',
            customer_phone='01777778888',
            delivery_address='Kushtia',
            subtotal=Decimal('650.00'),
            total=Decimal('700.00'),
            payment_status=Order.PaymentStatus.VERIFIED,
            order_status=Order.OrderStatus.DELIVERED
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            product_name_snapshot=self.product.name,
            unit_price=Decimal('650.00'),
            quantity=1,
            line_total=Decimal('650.00')
        )

        self.client.force_authenticate(user=self.customer)
        res = self.client.post('/api/v1/reviews/', {
            'product': str(self.product.id),
            'rating': 5,
            'comment': 'Outstanding crunch and velvety texture!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data['is_verified'])

    def test_review_without_delivered_order_unverified(self):
        # Customer without delivered order
        new_customer = User.objects.create_user(
            phone='01788889999',
            password='Password123!',
            full_name='Non Purchaser'
        )
        self.client.force_authenticate(user=new_customer)
        res = self.client.post('/api/v1/reviews/', {
            'product': str(self.product.id),
            'rating': 4,
            'comment': 'Looks delicious in photos!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertFalse(res.data['is_verified'])
