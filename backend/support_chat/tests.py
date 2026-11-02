from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from support_chat.models import SupportConversation, SupportMessage, ConversationStatus, MessageSenderType

class SupportChatTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            phone='01308516242',
            password='AdminPass123!',
            full_name='Owner Admin'
        )

    def test_create_support_conversation_and_message(self):
        payload = {
            'guest_name': 'Bakery Visitor',
            'guest_phone': '01711223344',
            'message': 'Do you deliver to Disha Tower in Kushtia?',
            'session_key': 'session-secret-abc-123'
        }
        res = self.client.post('/api/v1/support/conversations/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('reference', res.data)
        ref = res.data['reference']
        self.assertTrue(ref.startswith('FC-'))

        conv = SupportConversation.objects.get(reference=ref)
        self.assertEqual(conv.status, ConversationStatus.OPEN)
        self.assertEqual(conv.messages.count(), 1)
        self.assertEqual(conv.messages.first().sender_type, MessageSenderType.CUSTOMER)

    def test_guest_session_isolation(self):
        """
        SECURITY TEST:
        Guest A's conversation cannot be read by another visitor without matching session_key.
        """
        conv = SupportConversation.objects.create(
            reference='FC-5555',
            guest_name='Private Guest',
            guest_phone='01700009999',
            session_key='secret-key-guest-A',
            assigned_whatsapp_number='+8801308516242'
        )
        SupportMessage.objects.create(
            conversation=conv,
            sender_type=MessageSenderType.CUSTOMER,
            text='My secret celebration message'
        )

        # Visitor without secret key is rejected
        res = self.client.get('/api/v1/support/conversations/FC-5555/poll/?session_key=wrong-key')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

        # Visitor with correct secret key can view messages
        res_ok = self.client.get('/api/v1/support/conversations/FC-5555/poll/?session_key=secret-key-guest-A')
        self.assertEqual(res_ok.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_ok.data['messages']), 1)

    def test_whatsapp_webhook_challenge(self):
        """Meta webhook verification challenge returns the challenge string."""
        verify_token = 'freshcake_webhook_token_2026'
        challenge = 'challenge_random_12345'
        url = f'/api/v1/support/webhooks/whatsapp/?hub.mode=subscribe&hub.verify_token={verify_token}&hub.challenge={challenge}'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.content.decode('utf-8'), challenge)
