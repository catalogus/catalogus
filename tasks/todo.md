# Guest Order Confirmation Access

## Documentacao de Handover
- [ ] Criar pacote de documentacao em PT-PT para handover tecnico e operacional do projecto.
- [ ] Documentar arquitectura, apps, servicos, ambientes, Supabase, deploy e suporte.
- [ ] Documentar operacao do backoffice para o cliente.
- [ ] Documentar onboarding e manutencao para futuros developers.
- [ ] Rever consistencia editorial e checklist final de entrega.

## Plan
- [x] Trace why guest checkout redirects to an order page that cannot read the order.
- [x] Move confirmation-page order loading to a server-backed query that works for guest orders.
- [ ] Verify the order confirmation page shows the created order after checkout.

## Review
- [x] Guest order confirmation no longer depends on client-side RLS access to `orders`.

# M-Pesa Order Status Follow-up

## Current Behavior
- [x] Guest checkout creates the order and redirects correctly to `/pedido/:orderId`.
- [x] The order page can now load guest orders through a server-backed query.
- [ ] After the customer confirms payment on the phone, the order page can still remain in `processing`.
- [ ] The page text says `Se ja confirmou, toque em "Atualizar estado"`, but there is currently no `Atualizar estado` button in the UI.

## Suspected Cause
- [ ] The order only moves from `processing` to `paid` when the gateway callback updates Supabase or when a status-check endpoint is called.
- [ ] Refreshing the page only re-reads the current DB state; it does not trigger `/mpesa/status`.

## Next Fix
- [ ] Check gateway logs for successful/failed `/mpesa/callback` handling after a real PIN confirmation.
- [ ] Add a real `Atualizar estado` action on the order page that triggers a status reconciliation request.
- [ ] Update the order detail copy so it only promises actions the UI actually supports.

## M-Pesa Auto-Reconciliation
- [ ] Add gateway logging for callback/status payloads and Supabase update failures.
- [ ] Broaden M-Pesa success/failure parsing so successful payments do not remain in `processing`.
- [ ] Add automatic public order-page status reconciliation while an order is still `processing`.
- [ ] Update order-page payment copy to describe automatic status refresh.
- [ ] Verify the updated flow with targeted tests and a sandbox payment.

# Repo: Extract M-Pesa Gateway

## Plan
- [x] Audit the existing `services/mpesa-gateway` service and its dependencies on `catalogus`.
- [x] Move the gateway into a top-level `mpesa-gateway` folder so it can live as its own repo.
- [x] Update the extracted service so it remains runnable/testable on its own.
- [x] Remove stale in-repo references from `catalogus` and verify the new layout.

## Review
- [x] `mpesa-gateway` now lives at the project root as a sibling repo candidate.
- [x] The extracted service has its own `package.json`, test script, and `.gitignore`.
- [x] `catalogus` no longer assumes the gateway code lives under `services/mpesa-gateway`.

# Code Size Guardrail

## Plan
- [x] Add a line-count guard for code files with a 350-line limit.
- [x] Exclude generated router output and translation dictionaries from the limit.
- [x] Refactor oversized public routes/components into smaller feature modules.
- [x] Verify the new limit across the app.

## Review
- [x] `pnpm run check:lines` passes with all checked code files at or below 350 lines.
- [x] `pnpm build` succeeds after the refactor.
- [x] `pnpm test` now uses `--passWithNoTests` because the repo currently has no Vitest files.
- [x] Added Vitest coverage for pure news, author-detail, and M-Pesa utility modules.

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

# Admin Roles: Super Admin vs Content Admin

## Spec (Draft)
- Add two admin types:
  - **Super Admin** (max 2 accounts): full access to all admin modules, data, and metrics.
  - **Content Admin**: access to all admin modules except Transactions/Orders.
- Dashboard:
  - Same dashboard layout for both.
  - Content Admins must **not** see commerce metrics (derived from orders/transactions).
  - Commerce metrics to hide for Content Admins:
    - Revenue, Paid Orders, Total Orders, Avg Order Value, Paid Rate, New Customers.
    - Trend chart (revenue/orders), Order status breakdown, Top books (sales), Recent orders list.
  - Content Admins can still see catalog + engagement metrics (inventory health, active/low stock, newsletter stats).
- Storage model: any approach ok. Proposed: `profiles.admin_level` enum:
  - `super_admin`, `content_admin` (nullable for non-admins).
- Creation:
  - Super Admin accounts can be created at any time, subject to the max-2 guardrail.
  - No hardcoded backfill to specific emails; existing admin rows should default to `content_admin`.
