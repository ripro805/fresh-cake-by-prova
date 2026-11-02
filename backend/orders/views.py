import uuid
from decimal import Decimal
from django.db import transaction, models
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from catalog.models import Product, ProductVariant
from .models import DeliveryZone, Order, OrderItem, OrderTimelineItem
from .serializers import (
    DeliveryZoneSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer
)

from coupons.models import Coupon
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

class DeliveryZoneViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DeliveryZone.objects.filter(is_active=True).order_by('sort_order', 'fee')
    serializer_class = DeliveryZoneSerializer
    permission_classes = [permissions.AllowAny]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.prefetch_related('items', 'timeline').select_related('delivery_zone', 'customer')
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['order_status', 'payment_status', 'payment_method', 'delivery_type']
    search_fields = ['order_number', 'customer_name', 'customer_phone', 'customer_email', 'payment_trx_id']
    ordering_fields = ['created_at', 'total', 'order_status']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'track', 'preview']:
            return [permissions.AllowAny()]
        if self.action in ['update_status', 'update_payment_status', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerAdmin()]
        # List and retrieve: enforced in get_queryset and get_object
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_authenticated and getattr(user, 'role', '') == 'OWNER_ADMIN':
            return qs
        if user.is_authenticated:
            # Customer sees only their own orders
            return qs.filter(customer=user)
        # Unauthenticated users cannot list all orders
        if self.action == 'list':
            return qs.none()
        return qs

    def get_object(self):
        """Allow lookup by order_number or UUID, strictly enforcing user permissions."""
        lookup_value = self.kwargs.get('pk')
        user = self.request.user

        # Unauthenticated users cannot view orders directly via GET /orders/<id>/
        # They must use /orders/track/ with order_number + phone number
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required to view order details. Use order tracking for guest orders.")

        qs = self.get_queryset()

        try:
            uuid_obj = uuid.UUID(lookup_value)
            return qs.get(id=uuid_obj)
        except (ValueError, TypeError):
            pass
        except Order.DoesNotExist:
            raise NotFound(f"Order '{lookup_value}' not found.")

        try:
            return qs.get(order_number=lookup_value)
        except Order.DoesNotExist:
            raise NotFound(f"Order '{lookup_value}' not found.")

    def _resolve_pricing_and_items(self, items_data, is_preview=False):
        """
        Server-side authoritative pricing and stock validation.
        Prevents client price tampering and ensures inventory consistency.
        """
        subtotal = Decimal('0.00')
        prepared_items = []

        for item_data in items_data:
            prod_id = item_data['product_id']
            try:
                prod = Product.objects.get(id=prod_id)
            except (ValueError, Product.DoesNotExist):
                prod = Product.objects.filter(slug=prod_id).first()
                if not prod:
                    raise ValidationError(f"Product '{prod_id}' not found.")

            if not prod.is_available:
                raise ValidationError(f"Product '{prod.name}' is currently unavailable.")

            qty = int(item_data['quantity'])
            if qty < 1:
                raise ValidationError("Item quantity must be at least 1.")

            # Check stock for stock-controlled items
            if prod.stock_mode == Product.StockMode.STOCK_CONTROLLED:
                if prod.current_stock < qty:
                    raise ValidationError(f"Insufficient stock for '{prod.name}'. Only {prod.current_stock} available.")

            # Authoritative pricing lookup (discard client unit_price)
            variant_name = (item_data.get('variant_name') or '').strip()
            variant_id = (item_data.get('variant_id') or '').strip()
            variant = None

            if variant_id:
                try:
                    variant = prod.variants.filter(id=variant_id).first()
                except (ValueError, TypeError):
                    pass
            if not variant and variant_name:
                variant = prod.variants.filter(name__iexact=variant_name).first()

            if variant:
                unit_price = variant.price
                variant_snapshot = variant.name
            else:
                unit_price = prod.discount_price if prod.discount_price is not None else prod.base_price
                variant_snapshot = variant_name

            line_total = (unit_price * qty).quantize(Decimal('0.01'))
            subtotal += line_total

            prepared_items.append({
                'product': prod,
                'product_name_snapshot': prod.name,
                'variant_snapshot': variant_snapshot,
                'flavor_snapshot': item_data.get('flavor_name', '') or '',
                'unit_price': unit_price,
                'quantity': qty,
                'line_total': line_total
            })

        return subtotal, prepared_items

    def _calculate_discount(self, coupon_code, subtotal):
        """Authoritative coupon validation against Coupon model with fallback."""
        discount = Decimal('0.00')
        matched_coupon = None
        code = (coupon_code or '').strip().upper()

        if code:
            matched_coupon = Coupon.objects.filter(code__iexact=code, is_active=True).first()
            if matched_coupon:
                is_valid, msg = matched_coupon.is_valid_for(subtotal)
                if is_valid:
                    discount = matched_coupon.calculate_discount(subtotal)
            elif code == 'FRESHPROVA10':
                discount = (subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
            elif code == 'WELCOME50':
                discount = Decimal('50.00')

        return discount, matched_coupon

    @extend_schema(summary="Preview order calculation (subtotal, delivery fee, discount, total)")
    @action(detail=False, methods=['post'])
    def preview(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            subtotal, _ = self._resolve_pricing_and_items(data['items'], is_preview=True)
        except ValidationError as e:
            return Response({"error": str(e.detail if hasattr(e, 'detail') else e)}, status=status.HTTP_400_BAD_REQUEST)

        # Delivery fee lookup
        delivery_type = data.get('delivery_type', 'delivery')
        zone_code = data.get('delivery_zone_code', 'INSIDE_KUSHTIA')
        delivery_fee = Decimal('0.00')

        if delivery_type == 'delivery':
            zone = DeliveryZone.objects.filter(code=zone_code, is_active=True).first()
            if zone:
                delivery_fee = zone.fee
            else:
                delivery_fee = Decimal('50.00') if zone_code == 'INSIDE_KUSHTIA' else Decimal('150.00')

        discount, _ = self._calculate_discount(data.get('coupon_code', ''), subtotal)
        total = max(Decimal('0.00'), subtotal + delivery_fee - discount)

        return Response({
            'subtotal': str(subtotal),
            'delivery_fee': str(delivery_fee),
            'discount': str(discount),
            'total': str(total),
            'currency': '৳'
        })

    @extend_schema(summary="Place a new order (Guest or Authenticated)")
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Delivery Zone & Fee
        delivery_type = data.get('delivery_type', 'delivery')
        zone_code = data.get('delivery_zone_code', 'INSIDE_KUSHTIA')
        delivery_zone = None
        delivery_fee = Decimal('0.00')

        if delivery_type == 'delivery':
            delivery_zone = DeliveryZone.objects.filter(code=zone_code, is_active=True).first()
            if delivery_zone:
                delivery_fee = delivery_zone.fee
            else:
                delivery_fee = Decimal('50.00') if zone_code == 'INSIDE_KUSHTIA' else Decimal('150.00')

        # 2. Authoritative Subtotal & Stock Check
        try:
            subtotal, prepared_items = self._resolve_pricing_and_items(data['items'])
        except ValidationError as e:
            return Response({"error": str(e.detail if hasattr(e, 'detail') else e)}, status=status.HTTP_400_BAD_REQUEST)

        # 3. Discounts
        discount, coupon_obj = self._calculate_discount(data.get('coupon_code', ''), subtotal)
        if coupon_obj:
            coupon_obj.used_count += 1
            coupon_obj.save(update_fields=['used_count'])

        total = max(Decimal('0.00'), subtotal + delivery_fee - discount)

        # 4. User linking
        customer_user = request.user if request.user.is_authenticated else None

        # 5. Create Order
        order_number = Order.generate_order_number()
        order = Order.objects.create(
            order_number=order_number,
            customer=customer_user,
            customer_name=data['customer_name'],
            customer_phone=data['customer_phone'],
            customer_email=data.get('customer_email') or '',
            delivery_type=delivery_type,
            delivery_zone=delivery_zone,
            delivery_address=data.get('delivery_address', ''),
            delivery_area=data.get('delivery_area', ''),
            delivery_instructions=data.get('delivery_instructions', ''),
            order_notes=data.get('order_notes', ''),
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount=discount,
            total=total,
            payment_method=data['payment_method'],
            payment_status=Order.PaymentStatus.PENDING,
            payment_trx_id=data.get('payment_trx_id', ''),
            payment_sender_phone=data.get('payment_sender_phone', ''),
            order_status=Order.OrderStatus.PLACED
        )

        # 6. Create Order Items
        for pitem in prepared_items:
            OrderItem.objects.create(
                order=order,
                product=pitem['product'],
                product_name_snapshot=pitem['product_name_snapshot'],
                variant_snapshot=pitem['variant_snapshot'],
                flavor_snapshot=pitem['flavor_snapshot'],
                unit_price=pitem['unit_price'],
                quantity=pitem['quantity'],
                line_total=pitem['line_total']
            )

            # Atomic stock deduction for stock-controlled products
            prod = pitem['product']
            if prod.stock_mode == Product.StockMode.STOCK_CONTROLLED:
                Product.objects.filter(id=prod.id).update(
                    current_stock=models.F('current_stock') - pitem['quantity']
                )

        # 7. Create Initial Timeline
        OrderTimelineItem.objects.create(
            order=order,
            status='Order Placed',
            note='Order successfully placed by customer.'
        )

        output_serializer = OrderSerializer(order)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Track order status with order number and phone number")
    @action(detail=False, methods=['post'], url_path='track')
    def track(self, request):
        order_number = request.data.get('order_number', '').strip()
        phone = request.data.get('phone', '').strip()

        if not order_number or not phone:
            return Response(
                {"error": "Both order_number and phone are required for tracking verification."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order = Order.objects.prefetch_related('items', 'timeline').filter(
            order_number__iexact=order_number,
            customer_phone__endswith=phone[-10:] # Flexible match for leading 0 or +88
        ).first()

        if not order:
            return Response(
                {"error": "No order found matching the provided order number and phone number."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data)

    @extend_schema(summary="Update order status (Owner Admin only)")
    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        note = serializer.validated_data.get('note', '')

        order.order_status = new_status
        order.save()

        OrderTimelineItem.objects.create(
            order=order,
            status=new_status,
            note=note or f"Order status updated to {new_status} by admin."
        )

        return Response(OrderSerializer(order).data)

    @extend_schema(summary="Update order payment status (Owner Admin only)")
    @action(detail=True, methods=['patch'], url_path='update-payment-status')
    def update_payment_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('payment_status', '').lower()
        valid_statuses = [c[0] for c in Order.PaymentStatus.choices]
        if new_status in valid_statuses:
            order.payment_status = new_status
            order.save(update_fields=['payment_status'])
            OrderTimelineItem.objects.create(
                order=order,
                status=f"Payment {new_status.title()}",
                note=f"Payment status updated to {new_status} by Admin."
            )
            return Response(OrderSerializer(order).data)
        return Response({"error": f"Invalid payment status. Valid options: {valid_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

