# SEO

## Overview
This project uses TanStack Router `head` metadata plus JSON-LD structured data. Defaults live in `src/lib/seo.ts` and are applied in `src/routes/__root.tsx`. Per-route head metadata is defined on public routes.

## Defaults
- Site name: `Catalogus`
- Default description: set in `SEO_DEFAULTS.description`
- Default OG image: `/catalogos-1024x555.webp`
- Default locale: `pt_MZ`
- Canonical base URL: from `SITE_URL` or `VITE_SITE_URL`, fallback to `https://catalogus.co.mz`

## Per-Route Rules
- Home, shop, authors, news list, projects, production, about, contacts, publications list all define titles and descriptions.
- Book detail uses `seo_title` and `seo_description` when present, otherwise falls back to `title` and `description`.
- Publication detail uses `seo_title` and `seo_description` when present, otherwise falls back to `title` and `description`.
- Author detail uses author `bio` as description when present, otherwise falls back to site default.
- News detail uses `excerpt` or `body` as description when present, otherwise falls back to site default.

## Noindex Rules
Pages that should not be indexed use `noindex, nofollow`:
- Private/app routes: `/admin`, `/account`, `/auth`, `/author`, `/checkout`, `/carrinho`, `/pedido`, `/meus-pedidos`, `/newsletter`, `/demo`
- Search results: `/pesquisa`
- News list with filters (`?q`, `?categoria`, `?tag`)

## Structured Data
JSON-LD is emitted via `headScripts`:
- `Organization` and `WebSite` globally
- `Book` on book detail
- `NewsArticle` on news detail
- `Person` on author detail
- `BreadcrumbList` on detail pages

## Robots and Sitemap
- `public/robots.txt` disallows private routes and references `/sitemap.xml`.
- `src/routes/sitemap.xml.ts` dynamically emits static + dynamic URLs with `lastmod`.

## Updates
To change defaults or behavior, update `src/lib/seo.ts` and route `head` definitions.
