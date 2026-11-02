import django_filters
from django.db.models import Q
from .models import Product

class ProductFilter(django_filters.FilterSet):
    """
    Advanced DRF FilterSet for FRESH CAKE by PROVA catalog.
    Supports combined filtering: category, price bounds, flavor, stock, cake type, discount, and ratings.
    """
    category = django_filters.CharFilter(method='filter_category')
    min_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='base_price', lookup_expr='lte')
    flavor = django_filters.CharFilter(method='filter_flavor')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    is_available = django_filters.BooleanFilter(field_name='is_available')
    is_discounted = django_filters.BooleanFilter(method='filter_discounted')
    cake_type = django_filters.CharFilter(field_name='cake_type', lookup_expr='icontains')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_bestseller = django_filters.BooleanFilter(field_name='is_bestseller')
    is_trending = django_filters.BooleanFilter(field_name='is_trending')
    min_rating = django_filters.NumberFilter(field_name='rating', lookup_expr='gte')

    class Meta:
        model = Product
        fields = [
            'category',
            'min_price',
            'max_price',
            'flavor',
            'in_stock',
            'is_available',
            'is_discounted',
            'cake_type',
            'is_featured',
            'is_bestseller',
            'is_trending',
            'min_rating',
        ]

    def filter_category(self, queryset, name, value):
        if not value or value.lower() == 'all':
            return queryset
        return queryset.filter(Q(category__slug__iexact=value) | Q(category__name__iexact=value))

    def filter_flavor(self, queryset, name, value):
        if not value or value.lower() == 'all':
            return queryset
        return queryset.filter(flavors__name__icontains=value).distinct()

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(is_available=True, current_stock__gt=0)
        return queryset

    def filter_discounted(self, queryset, name, value):
        if value:
            return queryset.filter(discount_price__isnull=False, discount_price__gt=0)
        return queryset
