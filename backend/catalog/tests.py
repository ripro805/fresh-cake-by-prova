from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from catalog.models import Category, Product, ProductVariant

class CatalogTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category = Category.objects.create(
            name='Celebration Cakes',
            slug='celebration-cakes',
            description='Handcrafted celebration cakes'
        )

        self.product = Product.objects.create(
            category=self.category,
            name='Royal Belgian Chocolate Fudge Cake',
            slug='royal-belgian-chocolate-fudge-cake',
            base_price=Decimal('1200.00'),
            discount_price=Decimal('1050.00'),
            is_available=True,
            is_featured=True,
            is_bestseller=True,
            current_stock=15
        )

        self.variant = ProductVariant.objects.create(
            product=self.product,
            name='2 Pound (Serves 8-12)',
            price=Decimal('2100.00'),
            is_default=False
        )

    def test_effective_price_with_discount(self):
        """Effective price should return discount_price when available."""
        self.assertEqual(self.product.price, Decimal('1050.00'))

    def test_effective_price_without_discount(self):
        """Effective price should fall back to base_price when no discount."""
        prod2 = Product.objects.create(
            category=self.category,
            name='Vanilla Cloud Cake',
            slug='vanilla-cloud-cake',
            base_price=Decimal('850.00'),
            discount_price=None,
            is_available=True
        )
        self.assertEqual(prod2.price, Decimal('850.00'))

    def test_product_variant_pricing(self):
        self.assertEqual(self.variant.price, Decimal('2100.00'))
        self.assertEqual(self.product.variants.count(), 1)

    def test_catalog_api_listing(self):
        response = self.client.get('/api/v1/catalog/products/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify paginated response format
        self.assertIn('results', response.data)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_catalog_api_filter_by_category(self):
        response = self.client.get(f'/api/v1/catalog/products/?category={self.category.slug}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_catalog_api_slug_detail(self):
        response = self.client.get(f'/api/v1/catalog/products/{self.product.slug}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Royal Belgian Chocolate Fudge Cake')
        self.assertEqual(len(response.data['variants']), 1)