- Enforcement layers:
  - UI navigation + route guards.
  - Supabase RLS + storage policies.
  - DB guardrail to cap Super Admins at 2.

## Plan
- [ ] Confirm access matrix (explicit list of modules available to Content Admins).
- [x] Add DB migration:
  - `admin_level` enum + column on `profiles`.
  - Backfill `admin` rows to `content_admin`.
  - Guardrail trigger/constraint to cap `super_admin` at 2.
  - Helper functions: `is_super_admin()` and updated `is_admin()` (or `is_content_admin()`).
- [x] Update RLS + storage policies:
  - Orders/order_items restricted to `is_super_admin()`.
  - Content modules remain `is_admin()`.
- [x] Update admin dashboard:
  - For Content Admins, skip commerce RPC and hide commerce sections.
  - Provide content-only metrics query (books + newsletter + inventory).
- [x] Update admin UI:
  - [x] Users page: add admin type selector and show super-admin slot count.
  - [x] Route guards: add `SuperAdminGuard` for `/admin/orders` and `/admin/users`.
  - [x] Sidebar: hide Orders and Users for Content Admin.
  - [x] User table badges: display `super_admin` vs `content_admin`.
  - [x] Add invite-based staff user creation flow (edge function + admin form).
- [ ] Verify end-to-end:
  - Super Admin can access everything.
  - Content Admin can access everything except Orders/Transactions.
  - Commerce metrics hidden for Content Admins.
  - Creating a 3rd Super Admin is blocked with a clear error.

## Review
- [ ] Access matrix implemented and documented.
- [ ] RLS/storage policies enforce access correctly.
- [ ] Dashboard hides commerce metrics for Content Admins.
- [ ] UI shows only allowed modules for Content Admin.
- [ ] Super Admin limit (2) enforced at DB level and surfaced in UI errors.

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
- [x] Verify public pages still render author info and no emails/phones are exposed.

## Review
- [x] Public author/news pages read from `public_profiles`.
- [x] Direct `profiles` access requires auth (self/admin).

### Verification Notes
- User confirmed author info renders on public pages; no private fields reported.

# Security: CSP Report-Only

## Spec
- Add `Content-Security-Policy-Report-Only` header in `vercel.json`.
- Allow required external sources (fonts, Supabase, Vimeo/YouTube embeds).

## Plan
- [x] Add CSP report-only header.
- [x] Review against production asset domains and add report endpoint if needed.

## Review
- [x] CSP report-only header shipped.

# Security: CSP Reporting Endpoint

## Spec
- Add `/csp-report` endpoint to collect CSP reports.
- Wire CSP report-uri to the endpoint.

## Plan
- [x] Add server route for CSP reports.
- [x] Update CSP report-uri directive.

## Review
- [x] CSP reports accepted by server route (204 response).

# Bug: Admin Requires Page Refresh After Idle

## Spec (Draft)
- Admin pages should fetch/mutate reliably after idle without forcing a full refresh.
- If session token expires or gets close to expiry, refresh it automatically on focus/visibility change.
- Ensure manual REST/storage calls always use a fresh access token and retry once on auth failure.

## Plan
- [x] Identify where admin fetch/mutation uses raw `session.access_token` or relies on stale auth state.
- [x] Add a shared helper to obtain a fresh access token (refresh if near expiry).
- [x] Refresh session on window focus/visibility and invalidate admin queries on token refresh.
- [x] Update admin REST/storage calls to use the fresh-token helper.
- [x] Verify admin actions after 5–10 minutes idle without full refresh.

## Review
- [x] Admin fetches/mutations succeed after idle without manual refresh.
- [x] Fresh token helper used for REST/storage operations.
- [x] Verification notes recorded.

### Verification Notes
- `pnpm build` succeeded. Warnings: `TT Norms Pro Regular Italic.otf` unresolved at build time, and chunk size warning (>500 kB after minification).
- User confirmed idle session issue resolved without refresh.

# Platform Improvements: Phase 3 (Performance/A11y Polish)

## Spec
- Tighten performance and accessibility polish for critical UI components.
- Ensure mobile navigation uses an accessible, focus-trapped dialog.
- Replace raw images in key public sections with optimized components or add missing performance attributes.
- Verify improvements with targeted checks and document results.

## Plan
- [x] Convert mobile menu to Radix Dialog with focus trap, keyboard navigation, and screen reader-friendly labeling.
- [x] Replace raw `img` usage in home/public sections with `BookCover`, `AuthorPhoto`, or `OptimizedImage` where appropriate.
- [x] Add/verify `decoding`, `loading`, and `fetchPriority` for LCP-critical images and ensure width/height are set to reduce CLS.
- [ ] Run targeted checks (manual a11y, Lighthouse or local audit) and document outcomes.

