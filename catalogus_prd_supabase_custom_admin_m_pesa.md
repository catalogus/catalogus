# Catalogus – Product Requirements Document (PRD)

**Version:** 2.0  
**Date:** January 2026  
**Timeline:** 7–10 days  
**Budget:** $0 (Supabase free tier + existing admin + Vercel/cPanel)

---

## 1. Project Overview

### 1.1 Purpose
Catalogus is an online bookstore and cultural platform focused on selling books and showcasing authors. The system must support:
- Book sales via **M‑Pesa (Mozambique)**
- Content management (books, authors, posts, partners, services)
- A **custom-built admin panel** (already available)
- Public storefront with checkout flow

The platform must be **secure, fast, and simple**, avoiding heavy CMS abstractions.

### 1.2 Goals
- Enable reliable online book sales using M‑Pesa
- Allow admins to manage content independently
- Support author profiles and approval workflow
- Keep infrastructure minimal and maintainable
- Zero additional hosting costs
=KpmUx=a5L)AHiJ
### 1.3 Target Users
1. **Admins** – manage books, authors, orders, content
2. **Authors** – manage own profile (after approval)
3. **Customers** – register/login, purchase books, and track orders

---

## 2. Technology Stack

### 2.1 Monorepo + Single App
- **Repo:** Single repository
- **App:** One TanStack Start application hosting **both** the public storefront and the admin UI

### 2.2 Frontend (Public + Admin)
- **Framework:** TanStack Start (React)
- **Routing:** TanStack Router (file-based)
- **Data Fetching:** TanStack Query
- **Forms:** TanStack Form
- **Styling:** Tailwind CSS
- **Admin UI:** Rebuild by **copying the existing dashboard design** and adapting screens to Catalogus entities (Books, Authors, Orders, Content)

### 2.3 Backend (Data + Auth + Media)
- **Database:** Supabase Postgres
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (covers, author photos, partner logos, etc.)

### 2.4 Server Logic (Within TanStack Start)
- **Checkout & Order Creation:** Server routes / server functions inside TanStack Start
- **Payments:** Secure server-side integration with **Vodacom M-Pesa** (no direct browser calls)
- **Callbacks:** Public HTTPS callback route handled by the TanStack Start server

### 2.5 Hosting
- **Preferred:** Deploy TanStack Start app to a Node-capable host (supports server routes + callbacks)
  - Options: Vercel (if using compatible server deployment) or a Node host (e.g., VPS/cPanel Node app)
- **Supabase:** Managed backend service (DB/Auth/Storage)

---

## 3. System Architecture

```
┌─────────────────────────────────────────┐
│ Public Storefront (Vite / SSR)           │
│ - Browse books                           │
│ - Cart (local state)                    │
│ - Checkout                              │
└───────────────┬─────────────────────────┘
                │ HTTPS
                ▼
┌─────────────────────────────────────────┐
│ Secure Server Layer                     │
│ (Supabase Edge Functions / Node API)    │
│ - Create orders                         │
│ - Initiate M‑Pesa payment               │
│ - Handle callbacks                      │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│ Supabase                                 │
│ - Postgres DB                            │
│ - Auth                                  │
│ - Storage                               │
└─────────────────────────────────────────┘
```

---

## 4. User Roles & Permissions

### 4.1 Admin
- Full CRUD on all tables
- Approve/reject authors
- Manage orders and stock
- Access admin dashboard

### 4.2 Author
- Register account
- Status: `pending | approved | rejected`
- Can edit own profile only
- Cannot manage books or orders

### 4.3 Customer
- Register and login (**email/password**) via Supabase Auth
- Browse books and content
- Add to cart
- Checkout via M‑Pesa
- View order history and order status (My Orders)
- Manage basic profile info (name, phone, email)
- No admin access

---

## 5. Core Features

### 5.0 Customer Accounts (v1)
- ✅ Customer registration & login (email/password)
- ✅ Customer profile (name, phone, email)
- ✅ My Orders (order history)
- ✅ Order detail page with payment + fulfillment status

### 5.1 E‑commerce
- Book catalog
- Stock management
- Cart (client-side)
- Secure checkout
- M‑Pesa C2B payment
- Order tracking

### 5.2 Content Management
- Books
- Authors
- Blog posts
- Partners
- Services
- Projects

### 5.3 Author Management
- Public author registration
- Admin approval workflow
- Public author pages

### 5.4 Multilingual (v1 optional)
- Portuguese (default)
- English

---

## 6. Data Model (Supabase)

### 6.1 profiles
- id (uuid, auth.users)
- role: admin | author | customer
- status: pending | approved | rejected *(authors only)*
- name, bio *(authors)*
- photo_url, social_links *(authors)*
- phone *(customers/authors)*

### 6.2 books
- id
- title, slug
- description
- price_mzn
- stock
- cover_url
- category, language
- is_active

### 6.3 authors_books
- author_id
- book_id

### 6.4 orders
- id
- order_number
- customer_id (uuid, references auth.users)
- customer_name *(snapshot)*
- customer_phone *(snapshot)*
- customer_email *(snapshot)*
- total *(server-calculated)*
- status: pending | processing | paid | failed | cancelled
- mpesa_transaction_id
- created_at

### 6.5 order_items
- id
- order_id
- book_id
- quantity
- price

---

## 7. Security & RLS

### Public
- Read-only access to active books and approved authors
- Can create orders **only via server functions**

### Admin
- Full access via role check

### Author
- Can update own profile only

All stock updates, totals, and order status changes **must be server-side**.

---

## 8. M‑Pesa Integration

### 8.1 Server Endpoints

#### create_order_and_initiate_mpesa
- Validates cart
- Calculates total server-side
- Creates order + items
- Calls M‑Pesa API
- Returns order ID

#### mpesa_callback
- Receives callback from Vodacom
- Verifies transaction
- Updates order status
- Decrements stock atomically

#### get_order_status
- Returns current order status

---

## 9. Frontend Pages

### Public
- Home
- Books list
- Book detail

### Customer Account
- Register
- Login
- My Orders
- Order detail
- Profile

### Checkout
- Cart
- Checkout
- Order success / failure

### Admin
- Dashboard
- Books management
- Authors approval
- Orders management
- Content management

---

## 10. Deployment Plan

### Supabase
- Create project
- Setup DB + RLS
- Configure Auth (email/password)
- Create Storage buckets

### TanStack Start App (Public + Customer + Admin)
- Implement server routes for checkout + M‑Pesa callback
- Configure environment variables (Supabase + M‑Pesa)
- Deploy to a Node-capable host (supports server routes + callbacks)

### Public Frontend
- Deploy to Vercel
- Connect to Supabase + server endpoints

---

## 11. Success Criteria

- Customers can buy books via M‑Pesa
- Orders update correctly after payment
- Stock is consistent
- Admin fully manages platform
- No sensitive logic exposed to frontend

---

## 12. Out of Scope (v1)
- Email notifications
- Discounts/coupons
- Digital downloads
- Advanced analytics dashboards
- Multiple payment methods (beyond M‑Pesa)

---

## 13. Risks & Mitigation Risks & Mitigation

- **Payment failure:** retries + clear UI feedback
- **Callback issues:** idempotent server logic
- **Abuse:** rate limiting + validation

---

## 14. Next Steps

1. Approve PRD
2. Finalize DB schema + RLS
3. Integrate admin
4. Implement payments
5. Launch v1

---

**Prepared by:** Oly

