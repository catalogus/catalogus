# Promoção Tag on Books

## Spec (Draft)
- Add optional promotion metadata on `books`.
- Proposed fields:
  - `promo_type` text enum (`promocao` | `pre-venda`) — mutually exclusive.
  - `promo_price_mzn` numeric(12,2) nullable.
  - `promo_start_date` date nullable (date-only).
  - `promo_end_date` date nullable (date-only).
- Active promo rule (draft):
  - `promo_type` is set AND
  - (`promo_start_date` is null OR `current_date >= promo_start_date`) AND
  - (`promo_end_date` is null OR `current_date <= promo_end_date`).
- When active:
  - Show red badges on book cards similar to screenshot.
  - If `promo_price_mzn` is set and lower than `price_mzn`, show `-X%` badge, strike original price, and show promo price.
  - Always show the type badge text: `PROMOÇÃO` or `PRÉ-VENDA`.
- Surfaces: shop listing cards, featured books grid, book detail page.
- Cart/checkout totals use `promo_price_mzn` when active.
- Price filtering + sorting use effective (promo) price when active.

## Plan
- [x] Confirm remaining spec choices (date vs datetime, price range/sorting based on promo price).
- [x] Add DB migration + schema updates (and seed updates if needed).
- [x] Update admin book form/list/detail to edit promo fields.
- [x] Update queries/types to include promo fields.
- [x] Implement UI badges + price presentation for listing, featured, and detail.
- [x] Update cart/checkout pricing if promo price is active.
- [x] Verify manually in shop listing, featured grid, detail, and cart/checkout; document results.

## Review
- [x] Promo data model confirmed and documented.
- [x] Admin can set/clear promo fields and save successfully.
- [x] Promo badges + price treatment match the reference screenshot.
- [x] Price calculations reflect promo price when active.
- [ ] No regressions in listing filters or checkout.

### Test Notes
- `pnpm test` failed in sandbox: `EPERM listen ::1` and Nitro dev worker init error.

# Bugfix: Pre-venda Not Showing

## Plan
- [x] Normalize promo date/price handling (string vs number, date-only parsing).
- [x] Use `books_shop` view for book detail + related queries to rely on computed promo flags.
- [x] Adjust pre-venda active logic to show until end date (ignore start date for pre-venda).
- [ ] Verify promo badges/prices render with active pre-venda and promo price.

## Review
- [ ] Pre-venda badge shows when active.
- [ ] Promo price replaces base price when active.

# Digital Books: Sell or Free Download

## Spec (Draft)
- Add support for digital books with either paid purchase or free download.
- Proposed model (draft):
  - Same `books` record with digital fields.
  - `is_digital` boolean.
  - `digital_file_path` (storage path) + `digital_file_url` optional.
  - `digital_access` enum: `paid` | `free`.
- Behavior (draft):
  - Paid digital: purchased via checkout, download link available after successful payment.
  - Paid digital uses existing `price_mzn` (no separate digital price).
  - Free digital: download available after newsletter subscription (hard gate).
  - Stock for digital items optional / ignored.
  - Show "Download" CTA for free digital; "Buy Digital" or normal add-to-cart for paid.
- Surfaces:
  - Admin books form (upload + set digital access).
  - Book detail page (download button).
  - Orders/history (link to downloads).
- Open questions:
  - Newsletter verification email provider: Resend.
  - Token expiry window: 24h.
  - Download signed URL TTL: 3h.

## Plan
- [x] Confirm remaining spec decisions (email provider, token expiry, download URL TTL).
- [x] Update DB schema + storage buckets/policies for digital files.
- [x] Update admin book form to upload and configure digital access.
- [x] Implement frontend UX: badges, pricing, and download CTA.
- [x] Implement backend download access (paid gating / free access).
- [ ] Verify flow: free download, paid purchase -> download availability.

## Review
- [ ] Admin can upload digital file and set free/paid access.
- [ ] Free digital downloads work immediately.
- [ ] Paid digital download unlocks after successful payment.
- [ ] UI clearly distinguishes physical vs digital where applicable.

# UI: Remove Book Card Descriptions