## Review
- [ ] Mobile menu passes keyboard navigation (Tab/Shift+Tab/Escape) and traps focus when open.
- [ ] LCP/CLS risk reduced for home/public sections (images optimized or attributed).
- [ ] Verification notes recorded with any remaining issues.

### Verification Notes
- `pnpm build` succeeded. Warnings: `TT Norms Pro Regular Italic.otf` path not resolved at build time, and large chunk size warning (>500 kB after minification).

# Dashboard Polish + Publishing/Staff UX

## Spec (Draft)
- Polish admin dashboard visuals and interactions for clarity and speed.
- Make publishing flow (posts/publications/books) seamless and low-friction.
- Make staff/user management (admin/user creation, role assignment) seamless and low-friction.

## Plan
- [ ] Run Rams design review on targeted admin files (dashboard + publishing + users/staff) and list issues by severity.
- [ ] Define UX improvements for publishing (save state, validation, status feedback, preview flow).
- [ ] Define UX improvements for staff management (invite/create, role change, success/error feedback).
- [ ] Implement prioritized fixes with minimal code changes.
- [ ] Verify key flows: create/edit/publish content; create staff user; role change; delete/disable.

## Review
- [ ] Dashboard UX issues addressed and validated.
- [ ] Publishing flow feels seamless (clear states, no dead ends).
- [ ] Staff management flow feels seamless (clear actions and confirmations).

# UI Consistency: Remove Rounded Corners

## Spec
- Remove rounded corners across the entire UI (admin + public).
- Ensure visuals remain consistent and intentional without rounding.

## Plan
- [x] Implement a global radius override in `src/styles.css` to force square corners.
- [ ] Verify key screens (admin dashboard, posts, users; public home/shop) show no rounded corners.
- [ ] Clean up any outliers if a component still renders rounded corners.

## Review
- [ ] No rounded corners remain across the app.
- [ ] Key screens verified visually after the change.

# Website Copy Update: Revisao do Site (9 de Fevereiro)

## Spec (Draft)
- Update public website copy based on the "REVISAO DO SITE _ 9 de FEVEREIRO.pdf" document.
- Only adjust text content (no structural or design changes) unless explicitly called out in the document.
- Track each copy change back to its page/section for verification.

## Plan
- [x] Review the PDF and extract required copy changes, organized by page/section.
- [x] Locate the corresponding copy in the codebase and map each change to a file/route.
- [x] Apply the copy updates with minimal impact.
- [x] Verify updates across affected pages (manual spot check) and document results.

## Review
- [x] All requested copy changes applied.
- [ ] Manual spot checks confirm updates on each affected page/section.
Review Notes: Verified copy updates via `rg` and file diffs; UI spot checks not run.

# UI: Featured Authors Background Image

## Plan
- [x] Locate the featured authors CTA background image usage.
- [x] Swap the background image to `/catalogos-authors.webp`.
- [x] Verify the section renders with the new background.

## Review
- [x] CTA background updated to the new image.
Review Notes: Verified `FeaturedAuthorsSection` now references `/catalogos-authors.webp` and the file exists in `public/`; UI spot check not run.

# UI: Shop Header Background Image

## Plan
- [x] Locate the shop header background image usage.
- [x] Swap the background image to `/oficinas.webp`.
- [x] Verify the header renders with the new background.

## Review
- [x] Shop header background updated to the new image.
Review Notes: Verified `/oficinas.webp` exists in `public/` and is referenced in the shop header; UI spot check not run.

# UI: Publications Header Background Image

## Plan
- [x] Locate the publications header background image usage.
- [x] Swap the background image to `/Quem-somos-768x513.jpg`.
- [x] Verify the header renders with the new background.

## Review
- [x] Publications header background updated to the new image.
Review Notes: Verified `/Quem-somos-768x513.jpg` exists in `public/` and is referenced in the publications header; adjusted overlay gradient opacity so the image can show through; UI spot check not run.

# UI: Active Header Nav Highlight

## Plan
- [x] Identify header/nav structure and current route detection.
- [x] Implement active state styling for current page (desktop and mobile).
- [x] Verify active state on a few key routes.

## Review
- [x] Current page is visibly highlighted in the header nav.
Review Notes: Active styling now uses the current pathname (and hash for project anchors) to set underline/text color; UI spot check not run.

# Repo: Batch Commits by Context

## Plan
- [x] Review diffs and group changes by context.
- [x] Stage and commit each group with clear messages (exclude `REVISAO DO SITE _ 9 de FEVEREIRO.pdf`).
- [x] Verify working tree state after commits.

