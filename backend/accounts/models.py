import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserRole(models.TextChoices):
    CUSTOMER = 'CUSTOMER', _('Customer')
    OWNER_ADMIN = 'OWNER_ADMIN', _('Owner Admin')

class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, full_name='', email=None, **extra_fields):
        if not phone:
            raise ValueError(_('Phone number is required for user account creation.'))
        
        email = self.normalize_email(email) if email else None
        phone = phone.strip()
        
        # Public registrations are strictly CUSTOMER
        role = extra_fields.pop('role', UserRole.CUSTOMER)
        
        user = self.model(
            phone=phone,
            email=email,
            full_name=full_name.strip(),
            role=role,
            **extra_fields
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, full_name='System Admin', email=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields['role'] = UserRole.OWNER_ADMIN

        return self.create_user(phone, password, full_name, email, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, unique=True, db_index=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True, db_index=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CUSTOMER,
        db_index=True
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.phone}) [{self.role}]"

    @property
    def is_owner_admin(self):
        return self.role == UserRole.OWNER_ADMIN

class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    notes = models.TextField(blank=True, help_text='Internal customer preferences or delivery instructions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.full_name}"

class DeliveryZoneChoice(models.TextChoices):
    INSIDE_KUSHTIA = 'INSIDE_KUSHTIA', _('Inside Kushtia Town')
    OUTSIDE_KUSHTIA = 'OUTSIDE_KUSHTIA', _('Outside Kushtia Town')

class CustomerAddress(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=50, default='Home', help_text='e.g. Home, Workplace, Party Venue')
    recipient_name = models.CharField(max_length=150)
    recipient_phone = models.CharField(max_length=20)
    delivery_zone = models.CharField(
        max_length=30,
        choices=DeliveryZoneChoice.choices,
        default=DeliveryZoneChoice.INSIDE_KUSHTIA
    )
    address_line = models.TextField(help_text='House, Road, Area, Landmark in Kushtia')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('Customer Address')
        verbose_name_plural = _('Customer Addresses')
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.label}: {self.address_line[:30]} ({self.recipient_name})"

    def save(self, *args, **kwargs):
        if self.is_default:
            CustomerAddress.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
