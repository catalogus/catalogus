-- Catalogus Supabase schema + RLS
-- Run with: supabase db push -f supabase/schema.sql

-- Enums
create type public.user_role as enum ('admin', 'author', 'customer');
create type public.author_status as enum ('pending', 'approved', 'rejected');
create type public.order_status as enum ('pending', 'processing', 'paid', 'failed', 'cancelled');
create type public.content_status as enum ('draft', 'published');
create type public.language_code as enum ('pt', 'en');

-- Tables
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'customer',
  status author_status,
  name text not null,
  email text,
  bio text,
  photo_url text,
  photo_path text,
  social_links jsonb default '{}'::jsonb,
  phone text,
  birth_date date,
  residence_city text,
  province text,
  published_works jsonb default '[]'::jsonb,
  author_gallery jsonb default '[]'::jsonb,
  featured_video text,
  author_type text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  description_json jsonb,
  price_mzn numeric(12, 2) not null,
  stock integer not null default 0,
  cover_url text,
  cover_path text,
  featured boolean not null default false,
  isbn text,
  publisher text,
  seo_title text,
  seo_description text,
  category text,
  language language_code not null default 'pt',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index books_is_active_idx on public.books (is_active);
create index books_category_idx on public.books (category);
create index books_language_idx on public.books (language);

create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  bio text,
  photo_path text,
  photo_url text,
  author_type text,
  social_links jsonb default '{}'::jsonb,
  featured boolean not null default false,
  wp_id bigint,
  wp_slug text,
  phone text,
  birth_date date,
  residence_city text,
  province text,
  published_works jsonb default '[]'::jsonb,
  author_gallery jsonb default '[]'::jsonb,
  featured_video text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists authors_wp_id_key on public.authors (wp_id);
create index if not exists authors_wp_slug_idx on public.authors (wp_slug);
create index if not exists authors_featured_idx on public.authors (featured);

