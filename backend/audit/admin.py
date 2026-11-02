from django.contrib import admin
from .models import AuditLog

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'user', 'resource_type', 'resource_id', 'timestamp')
    list_filter = ('resource_type', 'action')
    search_fields = ('action', 'resource_type', 'resource_id')
