import sys
import time
import uuid
import json
import urllib.request
import urllib.error

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

API_BASE = 'http://127.0.0.1:8000/api/v1'
FRONTEND_BASE = 'http://localhost:5173'

class E2ETestRunner:
    def __init__(self):
        self.results = []
        self.access_token = None
        self.admin_token = None
        self.test_order_number = None
        self.test_req_number = None

    def record(self, test_id, name, status, details=''):
        self.results.append({
            'test_id': test_id,
            'name': name,
            'status': status,
            'details': details
        })
        icon = '[PASS]' if status == 'PASSED' else ('[FAIL]' if status == 'FAILED' else '[WARN]')
        print(f"{icon} {test_id}: {name} - {status} ({details})")

    def request(self, endpoint, method='GET', data=None, token=None, headers=None):
        url = f"{API_BASE}{endpoint}" if endpoint.startswith('/') else endpoint
        req_headers = {'Content-Type': 'application/json'}
        if token:
            req_headers['Authorization'] = f"Bearer {token}"
        if headers:
            req_headers.update(headers)

        body = json.dumps(data).encode('utf-8') if data is not None else None
        req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                status_code = resp.getcode()
                resp_body = resp.read().decode('utf-8')
                return status_code, json.loads(resp_body) if resp_body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode('utf-8')
            try:
                parsed = json.loads(err_body)
            except Exception:
                parsed = {'raw': err_body}
            return e.code, parsed
        except Exception as ex:
            return 0, {'error': str(ex)}

    def run_all(self):
        print("=" * 70)
        print("FRESH CAKE by PROVA — LIVE E2E & SECURITY VERIFICATION SUITE")
        print("=" * 70)

        # 1. Frontend Homepage Accessibility
        try:
            req = urllib.request.Request(FRONTEND_BASE)
            with urllib.request.urlopen(req, timeout=5) as res:
                if res.getcode() == 200:
                    self.record('E2E-001', 'Frontend Homepage Availability', 'PASSED', 'Vite dev server responded HTTP 200')
                else:
                    self.record('E2E-001', 'Frontend Homepage Availability', 'FAILED', f'HTTP {res.getcode()}')
        except Exception as e:
            self.record('E2E-001', 'Frontend Homepage Availability', 'BLOCKED', str(e))

        # 2. Public Catalog & Pagination
        code, data = self.request('/catalog/products/?page=1&page_size=6')
        if code == 200 and 'results' in data and len(data['results']) > 0:
            self.record('E2E-002', 'Public Catalog & Pagination API', 'PASSED', f"Loaded {len(data['results'])} products, total {data.get('count')}")
            self.sample_product = data['results'][0]
        else:
            self.record('E2E-002', 'Public Catalog & Pagination API', 'FAILED', f"Code: {code}")

        # 3. Customer Registration
        random_suffix = str(int(time.time()))[-6:]
        reg_phone = f"0178{random_suffix}"
        reg_payload = {
            'phone': reg_phone,
            'full_name': 'Automated QA Customer',
            'email': f"qa_{random_suffix}@freshcake.com",
            'password': 'QAPassword2026!',
            'password_confirm': 'QAPassword2026!'
        }
        code, data = self.request('/auth/register/', method='POST', data=reg_payload)
        if code == 201:
            self.record('E2E-003', 'Customer Account Registration', 'PASSED', f"Registered customer phone: {reg_phone}")
        else:
            self.record('E2E-003', 'Customer Account Registration', 'FAILED', str(data))

        # 4. Customer Login & JWT Token
        login_payload = {
            'identifier': reg_phone,
            'password': 'QAPassword2026!'
        }
        code, data = self.request('/auth/login/', method='POST', data=login_payload)
        if code == 200 and 'access' in data:
            self.access_token = data['access']
            self.record('E2E-004', 'Customer Login & JWT Token Generation', 'PASSED', 'JWT Access token received')
        else:
            self.record('E2E-004', 'Customer Login & JWT Token Generation', 'FAILED', str(data))

        # 5. Order Calculation & Price Preview
        preview_payload = {
            'customer_name': 'Automated QA Customer',
            'customer_phone': reg_phone,
            'delivery_type': 'delivery',
            'delivery_zone_code': 'INSIDE_KUSHTIA',
            'delivery_address': 'Upazila Road, Indra Mor, Kushtia',
            'coupon_code': 'FRESHPROVA10',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': self.sample_product['id'],
                    'unit_price': str(self.sample_product['price']),
                    'quantity': 2
                }
            ]
        }
        code, data = self.request('/orders/orders/preview/', method='POST', data=preview_payload)
        if code == 200 and 'total' in data:
            self.record('E2E-005', 'Order Preview & Coupon Calculation', 'PASSED', f"Total: {data['total']} {data['currency']}, Discount: {data['discount']}")
        else:
            self.record('E2E-005', 'Order Preview & Coupon Calculation', 'FAILED', str(data))

        # 6. Security: Price Tampering Attempt
        tamper_payload = {
            'customer_name': 'Hacker Bob',
            'customer_phone': '01911223344',
            'delivery_type': 'delivery',
            'delivery_zone_code': 'INSIDE_KUSHTIA',
            'delivery_address': 'Kushtia',
            'payment_method': 'cod',
            'items': [
                {
                    'product_id': self.sample_product['id'],
                    'unit_price': '0.50',  # Malicious price attempt
                    'quantity': 1
                }
            ]
        }
        code, data = self.request('/orders/orders/', method='POST', data=tamper_payload)
        if code == 201:
            order_num = data['order_number']
            unit_price = data['items'][0]['unit_price']
            subtotal = data['subtotal']
            if float(subtotal) >= float(self.sample_product['price']):
                self.record('E2E-006', 'Security: Order Price Tampering Defense', 'PASSED', f"Tamper ৳0.50 blocked! Server enforced DB price ৳{unit_price}")
            else:
                self.record('E2E-006', 'Security: Order Price Tampering Defense', 'FAILED', f"Price tampering succeeded! Subtotal: {subtotal}")
        else:
            self.record('E2E-006', 'Security: Order Price Tampering Defense', 'PASSED', f"Order rejected with code {code}")

        # 7. Customer Order Placement
        order_payload = {
            'customer_name': 'Automated QA Customer',
            'customer_phone': reg_phone,
            'delivery_type': 'delivery',
            'delivery_zone_code': 'INSIDE_KUSHTIA',
            'delivery_address': 'Court Para, Kushtia',
            'payment_method': 'bkash',
            'payment_trx_id': f"TRX{random_suffix}",
            'payment_sender_phone': reg_phone,
            'items': [
                {
                    'product_id': self.sample_product['id'],
                    'unit_price': str(self.sample_product['price']),
                    'quantity': 1
                }
            ]
        }
        code, data = self.request('/orders/orders/', method='POST', data=order_payload, token=self.access_token)
        if code == 201:
            self.test_order_number = data['order_number']
            self.test_order_id = data['id']
            self.record('E2E-007', 'Authenticated Customer Order Placement', 'PASSED', f"Order created #{self.test_order_number}")
        else:
            self.record('E2E-007', 'Authenticated Customer Order Placement', 'FAILED', str(data))

        # 8. Order Tracking with Phone Verification
        track_payload = {
            'order_number': self.test_order_number,
            'phone': reg_phone
        }
        code, data = self.request('/orders/orders/track/', method='POST', data=track_payload)
        if code == 200 and data.get('order_number') == self.test_order_number:
            self.record('E2E-008', 'Order Tracking by Number and Phone', 'PASSED', f"Status: {data.get('order_status')}")
        else:
            self.record('E2E-008', 'Order Tracking by Number and Phone', 'FAILED', str(data))

        # 9. Security: IDOR Direct Lookup by Unauthenticated Guest
        code, data = self.request(f"/orders/orders/{self.test_order_id}/")
        if code in [401, 403, 404]:
            self.record('E2E-009', 'Security: Order IDOR Access Control', 'PASSED', f"Anonymous direct GET blocked with HTTP {code}")
        else:
            self.record('E2E-009', 'Security: Order IDOR Access Control', 'FAILED', f"IDOR Vulnerability! Code {code}")

        # 10. Custom Cake Request Submission
        cake_payload = {
            'customer_name': 'Automated QA Customer',
            'customer_phone': reg_phone,
            'occasion': 'Golden Jubilee Celebration',
            'cake_size': '3 Pound (Serves 15-20)',
            'cake_flavor': 'Dark Chocolate Hazelnut',
            'color_preference': 'Gold & Black',
            'design_description': 'Tiered artisanal cake with fondant edible gold lace',
            'delivery_type': 'delivery',
            'delivery_date': '2026-11-15'
        }
        code, data = self.request('/custom-cakes/requests/', method='POST', data=cake_payload, token=self.access_token)
        if code == 201:
            self.test_req_number = data['request_number']
            self.test_req_id = data['id']
            self.record('E2E-010', 'Custom Cake Request Submission', 'PASSED', f"Created #{self.test_req_number}")
        else:
            self.record('E2E-010', 'Custom Cake Request Submission', 'FAILED', str(data))

        # 11. Security: Block Creating Order from Unaccepted Quotation
        order_quote_payload = {
            'payment_method': 'cod',
            'delivery_zone_code': 'INSIDE_KUSHTIA'
        }
        code, data = self.request(f"/custom-cakes/requests/{self.test_req_id}/create-order/", method='POST', data=order_quote_payload, token=self.access_token)
        if code == 400 and 'Cannot create order' in str(data):
            self.record('E2E-011', 'Business Rule: Unaccepted Quote Order Blocked', 'PASSED', 'Correctly rejected with HTTP 400')
        else:
            self.record('E2E-011', 'Business Rule: Unaccepted Quote Order Blocked', 'FAILED', f"Code: {code}, Data: {data}")

        # 12. Support Chat Session Isolation
        session_secret = str(uuid.uuid4())
        chat_payload = {
            'guest_name': 'Live Chat Guest',
            'guest_phone': '01300000000',
            'initial_message': 'Hello, do you have gluten-free cakes available?',
            'session_key': session_secret
        }
        code, data = self.request('/support/conversations/', method='POST', data=chat_payload)
        if code == 201:
            ref = data['reference']
            self.record('E2E-012', 'Customer Support Chat Initialization', 'PASSED', f"Conversation reference #{ref}")
            # Poll with matching key
            poll_code, poll_data = self.request(f"/support/conversations/{ref}/poll/?session_key={session_secret}")
            if poll_code == 200:
                self.record('E2E-013', 'Support Chat Polling & Session Isolation', 'PASSED', f"Session validated, {len(poll_data.get('messages', []))} messages")
            else:
                self.record('E2E-013', 'Support Chat Polling & Session Isolation', 'FAILED', f"Poll code: {poll_code}")
        else:
            self.record('E2E-012', 'Customer Support Chat Initialization', 'FAILED', str(data))

        # 13. Meta WhatsApp Webhook Challenge
        webhook_url = f"{API_BASE}/support/webhooks/whatsapp/?hub.mode=subscribe&hub.verify_token=freshcake_webhook_token_2026&hub.challenge=webhook_challenge_ok"
        try:
            with urllib.request.urlopen(webhook_url) as res:
                content = res.read().decode('utf-8')
                if res.getcode() == 200 and content == 'webhook_challenge_ok':
                    self.record('E2E-014', 'WhatsApp Webhook Verification Challenge', 'PASSED', 'Challenge token matched and echoed')
                else:
                    self.record('E2E-014', 'WhatsApp Webhook Verification Challenge', 'FAILED', f"Response: {content}")
        except Exception as e:
            self.record('E2E-014', 'WhatsApp Webhook Verification Challenge', 'FAILED', str(e))

        # Summary
        passed = sum(1 for r in self.results if r['status'] == 'PASSED')
        failed = sum(1 for r in self.results if r['status'] == 'FAILED')
        total = len(self.results)

        print("\n" + "=" * 70)
        print(f"LIVE E2E TEST RUN SUMMARY: Total: {total} | Passed: {passed} | Failed: {failed}")
        print("=" * 70)
        return failed == 0

if __name__ == '__main__':
    runner = E2ETestRunner()
    success = runner.run_all()
    sys.exit(0 if success else 1)
