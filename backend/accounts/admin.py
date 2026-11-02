from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CustomerProfile, CustomerAddress

class CustomerAddressInline(admin.TabularInline):
    model = CustomerAddress
    extra = 0

class CustomerProfileInline(admin.StackedInline):
    model = CustomerProfile
    can_delete = False

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('phone', 'full_name', 'email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('phone', 'full_name', 'email')
    ordering = ('-created_at',)
    inlines = [CustomerProfileInline, CustomerAddressInline]

    fieldsets = (
        (None, {'fields': ('phone', 'password')}),
        ('Personal Info', {'fields': ('full_name', 'email')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone', 'full_name', 'email', 'role', 'password', 'is_active', 'is_staff'),
        }),
    )
