# SOFTWARE QUALITY ASSURANCE & TEST PLAN

**PROJECT:** FRESH CAKE by PROVA  
**VERSION:** 1.0.0 Production Release Candidate  
**ENVIRONMENT:** Local Full-Stack (PostgreSQL + Django REST Framework + React / Vite / Three.js)  
**QA LEAD & TEAM:** Full SQA & Engineering Team (Antigravity Agentic Team)  
**DATE:** October 26, 2026  

---

## 1. Executive Summary & Objectives

The primary objective of this quality assurance project is to conduct a complete, professional, end-to-end quality assurance audit, security penetration test, manual & automated verification, and automated bug resolution across the entire **FRESH CAKE by PROVA** platform.

This is not merely an observational test report. Every reproducible flaw, security vulnerability, data integrity gap, and architectural bug identified during discovery and testing has been investigated, resolved with production-grade code, and re-tested through comprehensive regression suites.

---

## 2. Scope of Testing

### 2.1 In-Scope Components
1. **Frontend Web Application (React + TypeScript + Three.js):**
   - Brand identity, official logo integration, gold badge, splash animation.
   - Interactive 3D Showpiece cake canvas & Sponge Layer cross-section viewer with seamless state toggling.
   - Website-wide pagination across all customer and admin pages.
   - Product catalog, category filtering, search, sorting, and product detail gallery.
   - Shopping cart drawer, guest checkout, authenticated checkout, delivery zone calculation.
   - Custom Cake Request 5-step wizard (occasion, size, flavors, design description, schedule).
   - Customer Account Dashboard (profile, address book, orders, custom cakes, reviews, wishlist).
   - Live Customer Support Chat widget (session isolated, synchronized with WhatsApp backend).
   - Responsive UI across 360px, 390px, 768px, 1024px, 1280px, and 1920px viewports.

2. **Backend API & Business Logic (Django 5.1 + Django REST Framework + SimpleJWT):**
   - Authentication & Role-Based Access Control (`CUSTOMER` vs `OWNER_ADMIN`).
   - Server-side authoritative pricing and price-tampering defense.
   - Atomic inventory deduction for stock-controlled products with race-condition prevention.
   - Delivery zone fee validation (Inside Kushtia ৳50, Outside Kushtia ৳150, Pickup ৳0).
   - Coupon validation (percentage discounts with caps, fixed discounts, minimum spend enforcement).
   - Custom cake price quotation, customer acceptance/rejection, and order conversion.
   - Manual payment submissions (bKash & Nagad) and administrative verification.
   - Cash on Delivery (COD) collection workflow and separation of payment vs order status.
   - Financial P&L accounting (Recognized Revenue, Expenses, Net Profit).
   - Dual-tier inventory (Raw Ingredients & Finished Goods) with stock movements.
   - Meta WhatsApp Cloud API webhook challenge and incoming message ingestion.
   - Product review verification linked to delivered customer orders.

3. **Database & Data Integrity (PostgreSQL 16):**
   - Historical snapshot preservation on OrderItem models.
   - Foreign key cascading, indexing, and constraint enforcement.
   - Concurrency safety with atomic transactions (`select_for_update`).

### 2.2 Out-of-Scope / Blocked External Services
- Direct production Meta WhatsApp Cloud API message delivery (verified via mock webhook challenge & HMAC signature validation; live WhatsApp message forwarding requires live Meta Graph API bearer token).
- Live bank clearing gateway (bKash and Nagad use manual TrxID statement verification workflows as per business specification).

---

## 3. Testing Strategy & Methodology

| Phase | Methodology | Tools & Frameworks | Coverage Target |
|---|---|---|---|
| Phase 1 | Black Box Testing | Chrome / Edge Browser Subagent | Complete public customer & admin journeys |
| Phase 2 | White Box Testing | Source Code Auditing, AST Inspection | Internal logic, concurrency, permissions |
| Phase 3 | Gray Box Testing | REST API Client, HTTP Payloads | Token handling, session isolation, IDOR |
| Phase 4 | Unit Testing | Django Test Runner, TestCase | Models, business logic, calculations |
| Phase 5 | Integration Testing | DRF APIClient, In-Memory DB | Multi-module interaction, DB transactions |
| Phase 6 | System Testing | Automated Python Test Runner | End-to-end multi-step scenarios |
| Phase 7 | E2E Automation | `testing/e2e_runner.py`, Vite Dev | Live HTTP requests against servers |
| Phase 8 | Regression Testing | `manage.py test` & `npm run build` | Zero regression on prior brand & pagination fixes |
| Phase 9 | Security Testing | OWASP Top 10 Audit Suite | Injection, IDOR, Tampering, Escalation |
| Phase 10 | Performance Testing | Bundle Analyzer, HTTP latency | Bundle size, API query efficiency |
| Phase 11 | Accessibility & UI/UX | WCAG 2.2 AA, Multi-viewport browser | Contrast, keyboard nav, viewport fluidity |
| Phase 12 | Compatibility | Chromium & Gecko Engines | WebGL Three.js canvas, responsive layout |
| Phase 13 | Financial Testing | Accounting verification scripts | P&L formula, snapshot persistence |
| Phase 14 | Automatic Fixing | Direct file edits & re-testing | Fix all reproducible bugs safely |
| Phase 15 | Test Infrastructure | Repeatable test scripts | 100% automated repeatable execution |
| Phase 16 | Final QA Sign-off | SQA Lead Final Audit | Full production readiness clearance |

---

## 4. Test Schedule & Execution Criteria

### Entry Criteria
- Backend server running on `http://127.0.0.1:8000`.
- Frontend dev server running on `http://localhost:5173`.
- PostgreSQL database initialized with initial schema and migrations.

### Exit Criteria
- 100% of critical and high-severity bugs resolved in code.
- All automated unit and integration tests exit with Code 0.
- Frontend builds with zero TypeScript errors (`npm run build`).
- All 15 required documentation artifacts generated and verified.
