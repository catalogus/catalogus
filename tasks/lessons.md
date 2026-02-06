# Lessons

- When adding promo/date logic, normalize date strings and numeric fields, and prefer server-computed flags (views) across all queries to avoid inconsistent client behavior.
- When a promo appears inactive, always compare current date to the stored promo start/end dates and call out the exact dates before changing logic.
- For pre-venda, confirm whether start dates should gate visibility; align DB view + client helpers to the intended semantics before declaring the feature done.