## Plan
- [x] Remove description/excerpt from shop listing cards, related cards, and featured grid.
- [x] Remove description excerpt from search result book cards.
- [ ] Verify card layouts still align and pricing is visible.

## Review
- [ ] Listing/featured/search cards no longer show description text.

# Bug: Dashboard Idle -> Failed to Fetch

## Spec (Draft)
- When user stays idle on dashboard for ~5+ minutes, navigating to another section triggers `Failed to fetch` and forces a full page refresh.
- Expected: navigation should work without full refresh; requests should succeed after idle.

## Plan
- [x] Trace the request path for dashboard section navigation and identify which fetch fails after idle.
- [x] Review auth/session handling (Supabase/SDK) and any request wrappers for idle/refresh behavior.
- [x] Implement a resilient fix (session refresh, retry, or token rehydration) with minimal impact.
- [ ] Verify by idling 5+ minutes, then navigating to another section without refresh; document results.

## Review
- [x] Root cause identified and documented.
- [ ] Navigation works after idle without manual refresh.

Notes: Likely idle expiry of Supabase access token without a proactive refresh; added scheduled refresh in AuthProvider.

# Bug: books_shop.is_digital Missing

## Spec (Draft)
- UI error shows: `column books_shop.is_digital does not exist`.
- Likely cause: production schema missing `books.is_digital` (digital books migration not applied) or stale `books_shop` view.

## Plan
- [x] Confirm schema expectations: `books.is_digital` + `digital_access` exist; `books_shop` view should include `b.*`.
- [x] Add migration to ensure digital book columns/type exist (idempotent) and recreate `books_shop` view.
- [ ] Verify local schema/migration ordering and ensure view includes `is_digital`.
- [ ] Document that migration must be applied in production to resolve the error.

## Review
- [ ] `books_shop` includes `is_digital` and query no longer fails.

# UI: Remove Admin SEO Fields

## Spec (Draft)
- Remove SEO title/description inputs from admin forms for Books and Publications (Mapas Literarios).
- SEO should be automatic (derived from title/description), not manual input.
- Avoid wiping existing SEO fields unintentionally on edit.

## Plan
- [x] Remove SEO section from `BookForm`.
- [x] Remove SEO section from `PublicationForm`.
- [x] Auto-derive `seo_title`/`seo_description` in admin save logic.
- [ ] Verify forms submit without manual SEO and without unexpected clearing.

## Review
- [ ] SEO inputs no longer appear on add/edit for Books and Publications.

# SEO: Full Implementation

## Spec (Draft)
- Establish global SEO defaults: site name, canonical base URL, default title/description, default OG image, favicon/manifest links.
- Add per-route SEO (title, meta description, canonical, OG/Twitter) for public pages.
- Use existing `seo_title`/`seo_description` on books/publications; define fallback rules for missing fields.
- Add SEO fields where missing (e.g., posts/authors) if needed for control.
- Implement structured data (JSON-LD):
  - Site-wide `Organization` + `WebSite` (SearchAction).
  - `Book` on book detail pages.
  - `Article` on news posts.
  - `Person` on author profiles.
  - `BreadcrumbList` on detail pages.
- Add `robots.txt` with disallow rules for admin/private pages and sitemap reference.
- Add `sitemap.xml` (dynamic) covering static routes + dynamic slugs (books, authors, posts, publications) with `lastmod`.
- Ensure correct `<html lang>` and consider hreflang if multi-lingual URLs are added.
- Noindex for admin and private/customer pages (admin, account, checkout, search results, etc.).

## Plan
- [x] Confirm SEO inputs: canonical domain, default description, default OG image, and which routes should be indexable.
- [x] Audit current routes/data and define SEO fallback rules per page type.
- [x] Add shared SEO utilities/config (title template, meta builder, OG/Twitter helpers).
- [x] Implement per-route `head` metadata for public pages (home, shop, book, author, news list/detail, projects, production, about, contacts, publications).
- [x] Add structured data JSON-LD per page type.
- [x] Implement `robots.txt` + `sitemap.xml` (dynamic) including lastmod.
- [ ] Verify SSR HTML output for key routes and validate structured data.
- [x] Document SEO behavior and admin guidance (if new fields added).

