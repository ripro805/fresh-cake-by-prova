from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User, UserRole

class AccountsAuthenticationTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/auth/register/'
        self.login_url = '/api/v1/auth/login/'
        self.me_url = '/api/v1/auth/me/'

        self.customer_user = User.objects.create_user(
            phone='01711000001',
            password='Password123!',
            full_name='Test Customer',
            email='customer@example.com'
        )

        self.admin_user = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPassword123!',
            full_name='Owner Admin',
            email='admin@freshcake.com'
        )

    def test_customer_registration_success(self):
        payload = {
            'phone': '01812345678',
            'full_name': 'New Customer',
            'email': 'newcustomer@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['phone'], '01812345678')
        created_user = User.objects.get(phone='01812345678')
        self.assertEqual(created_user.role, UserRole.CUSTOMER)

    def test_registration_cannot_escalate_role(self):
        """Verify that public registration can NEVER create an OWNER_ADMIN account."""
        payload = {
            'phone': '01899999999',
            'full_name': 'Attacker',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'role': 'OWNER_ADMIN'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        created_user = User.objects.get(phone='01899999999')
        self.assertEqual(created_user.role, UserRole.CUSTOMER)
        self.assertFalse(created_user.is_staff)

    def test_registration_duplicate_phone_rejected(self):
        payload = {
            'phone': '01711000001',
            'full_name': 'Duplicate User',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registration_password_mismatch_rejected(self):
        payload = {
            'phone': '01811112222',
            'full_name': 'Mismatch User',
            'password': 'PasswordOne1!',
            'password_confirm': 'PasswordTwo2!'
        }
        response = self.client.post(self.register_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success_with_phone(self):
        payload = {
            'identifier': '01711000001',
            'password': 'Password123!'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_credentials_rejected(self):
        payload = {
            'identifier': '01711000001',
            'password': 'WrongPassword!'
        }
        response = self.client.post(self.login_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_me_authenticated(self):
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], '01711000001')

    def test_get_me_unauthenticated_rejected(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
