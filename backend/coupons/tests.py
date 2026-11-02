from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from coupons.models import Coupon

class CouponsTestCase(TestCase):
    def setUp(self):
        self.pct_coupon = Coupon.objects.create(
            code='PROVA15',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('15.00'),
            min_order_amount=Decimal('1000.00'),
            max_discount_amount=Decimal('300.00'),
            is_active=True
        )

        self.fixed_coupon = Coupon.objects.create(
            code='SAVE100',
            discount_type=Coupon.DiscountType.FIXED,
            discount_value=Decimal('100.00'),
            min_order_amount=Decimal('500.00'),
            is_active=True
        )

    def test_coupon_min_order_amount_enforcement(self):
        # ৳800 is below ৳1000 minimum
        is_valid, msg = self.pct_coupon.is_valid_for(Decimal('800.00'))
        self.assertFalse(is_valid)
        self.assertIn('Minimum order amount', msg)

        # ৳1200 meets minimum
        is_valid, msg = self.pct_coupon.is_valid_for(Decimal('1200.00'))
        self.assertTrue(is_valid)

    def test_percentage_discount_calculation_and_cap(self):
        # 15% of ৳1200 = ৳180.00
        disc = self.pct_coupon.calculate_discount(Decimal('1200.00'))
        self.assertEqual(disc, Decimal('180.00'))

        # 15% of ৳3000 = ৳450.00, capped at max_discount_amount ৳300.00
        disc_capped = self.pct_coupon.calculate_discount(Decimal('3000.00'))
        self.assertEqual(disc_capped, Decimal('300.00'))

    def test_fixed_discount_calculation(self):
        disc = self.fixed_coupon.calculate_discount(Decimal('600.00'))
        self.assertEqual(disc, Decimal('100.00'))
