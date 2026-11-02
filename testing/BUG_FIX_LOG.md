# SQA BUG FIX & ENGINEERING REMEDIATION LOG

**PROJECT:** FRESH CAKE by PROVA  
**DATE:** October 26, 2026  
**ENGINEERING TEAM:** Full-Stack & SQA Engineering Team  
**REMEDIATION CYCLE:** 100% Verified in Source Code and Regression Testing  

---

## 1. Remediation Chronology

### Fix #1: Server-Side Authoritative Pricing Enforcement
- **Defect Reference:** BUG-001 (CRITICAL)
- **Files Modified:** `backend/orders/views.py`
- **Rationale:** Financial calculations must never trust client-submitted unit prices.
- **Code Modifications:**
  - Added private helper method `_resolve_pricing_and_items(items_data, is_preview=False)`.
  - Authoritative price lookup pulls from `ProductVariant.price` if variant is selected, otherwise `Product.discount_price` or `Product.base_price`.
  - Calculated `line_total = unit_price * qty` and `subtotal += line_total` server-side.
  - Decremented product stock atomically for stock-controlled items using `models.F('current_stock') - qty`.
- **Verification:** Unit test `test_price_tampering_prevention` and Live E2E test `E2E-006` confirmed tamper prevention.

---

### Fix #2: IDOR Prevention on Order Retrieval
- **Defect Reference:** BUG-002 (CRITICAL)
- **Files Modified:** `backend/orders/views.py`
- **Rationale:** Eliminate direct object reference leakage of customer contact and address data.
- **Code Modifications:**
  - Updated `OrderViewSet.get_object()`:
    ```python
    if not user.is_authenticated:
        raise PermissionDenied("Authentication required to view order details. Use order tracking for guest orders.")
    qs = self.get_queryset() # Scoped to request.user if not admin
    ```
  - Added clean exception handling catching `Order.DoesNotExist` and raising DRF's `NotFound`.
- **Verification:** Unit test `test_order_idor_access_control` and Live E2E test `E2E-009` verified HTTP 403 / 404 enforcement.

---

### Fix #3: IDOR Prevention on Custom Cake Requests
- **Defect Reference:** BUG-003 (HIGH)
- **Files Modified:** `backend/custom_cakes/views.py`
- **Rationale:** Protect customer cake design notes and contact information from unauthorized viewers.
- **Code Modifications:**
  - Updated `CustomCakeRequestViewSet.get_object()` to verify caller ownership.
  - Added phone matching requirement in `customer_respond` for guest submissions.
- **Verification:** Automated unit suite and live runner confirmed permission denial on unauthorized requests.

---

### Fix #4: Custom Cake Quotation to Order Conversion Action
- **Defect Reference:** BUG-004 (HIGH)
- **Files Modified:** `backend/custom_cakes/views.py`
- **Rationale:** Connect custom cake workflow with bakery production order system, strictly forbidding unaccepted quotation orders.
- **Code Modifications:**
  - Added `@action(detail=True, methods=['post'], url_path='create-order')`:
    - Enforces `req_obj.quotation_status == CustomCakeRequest.QuotationStatus.ACCEPTED`.
    - Computes delivery fee based on selected `delivery_zone_code`.
    - Generates `Order` and `OrderItem` snapshots referencing custom cake specs.
    - Transitions `req_obj.quotation_status` to `COMPLETED`.
- **Verification:** Unit tests `test_customer_accept_and_convert_to_order` and `test_unaccepted_quotation_cannot_be_ordered`.

---

### Fix #5: Quotation Response UI in Customer Account
- **Defect Reference:** BUG-005 (MEDIUM)
- **Files Modified:** `src/pages/AccountPage.tsx`, `src/services/storeService.ts`
- **Rationale:** Allow customers to review quotes, accept, or decline directly from their account dashboard.
- **Code Modifications:**
  - Implemented `respondToCustomCakeQuotation` in `storeService.ts`.
  - Added "Accept Quotation" and "Decline" buttons in `AccountPage.tsx` under custom cake request cards when `quotation_status === 'Quotation Sent'`.
- **Verification:** Verified frontend production build compiles cleanly (`npm run build`).

---

### Fix #6: Verified Purchase Review Enforcement
- **Defect Reference:** BUG-006 (MEDIUM)
- **Files Modified:** `backend/reviews/views.py`
- **Rationale:** Ensure customer reviews carry verified buyer badges only when the customer has an actual delivered order.
- **Code Modifications:**
  - Implemented `perform_create()` in `ProductReviewViewSet`:
    ```python
    has_delivered_order = OrderItem.objects.filter(
        order__customer=user,
        order__order_status=Order.OrderStatus.DELIVERED,
        product=product
    ).exists()
    serializer.save(is_verified=has_delivered_order)
    ```
- **Verification:** Unit tests `test_review_verified_purchase_true` and `test_review_without_delivered_order_unverified`.

---

### Fix #7: Dynamic Checkout Coupon Validation & Payment Status Guard
- **Defect Reference:** Checkout Coupon & Payment Status Synchronization
- **Files Modified:** `src/pages/CheckoutPage.tsx`, `src/services/storeService.ts`
- **Rationale:** Hardcoded checkout coupon checks bypassed database-backed promotional campaigns. Additionally, client-submitted payments must start in `pending` payment status rather than self-verifying before admin approval.
- **Code Modifications:**
  - Implemented `storeService.validateCoupon(code, subtotal)` querying `POST /api/v1/coupons/validate/` with robust offline/promo fallback.
  - Linked `CheckoutPage.tsx` coupon handler to dynamic verification, displaying precise discount calculations and backend promo error messages.
  - Guarded initial order payment status to strictly default to `pending`, preserving administrative audit trails and payment verification integrity.
- **Verification:** Live E2E test `E2E-005` (Order preview & coupon calculation) and frontend build verification.

---

### Fix #8: Custom Cake Quotation-to-Order Conversion Modal & Execution Flow
- **Defect Reference:** Custom Cake Production Conversion Flow
- **Files Modified:** `src/pages/AccountPage.tsx`, `src/services/storeService.ts`
- **Rationale:** After accepting a custom cake price quotation, customers needed an intuitive, friction-free UI dialog to select delivery zone, delivery address, payment method (COD/bKash/Nagad), and place their official bakery order.
- **Code Modifications:**
  - Added "Place Official Order Now" action button on accepted quotation cards in `AccountPage.tsx`.
  - Added dedicated interactive order confirmation modal with dynamic delivery fee computation, bKash/Nagad instructions, and atomic conversion invocation via `storeService.convertCustomCakeToOrder()`.
  - Displayed "Official Order Placed" production badge for completed requests with quick link to live order tracking.
- **Verification:** Full frontend production build (`tsc -b && vite build`) passed with zero errors; live E2E test `E2E-011` validated endpoint constraints.

