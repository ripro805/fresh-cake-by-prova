from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from catalog.models import Category, Product
from inventory.models import Ingredient, FinishedGoodStock, StockMovement

class InventoryTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )

        self.ingredient = Ingredient.objects.create(
            name='All-Purpose Flour',
            unit=Ingredient.Unit.KG,
            current_stock=Decimal('4.00'),
            min_threshold=Decimal('10.00'),
            unit_cost=Decimal('65.00')
        )

        cat = Category.objects.create(name='Puffs', slug='puffs')
        self.product = Product.objects.create(
            category=cat,
            name='Cream Puff Box',
            slug='cream-puff-box',
            base_price=Decimal('350.00'),
            is_available=True
        )

        self.fg_stock = FinishedGoodStock.objects.create(
            product=self.product,
            current_quantity=12,
            reserved_quantity=2,
            min_threshold=5
        )

    def test_low_stock_property(self):
        # Current stock 4kg <= min threshold 10kg
        self.assertTrue(self.ingredient.is_low_stock)
        self.assertEqual(self.fg_stock.available_quantity, 10)
        self.assertFalse(self.fg_stock.is_low_stock)

    def test_restock_ingredient_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/v1/inventory/ingredients/{self.ingredient.id}/restock/', {
            'quantity': '20.00',
            'notes': 'Wholesale flour sack purchase'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.ingredient.refresh_from_db()
        self.assertEqual(self.ingredient.current_stock, Decimal('24.00'))
        self.assertFalse(self.ingredient.is_low_stock)

        # Check movement log
        movement = StockMovement.objects.filter(ingredient=self.ingredient).first()
        self.assertIsNotNone(movement)
        self.assertEqual(movement.movement_type, StockMovement.MovementType.RESTOCK)
        self.assertEqual(movement.quantity, Decimal('20.00'))

    def test_adjust_finished_goods_stock(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/v1/inventory/finished-goods/{self.fg_stock.id}/adjust/', {
            'quantity': 25,
            'reason': 'Fresh morning baking batch'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.fg_stock.refresh_from_db()
        self.assertEqual(self.fg_stock.current_quantity, 25)
