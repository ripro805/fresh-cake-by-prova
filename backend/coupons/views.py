from decimal import Decimal
from rest_framework import serializers, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from .models import Coupon

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class CouponValidateSerializer(serializers.Serializer):
    code = serializers.CharField()
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)


class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.action in ['validate_coupon']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]

    @extend_schema(summary="Validate a coupon code against subtotal")
    @action(detail=False, methods=['post'], url_path='validate')
    def validate_coupon(self, request):
        serializer = CouponValidateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].strip().upper()
        subtotal = Decimal(str(serializer.validated_data['subtotal']))

        coupon = Coupon.objects.filter(code__iexact=code, is_active=True).first()
        if not coupon:
            return Response(
                {'valid': False, 'message': 'Invalid coupon code.'},
                status=status.HTTP_404_NOT_FOUND
            )

        valid, msg = coupon.is_valid_for(subtotal)
        if not valid:
            return Response({'valid': False, 'message': msg}, status=status.HTTP_400_BAD_REQUEST)

        discount_amount = coupon.calculate_discount(subtotal)
        return Response({
            'valid': True,
            'code': coupon.code,
            'discount_type': coupon.discount_type,
            'discount_value': str(coupon.discount_value),
            'discount_amount': str(discount_amount),
            'message': f"Coupon '{coupon.code}' applied! You save ৳{discount_amount}."
        })
