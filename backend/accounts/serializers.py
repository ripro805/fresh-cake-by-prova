from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole, CustomerProfile, CustomerAddress

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT serializer supporting unified login via either Phone or Email.
    Returns access & refresh tokens along with verified user role from PostgreSQL.
    """
    username_field = 'identifier'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['identifier'] = serializers.CharField(required=False, write_only=True)
        self.fields['phone'] = serializers.CharField(required=False, write_only=True)
        self.fields['email'] = serializers.CharField(required=False, write_only=True)
        self.fields['username'] = serializers.CharField(required=False, write_only=True)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['phone'] = user.phone
        token['email'] = user.email or ''
        token['full_name'] = user.full_name
        token['role'] = user.role
        return token

    def validate(self, attrs):
        identifier = (
            attrs.get('identifier') or 
            attrs.get('phone') or 
            attrs.get('email') or 
            attrs.get('username') or 
            ''
        ).strip()
        password = attrs.get('password', '')

        if not identifier:
            raise serializers.ValidationError({"identifier": "Email or phone number is required."})

        # Match user by email or phone
        user = None
        if '@' in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
        else:
            cleaned_phone = identifier.replace(' ', '').replace('-', '')
            user = User.objects.filter(phone=cleaned_phone).first()
            if not user:
                user = User.objects.filter(phone=identifier).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError({
                "detail": "Invalid credentials. Please verify your email/phone and password."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "This account has been disabled. Please contact bakery support."
            })

        self.user = user

        refresh = self.get_token(user)
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': str(user.id),
                'phone': user.phone,
                'email': user.email or '',
                'full_name': user.full_name,
                'role': user.role,
                'is_staff': user.is_staff
            }
        }
        return data

class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'phone', 'email', 'full_name', 'password', 'password_confirm')
        read_only_fields = ('id',)

    def validate_phone(self, value):
        cleaned = value.strip().replace(' ', '')
        if User.objects.filter(phone=cleaned).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return cleaned

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Strictly enforce CUSTOMER role for public registration
        user = User.objects.create_user(
            phone=validated_data['phone'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            email=validated_data.get('email'),
            role=UserRole.CUSTOMER
        )
        return user

class CustomerAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerAddress
        fields = ('id', 'label', 'recipient_name', 'recipient_phone', 'delivery_zone', 'address_line', 'is_default', 'created_at')
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class CustomerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomerProfile
        fields = ('avatar', 'notes')

class UserSerializer(serializers.ModelSerializer):
    profile = CustomerProfileSerializer(read_only=True)
    addresses = CustomerAddressSerializer(many=True, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'phone', 'email', 'full_name', 'role', 'is_active', 'created_at', 'profile', 'addresses')
        read_only_fields = ('id', 'phone', 'role', 'is_active', 'created_at')

class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
