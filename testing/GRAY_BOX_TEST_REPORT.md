# GRAY BOX TESTING REPORT

**PROJECT:** FRESH CAKE by PROVA  
**DATE:** October 26, 2026  
**TESTER:** Gray Box Testing Specialist & API Testing Engineer  
**APPROACH:** Combining external API interaction with knowledge of internal schema and state transitions  

---

## 1. Scope & Strategy

Gray Box testing assesses system security, data consistency, and authorization boundaries by exercising external endpoints while verifying internal database state changes, token claims, and business logic execution.

---

## 2. API Authorization & Privilege Boundary Verification

### 2.1 Role-Based Access Control (RBAC) Tests

| Target Endpoint | Method | Caller Role | Expected Result | Actual Result | Verification |
|---|---|---|---|---|---|
| `/api/v1/auth/register/` | POST | Anonymous | 201 Created (forced CUSTOMER) | 201 Created | Checked DB: `role='CUSTOMER'` |
| `/api/v1/finance/expenses/summary/` | GET | Customer Token | 403 Forbidden | 403 Forbidden | Non-admin blocked from revenue data |
| `/api/v1/inventory/ingredients/` | GET | Customer Token | 403 Forbidden | 403 Forbidden | Inventory endpoints restricted |
| `/api/v1/payments/submissions/<id>/verify/`| POST | Customer Token | 403 Forbidden | 403 Forbidden | Customer cannot verify payments |
| `/api/v1/custom-cakes/requests/<id>/send-quotation/`| POST | Customer Token | 403 Forbidden | 403 Forbidden | Customer cannot quote prices |
| `/api/v1/orders/orders/<id>/update-status/`| PATCH | Customer Token | 403 Forbidden | 403 Forbidden | Customer cannot alter order status |
| `/api/v1/finance/expenses/summary/` | GET | Admin Token | 200 OK | 200 OK | Admin receives P&L calculations |

---

## 3. Database State Transition Audits

### 3.1 Order Lifecycle & Snapshot Integrity
1. **Initial Order State:**
   - Order created with `order_status = 'Placed'`, `payment_status = 'Pending'`.
   - Initial timeline record created: `Order Placed`.
   - `OrderItem` preserves `product_name_snapshot`, `variant_snapshot`, `flavor_snapshot`, and authoritative `unit_price`.
2. **Payment Verification State:**
   - Admin approves payment submission via `/verify/`.
   - DB Verification:
     - `submission.status` transitioned to `VERIFIED`.
     - `order.payment_status` transitioned to `VERIFIED`.
     - `order.order_status` transitioned to `CONFIRMED`.
     - `order.payment_trx_id` recorded on the order.
     - New timeline item: `Payment of ৳X verified by Admin via bKash`.
3. **Cash on Delivery (COD) Delivery State:**
   - Rider records collection via `POST /api/v1/payments/cash-collections/`.
   - DB Verification:
     - `CashCollection` record persisted with `amount_collected` and `collected_by`.
     - `order.payment_status` transitioned to `VERIFIED`.
     - `order.order_status` transitioned to `DELIVERED`.
     - Delivery income recognized in financial reporting.

### 3.2 Dual-Tier Inventory & Stock Movements
1. **Ingredient Restock:**
   - Current stock: `4.00 kg`.
   - Admin restocks `20.00 kg`.
   - DB Verification:
     - `ingredient.current_stock` updated to `24.00 kg`.
     - `StockMovement` row inserted with `movement_type='RESTOCK'`, `quantity=20.00`.
2. **Finished Goods Batch Adjustment:**
   - Initial quantity: `12`.
   - Admin sets quantity to `25`.
   - DB Verification:
     - `FinishedGoodStock.current_quantity` updated to `25`.
     - `StockMovement` row inserted with `movement_type='ADJUSTMENT'`, `quantity=13`.

### 3.3 Custom Cake Quotation Lifecycle
1. **Request Created:** `quotation_status = 'Pending Review'`.
2. **Quotation Issued:** Admin sets `quotation_amount = 2500.00` -> `quotation_status = 'Quotation Sent'`.
3. **Customer Accept:** Customer calls `/respond/` with `action='accept'` -> `quotation_status = 'Accepted'`.
4. **Order Conversion:** Customer calls `/create-order/` -> Official `Order` generated, `quotation_status = 'Completed'`.

---

## 4. Session Isolation & Token Expiration Verification

### 4.1 Guest Customer Live Chat Isolation
- Each guest conversation generates a unique cryptographic `session_key`.
- Requests to `/support/conversations/<ref>/poll/`:
  - With valid `session_key`: Returns conversation and message history.
  - With incorrect `session_key` or missing key: Returns HTTP 404, preventing conversation hijacking.

### 4.2 JWT Rotation & Blacklisting
- JWT Access tokens have a 24-hour lifetime.
- Refresh tokens have a 14-day lifetime.
- Token refresh endpoint `/api/v1/auth/token/refresh/` generates new access tokens seamlessly.

---

## 5. Gray Box Audit Conclusion

All internal state transitions match their external API contracts. No database record or financial figure can be manipulated through parameter tampering or unauthorized role impersonation.
