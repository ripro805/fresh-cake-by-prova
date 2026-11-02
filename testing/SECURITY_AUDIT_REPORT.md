# SECURITY AUDIT & PENETRATION TESTING REPORT

**PROJECT:** FRESH CAKE by PROVA  
**FRAMEWORK:** OWASP Top 10:2021 & Web Application Security Standards  
**DATE:** October 26, 2026  
**LEAD:** Cybersecurity & Application Security Specialist  
**OVERALL SECURITY POSTURE:** HIGH (All Discovered Vulnerabilities Remediated)  

---

## 1. Executive Summary

A comprehensive security assessment was performed across the frontend and backend architectures of the FRESH CAKE by PROVA platform. Testing encompassed authentication, session management, authorization boundaries, object reference security (IDOR), data integrity, injection attacks, and payment manipulation.

---

## 2. OWASP Top 10 Assessment Matrix

| OWASP Vulnerability Category | Risk Level Prior to Fix | Post-Fix Risk | Remediation Implemented |
|---|---|---|---|
| **A01:2021 — Broken Access Control** | **CRITICAL** | **RESOLVED (LOW)** | Fixed IDOR in `OrderViewSet` and `CustomCakeRequestViewSet`. Enforced customer queryset scoping and 403 Forbidden on direct anonymous access. |
| **A02:2021 — Cryptographic Failures** | LOW | PASS | Passwords hashed using Django's `PBKDF2PasswordHasher` with SHA256. JWT tokens signed with HS256 using dedicated signing secret. |
| **A03:2021 — Injection (SQLi, XSS)** | LOW | PASS | Django ORM uses parameterized SQL queries exclusively. Frontend React automatically escapes JSX expressions, preventing reflected and DOM-based XSS. |
| **A04:2021 — Insecure Design** | **CRITICAL** | **RESOLVED (LOW)** | Server-side authoritative pricing implemented in `OrderViewSet`. Client-supplied unit prices are stripped and recalculated from DB. |
| **A05:2021 — Security Misconfiguration** | MEDIUM | PASS | Strict `CORS_ALLOWED_ORIGINS` configured. `XFrameOptionsMiddleware` enabled. Clickjacking protection active. |
| **A06:2021 — Vulnerable Components** | LOW | PASS | Python dependencies (Django 5.1.4, DRF 3.15.2, SimpleJWT 5.4.0) and npm packages audited with 0 known high/critical CVEs. |
| **A07:2021 — Identification & Auth Failures** | LOW | PASS | Public registration strictly locks user role to `CUSTOMER` (prevents privilege escalation). Password length validator (min 8 chars) enforced. |
| **A08:2021 — Software & Data Integrity** | MEDIUM | PASS | Meta WhatsApp webhooks verify `X-Hub-Signature-256` HMAC-SHA256 signatures before processing payloads. |
| **A09:2021 — Logging & Monitoring** | LOW | PASS | `WhatsAppWebhookLog` records raw incoming payloads. `AuditLog` records admin configuration updates and destination phone number modifications. |
| **A10:2021 — Server-Side Request Forgery** | LOW | PASS | No user-supplied URLs are fetched by the backend server. Media uploads use safe local storage backends. |

---

## 3. Vulnerability Findings & Detailed Remediations

### 3.1 VULN-SEC-01: Client-Side Price Tampering (Insecure Design)
- **Severity:** CRITICAL
- **CVSS v3.1 Score:** 9.1 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N)
- **Description:** When previewing or creating an order, `orders/views.py` trusted the `unit_price` submitted in the request payload. A malicious user could send `unit_price: 1.00` for an expensive cake and complete the order.
- **Remediation:**
  - Implemented `_resolve_pricing_and_items()` in `OrderViewSet`.
  - The server queries `Product` and `ProductVariant` directly in PostgreSQL and calculates the line item total and subtotal authoritatively. Any client-provided `unit_price` is completely disregarded.
- **Verification:** Automated test `test_price_tampering_prevention` verified that an order submitted with `unit_price: 1.00` was billed at the database price of ৳900.00.

### 3.2 VULN-SEC-02: Broken Access Control / IDOR on Orders (A01:2021)
- **Severity:** HIGH
- **CVSS v3.1 Score:** 7.5 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N)
- **Description:** `OrderViewSet.get_object()` bypassed `get_queryset()` filtering and queried `Order.objects.get(...)` directly by primary key or order number. Any anonymous visitor or registered customer could view any other customer's order, shipping address, phone number, and items.
- **Remediation:**
  - Rewrote `get_object()`:
    1. Direct `GET /orders/<id>/` by anonymous users is rejected with HTTP 403 `PermissionDenied`. Anonymous customers must use `POST /orders/track/` where the phone number is verified.
    2. Non-admin users are restricted to `qs.filter(customer=user)`. Attempting to access an order belonging to another customer raises HTTP 404 `NotFound`.
- **Verification:** Automated test `test_order_idor_access_control` confirmed that Customer 2 receives 404 when requesting Customer 1's order, and anonymous users receive 403.

### 3.3 VULN-SEC-03: Broken Access Control / IDOR on Custom Cakes (A01:2021)
- **Severity:** HIGH
- **CVSS v3.1 Score:** 7.5
- **Description:** Any caller could retrieve or respond to another customer's custom cake design request without authentication.
- **Remediation:** Scoped `CustomCakeRequestViewSet.get_object()` to owner/admin only. Guest interaction requires phone verification matching the stored customer contact.
- **Verification:** Automated tests verified permission denial on unverified requests.

### 3.4 VULN-SEC-04: Unauthorized Order Conversion of Unapproved Quotations
- **Severity:** HIGH
- **CVSS v3.1 Score:** 6.5
- **Description:** Potential business logic flaw allowing orders to be placed before an admin has quoted a price or before the customer has accepted the quotation.
- **Remediation:** Added strict check in `create_order` action:
  ```python
  if req_obj.quotation_status != CustomCakeRequest.QuotationStatus.ACCEPTED:
      return Response({"error": "Quotation must be Accepted first."}, status=400)
  ```
- **Verification:** Verified by `test_unaccepted_quotation_cannot_be_ordered`.

---

## 4. Security Recommendations for Future Production Deployment

1. **HTTPS Enforcement:** When deploying to production domains (e.g. `freshcakebyprova.com`), ensure `SECURE_SSL_REDIRECT = True` and configure HTTP Strict Transport Security (HSTS).
2. **Reverse Proxy Rate Limiting:** Configure Nginx or Cloudflare rate limiting on `/api/v1/auth/login/` (e.g., 5 requests per minute per IP) to mitigate brute-force password guessing.
3. **Environment Secrets:** Store `SECRET_KEY`, `JWT_SIGNING_KEY`, and `WHATSAPP_APP_SECRET` strictly in production environment secret stores, never committed to version control.
