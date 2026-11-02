from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from drf_spectacular.utils import extend_schema

from .models import User, CustomerAddress
from .serializers import (
    CustomTokenObtainPairSerializer,
    CustomerRegisterSerializer,
    UserSerializer,
    CustomerAddressSerializer,
    PasswordChangeSerializer
)

@extend_schema(tags=['Authentication'])
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    User login with phone and password. Returns JWT access & refresh tokens along with user profile.
    """
    serializer_class = CustomTokenObtainPairSerializer

@extend_schema(tags=['Authentication'])
class CustomerRegisterView(generics.CreateAPIView):
    """
    Public customer account registration. Strictly creates CUSTOMER accounts.
    """
    queryset = User.objects.all()
    serializer_class = CustomerRegisterSerializer
    permission_classes = [permissions.AllowAny]

@extend_schema(tags=['Authentication'])
class MeView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update currently authenticated customer or admin profile.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

@extend_schema(tags=['Customer Addresses'])
class CustomerAddressViewSet(viewsets.ModelViewSet):
    """
    Manage saved delivery addresses for the authenticated customer.
    """
    serializer_class = CustomerAddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CustomerAddress.objects.filter(user=self.request.user)

@extend_schema(tags=['Authentication'])
class PasswordChangeView(APIView):
    """
    Secure password change for authenticated users.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
