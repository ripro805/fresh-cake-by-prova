from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SupportConversationViewSet,
    AdminSupportViewSet,
    WhatsAppSettingsView,
    WhatsAppWebhookView
)

router = DefaultRouter()
router.register('conversations', SupportConversationViewSet, basename='support-conversations')
router.register('admin/conversations', AdminSupportViewSet, basename='admin-support-conversations')

urlpatterns = [
    path('admin/settings/', WhatsAppSettingsView.as_view(), name='admin-whatsapp-settings'),
    path('webhooks/whatsapp/', WhatsAppWebhookView.as_view(), name='whatsapp-webhook'),
    path('', include(router.urls)),
]
