import uuid
from django.db import models
from django.conf import settings

class AuditLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=150)
    resource_type = models.CharField(max_length=100)
    resource_id = models.CharField(max_length=100, blank=True, default='')
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        user_str = self.user.phone if self.user else "Anonymous/System"
        return f"[{self.timestamp}] {user_str} - {self.action} on {self.resource_type}:{self.resource_id}"
