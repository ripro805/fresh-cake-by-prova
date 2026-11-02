from rest_framework import permissions
from .models import UserRole

class IsOwnerAdmin(permissions.BasePermission):
    """
    Allows access only to authenticated Owner-Admin accounts.
    """
    message = "Access restricted to authorized bakery owner-administrators."

    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == UserRole.OWNER_ADMIN
        )

class IsCustomerUser(permissions.BasePermission):
    """
    Allows access only to authenticated customers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsOwnerOrAdminObject(permissions.BasePermission):
    """
    Object-level permission allowing users to access only their own records,
    while Owner-Admins can manage any record.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.OWNER_ADMIN:
            return True
        
        # Check standard user field
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'customer'):
            return obj.customer == request.user
        return False
