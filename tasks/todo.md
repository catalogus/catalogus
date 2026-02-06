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
