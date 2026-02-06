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
- [ ] Verify promo badges/prices render with active pre-venda and promo price.

## Review
- [ ] Pre-venda badge shows when active.
- [ ] Promo price replaces base price when active.
