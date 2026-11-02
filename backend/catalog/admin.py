from django.contrib import admin
from .models import Category, Product, ProductImage, ProductVariant, ProductFlavor

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductFlavorInline(admin.TabularInline):
    model = ProductFlavor
    extra = 1

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'sort_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('sort_order', 'is_active')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'cake_type', 'base_price', 'discount_price', 'stock_mode', 'is_available', 'is_featured', 'is_bestseller')
    list_filter = ('category', 'cake_type', 'stock_mode', 'is_available', 'is_featured', 'is_bestseller')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline, ProductFlavorInline]
