# Brightloop Software — Subscription Management System

Enterprise-grade Subscription, Quotation, Recurring Billing, and Invoicing Platform inspired by Odoo's Subscription Management module.

---

## 1. System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (custom dark sidebar + purple/brand palette)
- **Icons**: Lucide React
- **Charts & Intelligence**: Recharts (Monthly revenue trends, MRR/ARR, subscription distribution)
- **Forms & State**: React Hook Form, Context API (AuthContext, ToastContext)
- **HTTP Client**: Axios with JWT Bearer Interceptors & error handlers

### Backend
- **Framework**: Spring Boot 3.4.3 (Java 17+)
- **Security**: Spring Security 6 with stateless JWT (`JJWT 0.12.5`) & BCrypt
- **Persistence**: Spring Data JPA & Hibernate 6 with MySQL 8.x Dialect
- **Scheduler**: Spring Boot `@Scheduled` Automated Daily Billing Engine (idempotent `BillingRecord` duplicate protection)
- **PDF Generation**: iText 7 for professional signed tax invoice PDF downloads
- **Database**: MySQL 8.0 on `localhost:3306`

---

## 2. Local MySQL Database Details

| Parameter | Local Value | Description |
|---|---|---|
| **Host** | `localhost:3306` | MySQL 8.0 Service (`MySQL80` Running) |
| **Database Name** | `brightloop_db` | Initialized with 27 relational tables |
| **Username** | `root` | Administrator DB user |
| **Password** | `Mom#1234` | Configured in `application.properties` |
| **DDL Mode** | `update` | Hibernate updates schema automatically |

### Executed Schema & Seed Files
1. `odoo2/database/01_schema.sql` (Tables, constraints, foreign keys, and indexes)
2. `odoo2/database/02_seed_data.sql` (Pre-seeded Roles, Admin, Staff, Customer, Taxes, Products, Plans, Subscriptions, and Invoices)

---

## 3. How to Run on Your Local System

### Running the Backend (IntelliJ IDEA)
1. Open IntelliJ IDEA.
2. Select **Open** and choose:
   `c:\Users\hp\OneDrive\Desktop\flag\odoo2\backend`
3. IntelliJ will detect `pom.xml` and resolve all dependencies.
4. Navigate to `src/main/java/com/brightloop/subscription/SubscriptionApplication.java`.
5. Click the green **Run (▶)** button.
6. The backend will start on **`http://localhost:8080`**.

### Running the Frontend (VS Code / Terminal)
1. In your terminal or VS Code, open:
   `c:\Users\hp\OneDrive\Desktop\flag\odoo2\frontend`
2. Run:
   ```bash
   npm run dev
   ```
3. Open your browser at **`http://localhost:5173`**.
   *(Requests to `/api/*` are automatically proxied to `http://localhost:8080`)*

---

## 4. Default Seeded User Credentials

| Role | Email | Password | Access & Workspace |
|---|---|---|---|
| **ADMIN** | `admin@brightloop.io` | `Admin@123` | Full access: KPIs, Products, Plans, Quotes, Subscriptions, Invoices, Payments, Discounts, Taxes, Reports, Staff, Settings |
| **STAFF** | `staff@brightloop.io` | `Staff@123` | Operational workspace: Customers, Quotes, Subscriptions, Invoices, Record Payments, Run Billing |
| **CUSTOMER** | `customer@brightloop.io` | `Customer@123` | Self-Service Portal: Overview, My Subscriptions, Invoices (PDF Download), Payment Receipts, Profile |

*(You can also click the **One-Click Demo Credentials** buttons directly on the Login page at `http://localhost:5173/login`)*

---

## 5. Automated Recurring Billing Engine

- **Scheduled Execution**: Daily at 02:00 AM UTC (`app.billing.cron=0 0 2 * * ?`).
- **Duplicate Protection**: Unique database constraint on `(subscription_id, billing_period_start)` in the `BillingRecord` table ensures zero duplicate billing even if the scheduler runs multiple times.
- **Manual Trigger**: Admin and Staff can trigger the billing engine on demand by clicking the **"Run Billing Engine"** button in the top navbar or via `POST /api/dashboard/trigger-billing`.

---

## 6. REST API Endpoint Catalog

### Authentication
- `POST /api/auth/register` — Register new customer
- `POST /api/auth/login` — Authenticate and receive JWT
- `POST /api/auth/forgot-password` — Issue password reset token
- `POST /api/auth/reset-password` — Update password with token
- `GET /api/auth/me` — Current user profile

### Products & Variants
- `GET /api/products` — Paginated catalog with search & type filter
- `GET /api/products/active` — Active product listing
- `POST /api/products` — Create product (Admin)
- `PUT /api/products/{id}` — Edit product (Admin)
- `DELETE /api/products/{id}` — Deactivate product (Admin)
- `POST /api/products/{id}/variants` — Add tiered variant (e.g., Enterprise +₹560)

### Subscription Plans
- `GET /api/plans` — Paginated plans
- `GET /api/plans/active` — Active subscription plans
- `POST /api/plans` — Create plan cadence (Admin)
- `PUT /api/plans/{id}` — Edit plan (Admin)
- `DELETE /api/plans/{id}` — Deactivate plan (Admin)

### Quotations & Conversion
- `GET /api/quotations` — List proposals
- `POST /api/quotations` — Create quotation with line items
- `POST /api/quotations/{id}/send` — Mark as SENT
- `POST /api/quotations/{id}/accept` — Mark as ACCEPTED
- `POST /api/quotations/{id}/reject` — Mark as REJECTED
- `POST /api/quotations/{id}/convert-to-subscription` — 1-Click convert quotation to active recurring subscription

### Subscriptions (State Machine)
- `GET /api/subscriptions` — List contracts
- `POST /api/subscriptions` — Create subscription
- `POST /api/subscriptions/{id}/confirm` — DRAFT → CONFIRMED
- `POST /api/subscriptions/{id}/activate` — CONFIRMED → ACTIVE
- `POST /api/subscriptions/{id}/pause` — ACTIVE → PAUSED
- `POST /api/subscriptions/{id}/resume` — PAUSED → ACTIVE
- `POST /api/subscriptions/{id}/close` — ACTIVE → CLOSED
- `POST /api/subscriptions/{id}/cancel` — Cancel contract
- `POST /api/subscriptions/{id}/renew` — Renew for next cycle

### Invoices & Tax Statements
- `GET /api/invoices` — List invoices
- `GET /api/invoices/{id}` — Full invoice statement
- `POST /api/invoices/{id}/confirm` — Confirm invoice
- `POST /api/invoices/{id}/send` — Send invoice
- `POST /api/invoices/{id}/cancel` — Cancel invoice
- `GET /api/invoices/{id}/pdf` — Download signed iText PDF

### Payments & Ledger
- `GET /api/payments` — Payment ledger
- `POST /api/payments` — Record payment & auto-reconcile balance due

### Taxes & Discounts
- `GET /api/taxes` — Tax configuration (GST 18%, 12%, 5%, CGST/SGST)
- `POST /api/taxes` — Create tax rule (Admin)
- `GET /api/discounts` — Promotional discounts
- `POST /api/discounts` — Create discount voucher (Admin)

### Intelligence & Reports
- `GET /api/dashboard/summary` — MRR, ARR, Outstanding, Collections
- `GET /api/dashboard/revenue` — Historical revenue trend
- `GET /api/dashboard/subscriptions` — Subscription mix distribution
- `POST /api/dashboard/trigger-billing` — Run recurring billing engine
