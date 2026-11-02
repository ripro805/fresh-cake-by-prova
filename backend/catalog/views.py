import uuid
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from .models import Category, Product, ProductVariant, ProductFlavor, ProductImage
from .filters import ProductFilter
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductVariantSerializer,
    ProductFlavorSerializer,
    ProductImageSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.filter(is_active=True).order_by('sort_order', 'name')
    serializer_class = CategorySerializer
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants', 'flavors')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'cake_type', 'category__name']
    ordering_fields = ['base_price', 'rating', 'created_at', 'review_count']
    ordering = ['-is_featured', '-is_bestseller', '-created_at']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'create', 'update', 'partial_update']:
            return ProductDetailSerializer
        return ProductListSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'featured', 'bestsellers', 'category_products']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]

    def get_object(self):
        """Allow lookup by either slug or UUID."""
        lookup_value = self.kwargs.get('pk')
        queryset = self.filter_queryset(self.get_queryset())
        
        # Try UUID first
        try:
            uuid_obj = uuid.UUID(lookup_value)
            return queryset.get(id=uuid_obj)
        except (ValueError, TypeError, Product.DoesNotExist):
            pass

        # Try slug
        try:
            return queryset.get(slug=lookup_value)
        except Product.DoesNotExist:
            return super().get_object()

    @extend_schema(summary="Get featured hero products")
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(featured_products, many=True)
        return Response(serializer.data)

    @extend_schema(summary="Get bestselling bakery items")
    @action(detail=False, methods=['get'])
    def bestsellers(self, request):
        bestseller_products = self.get_queryset().filter(is_bestseller=True)[:8]
        serializer = ProductListSerializer(bestseller_products, many=True)
        return Response(serializer.data)

    @extend_schema(summary="Get products by category slug (cakes, donuts, momos)")
    @action(detail=False, methods=['get'], url_path='category/(?P<category_slug>[^/.]+)')
    def category_products(self, request, category_slug=None):
        products = self.get_queryset().filter(category__slug=category_slug)
        serializer = ProductListSerializer(products, many=True)
        return Response(serializer.data)
