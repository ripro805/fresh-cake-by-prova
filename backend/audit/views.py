from rest_framework import serializers, viewsets, permissions
from accounts.permissions import IsOwnerAdmin
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_phone', 'user_name', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'timestamp']


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAdmin]
