# UNIT TESTING REPORT

**PROJECT:** FRESH CAKE by PROVA  
**FRAMEWORK:** Django Test Runner (`django.test.TestCase` + PostgreSQL Test DB)  
**TOTAL UNIT & INTEGRATION TESTS:** 42  
**PASSED:** 42  
**FAILED:** 0  
**EXECUTION TIME:** 59.967 seconds  
**DATE:** October 26, 2026  

---

## 1. Test Suite Summary by Module

| Module / App | Test File | Test Count | Passed | Failed | Status |
|---|---|---|---|---|---|
| Accounts & Auth | `backend/accounts/tests.py` | 8 | 8 | 0 | 100% PASSED |
| Catalog & Pricing | `backend/catalog/tests.py` | 6 | 6 | 0 | 100% PASSED |
| Orders & Anti-Tampering | `backend/orders/tests.py` | 7 | 7 | 0 | 100% PASSED |
| Custom Cakes & Quotations | `backend/custom_cakes/tests.py` | 4 | 4 | 0 | 100% PASSED |
| Payments & Collections | `backend/payments/tests.py` | 4 | 4 | 0 | 100% PASSED |
| Finance & P&L | `backend/finance/tests.py` | 2 | 2 | 0 | 100% PASSED |
| Coupons & Discounts | `backend/coupons/tests.py` | 3 | 3 | 0 | 100% PASSED |
| Dual-Tier Inventory | `backend/inventory/tests.py` | 3 | 3 | 0 | 100% PASSED |
| Support Chat & Webhook | `backend/support_chat/tests.py` | 3 | 3 | 0 | 100% PASSED |
| Reviews & Order Validation | `backend/reviews/tests.py` | 2 | 2 | 0 | 100% PASSED |
| **TOTALS** | **10 Test Suites** | **42** | **42** | **0** | **100% OK** |

---

## 2. Detailed Unit Test Execution Results

### 2.1 Accounts & Authentication (`accounts.tests.AccountsAuthenticationTestCase`)
1. `test_customer_registration_success`: Verified registration generates customer account with phone, full name, and returns HTTP 201. (PASSED)
2. `test_registration_cannot_escalate_role`: Verified passing `role: "OWNER_ADMIN"` during public registration is stripped, ensuring strictly `CUSTOMER` role. (PASSED)
3. `test_registration_duplicate_phone_rejected`: Duplicate phone returns HTTP 400 with uniqueness validation error. (PASSED)
4. `test_registration_password_mismatch_rejected`: Mismatched passwords rejected with HTTP 400. (PASSED)
5. `test_login_success_with_phone`: Verified valid phone/password returns JWT access and refresh tokens. (PASSED)
6. `test_login_invalid_credentials_rejected`: Wrong password returns HTTP 400 Bad Request. (PASSED)
7. `test_get_me_authenticated`: Authenticated customer retrieves their own phone and name. (PASSED)
8. `test_get_me_unauthenticated_rejected`: Anonymous request to `/auth/me/` returns HTTP 401 Unauthorized. (PASSED)

### 2.2 Catalog & Pricing (`catalog.tests.CatalogTestCase`)
9. `test_effective_price_with_discount`: `Product.price` returns `discount_price` (৳1050) over `base_price` (৳1200). (PASSED)
10. `test_effective_price_without_discount`: `Product.price` falls back to `base_price` (৳850) when no discount exists. (PASSED)
11. `test_product_variant_pricing`: `ProductVariant.price` evaluates to ৳2100 independently. (PASSED)
12. `test_catalog_api_listing`: `/catalog/products/` returns paginated dictionary with `results`, `count`, `current_page`. (PASSED)
13. `test_catalog_api_filter_by_category`: Querying `?category=celebration-cakes` scopes results to matching category. (PASSED)
14. `test_catalog_api_slug_detail`: Querying product slug returns product details and variant list. (PASSED)

### 2.3 Orders & Pricing Security (`orders.tests.OrdersModuleTestCase`)
15. `test_price_tampering_prevention`: Client POST with tampered `unit_price: 1.00` is rejected; server enforces DB price ৳900.00, subtotal ৳1800.00, total ৳1850.00. (PASSED)
16. `test_variant_pricing_enforcement`: Client POST with variant and tampered unit price is overridden by authoritative `variant.price` (৳1800.00). (PASSED)
17. `test_stock_deduction_on_order`: Ordering 3 units decrements `current_stock` from 10 to 7. (PASSED)
18. `test_insufficient_stock_rejection`: Ordering 999 units when stock is 10 returns HTTP 400 Bad Request. (PASSED)
19. `test_coupon_discount_calculation`: 10% coupon correctly computes ৳90.00 discount on ৳900 subtotal. (PASSED)
20. `test_order_idor_access_control`: Customer 2 cannot access Customer 1's order via direct GET; anonymous caller blocked with 403; Admin can access. (PASSED)
21. `test_order_tracking_endpoint`: Phone-verified lookup allows guest order tracking, rejecting mismatched phone numbers. (PASSED)

