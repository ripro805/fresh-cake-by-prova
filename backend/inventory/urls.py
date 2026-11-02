from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngredientViewSet, FinishedGoodStockViewSet, StockMovementViewSet

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'finished-goods', FinishedGoodStockViewSet, basename='finished-good-stock')
router.register(r'movements', StockMovementViewSet, basename='stock-movement')

urlpatterns = [
    path('', include(router.urls)),
]
