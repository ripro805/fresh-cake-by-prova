import uuid
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from orders.models import Order, OrderTimelineItem
from .models import PaymentSubmission, CashCollection
from .serializers import PaymentSubmissionSerializer, VerifyPaymentSerializer, CashCollectionSerializer

from cms.models import StoreSettings

class PaymentSubmissionViewSet(viewsets.ModelViewSet):
    queryset = PaymentSubmission.objects.select_related('order').all()
    serializer_class = PaymentSubmissionSerializer

    def get_permissions(self):
        if self.action in ['create', 'config']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]

    @extend_schema(summary="Get store payment accounts and instructions (bKash & Nagad)")
    @action(detail=False, methods=['get'])
    def config(self, request):
        settings = StoreSettings.get_settings()
        return Response({
            'store_name': f"{settings.store_name} {settings.brand_signature}".strip(),
            'bkash_number': settings.bkash_number or '01308516242',
            'bkash_type': 'Personal / Send Money',
            'nagad_number': settings.nagad_number or '01308516242',
            'nagad_type': 'Personal / Send Money',
            'instructions': 'Please send the exact order total to our bKash or Nagad number (01308516242). Keep the Transaction ID (TrxID) and enter it during checkout or payment verification.'
        })

    @extend_schema(summary="Admin verify or reject manual payment submission")
    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        submission = self.get_object()
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        action_type = serializer.validated_data['action']
        rejection_reason = serializer.validated_data.get('rejection_reason', '')

        if action_type == 'verify':
            submission.status = PaymentSubmission.Status.VERIFIED
            submission.verified_by = request.user
            submission.verified_at = timezone.now()
            submission.save()

            # Update order payment status
            order = submission.order
            order.payment_status = Order.PaymentStatus.VERIFIED
            order.payment_trx_id = submission.transaction_id
            order.payment_sender_phone = submission.sender_phone
            if order.order_status == Order.OrderStatus.PLACED:
                order.order_status = Order.OrderStatus.CONFIRMED
            order.save()

            OrderTimelineItem.objects.create(
                order=order,
                status='Payment Verified',
                note=f"Payment of ৳{submission.amount} verified by Admin via {submission.provider} (TrxID: {submission.transaction_id})."
            )
        else:
            submission.status = PaymentSubmission.Status.REJECTED
            submission.verified_by = request.user
            submission.verified_at = timezone.now()
            submission.rejection_reason = rejection_reason or 'Transaction ID could not be matched with statement.'
            submission.save()

            order = submission.order
            order.payment_status = Order.PaymentStatus.FAILED
            order.save()

            OrderTimelineItem.objects.create(
                order=order,
                status='Payment Rejected',
                note=f"Payment rejected: {submission.rejection_reason}"
            )

        return Response(PaymentSubmissionSerializer(submission).data)


class CashCollectionViewSet(viewsets.ModelViewSet):
    queryset = CashCollection.objects.select_related('order').all()
    serializer_class = CashCollectionSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        collection = serializer.save()

        # Update order status to Delivered and payment_status to Verified
        order = collection.order
        order.payment_status = Order.PaymentStatus.VERIFIED
        order.order_status = Order.OrderStatus.DELIVERED
        order.save()

        OrderTimelineItem.objects.create(
            order=order,
            status='Delivered',
            note=f"Delivered and Cash collected (৳{collection.amount_collected}) by {collection.collected_by}."
        )

        return Response(CashCollectionSerializer(collection).data, status=status.HTTP_201_CREATED)
