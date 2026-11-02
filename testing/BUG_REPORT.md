# DEFECT & BUG CLASSIFICATION REPORT

**PROJECT:** FRESH CAKE by PROVA  
**DATE:** October 26, 2026  
**QA TEAM:** Senior QA Engineer, White Box Specialist, Cybersecurity Engineer  
**TOTAL BUGS DISCOVERED:** 6  
**BUGS FIXED:** 6  
**BUGS REMAINING:** 0  

---

## 1. Bug Severity Summary

| Severity Level | Discovered | Fixed | Remaining | Percentage Resolved |
|---|---|---|---|---|
| **CRITICAL** | 2 | 2 | 0 | 100% |
| **HIGH** | 2 | 2 | 0 | 100% |
| **MEDIUM** | 2 | 2 | 0 | 100% |
| **LOW** | 0 | 0 | 0 | 100% |
| **TOTAL** | **6** | **6** | **0** | **100% FIXED** |

---

## 2. Detailed Bug Logs

### BUG-001 (CRITICAL): Server-Side Order Price Tampering Vulnerability
- **Affected Page / Module:** `backend/orders/views.py` (`OrderViewSet.create` & `OrderViewSet.preview`)
- **Reproduction Steps:**
  1. Prepare a checkout POST request to `/api/v1/orders/orders/`.
  2. Select an artisan cake priced at ৳1200.00.
  3. Modify the payload field: `'unit_price': '1.00'`.
  4. Submit the request.
- **Expected Behavior:** The server must calculate unit prices and subtotals authoritatively from `Product` and `ProductVariant` tables in PostgreSQL, rejecting or overriding any client-supplied price.
- **Actual Behavior (Before Fix):** The server directly took `unit_price = Decimal(str(item_data['unit_price']))` and persisted the order with a ৳1.00 total.
- **Root Cause:** Trusting untrusted client input for financial calculations without querying the database of record.
- **Fix Applied:** Implemented server-side authoritative lookup in `_resolve_pricing_and_items()`, pulling prices strictly from `ProductVariant.price` or `Product.price`.
- **Status:** **FIXED & VERIFIED** (Verified via automated test `test_price_tampering_prevention` and live `E2E-006`).

---

### BUG-002 (CRITICAL): Insecure Direct Object Reference (IDOR) on Orders
- **Affected Page / Module:** `backend/orders/views.py` (`OrderViewSet.get_object`)
- **Reproduction Steps:**
  1. Authenticate as Customer B (or remain unauthenticated).
  2. Send a `GET` request to `/api/v1/orders/orders/<customer_A_order_id>/` or `<customer_A_order_number>/`.
- **Expected Behavior:** Unauthenticated callers should be rejected with HTTP 403 / 401. Authenticated customers attempting to view another customer's order should receive HTTP 404 (Not Found).
- **Actual Behavior (Before Fix):** The endpoint directly queried `Order.objects.get(...)` across the entire database, returning Customer A's complete personal information, delivery address, phone number, and order items to any caller.
- **Root Cause:** `get_object()` bypassed `get_queryset()` filtering and omitted ownership verification.
- **Fix Applied:** Refactored `get_object()` to enforce authentication, query only from `self.get_queryset()` (scoped to `customer=request.user`), and handle `Order.DoesNotExist` cleanly.
- **Status:** **FIXED & VERIFIED** (Verified via automated test `test_order_idor_access_control` and live `E2E-009`).

---

### BUG-003 (HIGH): Insecure Direct Object Reference (IDOR) on Custom Cake Requests
- **Affected Page / Module:** `backend/custom_cakes/views.py` (`CustomCakeRequestViewSet.get_object`)
- **Reproduction Steps:**
  1. As an unauthenticated visitor, issue a `GET` or `POST /respond/` to `/api/v1/custom-cakes/requests/<request_id>/`.
- **Expected Behavior:** Requests belonging to customer accounts require authentication and ownership verification. Guest requests require phone verification.
- **Actual Behavior (Before Fix):** Any user could view or accept/reject someone else's custom cake request by guessing the request number.
- **Root Cause:** Missing caller identity and phone ownership verification on custom cake endpoints.
- **Fix Applied:** Added customer ownership and phone matching checks in `get_object()` and `customer_respond()`.
- **Status:** **FIXED & VERIFIED** (Verified via automated unit and live E2E tests).

---

### BUG-004 (HIGH): Missing Custom Cake Quotation to Order Conversion Endpoint
- **Affected Page / Module:** `backend/custom_cakes/views.py`
- **Reproduction Steps:**
  1. Submit a custom cake request.
  2. Receive an admin price quotation and accept it.
  3. Attempt to convert the accepted quotation into an official order for bakery production.
- **Expected Behavior:** An accepted quotation can be converted into an official `Order` with the quoted price, delivery address, and payment method. Any attempt to convert an unaccepted quotation (e.g. Pending Review or Rejected) must be rejected with HTTP 400.
- **Actual Behavior (Before Fix):** No backend endpoint existed to convert accepted quotations into orders, leaving accepted custom cakes stranded without order records.
- **Root Cause:** Incomplete feature integration between `custom_cakes` and `orders` apps.
- **Fix Applied:** Implemented `@action(detail=True, methods=['post'], url_path='create-order')` on `CustomCakeRequestViewSet`, with strict `quotation_status == ACCEPTED` validation and automatic `Order` + `OrderItem` generation.
- **Status:** **FIXED & VERIFIED** (Verified via automated test `test_customer_accept_and_convert_to_order` and live `E2E-011`).

---

### BUG-005 (MEDIUM): Missing Quotation Accept/Decline Action Buttons on Customer Account Page
- **Affected Page / Module:** `src/pages/AccountPage.tsx` & `src/services/storeService.ts`
- **Reproduction Steps:**
  1. Log into customer account.
  2. Open "Custom Cakes" tab.
  3. Locate a custom cake request where `quotation_status == 'Quotation Sent'`.
- **Expected Behavior:** The customer is presented with "Accept Quotation" and "Decline" action buttons with immediate UI feedback.
- **Actual Behavior (Before Fix):** Only the chef note and quotation amount were rendered; no buttons existed to accept or decline.
- **Root Cause:** UI buttons were omitted from the custom cake card in `AccountPage.tsx` and `storeService.ts` lacked a wrapper method.
- **Fix Applied:** Added `respondToCustomCakeQuotation` in `storeService.ts` and rendered "Accept Quotation" and "Decline" buttons with responsive feedback in `AccountPage.tsx`.
- **Status:** **FIXED & VERIFIED** (Verified in frontend TypeScript build and manual UI inspection).

---

### BUG-006 (MEDIUM): Product Reviews Omitted Delivered Order Purchase Verification
- **Affected Page / Module:** `backend/reviews/views.py` (`ProductReviewViewSet`)
- **Reproduction Steps:**
  1. As an authenticated user, submit a product review on an item never ordered.
- **Expected Behavior:** The review should be marked `is_verified = False` unless the customer has a confirmed delivered order for that product.
- **Actual Behavior (Before Fix):** All reviews were submitted with unverified status or defaulted without order verification.
- **Root Cause:** Missing cross-module check against `orders_orderitem`.
- **Fix Applied:** Added `perform_create()` hook checking `OrderItem.objects.filter(order__customer=user, order__order_status=DELIVERED, product=product).exists()`.
- **Status:** **FIXED & VERIFIED** (Verified via automated test `test_review_verified_purchase_true` and `test_review_without_delivered_order_unverified`).
