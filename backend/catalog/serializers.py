from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant, ProductFlavor

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'tagline', 'description', 'image_url', 'sort_order', 'is_active', 'product_count']


class ProductImageSerializer(serializers.ModelSerializer):
    url = serializers.CharField(source='url', read_only=True)

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'image_url', 'url', 'alt_text', 'is_primary', 'sort_order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'price', 'sku', 'is_default']


class ProductFlavorSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductFlavor
        fields = ['id', 'name', 'is_available']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    images = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    flavors = serializers.SerializerMethodField()
    availability = serializers.BooleanField(source='is_available', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name', 'category', 'category_name', 'category_slug',
            'cake_type', 'description', 'base_price', 'discount_price', 'price',
            'prep_time', 'stock_mode', 'current_stock', 'availability',
            'is_featured', 'is_bestseller', 'is_trending', 'rating', 'review_count',
            'images', 'variants', 'flavors'
        ]

    def get_images(self, obj):
        imgs = obj.images.all()
        return [img.url for img in imgs]

    def get_flavors(self, obj):
        return [f.name for f in obj.flavors.filter(is_available=True)]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), source='category', write_only=True
    )
    price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    images = serializers.SerializerMethodField()
    raw_images = ProductImageSerializer(source='images', many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    flavors = serializers.SerializerMethodField()
    raw_flavors = ProductFlavorSerializer(source='flavors', many=True, read_only=True)
    availability = serializers.BooleanField(source='is_available', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name', 'category', 'category_id',
            'cake_type', 'description', 'base_price', 'discount_price', 'price',
            'prep_time', 'stock_mode', 'current_stock', 'is_available', 'availability',
            'is_featured', 'is_bestseller', 'is_trending', 'rating', 'review_count',
            'images', 'raw_images', 'variants', 'flavors', 'raw_flavors',
            'created_at', 'updated_at'
        ]

    def get_images(self, obj):
        return [img.url for img in obj.images.all()]

    def get_flavors(self, obj):
        return [f.name for f in obj.flavors.filter(is_available=True)]
