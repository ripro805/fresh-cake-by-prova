from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomCakeRequestViewSet

router = DefaultRouter()
router.register(r'requests', CustomCakeRequestViewSet, basename='custom-cake-request')

urlpatterns = [
    path('', include(router.urls)),
]
