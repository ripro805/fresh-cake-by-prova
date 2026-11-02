from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView,
    CustomerRegisterView,
    MeView,
    CustomerAddressViewSet,
    PasswordChangeView
)

router = DefaultRouter()
router.register(r'addresses', CustomerAddressViewSet, basename='customer-address')

urlpatterns = [
    path('register/', CustomerRegisterView.as_view(), name='auth-register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='auth-me'),
    path('password-change/', PasswordChangeView.as_view(), name='auth-password-change'),
    path('', include(router.urls)),
]
