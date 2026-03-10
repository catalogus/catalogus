# Cross-Project Performance Intervention Report

## Executive Summary

This report summarizes the performance, security, and architecture intervention completed across the two Catalogus applications:

- `catalogus` - public-facing web experience
- `catalogus_admin` - administrative dashboard and content operations application

The intervention used the Vercel React Best Practices framework as the assessment and refactoring guide, with emphasis on:

- eliminating data and code-loading waterfalls
- reducing shipped JavaScript
- improving server/client data boundaries
- reducing unnecessary rerenders
- improving rendering behavior for important user-facing surfaces

The program was executed in 7 phases. At the time of this report:

- Phases 0 through 5 are completed
- Phase 6 (final manual verification and closeout) remains open

## Scope

### Applications Reviewed

- `catalogus`
- `catalogus_admin`

### Optimization Framework Used

The work was prioritized using the Vercel React Best Practices categories:

1. Eliminating Waterfalls
2. Bundle Size Optimization
3. Server-Side Performance
4. Client-Side Data Fetching
5. Re-render Optimization
6. Rendering Performance
7. JavaScript Performance
8. Advanced Patterns

## Phase Overview

| Phase | Title | Status |
|---|---|---|
| 0 | Baseline and guardrails | Complete |
| 1 | Critical security and server-boundary fixes | Complete |
| 2 | Eliminate the biggest waterfalls | Complete |
| 3 | Reduce shipped JavaScript | Complete |
| 4 | Improve server/client data strategy | Complete |
| 5 | Rerender and rendering hygiene | Complete |
| 6 | Verification and closeout | Open |

## Baseline Findings

### `catalogus`

Baseline risks identified:

- oversized main client bundle
- SSR query client lifecycle risk
- serial data fetching in content flows
- root-level devtools code in app shell
- limited route cache/revalidation strategy for content pages

Baseline measurements:

- main client chunk around 512 kB
- large route chunk for publication/news detail pages
- Supabase-related client chunk around 168 kB
- persistent Vitest hanging-process warning after successful test completion

### `catalogus_admin`

Baseline risks identified:

- browser exposure of Umami analytics token
- route-level double lazy loading
- client-heavy dashboard data orchestration
- browser-managed publication cleanup workflow
- large editor and PDF-related bundles

Baseline measurements:

- main app chunk around 436-437 kB
- `vendor-editor` around 392 kB
- `vendor-pdfjs` around 500 kB
- static PDF worker asset around 1.1 MB

## Work Completed By Phase

## Phase 0 - Baseline and Guardrails

### Goals

- establish build/test baseline
- identify largest chunks and risky surfaces
- define verification rules
- define rollout/tracking strategy

### Outcome

Completed.

### Deliverables

- baseline build and test runs for both apps
- initial chunk-size observations
- phased checklist and notes recorded in `catalogus/tasks/todo.md`

## Phase 1 - Critical Security and Server-Boundary Fixes

### `catalogus_admin`

Completed:
- moved Umami analytics access behind server-side proxy endpoints
- removed browser dependency on `VITE_UMAMI_API_TOKEN`
- added server-side config check for analytics availability
- added cache headers and lightweight request protection on analytics proxy

Key files:
- `catalogus_admin/api/umami/[endpoint].js`
- `catalogus_admin/api/umami/config.js`
- `catalogus_admin/src/hooks/use-umami.ts`
- `catalogus_admin/src/components/dashboard/analytics-content.tsx`

### `catalogus`

Completed:
- replaced singleton React Query client with per-router/per-request client creation
- reduced SSR cross-request cache leakage risk

Key files:
- `catalogus/src/lib/queryClient.ts`
- `catalogus/src/router.tsx`
- `catalogus/src/routes/__root.tsx`

### Impact

- closed the most critical security issue in `catalogus_admin`
- improved SSR isolation and correctness in `catalogus`

## Phase 2 - Eliminate the Biggest Waterfalls

### `catalogus_admin`

Completed:
- removed route-level nested `React.lazy` usage where TanStack Router was already code splitting
- added route-loader preload for analytics configuration

Key files:
- multiple files under `catalogus_admin/src/routes/**`
- `catalogus_admin/src/routes/analytics/index.tsx`

### `catalogus`

Completed:
- parallelized several safe content-fetching paths
- reduced serial waits in authors, related posts, author detail, and book detail flows

Key files:
- `catalogus/src/features/authors/authorsData.ts`
- `catalogus/src/features/news/newsPostData.ts`
- `catalogus/src/features/authors/authorDetailData.ts`
- `catalogus/src/features/shop/bookDetailData.ts`

### Impact

- reduced avoidable navigation/data-loading latency
- improved route responsiveness and content fetch behavior

## Phase 3 - Reduce Shipped JavaScript

### `catalogus`

Completed:
- devtools are no longer imported eagerly in the root app shell
- devtools now load only in development and behind lazy boundaries

Key file:
- `catalogus/src/routes/__root.tsx`

### `catalogus_admin`

Completed:
- moved image compression to dynamic import
- lazy-loaded rich text editor wrapper inside article editor
- audited editor/PDF loading paths

Key files:
- `catalogus_admin/src/lib/imageOptimization.ts`
- `catalogus_admin/src/components/dashboard/article-editor.tsx`

### Notable bundle effects

- `imageOptimization` route-local chunk dropped significantly after dynamic import
- `browser-image-compression` moved to an on-demand chunk
- editor route shell became slightly lighter
- largest remaining chunks still exist in editor, PDF, and app-shell paths

### Impact

- reduced eager startup JS for selected high-cost paths
- improved code-splitting quality, especially in admin upload/editor flows

## Phase 4 - Improve Server/Client Data Strategy

### `catalogus_admin`