## Review
- [x] Changes are split into logical commits and PDF remains untracked.
Review Notes: Committed `Update section backgrounds` and `Highlight active nav item`; PDF remains untracked. Unrelated changes still present in working tree.

# Repo: Commit Remaining Changes

## Plan
- [ ] Review remaining diffs and identify any risky deletions or broken references.
- [ ] Confirm whether to keep asset deletions or update references.
- [ ] Stage and commit remaining changes by context.
- [ ] Verify working tree state (PDF remains untracked).

## Review
- [ ] Remaining changes committed with no broken asset references.

# Bug: Hero CTA Uses Localhost URL

## Plan
- [x] Trace how hero CTA URLs are sourced and rendered.
- [x] Normalize hero CTA URLs to avoid localhost origins (convert to relative path).
- [x] Verify CTA link output for posts and ensure external links remain untouched.

## Review
- [x] Hero CTA no longer points to `http://localhost:3000/...` on production.
Review Notes: CTA URLs are normalized in the hero render; post slides now resolve to `/noticias/{slug}` when available; admin auto-URL uses post slugs.

# Favicon Update

## Plan
- [x] Review new favicon assets in `public/` and confirm desired filenames.
- [x] Update head links to reference new favicon and manifest files.
- [x] Align web manifest metadata/icons with new favicon set.
- [x] Verify favicon links resolve (no 404s) and document results.

## Review
- [x] Head references point to the new favicon assets.
- [x] Manifest(s) include the new icon sizes.
Review Notes: Verified file presence for all new favicon assets and manifest references in `src/routes/__root.tsx`.

# Favicon SVG

## Plan
- [x] Review `public/favicon.svg` and current head icon links.
- [x] Update head links to include the SVG favicon (keep PNG/ICO fallbacks).
- [x] Verify the SVG is referenced and resolves in the built head output.

## Review
- [x] SVG favicon referenced in head.
Review Notes: `src/routes/__root.tsx` now includes a `rel="icon"` link for `/favicon.svg`, and both manifest files include the SVG icon.

# Favicon SVG Fallback

## Plan
- [x] Generate `public/favicon.ico` from the PNG fallback.
- [x] Restore the ICO `<link rel="icon">` in the document head.
- [x] Add cache-busting query params and a `shortcut icon` link for wider browser support.
- [ ] Verify the favicon renders (hard refresh or new private window) in Arc/Chrome/Safari.

## Review
- [ ] ICO fallback is present and referenced in head.

# Bug: Delete Book Fails With Order Items FK

## Spec (Draft)
- Deleting a book with existing `order_items` fails due to FK `order_items_book_id_fkey`.
- Expected: admin sees a clear message; book is removed from sale without breaking order history.

## Plan
- [x] Locate the admin delete action and confirm FK restriction source.
- [x] Decide behavior: block delete when order items exist and archive the book instead.
- [x] Implement delete flow: check order_items count; if >0, set `is_active=false` (and `featured=false`) with a clear toast; else delete.
- [ ] Verify delete/archival paths and document results.

## Review
- [ ] Deleting a book with orders no longer throws FK error.
- [ ] Book is archived (inactive, unfeatured) with a clear admin message.

# UI: Book Covers Should Not Crop

## Spec (Draft)
- Book covers in listing/featured/detail are cropped due to `object-cover`.
- Expected: show full cover (no cropping), even if it letterboxes within the 3:4 card.

## Plan
- [ ] Find all `BookCover` usages in shop listing, featured grid, and book detail.
- [ ] Switch cover images to `object-contain` and remove hover scaling to avoid edge cropping.
- [ ] Verify layouts still align and covers are fully visible.

## Review
- [ ] Listing/featured/detail covers render without cropping.

# Cross-Project Performance Intervention (Vercel React Best Practices)

## Spec
- Audit and improve both `catalogus` and `catalogus_admin` using the Vercel React best-practices priorities.
- Focus first on the highest-impact categories: async waterfalls, bundle size, server/client data boundaries, and rerender stability.
- Keep the work phased so each batch can be implemented, verified, and rolled back independently if needed.
- Treat `catalogus` as the public performance/SSR target and `catalogus_admin` as the security/client-orchestration target.

## Plan

### Phase 0 - Baseline and guardrails
- [x] Record current baselines for both apps: build output, largest chunks, key slow routes, and any obvious hydration/client-fetch delays.
- [x] Define verification for each phase: build, targeted tests, and manual route checks for both apps.
- [x] Decide issue tracking granularity: one branch per phase or one branch per project area.

