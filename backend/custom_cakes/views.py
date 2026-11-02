import uuid
from decimal import Decimal
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from .models import CustomCakeRequest
from .serializers import (
    CustomCakeRequestSerializer,
    CustomCakeCreateSerializer,
    AdminSendQuotationSerializer,
    CustomerRespondQuotationSerializer
)

from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError
from django.db import transaction
from orders.models import Order, OrderItem, OrderTimelineItem, DeliveryZone
from orders.serializers import OrderSerializer
from catalog.models import Product

class CustomCakeRequestViewSet(viewsets.ModelViewSet):
    queryset = CustomCakeRequest.objects.all()
    serializer_class = CustomCakeRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['quotation_status', 'occasion', 'delivery_type']
    search_fields = ['request_number', 'customer_name', 'customer_phone', 'design_description', 'occasion']
    ordering_fields = ['created_at', 'delivery_date', 'quotation_amount']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'track', 'customer_respond', 'create_order']:
            return [permissions.AllowAny()]
        if self.action in ['send_quotation', 'destroy']:
            return [permissions.IsAuthenticated(), IsOwnerAdmin()]
        # List and retrieve
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.is_authenticated and getattr(user, 'role', '') == 'OWNER_ADMIN':
            return qs
        if user.is_authenticated:
            return qs.filter(customer=user)
        if self.action == 'list':
            return qs.none()
        return qs

    def get_object(self):
        lookup_value = self.kwargs.get('pk')
        user = self.request.user

        # For Admin
        if user.is_authenticated and getattr(user, 'role', '') == 'OWNER_ADMIN':
            qs = CustomCakeRequest.objects.all()
        elif user.is_authenticated:
            qs = CustomCakeRequest.objects.filter(customer=user)
        else:
            # Guest caller: allow only if performing actions with verified phone or track
            if self.action in ['customer_respond', 'create_order']:
                qs = CustomCakeRequest.objects.all()
            else:
                raise PermissionDenied("Authentication required to view custom cake requests. Use track endpoint for guest requests.")

        try:
            uuid_obj = uuid.UUID(lookup_value)
            return qs.get(id=uuid_obj)
        except (ValueError, TypeError):
            pass

        try:
            return qs.get(request_number=lookup_value)
        except CustomCakeRequest.DoesNotExist:
            raise NotFound(f"Custom cake request '{lookup_value}' not found.")

    def create(self, request, *args, **kwargs):
        serializer = CustomCakeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        request_number = CustomCakeRequest.generate_request_number()
        customer_user = request.user if request.user.is_authenticated else None

        req = CustomCakeRequest.objects.create(
            request_number=request_number,
            customer=customer_user,
            **data
        )

        return Response(CustomCakeRequestSerializer(req).data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Track custom cake request by request number and phone")
    @action(detail=False, methods=['post'], url_path='track')
    def track(self, request):
        request_number = request.data.get('request_number', '').strip()
        phone = request.data.get('phone', '').strip()

        if not request_number or not phone:
            return Response(
                {"error": "Both request_number and phone are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        req = CustomCakeRequest.objects.filter(
            request_number__iexact=request_number,
            customer_phone__endswith=phone[-10:]
        ).first()

        if not req:
            return Response(
                {"error": "Custom cake request not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(CustomCakeRequestSerializer(req).data)

    @extend_schema(summary="Admin sends custom cake price quotation")
    @action(detail=True, methods=['post'], url_path='send-quotation')
    def send_quotation(self, request, pk=None):
        req_obj = self.get_object()
        serializer = AdminSendQuotationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        req_obj.quotation_amount = serializer.validated_data['quotation_amount']
        req_obj.admin_notes = serializer.validated_data.get('admin_notes', '')
        req_obj.quotation_status = CustomCakeRequest.QuotationStatus.QUOTATION_SENT
        req_obj.save()

        return Response(CustomCakeRequestSerializer(req_obj).data)

    @extend_schema(summary="Customer responds to quotation (Accept or Reject)")
    @action(detail=True, methods=['post'], url_path='respond')
    def customer_respond(self, request, pk=None):
        req_obj = self.get_object()

        # If guest caller, verify phone matches
        if not request.user.is_authenticated and req_obj.customer:
            raise PermissionDenied("This custom cake request belongs to an account. Please log in.")
        if not request.user.is_authenticated:
            phone = request.data.get('phone', '').strip()
            if not phone or not req_obj.customer_phone.endswith(phone[-10:]):
                raise PermissionDenied("Phone verification required to respond to guest quotation.")

        serializer = CustomerRespondQuotationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        feedback = serializer.validated_data.get('feedback', '')

        if action_type == 'accept':
            req_obj.quotation_status = CustomCakeRequest.QuotationStatus.ACCEPTED
        else:
            req_obj.quotation_status = CustomCakeRequest.QuotationStatus.REJECTED

        if feedback:
            req_obj.customer_feedback = feedback
        req_obj.save()

        return Response(CustomCakeRequestSerializer(req_obj).data)

    @extend_schema(summary="Create an official order from an accepted quotation")
    @transaction.atomic
    @action(detail=True, methods=['post'], url_path='create-order')
    def create_order(self, request, pk=None):
        req_obj = self.get_object()

        # Strict business rule: Cannot order unaccepted quotation
        if req_obj.quotation_status != CustomCakeRequest.QuotationStatus.ACCEPTED:
            return Response(
                {"error": f"Cannot create order for custom cake request with status '{req_obj.quotation_status}'. Quotation must be 'Accepted' first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not req_obj.quotation_amount or req_obj.quotation_amount <= 0:
            return Response(
                {"error": "Custom cake quotation has no valid price."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Phone check for guest
        if not request.user.is_authenticated and req_obj.customer:
            raise PermissionDenied("This custom cake request belongs to an account. Please log in.")
        if not request.user.is_authenticated:
            phone = request.data.get('phone', '').strip()
            if not phone or not req_obj.customer_phone.endswith(phone[-10:]):
                raise PermissionDenied("Phone verification required to order guest quotation.")

        payment_method = request.data.get('payment_method', Order.PaymentMethod.COD)
        payment_trx_id = request.data.get('payment_trx_id', '').strip()
        payment_sender_phone = request.data.get('payment_sender_phone', '').strip()

        if payment_method in ['bkash', 'nagad']:
            if not payment_trx_id or not payment_sender_phone:
                return Response(
                    {"error": f"Transaction ID and sender phone number are required for {payment_method.upper()} payment."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        delivery_type = req_obj.delivery_type
        delivery_zone = None
        delivery_fee = Decimal('0.00')

        if delivery_type == CustomCakeRequest.DeliveryType.DELIVERY:
            zone_code = request.data.get('delivery_zone_code', 'INSIDE_KUSHTIA')
            delivery_zone = DeliveryZone.objects.filter(code=zone_code, is_active=True).first()
            if delivery_zone:
                delivery_fee = delivery_zone.fee
            else:
                delivery_fee = Decimal('50.00') if zone_code == 'INSIDE_KUSHTIA' else Decimal('150.00')

        subtotal = req_obj.quotation_amount
        total = subtotal + delivery_fee
        order_number = Order.generate_order_number()

        # Default placeholder cake product for custom orders if needed
        placeholder_prod = Product.objects.first()

        order = Order.objects.create(
            order_number=order_number,
            customer=req_obj.customer or (request.user if request.user.is_authenticated else None),
            customer_name=req_obj.customer_name,
            customer_phone=req_obj.customer_phone,
            customer_email=req_obj.customer_email,
            delivery_type=Order.DeliveryType.DELIVERY if delivery_type == CustomCakeRequest.DeliveryType.DELIVERY else Order.DeliveryType.PICKUP,
            delivery_zone=delivery_zone,
            delivery_address=req_obj.delivery_address or request.data.get('delivery_address', ''),
            delivery_area=request.data.get('delivery_area', ''),
            delivery_instructions=f"Custom Cake Order #{req_obj.request_number}. Delivery Date: {req_obj.delivery_date} {req_obj.delivery_time}",
            order_notes=f"Design notes: {req_obj.design_description}. Message: {req_obj.custom_message}",
            subtotal=subtotal,
            delivery_fee=delivery_fee,
            discount=Decimal('0.00'),
            total=total,
            payment_method=payment_method,
            payment_status=Order.PaymentStatus.PENDING,
            payment_trx_id=payment_trx_id,
            payment_sender_phone=payment_sender_phone,
            order_status=Order.OrderStatus.PLACED
        )

        OrderItem.objects.create(
            order=order,
            product=placeholder_prod,
            product_name_snapshot=f"Custom Cake: {req_obj.occasion} ({req_obj.cake_type})",
            variant_snapshot=f"{req_obj.cake_size} • {req_obj.cake_tiers}",
            flavor_snapshot=req_obj.cake_flavor,
            unit_price=subtotal,
            quantity=1,
            line_total=subtotal
        )

        OrderTimelineItem.objects.create(
            order=order,
            status='Order Placed',
            note=f"Custom cake quotation #{req_obj.request_number} converted into official order."
        )

        req_obj.quotation_status = CustomCakeRequest.QuotationStatus.COMPLETED
        req_obj.save(update_fields=['quotation_status'])

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
