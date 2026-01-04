# Catalogus Supabase setup

## Prereqs
- Supabase project created (email/password auth enabled).
- Supabase CLI logged in (`supabase login`) and a Postgres connection string handy (`SUPABASE_DB_URL`).

## Apply schema
Quick apply to a DB (remote or local):
```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

If you prefer migrations, split `supabase/schema.sql` into `supabase/migrations/*.sql` and run:
```bash
supabase db push
```

Tip: if you run pieces in the Supabase SQL editor, run the tables block first, then the helper functions, then the RLS policies to avoid “relation does not exist” errors from `is_admin()` referencing `profiles`.

## Buckets
The script creates three buckets: `covers`, `authors`, `partners` (public). Add more if needed (e.g., `posts`, `projects`).

## Seeding examples (run after users exist)
```sql
-- Make an existing auth user an admin
insert into public.profiles (id, role, name)
values ('<auth_user_uuid>', 'admin', 'Admin User')
on conflict (id) do update set role = excluded.role;

-- Sample book
insert into public.books (title, slug, price_mzn, stock, category, language)
values ('Sample Book', 'sample-book', 850, 10, 'Fiction', 'pt');

-- Approve an author and link a book
update public.profiles set role = 'author', status = 'approved', name = 'Author One'
where id = '<author_auth_uuid>';
insert into public.authors_books (author_id, book_id)
values ('<author_auth_uuid>', '<book_uuid>');
```

## Notes
- Orders/order_items inserts/updates are restricted to service role or admins (see `public.is_service_role()`).
- Customers can only see their own orders/items; public reads only active books/approved authors/content.