### Phase 1 - Critical security and server-boundary fixes
- [x] `catalogus_admin`: move Umami API access behind a server boundary so `VITE_UMAMI_API_TOKEN` is no longer exposed to the client.
- [x] `catalogus_admin`: add caching/rate limits to the Umami proxy path and define failure behavior for analytics screens.
- [x] `catalogus`: replace the singleton SSR `QueryClient` with a per-request instance and confirm no cross-request cache leakage.

### Phase 2 - Eliminate the biggest waterfalls
- [x] `catalogus_admin`: remove route-level double lazy loading where TanStack Router is already splitting routes.
- [x] `catalogus_admin`: identify dashboard screens that should preload data via route loaders instead of post-render fetches.
- [x] `catalogus`: flatten serial author/news data loading into parallel fetches where dependencies allow.
- [x] `catalogus`: review other loaders/server functions for early-start/late-await opportunities.

### Phase 3 - Reduce shipped JavaScript
- [x] `catalogus`: lazy-load or fully isolate devtools from the root bundle.
- [x] `catalogus_admin`: dynamically import interaction-only heavy modules such as image compression and other upload helpers.
- [x] Audit both apps for barrel imports, unnecessary root imports, and routes/components that should be split more aggressively.
- [x] Re-check bundle output after chunking changes and note wins/regressions.

### Phase 4 - Improve server/client data strategy
- [x] `catalogus`: classify routes into cacheable/prerenderable vs. truly dynamic and implement the chosen strategy.
- [x] `catalogus`: prioritize public content routes (`/`, news, authors, publications) for cache/revalidation work.
- [x] `catalogus_admin`: move long client-side orchestration flows (especially publication/PDF processing and relational filtering) to server-side functions/RPC where practical.
- [x] `catalogus_admin`: replace client-side multi-step data joins/count logic with server-aggregated responses for critical dashboards.

### Phase 5 - Rerender and rendering hygiene
- [x] Memoize unstable provider/context values in both apps, starting with auth/theme/cart/root providers.
- [x] Narrow provider scope where possible so app-wide rerenders do not fan out through the whole tree.
- [x] Audit expensive components for avoidable recalculation, effect-driven derived state, and unstable object dependencies.
- [x] Review image/LCP-critical surfaces in `catalogus` for dimensions, loading priority, and consistent optimized rendering.

### Phase 6 - Verification and closeout
- [ ] Run builds/tests for both apps and document any environment-specific blockers.
- [ ] Manually verify key public flows in `catalogus`: home, authors, news, publications, checkout-adjacent routes.
- [ ] Manually verify key admin flows in `catalogus_admin`: dashboard, analytics, publication upload/edit, auth idle recovery.
- [ ] Write a short review note with completed wins, remaining risks, and the next recommended phase.

## Review
- [ ] Critical security issues closed or isolated behind server boundaries.
- [ ] Largest known waterfalls reduced in both apps.
- [ ] Bundle size and route-load behavior improved measurably.
- [ ] Data-fetching boundaries are clearer and less client-heavy.
- [ ] Provider/rerender hotspots reduced.
- [ ] Verification notes captured with before/after evidence.

### Phase 0 Notes
- `catalogus` baseline build passed. Largest client chunks: `main-LPNl6hMN.js` 512.38 kB, route `_slug-BmOmitzO.js` 194.82 kB, `supabase-CfPnqtvV.js` 168.10 kB, `FlipbookViewer-DoId56L4.js` 59.54 kB, `radix-B9W3luMG.js` 45.17 kB. Build warning: unresolved `/TT Norms/TT Norms Pro Regular Italic.otf` and >500 kB chunk warning.
- `catalogus` SSR/server baseline build passed. Largest server chunks: `router-DWDdtjE5.mjs` 139.88 kB and `server.mjs` 135.21 kB.
- `catalogus_admin` baseline build passed. Largest client chunks: `vendor-pdfjs-BbWLtDaW.js` 500.83 kB, `index-B2q2BN5k.js` 435.76 kB, `vendor-editor-LAm6lehq.js` 392.63 kB, `vendor-supabase-DlZiTvmv.js` 173.66 kB, `article-editor-WuTE7Xto.js` 112.14 kB, `imageOptimization-5LMxsmXE.js` 54.62 kB, `sidebar-By9fSXRE.js` 52.84 kB. Build warning: >500 kB chunk warning. `pdf.worker.min-Cr_QfRGn.mjs` is 1128.59 kB as a static asset.
- Test baseline passed for both apps. `catalogus`: 4 files / 14 tests passed, with a Vitest hanging-process shutdown warning after completion. `catalogus_admin`: 4 files / 8 tests passed.
- Key known slow/risky areas to measure against later:
  - `catalogus`: root client bundle size, public content route caching, serial author/news loaders, root devtools import, SSR query-client lifetime.
  - `catalogus_admin`: browser-exposed Umami token, double lazy route waterfalls, client-only dashboard fetching, publication/PDF workflow orchestration, heavy editor/PDF/image chunks.
