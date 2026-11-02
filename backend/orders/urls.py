from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliveryZoneViewSet, OrderViewSet

router = DefaultRouter()
router.register(r'delivery-zones', DeliveryZoneViewSet, basename='delivery-zone')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]
