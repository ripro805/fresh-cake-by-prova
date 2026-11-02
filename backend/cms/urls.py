from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoreSettingsView, HeroBannerViewSet

router = DefaultRouter()
router.register(r'banners', HeroBannerViewSet, basename='hero-banner')

urlpatterns = [
    path('settings/', StoreSettingsView.as_view(), name='store-settings'),
    path('', include(router.urls)),
]
