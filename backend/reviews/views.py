from rest_framework import serializers, viewsets, permissions
from accounts.permissions import IsOwnerAdmin
from .models import ProductReview

class ProductReviewSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    customer_name = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'product_name', 'customer_name', 'rating', 'comment', 'is_verified', 'is_approved', 'created_at']
        read_only_fields = ['id', 'is_approved', 'created_at']


class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.filter(is_approved=True)
    serializer_class = ProductReviewSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data.get('product')
        is_verified = False

        if user.is_authenticated:
            from orders.models import Order, OrderItem
            has_delivered_order = OrderItem.objects.filter(
                order__customer=user,
                order__order_status=Order.OrderStatus.DELIVERED,
                product=product
            ).exists()
            is_verified = has_delivered_order
            customer_name = user.full_name or serializer.validated_data.get('customer_name') or user.phone
            serializer.save(customer_name=customer_name, is_verified=is_verified)
        else:
            serializer.save(is_verified=False)