- Verification standard for each next phase:
  - Run `pnpm build` in both `catalogus` and `catalogus_admin`.
  - Run `pnpm test` in `catalogus` and `pnpm test:run` in `catalogus_admin` when touched areas justify it.
  - Manually verify impacted routes/flows after each phase instead of deferring all checks to the end.
  - Re-check chunk output after any Phase 2-4 bundle/data-boundary changes.
- Tracking strategy: use one focused branch per phase, and split further by project area only if a phase becomes too broad. Current workspace note: `catalogus` already has unrelated local changes; `catalogus_admin` is currently clean.

### Phase 1 Notes
- `catalogus_admin` no longer reads `VITE_UMAMI_API_TOKEN` in the browser. Client analytics now call same-origin proxy endpoints in `catalogus_admin/api/umami/[endpoint].js` and `catalogus_admin/api/umami/config.js`.
- `catalogus_admin` analytics UI now checks server-side Umami configuration before firing metrics requests and shows a server-env setup message when not configured.
- `catalogus_admin` proxy now has cache headers for `stats`, `pageviews`, `metrics`, and `active`, explicit upstream/proxy errors, and a lightweight per-IP in-memory rate limit for burst protection.
- `catalogus` now creates the React Query client per router instance via `catalogus/src/lib/queryClient.ts`, wires it through router context in `catalogus/src/router.tsx`, and consumes that request-scoped instance in `catalogus/src/routes/__root.tsx`.
- Phase 1 verification:
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). Vitest still reports a hanging-process shutdown warning after completion.
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests).
  - Remaining manual verification: deploy-time check that Vercel routes `/api/umami/*` correctly in `catalogus_admin`, and confirm analytics renders when `UMAMI_API_TOKEN` is present in server env.

### Phase 2 Notes
- `catalogus_admin` no longer adds a second `React.lazy` boundary inside route files. Route modules now import their page content directly and let TanStack Router own route-level splitting, removing the extra code waterfall on navigation.
- Verified with search: there are no remaining `lazy(async () => import(...))` route wrappers under `catalogus_admin/src/routes`.
- `catalogus` author/news data fetching now removes a few easy serial waits:
  - `fetchStandaloneAuthors` now loads public profiles and linked author ids in parallel.
  - `loadAuthorsPageData` now starts standalone profile loading in parallel with featured author lookup.
  - `fetchRelatedPosts` now resolves category/tag post-id lookups in parallel.
- Phase 2 verification:
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). Vitest still reports the same hanging-process shutdown warning after success.
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests).
- Remaining Phase 2 work:
  - `catalogus_admin`: convert the most expensive dashboard screens from post-render fetching to route-loader prefetching.
  - `catalogus`: continue reviewing loaders/server functions for additional early-start/late-await wins beyond authors/news.

### Phase 2 Follow-up Notes
- `catalogus_admin` preload candidates identified:
  - `/analytics`: now preloads Umami config in the route loader so the screen can render with initial config state instead of waiting for a post-render config fetch.
  - `/`: dashboard metrics should be the next full route-loader candidate, but this likely needs query-client/router-context wiring or a cleaner auth-aware preload strategy.
  - `/atividade`, sidebar badges, and `/perfil/reivindicar` still fetch after render and are good secondary loader/prefetch candidates.
- Additional `catalogus` waterfall cleanup completed:
  - `loadAuthorResult` now resolves author-by-id and public-profile fallback in parallel for UUID lookups.
  - `loadBookDetailPageData` now resolves slug/id book lookups in parallel when the route param is a UUID.
- Follow-up verification:
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). The same Vitest hanging-process shutdown warning remains after completion.
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests).

