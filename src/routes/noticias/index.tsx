import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { publicSupabase } from '../../lib/supabasePublic'
import {
  formatPostDate,
  getCategoryBadgeClass,
  buildExcerpt,
} from '../../lib/newsHelpers'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/noticias/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    categoria: typeof search.categoria === 'string' ? search.categoria : undefined,
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }),
  loader: async ({ search }) => {
    const language: 'pt' | 'en' = 'pt'
    const isEnglish = language === 'en'
    const { q, categoria, tag } = search as {
      q?: string
      categoria?: string
      tag?: string
    }

    const { data: featuredData, error: featuredError } = await publicSupabase
      .from('posts')
      .select(
        `
          id,
          title,
          slug,
          featured_image_url,
          categories:post_categories_map(category:post_categories(name, slug, name_en, slug_en))
        `,
      )
      .eq('status', 'published')
      .eq('language', language)
      .eq('featured', true)

    if (featuredError) throw featuredError
    const featuredPost = featuredData?.length
      ? (featuredData[Math.floor(Math.random() * featuredData.length)] as NewsPost)
      : null

    let selectQuery = `
        id,
        title,
        slug,
        excerpt,
        body,
        featured_image_url,
        published_at,
        created_at,
        categories:post_categories_map${categoria ? '!inner' : ''}(category:post_categories${categoria ? '!inner' : ''}(name, slug, name_en, slug_en))
      `

    if (tag) {
      selectQuery += `,tags:post_tags_map!inner(tag:post_tags!inner(name, slug, name_en, slug_en))`
    }

    let query = publicSupabase
      .from('posts')
      .select(selectQuery)
      .eq('status', 'published')
      .eq('language', language)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (featuredPost?.id) {
      query = query.neq('id', featuredPost.id)
    }

    if (q) {
      query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
    }

    if (categoria) {
      const categoryField = isEnglish ? 'categories.category.slug_en' : 'categories.category.slug'
      query = query.eq(categoryField, categoria)
    }

    if (tag) {
      const tagField = isEnglish ? 'tags.tag.slug_en' : 'tags.tag.slug'
      query = query.eq(tagField, tag)
    }

    const from = 0
    const to = 5
    const { data, error } = await query.range(from, to)
    if (error) throw error

    const posts: NewsPost[] =
      data?.map((entry: any) => ({
        ...entry,
        categories:
          entry.categories?.map((c: any) => ({
            category: c.category,
          })) ?? [],
      })) ?? []

    return {
      featuredPost,
      posts,
      hasMore: posts.length === 6,
      language,
    }
  },
  head: ({ location }) => {
    const params = new URLSearchParams(
      location.search.startsWith('?') ? location.search.slice(1) : location.search,
    )
    const hasFilters = !!(params.get('q') || params.get('categoria') || params.get('tag'))
    return buildSeo({
      title: 'Noticias',
      description: 'Acompanhe as ultimas noticias e eventos literarios.',
      path: '/noticias',
      type: 'website',
      noindex: hasFilters,
    })
  },
  component: NewsListingPage,
})

type NewsPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  featured_image_url: string | null
  published_at: string | null
  created_at: string
  categories?: {
    category?: {
      name?: string | null
      slug?: string | null
    } | null
  }[] | null
}

function NewsListingPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.language === 'en' ? 'en' : 'pt'
  const isEnglish = language === 'en'
  const { q, categoria, tag } = Route.useSearch()
  const loaderData = Route.useLoaderData()

  const initialFeaturedPost =
    loaderData.language === language ? loaderData.featuredPost : null

  const postsQuery = useInfiniteQuery({
    queryKey: [
      'news-posts',
      'listing',
      q,
      categoria,
      tag,
      initialFeaturedPost?.id,
      language,
    ],
    queryFn: async ({ pageParam = 1 }) => {
      // Build select with conditional inner joins for filters
      let selectQuery = `
        id,
        title,
        slug,
        excerpt,
        body,
        featured_image_url,
        published_at,
        created_at,
        categories:post_categories_map${categoria ? '!inner' : ''}(category:post_categories${categoria ? '!inner' : ''}(name, slug, name_en, slug_en))
      `

      // If tag filter is active, add tags with inner join
      if (tag) {
        selectQuery += `,tags:post_tags_map!inner(tag:post_tags!inner(name, slug, name_en, slug_en))`
      }

      let query = publicSupabase
        .from('posts')
        .select(selectQuery)
        .eq('status', 'published')
        .eq('language', language)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      // Exclude hero post to avoid duplication
      if (initialFeaturedPost?.id) {
        query = query.neq('id', initialFeaturedPost.id)
      }

      // Apply search filter
      if (q) {
        query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      }

      // Apply category filter using nested relationship
      if (categoria) {
        const categoryField = isEnglish ? 'categories.category.slug_en' : 'categories.category.slug'
        query = query.eq(categoryField, categoria)
      }

      // Apply tag filter using nested relationship
      if (tag) {
        const tagField = isEnglish ? 'tags.tag.slug_en' : 'tags.tag.slug'
        query = query.eq(tagField, tag)
      }

      // Pagination
      const from = (pageParam - 1) * 6
      const to = from + 5 // 6 posts per page
      const { data, error } = await query.range(from, to)

      if (error) throw error

      const posts: NewsPost[] =
        data?.map((entry: any) => ({
          ...entry,
          categories:
            entry.categories?.map((c: any) => ({
              category: c.category,
            })) ?? [],
        })) ?? []

      return {
        posts,
        hasMore: posts.length === 6,
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    initialData:
      loaderData.language === language
        ? {
            pages: [
              { posts: loaderData.posts, hasMore: loaderData.hasMore },
            ],
            pageParams: [1],
          }
        : undefined,
    staleTime: 60_000,
  })

  const allPosts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? []
  const featuredPost = initialFeaturedPost
  const featuredCategory = featuredPost?.categories?.[0]?.category
  const featuredCategoryLabel = featuredCategory
    ? isEnglish
      ? featuredCategory.name_en ?? featuredCategory.name
      : featuredCategory.name
    : null

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
        {/* Background Image */}
        {featuredPost && featuredPost.featured_image_url && (
          <img
            src={featuredPost.featured_image_url}
            alt={featuredPost.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        {/* Fallback gradient if no featured post or no image */}
        {(!featuredPost || !featuredPost.featured_image_url) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-24 lg:px-15">
            <div className="max-w-3xl space-y-5">
              {/* Category Badge or Label */}
              {featuredPost && featuredCategory ? (
                <span
                  className={`${getCategoryBadgeClass(featuredCategory.slug || featuredCategory.name || '')} inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`}
                >
                  {featuredCategoryLabel}
                </span>
              ) : (
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  {t('news.listing.label')}
                </p>
              )}

              {/* Title */}
              <h1 className="text-2xl font-semibold leading-tight md:text-4xl">
                {featuredPost ? featuredPost.title : t('news.listing.title')}
              </h1>

              {/* CTA Button */}
              {featuredPost && (
                <a
                  href={`/noticias/${featuredPost.slug}`}
                  className="inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]"
                >
                  {t('news.listing.readFull')}
                </a>
              )}

              {/* Show active filters */}
              {(q || categoria || tag) && (
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  {q && <span>{t('news.listing.filters.search', { query: q })}</span>}
                  {categoria && (
                    <span>{t('news.listing.filters.category', { category: categoria })}</span>
                  )}
                  {tag && <span>{t('news.listing.filters.tag', { tag })}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-4 lg:px-15">
          {/* Loading State */}
          {postsQuery.isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {postsQuery.isError && (
            <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              {t('news.listing.error')}
            </div>
          )}

          {/* Empty State */}
          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            allPosts.length === 0 && (
              <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                {t('news.listing.empty')}
              </div>
            )}

          {/* Posts Grid */}
          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            allPosts.length > 0 && (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {allPosts.map((post) => {
                    const category = post.categories?.[0]?.category
                    const dateLabel = formatPostDate(
                      post.published_at ?? post.created_at,
                      i18n.language === 'en' ? 'en-US' : 'pt-PT',
                    )
                    const excerpt =
                      post.excerpt?.trim() || buildExcerpt(post.body)
                    const categoryLabel = category
                      ? isEnglish
                        ? category.name_en ?? category.name
                        : category.name
                      : null
                    const categoryClass = category?.slug
                      ? getCategoryBadgeClass(category.slug)
                      : categoryLabel
                        ? getCategoryBadgeClass(categoryLabel)
                        : ''

                    return (
                      <a
                        key={post.id}
                        href={`/noticias/${post.slug}`}
                        className="group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-none border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1"
                      >
                        {/* Background Image or Fallback Gradient */}
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                        {/* Category Badge */}
                        {category && (
                          <span
                            className={`${categoryClass} absolute left-4 top-4 rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`}
                          >
                            {categoryLabel}
                          </span>
                        )}

                        {/* Content Section */}
                        <div className="relative z-10 space-y-3 p-6 text-white">
                          <h3 className="text-xl font-semibold leading-snug md:text-2xl">
                            {post.title}
                          </h3>

                          {/* Excerpt (2 lines max) */}
                          {excerpt && (
                            <p className="line-clamp-2 text-sm leading-relaxed text-white/90">
                              {excerpt}
                            </p>
                          )}

                          <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                            {dateLabel}
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>

                {/* Load More Button */}
                {postsQuery.hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => postsQuery.fetchNextPage()}
                      disabled={postsQuery.isFetchingNextPage}
                      className="rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {postsQuery.isFetchingNextPage
                        ? t('news.listing.loadingMore')
                        : t('news.listing.loadMore')}
                    </button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {postsQuery.isFetchingNextPage && (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`loading-more-${index}`}
                        className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
