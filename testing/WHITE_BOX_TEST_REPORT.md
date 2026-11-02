# WHITE BOX TESTING & INTERNAL ARCHITECTURE AUDIT

**PROJECT:** FRESH CAKE by PROVA  
**DATE:** October 26, 2026  
**AUDITOR:** White Box Specialist & Senior Backend/Frontend Engineers  
**SCOPE:** Internal Source Code, Controllers, Serializers, Transactions, and Data Models  

---

## 1. Frontend Architecture Audit (React 18 + TypeScript + Vite)

### 1.1 State Management & Hooks
- **Component Lifecycle & Memory Leaks:**
  - Audited `RealCake3DInteractive.tsx`: Resolved WebGL context loss caused by unmounting/remounting during 3D vs Sponge Layer switches. Context is now retained permanently with CSS opacity and pointer-events toggling, eliminating WebGL context memory leaks.
  - Audited `SupportChatWidget.tsx`: Interval polling correctly clears timers on component unmount (`clearInterval(pollInterval)`).
- **TypeScript Type Safety:**
  - Full codebase passes `tsc -b` with zero errors.
  - Unified types in `src/types/index.ts` strictly align with backend serializable models.
  - Component props for `Pagination.tsx` support both `totalCount` and `totalItems` with type fallback safeguards.

### 1.2 Routing & Navigation Guards
- Protected routes in `src/App.tsx` use `useAuth()` context to inspect the stored user's role. Non-admin users are strictly blocked from `/admin/*` routes and redirected to `/login` or `/account`.

---

## 2. Backend Architecture Audit (Django 5.1 + Django REST Framework)

### 2.1 Server-Side Price & Calculation Integrity (BUG-001 Remediation)
- **Vulnerability Discovered:**
  - Prior implementation in `backend/orders/views.py` (lines 150-153) trusted client-submitted `item_data['unit_price']`:
    ```python
    # VULNERABLE CODE (PRE-FIX)
    unit_price = Decimal(str(item_data['unit_price']))
    qty = item_data['quantity']
    line_total = unit_price * qty
    subtotal += line_total
    ```
- **White Box Root Cause:**
  - Trusting user input for financial calculations without querying the database of record.
- **Remediation Implemented:**
  - Created private helper `_resolve_pricing_and_items()` in `OrderViewSet`.
  - Queries `Product` and `ProductVariant` directly in PostgreSQL. If a variant is specified, uses `variant.price`; otherwise uses `prod.discount_price if prod.discount_price is not None else prod.base_price`.
  - Overwrites and discards any client-supplied unit price.

### 2.2 Concurrency & Race Condition Prevention
- **Issue Discovered:**
  - Concurrent order placements could over-subscribe inventory for daily limited batches (`stock_mode == STOCK_CONTROLLED`).
- **Remediation Implemented:**
  - Atomic order placement wrapped in `@transaction.atomic`.
  - Atomic field updates using `models.F('current_stock') - qty`.
  - Checked `current_stock >= qty` inside the transaction before committing the order.

### 2.3 Broken Access Control & IDOR Vulnerabilities (BUG-002 & BUG-003 Remediation)
- **Vulnerability Discovered:**
  - `get_object()` in `OrderViewSet` and `CustomCakeRequestViewSet` queried `Order.objects.get(...)` without checking `request.user`.
  - Allowed any authenticated customer or unauthenticated guest to view another customer's full address, phone number, and items by guessing order numbers or UUIDs.
- **Remediation Implemented:**
  - Refactored `get_object()` in both viewsets:
    1. If `not request.user.is_authenticated`, direct `GET /orders/<id>/` is denied with `PermissionDenied`. Anonymous tracking is only permitted through `POST /orders/track/` where the phone number must match.
    2. If `request.user.role != 'OWNER_ADMIN'`, `get_queryset()` strictly filters by `customer=request.user`. Attempting to access another user's order raises `NotFound` (404), preventing IDOR leakage.

### 2.4 Custom Cake Order Conversion (BUG-004 Remediation)
- **Feature Gap Identified:**
  - The business requirement dictates: "Order creation from accepted quotation; verify that a custom cake order cannot be created using an unaccepted quotation."
  - The codebase lacked a dedicated order conversion endpoint.
- **Remediation Implemented:**
  - Implemented `@action(detail=True, methods=['post'], url_path='create-order')` in `CustomCakeRequestViewSet`.
  - Validates `req_obj.quotation_status == QuotationStatus.ACCEPTED`. If not accepted (e.g., Pending, Quotation Sent, Rejected), returns HTTP 400 Bad Request.
  - Automatically generates an official `Order` with `OrderItem` snapshots referencing the custom cake occasion, tiers, flavor, and approved quotation amount.
  - Transitions `quotation_status` to `COMPLETED`.

---

## 3. Database Schema & Query Optimization Audit

### 3.1 N+1 Query Elimination
- `OrderViewSet`: uses `prefetch_related('items', 'timeline').select_related('delivery_zone', 'customer')`, reducing queries per order listing from $3N+1$ to a constant 3 queries.
- `PaymentSubmissionViewSet`: uses `select_related('order')`.
- `FinishedGoodStockViewSet`: uses `select_related('product', 'product__category')`.
- `SupportConversationViewSet`: uses `prefetch_related('messages')`.

### 3.2 Audit Logging
- Changes to WhatsApp configuration destination numbers trigger automatic records in `audit_auditlog` with previous and new numbers, timestamp, and modifying user.

---

## 4. Code Quality & Linting Verification

- Python Backend: System check identified **0 issues**.
- Frontend TypeScript: `tsc -b` exited with **Code 0**.
- Vite Bundle Build: Built in **808ms**, producing optimized, tree-shaken chunks.
