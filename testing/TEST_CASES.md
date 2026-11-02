# SOFTWARE QUALITY ASSURANCE: COMPREHENSIVE TEST CASES

**PROJECT:** FRESH CAKE by PROVA  
**VERSION:** 1.0.0 Production Release Candidate  
**TOTAL TEST CASES DOCUMENTED:** 56  
**EXECUTION SUITE:** Automated + Live Browser  

---

## 1. Authentication & Authorization Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | Accounts | Customer Registration | Clean DB or unique phone | `phone: "0178XXXXXXX"`, valid password | HTTP 201 Created, JWT access token, role: CUSTOMER | HTTP 201 Created, customer registered | PASSED |
| TC-AUTH-002 | Accounts | Privilege Escalation Defense | Unauthenticated client | Register payload with `role: "OWNER_ADMIN"` | Role must be forced to CUSTOMER, is_staff=False | Stored role is CUSTOMER, is_staff=False | PASSED |
| TC-AUTH-003 | Accounts | Duplicate Phone Registration | User with phone exists | Existing phone number | HTTP 400 Bad Request with phone unique error | HTTP 400 with duplicate phone error | PASSED |
| TC-AUTH-004 | Accounts | Password Mismatch | None | `password != password_confirm` | HTTP 400 Bad Request | HTTP 400 with validation error | PASSED |
| TC-AUTH-005 | Accounts | Password Length Validation | None | `password: "short"` (< 8 chars) | HTTP 400 Bad Request (< 8 chars) | HTTP 400 MinimumLengthValidator error | PASSED |
| TC-AUTH-006 | Accounts | Login with Phone | Valid registered customer | Phone + correct password | HTTP 200 OK, JWT access & refresh tokens | HTTP 200 OK, tokens received | PASSED |
| TC-AUTH-007 | Accounts | Login with Invalid Password | Registered customer | Phone + wrong password | HTTP 400/401 Unauthorized | HTTP 400 Invalid credentials | PASSED |
| TC-AUTH-008 | Accounts | Me Profile Retrieval | Authenticated token | Valid Bearer token | HTTP 200 OK with authenticated user profile | HTTP 200 OK with user profile | PASSED |
| TC-AUTH-009 | Accounts | Me Profile Unauthenticated | No token provided | Header omitted | HTTP 401 Unauthorized | HTTP 401 Unauthorized | PASSED |
| TC-AUTH-010 | Accounts | Customer Profile Update | Authenticated customer | New name and email | Profile updated in DB, returned in response | Profile updated successfully | PASSED |

---

## 2. Catalog & Pricing Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-CAT-001 | Catalog | Product Listing & Pagination | Products in DB | `GET /catalog/products/?page=1&page_size=6` | HTTP 200, count, results list with 6 items | HTTP 200, paginated results | PASSED |
| TC-CAT-002 | Catalog | Category Filtering | Category exists | `GET /catalog/products/?category=cakes` | HTTP 200, only products in category | Filtered products returned | PASSED |
| TC-CAT-003 | Catalog | Product Slug Lookup | Product with slug exists | `GET /catalog/products/<slug>/` | HTTP 200, full product with variants & images | Complete product data returned | PASSED |
| TC-CAT-004 | Catalog | Effective Price (Discounted) | Product with discount_price | `Product.price` property check | Returns `discount_price` (৳1050 vs base ৳1200) | Evaluated to ৳1050.00 | PASSED |
| TC-CAT-005 | Catalog | Effective Price (Standard) | Product without discount | `Product.price` property check | Returns `base_price` (৳850) | Evaluated to ৳850.00 | PASSED |
| TC-CAT-006 | Catalog | Variant Pricing Hierarchy | Product with variants | Variant price query | Variant price overrides product base price | Variant price ৳2100 correctly returned | PASSED |

---

