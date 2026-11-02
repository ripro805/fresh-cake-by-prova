from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from .models import Ingredient, FinishedGoodStock, StockMovement
from .serializers import IngredientSerializer, FinishedGoodStockSerializer, StockMovementSerializer

class IngredientViewSet(viewsets.ModelViewSet):
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    @extend_schema(summary="Get low stock ingredients alert")
    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        low_items = [item for item in self.get_queryset() if item.is_low_stock]
        return Response(IngredientSerializer(low_items, many=True).data)

    @extend_schema(summary="Restock an ingredient")
    @action(detail=True, methods=['post'])
    def restock(self, request, pk=None):
        ingredient = self.get_object()
        qty = Decimal(str(request.data.get('quantity', 0)))
        notes = request.data.get('notes', 'Manual Restock')
        if qty <= 0:
            return Response({"error": "Quantity must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        ingredient.current_stock += qty
        ingredient.save()

        StockMovement.objects.create(
            ingredient=ingredient,
            movement_type=StockMovement.MovementType.RESTOCK,
            quantity=qty,
            notes=notes
        )

        return Response(IngredientSerializer(ingredient).data)


class FinishedGoodStockViewSet(viewsets.ModelViewSet):
    queryset = FinishedGoodStock.objects.select_related('product', 'product__category').all()
    serializer_class = FinishedGoodStockSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]

    @extend_schema(summary="Adjust product stock count")
    @action(detail=True, methods=['post'])
    def adjust(self, request, pk=None):
        stock = self.get_object()
        new_qty = int(request.data.get('quantity', 0))
        reason = request.data.get('reason', 'Stock count update')

        diff = new_qty - stock.current_quantity
        stock.current_quantity = new_qty
        stock.save()

        StockMovement.objects.create(
            finished_good=stock,
            movement_type=StockMovement.MovementType.ADJUSTMENT,
            quantity=diff,
            notes=reason
        )

        return Response(FinishedGoodStockSerializer(stock).data)


class StockMovementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = StockMovement.objects.select_related('ingredient', 'finished_good', 'finished_good__product').all()
    serializer_class = StockMovementSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]
