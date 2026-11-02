from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView
)

from support_chat.views import WhatsAppWebhookView


def api_root_view(request):
    return JsonResponse({
        "status": "online",
        "service": "FRESH CAKE by PROVA Backend API",
        "version": "1.0.0",
        "database": "Neon PostgreSQL Connected",
        "documentation": {
            "swagger_ui": "/api/docs/",
            "redoc": "/api/redoc/",
            "openapi_schema": "/api/schema/"
        },
        "admin_portal": "/django-admin/",
        "api_v1_endpoints": {
            "auth": "/api/v1/auth/",
            "catalog": "/api/v1/catalog/",
            "orders": "/api/v1/orders/",
            "custom_cakes": "/api/v1/custom-cakes/",
            "payments": "/api/v1/payments/",
            "inventory": "/api/v1/inventory/",
            "finance": "/api/v1/finance/",
            "cms": "/api/v1/cms/",
            "coupons": "/api/v1/coupons/",
            "reviews": "/api/v1/reviews/",
            "audit": "/api/v1/audit/",
            "support": "/api/v1/support/"
        }
    })


urlpatterns = [
    # API Health & Discovery Root
    path('', api_root_view, name='api-root'),

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

from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
