from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema

from accounts.permissions import IsOwnerAdmin
from .models import StoreSettings, HeroBanner
from .serializers import StoreSettingsSerializer, HeroBannerSerializer

class StoreSettingsView(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]

    @extend_schema(summary="Get public store settings and brand configuration")
    def get(self, request):
        settings = StoreSettings.get_settings()
        serializer = StoreSettingsSerializer(settings)
        return Response(serializer.data)

    @extend_schema(summary="Update store settings (Owner Admin only)")
    def put(self, request):
        settings = StoreSettings.get_settings()
        serializer = StoreSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class HeroBannerViewSet(viewsets.ModelViewSet):
    queryset = HeroBanner.objects.filter(is_active=True).order_by('sort_order')
    serializer_class = HeroBannerSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerAdmin()]
