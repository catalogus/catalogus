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