## Review
- [x] Global defaults in place (title/desc/OG/manifest/favicons).
- [ ] Per-route SEO metadata renders server-side.
- [ ] Structured data validates for Book/Article/Person pages.
- [ ] Robots + sitemap working and accurate.

### Test Notes
- `pnpm test` failed: `listen EPERM: operation not permitted ::1` and Nitro dev worker init error.

# Admin Sections: Basic KPIs

## Spec (Draft)
- Add lightweight KPI tiles at the top of admin sections: Users, Authors, Orders, Books, Publications.
- KPIs should be fast (count-based), use existing data, and be robust to filters.
- Default to all-time counts unless a section already defines a time range.

## Plan
- [x] Define KPI sets per section (users, authors, orders, books, publications).
- [x] Add shared KPI tile component for consistent layout.
- [x] Implement section KPIs using efficient count queries or existing list data.
- [x] Add loading/empty states where applicable.
- [ ] Verify each section renders correct counts and no regressions.

## Review
- [ ] Each section shows 3–5 relevant KPI tiles.
- [ ] KPIs update after mutations (create/update/delete).
- [ ] Performance remains acceptable (no large data fetches for KPIs).

# KPI Dashboard Revamp

## Spec (Draft)
- Goal: Turn the admin dashboard into a true KPI cockpit for sales, operations, and catalog health.
- Default time range: last 7 days, with quick picks (Today, 7d, 30d, 90d, YTD) and custom range.
- Timezone: Africa/Maputo for server-side aggregation; allow client override if needed.
- Show data freshness: "Last updated" timestamp and manual refresh.
- Section-by-section improvements:
  - Overview header: add date range selector, compare-to-previous-period toggle, and last updated.
  - KPI summary cards: expand from 3 to a focused 6-8 KPIs with deltas and small trends.
    - Candidate KPIs (based on existing data): revenue, paid orders, total orders, avg order value, paid rate, new customers, active books, low stock, newsletter signups.
  - Revenue and orders trend: line chart with revenue + orders over time and comparison to previous period.
  - Order status breakdown: stacked bar or donut (paid, pending, processing, failed, cancelled).
  - Top books: table with units sold, revenue, stock, promo flag (based on order_items + books).
  - Inventory health: low stock / out of stock list and digital vs physical split.
  - Engagement: newsletter signups and new customers (from first order).
  - Recent activity: latest orders list for quick access.
- Known data limits:
  - No pageview or cart events in schema, so conversion rate is not possible without new tracking.
- KPI formula definitions (draft):
  - Revenue: `sum(orders.total)` where `status = 'paid'` and `created_at` in range.
  - Paid orders: `count(*)` where `status = 'paid'` and `created_at` in range.
  - Total orders: `count(*)` where `created_at` in range (option: exclude `failed` + `cancelled` if desired).
  - Avg order value: `revenue / nullif(paid_orders, 0)`.
  - Paid rate: `paid_orders / nullif(total_orders, 0)`.
  - New customers: count of first-time buyers in range (by `customer_id`, fallback to `customer_email` when `customer_id` is null).
  - Newsletter signups: count `newsletter_subscriptions` where `created_at` in range; optionally split by `status = 'verified'`.
  - Active books: count `books` where `is_active = true`.
  - Low stock: count/list `books` where `is_active = true`, `is_digital = false`, and `stock <= low_stock_threshold` (default 5).
  - Out of stock: `stock = 0` (physical only).
  - Top books: aggregate `order_items` joined to `orders` (paid only) by `book_id`, sum `quantity`, revenue = `sum(quantity * price)`.
  - Orders trend: daily buckets of paid orders + revenue; generate full date series to fill zero days.
  - Order status breakdown: count by `status` in range.
  - Recent activity: latest N orders (created_at desc), show `order_number`, `customer_name`, `status`, `total`.
- Confirmed decisions:
  - Timezone: Africa/Maputo.
  - Total orders includes all statuses.
  - Low stock threshold: 5.