### Phase 3 Notes
- `catalogus` devtools are no longer imported in the root module. `catalogus/src/routes/__root.tsx` now lazy-loads the TanStack devtools only in dev mode behind a `Suspense` boundary.
- `catalogus_admin` image compression is now interaction-only. `catalogus_admin/src/lib/imageOptimization.ts` dynamically imports `browser-image-compression` only when an upload flow actually calls the optimizer.
- Bundle recheck after the Phase 3 changes:
  - `catalogus`: client build still has a large `main` chunk, but it dropped slightly from the previous 512.71 kB to `main-CLiABY5D.js` 512.34 kB and the client transform count dropped from 2246 to 2195 modules, which confirms the root devtools code moved out of the normal production path.
  - `catalogus_admin`: the old `imageOptimization` chunk dropped from 54.62 kB to `imageOptimization-CKF7LPdV.js` 1.60 kB, and `browser-image-compression` now ships as its own on-demand chunk at 53.17 kB instead of inflating initial route bundles.
  - Remaining big chunks are still the main priorities for later work: `catalogus` main client chunk (~512 kB), `catalogus_admin` main app chunk (~437 kB), `vendor-editor` (~392 kB), `vendor-supabase` (~173 kB), and `vendor-pdfjs` (~500 kB) plus the static PDF worker asset.
- Phase 3 verification:
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). The same Vitest hanging-process shutdown warning remains after success.
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests).

### Phase 3 Follow-up Notes
- `catalogus_admin` editor audit findings:
  - `article-editor` was still statically pulling in the rich text editor. It now lazy-loads `@/components/ui/richtext-editor` behind a `Suspense` fallback inside `catalogus_admin/src/components/dashboard/article-editor.tsx`.
  - This created a separate `richtext-editor` chunk (~2.05 kB wrapper) and reduced the route-local `article-editor` chunk from ~111.98 kB to ~110.59 kB. The heavier `vendor-editor` bundle remains large because TipTap/ProseMirror are still shared editor dependencies, but the route shell is now a bit lighter and more deferrable.
  - `vendor-pdfjs` is already behind `catalogus_admin/src/lib/pdfHelpers.ts` dynamic loading. The remaining issue is mostly the intrinsic size of `pdfjs-dist` and its worker asset, not an eager import bug.
- `catalogus` startup audit findings:
  - The root shell still pays for `Header`, auth/cart providers, i18n, and Radix UI primitives; those are the likely main-chunk anchors.
  - Public route code already defers the flipbook/PDF viewer on publication detail pages, so the worst remaining startup target is the root/header/app-shell path rather than route-local PDF code.
  - There was no obvious barrel-import hotspot in the `catalogus` app shell beyond normal shared UI composition.
- Additional verification after the follow-up split:
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests).
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). The same Vitest hanging-process warning remains.

### Phase 4 Notes
- `catalogus_admin` content-admin dashboard metrics no longer have to be assembled from four separate client queries when `includeCommerce` is false.
- Added a Supabase RPC migration in `catalogus_admin/supabase/migrations/20260310090000_add_content_dashboard_metrics_rpc.sql` that returns the lightweight content dashboard summary as one server-side aggregated JSON payload.
- Updated `catalogus_admin/src/hooks/supabase/dashboard.ts` to call `get_admin_content_dashboard_metrics` first and fall back to the old client-side multi-query path only when the RPC is missing, which keeps rollout safe before the migration is applied everywhere.
- Updated `catalogus_admin/src/lib/database.types.ts` so the new RPC is typed in the client.
- `catalogus` Phase 4 route classification:
  - `/` home, `/autores`, and `/publicacoes` are content-heavy but relatively cache-friendly, so they now use route loader caching with longer `staleTime`, `gcTime`, and preload settings.
  - `/noticias` is cacheable too, but because it varies by filters/search it now defines `loaderDeps` explicitly and uses a shorter cache window.
  - Highly user-specific or transactional flows remain outside this strategy for now.
- `catalogus` route-cache implementation landed in:
  - `catalogus/src/routes/index.tsx`
  - `catalogus/src/routes/autores/index.tsx`
  - `catalogus/src/routes/publicacoes/index.tsx`
  - `catalogus/src/routes/noticias/index.tsx`
- This does not add HTTP CDN cache headers yet; it improves TanStack Router loader reuse/revalidation behavior so public-content navigations and preloads stop refetching too aggressively within the client/router lifecycle.
- `catalogus_admin` publication flow now has its first server-side orchestration move: publication deletion no longer has to be fully coordinated in the browser when server env is available.
- Added `catalogus_admin/api/publications/[id].js`, which:
  - validates the caller via Supabase bearer token,
  - checks admin/author role server-side,
  - removes publication page/thumbnail/original PDF assets from storage,
  - deletes the publication record with service-role permissions.