Completed:
- added content dashboard aggregation RPC to replace multiple client-side queries
- added server-side publication deletion orchestration API
- preserved fallback behavior where server capabilities are not yet available

Key files:
- `catalogus_admin/supabase/migrations/20260310090000_add_content_dashboard_metrics_rpc.sql`
- `catalogus_admin/src/hooks/supabase/dashboard.ts`
- `catalogus_admin/api/publications/[id].js`
- `catalogus_admin/src/components/dashboard/mapas-literarios-content.tsx`

### `catalogus`

Completed:
- classified key public routes as cache-friendly
- added route-level loader caching/revalidation settings to content-heavy pages

Key files:
- `catalogus/src/routes/index.tsx`
- `catalogus/src/routes/noticias/index.tsx`
- `catalogus/src/routes/autores/index.tsx`
- `catalogus/src/routes/publicacoes/index.tsx`

### Impact

- reduced client-side orchestration burden in admin dashboard and publication cleanup
- improved route loader reuse and reduced aggressive refetching on public content pages

## Phase 5 - Rerender and Rendering Hygiene

### Provider and context stabilization

Completed in both applications:
- memoized root provider values
- stabilized provider action handlers
- reduced rerender churn from identity changes in auth/theme/cart contexts

Key files:
- `catalogus/src/contexts/AuthProvider.tsx`
- `catalogus/src/lib/useCart.tsx`
- `catalogus_admin/src/lib/auth.tsx`
- `catalogus_admin/src/components/theme-provider.tsx`

### Hot component cleanup

Completed:
- stabilized `Header` derived values and handlers
- memoized admin dashboard KPI and chart calculations
- improved image rendering path by removing effect-based public URL resolution
- added responsive `sizes` hints for home-page image grids
- centralized `SidebarProvider` and `DashboardSidebar` at admin root shell
- reduced redundant effect/listener/state churn in:
  - `FloatingSearch`
  - `Hero`
  - `FlipbookViewer`

Key files:
- `catalogus/src/components/Header.tsx`
- `catalogus_admin/src/components/dashboard/content.tsx`
- `catalogus/src/components/OptimizedImage.tsx`
- `catalogus/src/components/home/FeaturedBooksSection.tsx`
- `catalogus/src/components/home/FeaturedAuthorsSection.tsx`
- `catalogus/src/components/home/NewsSection.tsx`
- `catalogus_admin/src/routes/__root.tsx`
- `catalogus/src/components/search/FloatingSearch.tsx`
- `catalogus/src/components/Hero.tsx`
- `catalogus/src/components/flipbook/FlipbookViewer.tsx`

### Impact

- reduced provider remount churn in admin dashboard navigation
- improved rendering stability in public-site shell
- removed avoidable loading skeleton behavior for known image URLs
- reduced recalculation in dashboard and interactive public components

## Verification Status

### Automated Verification Completed

`catalogus`
- `pnpm build` passed repeatedly after each major phase
- `pnpm test` passed repeatedly
- known residual issue: Vitest hanging-process warning persists after successful completion

`catalogus_admin`
- `pnpm build` passed repeatedly after each major phase
- `pnpm test:run` passed repeatedly
- known residual issue: intermittent timing sensitivity observed in `src/lib/auth.test.tsx`, but reruns passed without code changes

### Manual Verification Status

Not yet fully completed.

Open verification work:
- public flow checks in `catalogus`
- admin flow checks in `catalogus_admin`
- final stakeholder closeout validation

## What Was Improved

### Security

Improved:
- analytics token no longer exposed in browser code
- server-side authorization boundaries improved for selected admin workflows

### Data Fetching

Improved:
- multiple serial fetches converted to parallel fetches
- dashboard aggregation moved closer to the server
- route caching introduced for public content pages

### Bundle and Loading Behavior

Improved:
- root devtools no longer included in normal production path
- interaction-only modules moved behind dynamic imports
- nested route waterfalls removed in admin dashboard

### Rerender Behavior

Improved:
- root provider values stabilized
- dashboard sidebar shell centralized
- expensive derived values and charts memoized
- hot effect-heavy components cleaned up

## Remaining Risks and Gaps

### Not Yet Closed

1. Phase 6 manual verification and final closeout
2. remaining large bundles:
   - `catalogus` main client chunk
   - `catalogus_admin` main app chunk
   - `catalogus_admin` editor and PDF bundles
3. `catalogus` Vitest hanging-process warning
4. `catalogus_admin` intermittent auth-test timing sensitivity
5. publication ingestion/PDF rendering is still largely client-side

## Recommended Next Steps

### Immediate

1. Complete Phase 6 manual verification:
   - `catalogus`: home, authors, news, publications, checkout-adjacent flows
   - `catalogus_admin`: dashboard, analytics, publication upload/edit, auth idle recovery

2. Produce before/after metrics summary:
   - chunk comparison
   - waterfall reductions
   - architecture improvements
   - residual risks

### Next Engineering Wave

1. Bundle-size campaign on remaining large chunks
2. server-side publication ingestion/PDF processing strategy
3. investigate `catalogus` Vitest hanging-process warning
4. stabilize intermittent `catalogus_admin` auth test timing

## Final Status

### Closed Phases

- Phase 0
- Phase 1
- Phase 2
- Phase 3
- Phase 4
- Phase 5

### Open Phase

- Phase 6

### Overall Assessment

The intervention successfully addressed the highest-priority architectural and performance risks across both applications. The most important wins were:

- elimination of exposed analytics credentials
- improved SSR query-client isolation
- removal of major route/data waterfalls
- stronger server/client boundaries in admin workflows
- reduced rerender churn in shared application shells

The program is not fully closed until Phase 6 manual verification and final closeout are completed.