### 2.4 Custom Cake Quotations (`custom_cakes.tests.CustomCakesTestCase`)
22. `test_custom_cake_submission`: 5-step form POST creates request with unique `CR-YYYYMMDD-XXXX` and `Pending Review` status. (PASSED)
23. `test_admin_send_quotation`: Admin submits quotation amount ৳2500.00; status becomes `Quotation Sent`. Non-admin blocked with 403. (PASSED)
24. `test_customer_accept_and_convert_to_order`: Customer accepts quote; `/create-order/` generates official `Order` with quote subtotal; request status becomes `Completed`. (PASSED)
25. `test_unaccepted_quotation_cannot_be_ordered`: Attempting to order a request in `Pending Review` status returns HTTP 400 Bad Request. (PASSED)

### 2.5 Payments & Cash Collections (`payments.tests.PaymentsTestCase`)
26. `test_payment_submission_creation`: Customer submits bKash TrxID; submission created in `PENDING` status. (PASSED)
27. `test_admin_payment_verification`: Admin verifies payment; updates order to `payment_status=VERIFIED`, `order_status=CONFIRMED`. (PASSED)
28. `test_admin_payment_rejection`: Admin rejects payment; updates order to `payment_status=FAILED`. (PASSED)
29. `test_cash_collection_workflow`: Rider records COD cash collection; updates order to `order_status=DELIVERED`, `payment_status=VERIFIED`. (PASSED)

### 2.6 Finance & P&L (`finance.tests.FinanceTestCase`)
30. `test_finance_summary_p_and_l`: Recognized revenue (৳2500) - Expenses (৳1100) = Net Profit (৳1400). Pending orders excluded. (PASSED)
31. `test_customer_cannot_access_finance`: Regular customer blocked from financial summary with HTTP 403 Forbidden. (PASSED)

### 2.7 Coupons & Discounts (`coupons.tests.CouponsTestCase`)
32. `test_coupon_min_order_amount_enforcement`: Coupon rejected if subtotal is below minimum spend requirement. (PASSED)
33. `test_percentage_discount_calculation_and_cap`: 15% discount computed accurately and capped at `max_discount_amount` (৳300). (PASSED)
34. `test_fixed_discount_calculation`: Fixed amount discount (৳100) applied accurately. (PASSED)

### 2.8 Dual-Tier Inventory (`inventory.tests.InventoryTestCase`)
35. `test_low_stock_property`: `is_low_stock` returns True when stock is at or below minimum threshold. (PASSED)
36. `test_restock_ingredient_endpoint`: Admin restocks 20kg; updates stock to 24kg and logs `StockMovement` of type `RESTOCK`. (PASSED)
37. `test_adjust_finished_goods_stock`: Batch adjustment updates current quantity and logs `ADJUSTMENT` movement. (PASSED)

### 2.9 Support Chat & Webhook (`support_chat.tests.SupportChatTestCase`)
38. `test_create_support_conversation_and_message`: Generates unique `FC-XXXX` reference and initial customer message. (PASSED)
39. `test_guest_session_isolation`: Polling with mismatched session key returns HTTP 404, preventing conversation leakage. (PASSED)
40. `test_whatsapp_webhook_challenge`: Meta webhook subscription challenge echoes `hub.challenge` token with HTTP 200. (PASSED)

### 2.10 Product Reviews (`reviews.tests.ReviewsTestCase`)
41. `test_review_verified_purchase_true`: Customer with a delivered order for product receives `is_verified=True`. (PASSED)
42. `test_review_without_delivered_order_unverified`: Customer without delivered order receives `is_verified=False`. (PASSED)

---

## 3. Execution Command & Terminal Output Verification

```bash
.\backend\venv\Scripts\python.exe manage.py test
Creating test database for alias 'default'...
..........................................
----------------------------------------------------------------------
Ran 42 tests in 59.967s

OK
Destroying test database for alias 'default'...
Found 42 test(s).
System check identified no issues (0 silenced).
```