## 3. Order Processing & Anti-Tampering Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-ORD-001 | Orders | Client Price Tampering Defense | Product price ৳900 | Client passes `unit_price: 1.00` | Server ignores client price, computes subtotal using ৳900 | Server calculated 2 x ৳900 = ৳1800 | PASSED |
| TC-ORD-002 | Orders | Variant Price Enforcement | Variant price ৳1800 | Client passes `unit_price: 5.00` | Server enforces variant price ৳1800 from DB | Server calculated 1 x ৳1800 = ৳1800 | PASSED |
| TC-ORD-003 | Orders | Atomic Stock Deduction | Stock-controlled product (10) | Order quantity: 3 | Product stock decremented to 7 atomically | Product stock decremented to 7 | PASSED |
| TC-ORD-004 | Orders | Out of Stock Rejection | Current stock: 10 | Order quantity: 999 | HTTP 400 Bad Request "Insufficient stock" | HTTP 400 Bad Request returned | PASSED |
| TC-ORD-005 | Orders | Delivery Fee - Inside Kushtia | Delivery type: delivery | `delivery_zone_code: "INSIDE_KUSHTIA"` | Delivery fee set to ৳50.00 | Delivery fee = ৳50.00 | PASSED |
| TC-ORD-006 | Orders | Delivery Fee - Outside Kushtia| Delivery type: delivery | `delivery_zone_code: "OUTSIDE_KUSHTIA"`| Delivery fee set to ৳150.00 | Delivery fee = ৳150.00 | PASSED |
| TC-ORD-007 | Orders | Delivery Fee - Store Pickup | Delivery type: pickup | `delivery_type: "pickup"` | Delivery fee set to ৳0.00 | Delivery fee = ৳0.00 | PASSED |
| TC-ORD-008 | Orders | Coupon 10% Discount | Order subtotal ৳900 | Coupon: `FRESHPROVA10` | 10% discount applied = ৳90.00 | Discount = ৳90.00, Total = ৳860.00 | PASSED |
| TC-ORD-009 | Orders | Fixed Discount Min Spend | Subtotal ৳800, min ৳1000 | Coupon with min spend ৳1000 | Coupon rejected with minimum spend message | Coupon rejected gracefully | PASSED |
| TC-ORD-010 | Orders | IDOR - Anonymous Direct GET | Order exists in DB | `GET /orders/orders/<id>/` without token | HTTP 403 Forbidden | HTTP 403 Forbidden returned | PASSED |
| TC-ORD-011 | Orders | IDOR - Cross-Customer GET | Customer A and B exist | Customer B requests Customer A's order id | HTTP 404 Not Found (scoped queryset) | HTTP 404 Not Found returned | PASSED |
| TC-ORD-012 | Orders | Order Tracking by Phone | Order exists in DB | Order number + matching phone | HTTP 200 with order details | Order details returned | PASSED |
| TC-ORD-013 | Orders | Order Tracking Phone Mismatch | Order exists in DB | Order number + wrong phone | HTTP 404 Not Found | HTTP 404 Not Found returned | PASSED |

---

## 4. Custom Cake Quotation Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-CAKE-001 | Custom Cakes | 5-Step Request Submission | Valid occasion & date | Occasion, flavor, size, theme, date | HTTP 201 Created with unique `CR-XXXXXXXX` | HTTP 201 Created, status: Pending Review | PASSED |
| TC-CAKE-002 | Custom Cakes | Admin Send Quotation | Pending request exists | Admin submits ৳2500 quote + chef notes | Status updated to `Quotation Sent`, amount ৳2500 | Quotation Sent status, amount ৳2500 | PASSED |
| TC-CAKE-003 | Custom Cakes | Non-Admin Quote Blocked | Pending request exists | Customer submits quote amount | HTTP 403 Forbidden | HTTP 403 Forbidden returned | PASSED |
| TC-CAKE-004 | Custom Cakes | Customer Accepts Quotation | Status is `Quotation Sent` | Action: `accept` | Status updated to `Accepted` | Status updated to Accepted | PASSED |
| TC-CAKE-005 | Custom Cakes | Convert Accepted Quote to Order| Status is `Accepted` | Payment method + delivery zone | Official Order created, status becomes Completed | Order created with quote snapshot | PASSED |
| TC-CAKE-006 | Custom Cakes | Block Order on Unaccepted Quote| Status is `Pending Review` | Customer tries `create-order` | HTTP 400 Bad Request "Quotation must be Accepted"| HTTP 400 Bad Request returned | PASSED |

