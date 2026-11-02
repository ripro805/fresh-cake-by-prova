from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentSubmissionViewSet, CashCollectionViewSet

router = DefaultRouter()
router.register(r'submissions', PaymentSubmissionViewSet, basename='payment-submission')
router.register(r'cash-collections', CashCollectionViewSet, basename='cash-collection')

urlpatterns = [
    path('', include(router.urls)),
]