drop table if exists public.authors_books;
create table public.authors_books (
  author_id uuid not null references public.authors (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete cascade,
  primary key (author_id, book_id)
);

create sequence if not exists public.order_number_seq;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('ORD-' || lpad(nextval('public.order_number_seq')::text, 8, '0')),
  customer_id uuid references auth.users (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  total numeric(12, 2) not null,
  status order_status not null default 'pending',
  mpesa_transaction_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index orders_customer_idx on public.orders (customer_id);
create index orders_status_idx on public.orders (status);
create index orders_created_idx on public.orders (created_at desc);

create table public.order_items (
  id bigserial primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  book_id uuid not null references public.books (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0)
);
create index order_items_order_idx on public.order_items (order_id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  status content_status not null default 'draft',
  language language_code not null default 'pt',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index posts_status_idx on public.posts (status);
create index posts_language_idx on public.posts (language);

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index partners_active_idx on public.partners (is_active);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  order_weight integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_active_idx on public.services (is_active);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  cover_url text,
  link text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index projects_active_idx on public.projects (is_active);

-- Helper functions (after tables exist)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.is_service_role()
returns boolean
language sql
security definer
as $$
  select coalesce((auth.jwt() ->> 'role') = 'service_role', false);
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.authors enable row level security;
alter table public.authors_books enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.posts enable row level security;
alter table public.partners enable row level security;
alter table public.services enable row level security;
alter table public.projects enable row level security;

-- Ensure new columns exist on existing deployments
alter table public.books
  add column if not exists description_json jsonb,
  add column if not exists cover_path text,
  add column if not exists featured boolean default false,
  add column if not exists isbn text,
  add column if not exists publisher text,
  add column if not exists seo_title text,
  add column if not exists seo_description text;

alter table public.profiles
  add column if not exists photo_path text,
  add column if not exists email text,
  add column if not exists birth_date date,
  add column if not exists residence_city text,
  add column if not exists province text,
  add column if not exists published_works jsonb default '[]'::jsonb,
  add column if not exists author_gallery jsonb default '[]'::jsonb,
  add column if not exists featured_video text,
  add column if not exists author_type text,
  add column if not exists featured boolean default false;

alter table public.authors
  add column if not exists author_type text,
  add column if not exists wp_id bigint,
  add column if not exists wp_slug text,
  add column if not exists bio text,
  add column if not exists photo_path text,
  add column if not exists photo_url text,
  add column if not exists social_links jsonb default '{}'::jsonb,
  add column if not exists featured boolean default false,
  add column if not exists phone text,
  add column if not exists birth_date date,
  add column if not exists residence_city text,
  add column if not exists province text,
  add column if not exists published_works jsonb default '[]'::jsonb,
  add column if not exists author_gallery jsonb default '[]'::jsonb,
  add column if not exists featured_video text;

-- Profiles policies
create policy "Profiles: user can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Profiles: admins can view all" on public.profiles
  for select using (public.is_admin());

create policy "Profiles: user can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Profiles: user can insert own profile (non-admin)" on public.profiles
  for insert with check (auth.uid() = id and role <> 'admin');

create policy "Profiles: admins can upsert" on public.profiles
  for all using (public.is_admin()) with check (true);

-- Books policies
create policy "Books: public can read active" on public.books
  for select using (is_active);

create policy "Books: admins full access" on public.books
  for all using (public.is_admin()) with check (public.is_admin());

-- Authors policies
create policy "Authors: public can read" on public.authors
  for select using (true);

create policy "Authors: admins full access" on public.authors
  for all using (public.is_admin()) with check (public.is_admin());

-- Authors_books policies
create policy "AuthorsBooks: public can read active books" on public.authors_books
  for select using (
    exists (
      select 1
      from public.books b
      where b.id = authors_books.book_id
        and b.is_active = true
    )
  );

create policy "AuthorsBooks: admins full access" on public.authors_books
  for all using (public.is_admin()) with check (public.is_admin());

-- Orders policies
create policy "Orders: customer can read own" on public.orders
  for select using (auth.uid() = customer_id);

create policy "Orders: admins can read all" on public.orders
  for select using (public.is_admin());

create policy "Orders: service/admin can insert" on public.orders
  for insert with check (public.is_admin() or public.is_service_role());

create policy "Orders: service/admin can update" on public.orders
  for update using (public.is_admin() or public.is_service_role());

-- Order items policies
create policy "OrderItems: customer can read own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

create policy "OrderItems: admins can read all" on public.order_items
  for select using (public.is_admin());

create policy "OrderItems: service/admin can insert" on public.order_items
  for insert with check (public.is_admin() or public.is_service_role());

create policy "OrderItems: service/admin can update" on public.order_items
  for update using (public.is_admin() or public.is_service_role());

-- Posts policies
create policy "Posts: public can read published" on public.posts
  for select using (status = 'published');

create policy "Posts: admins full access" on public.posts
  for all using (public.is_admin()) with check (public.is_admin());

-- Partners policies
create policy "Partners: public can read active" on public.partners
  for select using (is_active);

create policy "Partners: admins full access" on public.partners
  for all using (public.is_admin()) with check (public.is_admin());

-- Services policies
create policy "Services: public can read active" on public.services
  for select using (is_active);

create policy "Services: admins full access" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- Projects policies
create policy "Projects: public can read active" on public.projects
  for select using (is_active);

create policy "Projects: admins full access" on public.projects
  for all using (public.is_admin()) with check (public.is_admin());

-- Storage buckets (covers, authors, partners, author-photos)
insert into storage.buckets (id, name, public) values
  ('covers', 'covers', true),
  ('authors', 'authors', true),
  ('partners', 'partners', true),
  ('author-photos', 'author-photos', true)
on conflict (id) do nothing;

-- Storage policies for public assets and admin uploads
alter table storage.objects enable row level security;

create policy "Storage: public can read covers/authors/partners/author-photos"
  on storage.objects for select
  using (bucket_id in ('covers','authors','partners','author-photos'));

create policy "Storage: admin can manage covers/authors/partners"
  on storage.objects for all
  using (public.is_admin())
  with check (public.is_admin());

-- Author-photos storage policies (users can upload to their own folder)
create policy "Storage: users can upload own author photos"
  on storage.objects for insert
  with check (
    bucket_id = 'author-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

create policy "Storage: users can delete own author photos"
  on storage.objects for delete
  using (
    bucket_id = 'author-photos'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_admin()
    )
  );

-- Simple published/active defaults
update public.posts set status = 'published' where status is null;
update public.partners set is_active = true where is_active is null;
update public.services set is_active = true where is_active is null;
update public.projects set is_active = true where is_active is null;
