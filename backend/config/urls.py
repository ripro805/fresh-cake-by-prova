from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

from support_chat.views import WhatsAppWebhookView

urlpatterns = [
    # Django Admin Site
    path('django-admin/', admin.site.urls),

    # OpenAPI 3 Documentation Endpoints
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # API v1 Modular Routes
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/catalog/', include('catalog.urls')),
    path('api/v1/orders/', include('orders.urls')),
    path('api/v1/custom-cakes/', include('custom_cakes.urls')),
    path('api/v1/payments/', include('payments.urls')),
    path('api/v1/inventory/', include('inventory.urls')),
    path('api/v1/finance/', include('finance.urls')),
    path('api/v1/cms/', include('cms.urls')),
    path('api/v1/coupons/', include('coupons.urls')),
    path('api/v1/reviews/', include('reviews.urls')),
    path('api/v1/audit/', include('audit.urls')),
    path('api/v1/support/', include('support_chat.urls')),
    path('api/v1/webhooks/whatsapp/', WhatsAppWebhookView.as_view(), name='whatsapp-webhook-root'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
