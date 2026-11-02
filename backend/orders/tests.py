import uuid
from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User, UserRole
from catalog.models import Category, Product, ProductVariant
from coupons.models import Coupon
from orders.models import DeliveryZone, Order, OrderItem

class OrdersModuleTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer = User.objects.create_user(
            phone='01700000001',
            password='Password123!',
            full_name='Customer One',
            email='c1@example.com'
        )

        self.customer2 = User.objects.create_user(
            phone='01700000002',
            password='Password123!',
            full_name='Customer Two',
            email='c2@example.com'
        )

        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )

        self.category = Category.objects.create(name='Cakes', slug='cakes')
        self.product = Product.objects.create(
            category=self.category,
            name='Fresh Truffle Cake',
            slug='fresh-truffle-cake',
            base_price=Decimal('1000.00'),
            discount_price=Decimal('900.00'),
            stock_mode=Product.StockMode.STOCK_CONTROLLED,
            current_stock=10,
            is_available=True
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name='2 Pound',
            price=Decimal('1800.00')
        )

        self.zone_inside = DeliveryZone.objects.create(
            name='Inside Kushtia Town',
            code='INSIDE_KUSHTIA',
            fee=Decimal('50.00'),
            is_active=True
        )

        self.zone_outside = DeliveryZone.objects.create(
            name='Outside Kushtia Town',
            code='OUTSIDE_KUSHTIA',
            fee=Decimal('150.00'),
            is_active=True
        )

        self.coupon = Coupon.objects.create(
            code='TESTPROVA10',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('10.00'),
            is_active=True
        )

    def test_price_tampering_prevention(self):
        """
        CRITICAL SECURITY TEST:
        Client sends tampered unit_price = 1.00 for a ৳900 cake.
        Server MUST discard the client price and calculate using DB price (৳900.00).
        """
        payload = {
            'customer_name': 'Test Buyer',
            'customer_phone': '01712345678',
            'delivery_type': 'delivery',
            'delivery_zone_code': 'INSIDE_KUSHTIA',
            'delivery_address': 'Court Para, Kushtia',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': str(self.product.id),
                    'unit_price': '1.00',  # TAMPERED PRICE
                    'quantity': 2
                }
            ]
        }
        response = self.client.post('/api/v1/orders/orders/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_order = Order.objects.get(order_number=response.data['order_number'])
        # Subtotal must be 2 * 900 = 1800.00
        self.assertEqual(created_order.subtotal, Decimal('1800.00'))
        # Total must be 1800 + 50 (delivery) = 1850.00
        self.assertEqual(created_order.total, Decimal('1850.00'))

    def test_variant_pricing_enforcement(self):
        """Order with variant uses variant.price from DB."""
        payload = {
            'customer_name': 'Test Buyer',
            'customer_phone': '01712345678',
            'delivery_type': 'pickup',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': str(self.product.id),
                    'variant_id': str(self.variant.id),
                    'unit_price': '5.00',  # TAMPERED PRICE
                    'quantity': 1
                }
            ]
        }
        response = self.client.post('/api/v1/orders/orders/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_order = Order.objects.get(order_number=response.data['order_number'])
        self.assertEqual(created_order.subtotal, Decimal('1800.00'))
        self.assertEqual(created_order.delivery_fee, Decimal('0.00'))
        self.assertEqual(created_order.total, Decimal('1800.00'))

    def test_stock_deduction_on_order(self):
        """Stock controlled products deduct stock atomically."""
        initial_stock = self.product.current_stock
        payload = {
            'customer_name': 'Stock Buyer',
            'customer_phone': '01712345678',
            'delivery_type': 'pickup',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': str(self.product.id),
                    'unit_price': '900.00',
                    'quantity': 3
                }
            ]
        }
        response = self.client.post('/api/v1/orders/orders/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.product.refresh_from_db()
        self.assertEqual(self.product.current_stock, initial_stock - 3)

    def test_insufficient_stock_rejection(self):
        """Ordering more than current stock must be rejected."""
        payload = {
            'customer_name': 'Greedy Buyer',
            'customer_phone': '01712345678',
            'delivery_type': 'pickup',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': str(self.product.id),
                    'unit_price': '900.00',
                    'quantity': 999
                }
            ]
        }
        response = self.client.post('/api/v1/orders/orders/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_coupon_discount_calculation(self):
        """Order preview applies percentage discount accurately."""
        payload = {
            'customer_name': 'Coupon User',
            'customer_phone': '01712345678',
            'delivery_type': 'delivery',
            'delivery_zone_code': 'INSIDE_KUSHTIA',
            'delivery_address': 'Thanapara, Kushtia',
            'payment_method': 'cod',
            'coupon_code': 'TESTPROVA10',
            'items': [
                {
                    'product_id': str(self.product.id),
                    'unit_price': '900.00',
                    'quantity': 1
                }
            ]
        }
        response = self.client.post('/api/v1/orders/orders/preview/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # subtotal: 900, discount: 10% = 90.00, delivery: 50.00, total: 860.00
        self.assertEqual(response.data['subtotal'], '900.00')
        self.assertEqual(response.data['discount'], '90.00')
        self.assertEqual(response.data['delivery_fee'], '50.00')
        self.assertEqual(response.data['total'], '860.00')

    def test_order_idor_access_control(self):
        """
        SECURITY TEST:
        Customer A cannot view Customer B's order via direct GET /orders/<id>/.
        Anonymous user cannot view any order without phone-verified tracking.
        """
        # Create order belonging to Customer 1
        order = Order.objects.create(
            order_number='ORD-2026-TEST1',
            customer=self.customer,
            customer_name='Customer One',
            customer_phone='01700000001',
            delivery_address='Address 1',
            subtotal=Decimal('900.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('950.00'),
            payment_method=Order.PaymentMethod.COD,
            order_status=Order.OrderStatus.PLACED
        )

        # 1. Anonymous user blocked
        anon_client = APIClient()
        response = anon_client.get(f'/api/v1/orders/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Customer 2 blocked from Customer 1's order
        c2_client = APIClient()
        c2_client.force_authenticate(user=self.customer2)
        response = c2_client.get(f'/api/v1/orders/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # 3. Customer 1 can view own order
        c1_client = APIClient()
        c1_client.force_authenticate(user=self.customer)
        response = c1_client.get(f'/api/v1/orders/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Admin can view any order
        admin_client = APIClient()
        admin_client.force_authenticate(user=self.admin)
        response = admin_client.get(f'/api/v1/orders/orders/{order.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_order_tracking_endpoint(self):
        """Tracking endpoint allows guest tracking with valid order_number and phone."""
        order = Order.objects.create(
            order_number='ORD-2026-TRACK',
            customer_name='Guest Tracker',
            customer_phone='01988887777',
            delivery_address='Majampur, Kushtia',
            subtotal=Decimal('900.00'),
            delivery_fee=Decimal('50.00'),
            total=Decimal('950.00'),
            payment_method=Order.PaymentMethod.COD,
            order_status=Order.OrderStatus.PLACED
        )

        # Valid track
        response = self.client.post('/api/v1/orders/orders/track/', {
            'order_number': 'ORD-2026-TRACK',
            'phone': '01988887777'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['order_number'], 'ORD-2026-TRACK')

        # Invalid phone rejected
        response = self.client.post('/api/v1/orders/orders/track/', {
            'order_number': 'ORD-2026-TRACK',
            'phone': '01111111111'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