- Updated `catalogus_admin/src/components/dashboard/mapas-literarios-content.tsx` so deletion prefers the server API and falls back to the legacy client-side cleanup path only when the API is unavailable or not configured. This reduces one of the multi-step storage/database cleanup flows running in the browser and gives us a safer migration path.
- The heaviest part of publication ingestion is still client-side PDF rendering/page extraction; that remains the next server-boundary candidate if we want to keep pushing this phase.
- Phase 4 verification:
  - `catalogus_admin`: `pnpm build` passed.
  - `catalogus_admin`: `pnpm test:run` passed (8 tests). One earlier run showed a transient failure in `src/lib/auth.test.tsx`, but targeted/full reruns passed cleanly.
  - `catalogus`: `pnpm build` passed.
  - `catalogus`: `pnpm test` passed (14 tests). The same Vitest hanging-process shutdown warning remains after success.

### Phase 5 Notes
- Provider/context stability pass landed in both apps:
  - `catalogus/src/contexts/AuthProvider.tsx`: memoized the auth context value and stabilized `signOut` with `useCallback`.
  - `catalogus/src/lib/useCart.tsx`: memoized derived cart totals/counts and the cart context value.
  - `catalogus_admin/src/lib/auth.tsx`: memoized provider value and stabilized auth actions (`signIn`, `signOut`, `requestPasswordReset`, `updatePassword`, `refreshProfile`).
  - `catalogus_admin/src/components/theme-provider.tsx`: memoized the theme context value and stabilized the setter.
- These changes reduce whole-subtree rerenders from provider value identity churn, especially in root-level shells where auth/theme/cart context objects were recreated every render.
- Additional Phase 5 rerender cleanup landed in high-traffic UI surfaces:
  - `catalogus/src/components/Header.tsx`: memoized auth-derived URLs and the CMS-profile handler, and consolidated repeated header-height DOM writes through a stable callback.
  - `catalogus_admin/src/components/dashboard/content.tsx`: memoized KPI list construction and wrapped `TrendChart` in `memo`, with its point calculations moved behind `useMemo`.
- These are small but useful wins: the public-site header stops recreating several derived values/functions every render, and the admin dashboard avoids recomputing KPI/line-chart data when unrelated local state changes.
- Image/LCP follow-up landed in `catalogus`:
  - `catalogus/src/components/OptimizedImage.tsx` no longer waits for an effect/state round-trip to resolve Supabase public URLs. Image URLs are now derived synchronously with `useMemo`, which removes an avoidable loading-skeleton frame for many already-known images.
  - Added `sizes` support to `OptimizedImage`, `BookCover`, `AuthorPhoto`, `PostFeaturedImage`, and `HeroBackground` so responsive layouts can give the browser better image selection hints.
  - Wired responsive `sizes` hints into:
    - `catalogus/src/components/home/FeaturedBooksSection.tsx`
    - `catalogus/src/components/home/FeaturedAuthorsSection.tsx`
    - `catalogus/src/components/home/NewsSection.tsx`
- `catalogus_admin` provider-scope audit result: the biggest remaining scope issue is repeated route-level `SidebarProvider` usage across dashboard routes. That is a good next refactor target, but it is broader than the low-risk rendering pass completed here.
- `catalogus_admin` sidebar/provider scope refactor landed:
  - `catalogus_admin/src/routes/__root.tsx` now owns a single persistent `SidebarProvider` + `DashboardSidebar` wrapper for non-auth routes.
  - Dashboard route files no longer create their own sidebar/provider instances on every navigation.
  - This reduces provider remount churn and keeps sidebar state stable across dashboard route transitions.
  - Auth routes still render without the dashboard shell.
- Refactor note: centralizing the sidebar shell moved more dashboard layout code into the main shared admin chunk. That is a rerender/state-lifetime win, but it trades against bundle splitting slightly, so any future Phase 3/5 work should treat shell-state stability and chunk isolation together.
- Final low-risk effect cleanup landed in `catalogus` hot components:
  - `catalogus/src/components/search/FloatingSearch.tsx`: merged duplicate global keydown listeners into one stable effect and stabilized open/close/submit handlers.
  - `catalogus/src/components/Hero.tsx`: stabilized slide navigation handlers with `useCallback`, so keyboard navigation effect dependencies are accurate and less brittle.
  - `catalogus/src/components/flipbook/FlipbookViewer.tsx`: dimension recalculation now avoids redundant state updates when computed width/height do not change, reducing resize/observer churn.
- Phase 5 verification:
  - `catalogus`: `pnpm build` passed; `pnpm test` passed (14 tests). The same Vitest hanging-process shutdown warning remains.
  - `catalogus_admin`: `pnpm build` passed; `pnpm test:run` passed (8 tests). One initial post-refactor full test run had the same intermittent `auth.test.tsx` timing issue seen earlier, but a targeted rerun and a full rerun both passed without code changes.
