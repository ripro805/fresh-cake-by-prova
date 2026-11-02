# END-TO-END (E2E) AUTOMATION TESTING REPORT

**PROJECT:** FRESH CAKE by PROVA  
**DATE:** October 26, 2026  
**TEST SUITE:** `testing/e2e_runner.py` + Browser Subagent  
**TARGET SERVERS:** Django API (`http://127.0.0.1:8000`), Vite Dev (`http://localhost:5173`)  
**DATABASE:** PostgreSQL (`freshcake_db`)  
**OVERALL RESULT:** 14 / 14 Automated Scenarios Passed (100% OK)  

---

## 1. Live Automated E2E Test Scenarios

The live E2E runner (`testing/e2e_runner.py`) executed 14 distinct integration and security workflows against the running development servers.

| ID | Test Scenario | Method / Target | Result | Output Details |
|---|---|---|---|---|
| E2E-001 | Frontend Homepage Availability | `GET http://localhost:5173` | PASSED | Vite dev server responded with HTTP 200 |
| E2E-002 | Public Catalog & Pagination API | `GET /catalog/products/?page=1&page_size=6` | PASSED | Loaded 6 products out of 8 total in DB |
| E2E-003 | Customer Account Registration | `POST /auth/register/` | PASSED | Registered customer phone `0178954409` |
| E2E-004 | Customer Login & JWT Generation | `POST /auth/login/` | PASSED | Bearer access token received |
| E2E-005 | Order Preview & Coupon Calculation | `POST /orders/orders/preview/` | PASSED | Total: ৳554.00, 10% coupon discount ৳56.00 |
| E2E-006 | Order Price Tampering Defense | `POST /orders/orders/` (with ৳0.50 unit price) | PASSED | Malicious ৳0.50 price blocked; server enforced DB price ৳280.00 |
| E2E-007 | Authenticated Order Placement | `POST /orders/orders/` | PASSED | Official order created `#FC-20261026-3372` |
| E2E-008 | Order Tracking by Phone | `POST /orders/orders/track/` | PASSED | Tracking returned status: `Order Placed` |
| E2E-009 | Order IDOR Access Control | `GET /orders/orders/<id>/` (Anonymous) | PASSED | Direct GET blocked with HTTP 403 Forbidden |
| E2E-010 | Custom Cake Request Submission | `POST /custom-cakes/requests/` | PASSED | Request created `#CR-20261026-2644` |
| E2E-011 | Unaccepted Quote Order Blocked | `POST /custom-cakes/requests/<id>/create-order/`| PASSED | Rejected with HTTP 400 "Quotation must be Accepted first" |
| E2E-012 | Support Chat Initialization | `POST /support/conversations/` | PASSED | Live conversation created `#FC-8035` |
| E2E-013 | Support Chat Polling & Isolation | `GET /support/conversations/FC-8035/poll/` | PASSED | Session validated with secret key, 1 message |
| E2E-014 | WhatsApp Webhook Challenge | `GET /support/webhooks/whatsapp/?hub...` | PASSED | Meta challenge token validated and echoed |

---

## 2. Interactive Browser Subagent End-to-End Verification

The interactive browser subagent executed a full real-world user session on `http://localhost:5173`:

1. **Mobile Viewport (390 × 844 px):**
   - Verified that the header, sticky navbar, and hero showpiece collapse fluidly without horizontal overflow (`Capture: mobile_homepage_1792954431595.png`).
   - Toggled 3D showpiece to sponge layer cross-section.
2. **Shop Page & Catalog Navigation:**
   - Navigated to `/shop`.
   - Verified category filter chips, search input, and responsive 2-column mobile grid (`Capture: mobile_shop_page_1792954439106.png`).
   - Expanded to desktop 1280px viewport (`Capture: desktop_shop_page_1792954446543.png`).
3. **Product Detail & Cart Drawer:**
   - Opened *Salted Caramel Fudge Tub Cake*.
   - Verified price, description, variant buttons, and quantity stepper (`Capture: product_detail_page_1792954464540.png`).
   - Clicked "Add to Bag", opened cart drawer, and verified calculated item subtotal (`Capture: cart_drawer_opened_1792954504810.png`).
4. **5-Step Custom Cake Request Workflow:**
   - Navigated to `/custom-cake`.
   - Step 1: Selected Birthday occasion.
   - Step 2: Selected 2 Pound, Salted Caramel & Vanilla Bean flavor, 1 Tier.
   - Step 3: Filled theme and entered design description.
   - Step 4: Entered customer name (John Doe), phone (`01308516242`), date (`2026-11-01`), and address (`Upazila Road, Kushtia`).
   - Step 5: Reviewed order summary and submitted.
   - **Result:** Successfully generated custom request reference `CR-20261025-8726` (`Capture: custom_cake_submitted_success_1792954770758.png`).

---

## 3. Session Video Recording Reference

- Subagent recording file: `file:///C:/Users/rifat/.gemini/antigravity-ide/brain/9378006b-3fae-4788-b101-227a1a5ed846/qa_responsive_audit_1792954419139.webp`
- The entire browser session was recorded at 60 FPS, demonstrating responsive adaptability, interactive canvas responsiveness, and zero layout shift.