---

## 5. Payments & Cash Collections Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-PAY-001 | Payments | bKash Payment Submission | Order placed | TrxID, sender phone, amount | Submission created, status PENDING | Submission created with PENDING | PASSED |
| TC-PAY-002 | Payments | Admin Payment Verification | Pending submission exists | Admin calls `/verify/` with `action: "verify"` | Submission VERIFIED, Order payment_status VERIFIED, order_status CONFIRMED | Order CONFIRMED and payment VERIFIED | PASSED |
| TC-PAY-003 | Payments | Admin Payment Rejection | Pending submission exists | Admin calls `/verify/` with `action: "reject"` | Submission REJECTED, Order payment_status FAILED | Order payment_status FAILED | PASSED |
| TC-PAY-004 | Payments | Cash Collection (COD) | COD order in preparing | Rider records ৳650 collection | Order payment_status VERIFIED, order_status DELIVERED | Order marked DELIVERED and VERIFIED | PASSED |
| TC-PAY-005 | Payments | Non-Admin Blocked Verify | Pending submission exists | Regular customer calls `/verify/` | HTTP 403 Forbidden | HTTP 403 Forbidden returned | PASSED |

---

## 6. Financial P&L Accounting Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-FIN-001 | Finance | Revenue Recognition | 1 verified (৳2500), 1 pending (৳1000)| `GET /finance/expenses/summary/` | Recognized Revenue = ৳2500.00 (pending ignored) | Recognized Revenue = ৳2500.00 | PASSED |
| TC-FIN-002 | Finance | Net Profit Calculation | Revenue ৳2500, Expenses ৳1100 | Summary endpoint query | Net Profit = ৳1400.00 (`2500 - 1100`) | Net Profit = ৳1400.00 | PASSED |
| TC-FIN-003 | Finance | Non-Admin Forbidden | Customer user | `GET /finance/expenses/summary/` | HTTP 403 Forbidden | HTTP 403 Forbidden returned | PASSED |

---

## 7. Dual-Tier Inventory Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-INV-001 | Inventory | Low Stock Ingredient Alert | Stock: 4kg, min: 10kg | `ingredient.is_low_stock` | Returns True | True | PASSED |
| TC-INV-002 | Inventory | Raw Ingredient Restock | Ingredient stock: 4kg | Admin restocks 20kg | Stock becomes 24kg, StockMovement logged | Stock = 24kg, Movement RESTOCK logged | PASSED |
| TC-INV-003 | Inventory | Finished Goods Stock Adjust | Product stock: 12 | Admin adjusts to 25 | FinishedGoodStock = 25, Movement ADJUSTMENT logged| Stock = 25, Movement ADJUSTMENT logged | PASSED |

---

## 8. Live Support Chat & WhatsApp Integration Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-CHAT-001 | Support Chat | Guest Conversation Creation | None | Initial message + session_key | HTTP 201 Created with `FC-XXXX` reference | Created with unique FC-XXXX | PASSED |
| TC-CHAT-002 | Support Chat | Guest Session Isolation | Conversation exists | Guest polls with matching vs mismatch key | Match: 200 OK; Mismatch: 404 Not Found | Mismatch blocked with 404 | PASSED |
| TC-CHAT-003 | Support Chat | Meta Webhook Challenge | None | `hub.mode=subscribe`, `verify_token` | Returns challenge string with HTTP 200 | Challenge string returned | PASSED |

---

## 9. Product Reviews & Delivered Order Verification Test Cases

| Test Case ID | Module | Scenario | Preconditions | Input Data | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|---|
| TC-REV-001 | Reviews | Verified Purchase on Delivery | Customer has DELIVERED order | Customer posts review on product | Review saved with `is_verified: True` | Saved with is_verified: True | PASSED |
| TC-REV-002 | Reviews | Unverified for Non-Purchaser | Customer has NO delivered order | Customer posts review on product | Review saved with `is_verified: False` | Saved with is_verified: False | PASSED |