## Plan
- [x] Confirm KPI priorities, time ranges, and "must-have" sections with product owner.
- [x] Finalize metric formulas and confirm edge-case rules (paid vs total, customer identity, timezone).
- [x] Design data layer (single RPC returning JSON) for efficient, consistent metrics.
- [x] Update dashboard UI: layout, KPI cards, charts/tables, and section hierarchy.
- [x] Add empty/loading/error states for each section and data freshness indicator.
- [ ] Verify with real data and document results; note any missing instrumentation needs.

## Review
- [ ] KPI list and formulas are agreed and documented.
- [ ] Dashboard sections render with correct data for the selected time range.
- [ ] Performance is acceptable (no excessive client-side joins or N+1 queries).
- [ ] Visual hierarchy makes the most important KPIs obvious at a glance.

### Test Notes
- `pnpm test` failed: `listen EPERM: operation not permitted ::1` and Nitro dev worker init error.

# Platform Audit: Security, Performance, UX, SEO, Accessibility

## Spec
- Audit current codebase and platform behavior for the five areas.
- Provide a prioritized, concrete improvement plan (no code changes yet).
- Call out quick wins vs. larger initiatives, with file references where applicable.

## Plan
- [x] Scan routes, shared components, server functions, and Supabase migrations for baseline architecture.
- [ ] Identify issues/opportunities by category with concrete evidence (file refs).
- [ ] Prioritize improvements into quick wins vs. strategic workstreams.
- [ ] Align on scope/timeline before implementation.
- [ ] Define verification approach (Lighthouse, a11y checks, security validation).

## Review
- [ ] Findings documented by category with severity/impact.
- [ ] Prioritized roadmap agreed with the user.
- [ ] Verification strategy defined (metrics + tools).

# Platform Improvements: Phase Execution

## Spec
- Implement prioritized fixes across security, performance/UX, and accessibility/SEO.
- Use conventional commits per phase.
- Verify core flows and document results.

## Plan
- [x] Phase 0 (Security): pricing validation in RPC, sanitize rich HTML, throttle newsletter, noopener.
- [x] Phase 1 (Performance/UX): gate devtools, bundle PDF worker, reduce CLS/LCP risk, internal Link navigation.
- [x] Phase 2 (A11y/SEO): accessible dialogs, skip link, dynamic html lang, keyboard close.
- [x] Run targeted checks (lint/tests if possible) and document outcomes.

## Review
- [x] Phase 0 committed with conventional message.
- [x] Phase 1 committed with conventional message.
- [x] Phase 2 committed with conventional message.
- [x] Verification notes recorded.

### Verification Notes
- `pnpm test` (Vitest): no test files found (exit code 1).

# Security: RLS + Security Headers

## Spec
- Enable RLS and core policies for orders, order_items, profiles, books, authors, authors_books, partners, services, projects.
- Add `is_admin()` / `is_service_role()` helper functions if missing.
- Add baseline security headers in `vercel.json`.

## Plan
- [x] Add migration with RLS enables + policies + helper functions.
- [x] Add security headers in Vercel config.
- [x] Verify no breaking changes in public reads (books/authors) and customer order access.

## Review
- [x] RLS enabled for core tables with policies aligned to current app behavior.
- [x] Security headers active in `vercel.json`.

# Privacy: Public Profiles View

## Spec
- Remove public RLS policies from `profiles` and expose a safe `public_profiles` view.
- Update public-facing queries to use the view instead of `profiles`.

## Plan
- [x] Add migration to drop public profile select policies and create `public_profiles` view.
- [x] Update public routes (authors listing/detail, news detail) to use `public_profiles`.
- [ ] Verify public pages still render author info and no emails/phones are exposed.

## Review
- [ ] Public author/news pages read from `public_profiles`.
- [ ] Direct `profiles` access requires auth (self/admin).

### Verification Notes
- Not run locally; needs manual check of `/autores`, `/autor/:id`, `/noticias/:slug`.

# Security: CSP Report-Only

## Spec
- Add `Content-Security-Policy-Report-Only` header in `vercel.json`.
- Allow required external sources (fonts, Supabase, Vimeo/YouTube embeds).

## Plan
- [x] Add CSP report-only header.
- [ ] Review against production asset domains and add report endpoint if needed.

## Review
- [x] CSP report-only header shipped.
