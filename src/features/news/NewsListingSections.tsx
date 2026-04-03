import { buildExcerpt, getCategoryBadgeClass, getCategoryDisplayLabel } from '@/lib/newsHelpers'
import { formatPostDate } from '@/lib/newsHelpers'
import type { NewsPost } from './newsListingData'

export function NewsListingHero({ featuredPost, title, label, ctaLabel, featuredCategoryLabel, filters }: { featuredPost: NewsPost | null; title: string; label: string; ctaLabel: string; featuredCategoryLabel: string | null; filters: string[] }) {
  const featuredCategory = featuredPost?.categories?.[0]?.category
  return (
    <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
      {featuredPost?.featured_image_url ? <img src={featuredPost.featured_image_url} alt={featuredPost.title} className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" />}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
      <div className="relative z-10"><div className="container mx-auto px-4 py-24 lg:px-15"><div className="max-w-3xl space-y-5">
        {featuredPost && featuredCategory ? <span className={`${getCategoryBadgeClass(featuredCategory.slug || featuredCategory.name || '')} inline-flex rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`}>{featuredCategoryLabel}</span> : <p className="text-xs uppercase tracking-[0.4em] text-white/70">{label}</p>}
        <h1 className="text-2xl font-semibold leading-tight md:text-4xl">{featuredPost ? featuredPost.title : title}</h1>
        {featuredPost && <a href={`/noticias/${featuredPost.slug}`} className="inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]">{ctaLabel}</a>}
        {filters.length > 0 && <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70">{filters.map((item) => <span key={item}>{item}</span>)}</div>}
      </div></div></div>
    </section>
  )
}

export function NewsListingGrid({ posts, isLoading, isError, hasNextPage, isFetchingNextPage, onLoadMore, labels, locale, isEnglish }: { posts: NewsPost[]; isLoading: boolean; isError: boolean; hasNextPage: boolean; isFetchingNextPage: boolean; onLoadMore: () => void; labels: Record<string, string>; locale: string; isEnglish: boolean }) {
  return (
    <main className="py-20"><div className="container mx-auto px-4 lg:px-15">
      {isLoading && <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={`skeleton-${index}`} className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5" />)}</div>}
      {isError && <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">{labels.error}</div>}
      {!isLoading && !isError && posts.length === 0 && <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">{labels.empty}</div>}
      {!isLoading && !isError && posts.length > 0 && <>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{posts.map((post) => {
          const category = post.categories?.[0]?.category
          const categoryLabel = category
            ? getCategoryDisplayLabel({
                name: category.name,
                nameEn: category.name_en,
                slug: category.slug,
                slugEn: category.slug_en,
                isEnglish,
              })
            : null
          const categoryClass = category?.slug ? getCategoryBadgeClass(category.slug) : categoryLabel ? getCategoryBadgeClass(categoryLabel) : ''
          const excerpt = post.excerpt?.trim() || buildExcerpt(post.body)
          return <a key={post.id} href={`/noticias/${post.slug}`} className="group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-none border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1">{post.featured_image_url ? <img src={post.featured_image_url} alt={post.title} className="absolute inset-0 h-full w-full object-cover" loading="lazy" /> : <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />}<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />{category && <span className={`${categoryClass} absolute left-4 top-4 rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`}>{categoryLabel}</span>}<div className="relative z-10 space-y-3 p-6 text-white"><h3 className="text-xl font-semibold leading-snug md:text-2xl">{post.title}</h3>{excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-white/90">{excerpt}</p>}<div className="text-xs uppercase tracking-[0.2em] text-white/80">{formatPostDate(post.published_at ?? post.created_at, locale)}</div></div></a>
        })}</div>
        {hasNextPage && <div className="mt-12 flex justify-center"><button type="button" onClick={onLoadMore} disabled={isFetchingNextPage} className="rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50">{isFetchingNextPage ? labels.loadingMore : labels.loadMore}</button></div>}
        {isFetchingNextPage && <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={`loading-more-${index}`} className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5" />)}</div>}
      </>}
    </div></main>
  )
}
