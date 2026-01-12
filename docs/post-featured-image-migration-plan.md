# Post Featured Image Migration Plan (Resume After ISP Change)

## Pre-check
- Confirm `catalogus.co.mz` is reachable:
  - `curl -I https://catalogus.co.mz/wp-content/uploads/`
- Ensure env vars are set:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Dry Run (Small)
```
npx tsx scripts/migrate-post-featured-images.ts --dry-run --limit=5 --timeout-ms=20000 --retries=2
```

## Small Live Batch
```
npx tsx scripts/migrate-post-featured-images.ts --limit=25 --timeout-ms=20000 --retries=2
```

## Full Run
```
npx tsx scripts/migrate-post-featured-images.ts --timeout-ms=20000 --retries=2
```

## Validation
- Spot-check several posts in the UI.
- Confirm `featured_image_url` now points to Supabase Storage.
- Verify images load and look correct.
