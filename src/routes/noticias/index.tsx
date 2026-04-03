import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { NewsListingGrid, NewsListingHero } from '../../features/news/NewsListingSections'
import {
  fetchNewsListingPage,
  loadNewsListingPageData,
} from '../../features/news/newsListingData'
import { getCategoryDisplayLabel } from '../../lib/newsHelpers'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/noticias/')({
  loaderDeps: ({ search }) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    categoria: typeof search.categoria === 'string' ? search.categoria : undefined,
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }),
  staleTime: 2 * 60_000,
  preload: true,
  preloadStaleTime: 5 * 60_000,
  gcTime: 15 * 60_000,
  validateSearch: (search?: Record<string, unknown>) => {
    const safeSearch = search ?? {}
    return {
      q: typeof safeSearch.q === 'string' ? safeSearch.q : undefined,
      categoria: typeof safeSearch.categoria === 'string' ? safeSearch.categoria : undefined,
      tag: typeof safeSearch.tag === 'string' ? safeSearch.tag : undefined,
    }
  },
  loader: async ({ deps }) => loadNewsListingPageData(deps ?? {}),
  head: ({ location }) => {
    const search = location?.search ?? ''
    const normalizedSearch = search.startsWith('?') ? search.slice(1) : search
    const params = new URLSearchParams(normalizedSearch)
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

function NewsListingPage() {
  const { t, i18n } = useTranslation()
  const language = i18n.language === 'en' ? 'en' : 'pt'
  const isEnglish = language === 'en'
  const { q, categoria, tag } = Route.useSearch()
  const loaderData = Route.useLoaderData()
  const initialFeaturedPost = loaderData.language === language ? loaderData.featuredPost : null

  const postsQuery = useInfiniteQuery({
    queryKey: ['news-posts', 'listing', q, categoria, tag, initialFeaturedPost?.id, language],
    queryFn: ({ pageParam = 1 }) =>
      fetchNewsListingPage({
        language,
        q,
        categoria,
        tag,
        featuredPostId: initialFeaturedPost?.id,
        pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    initialPageParam: 1,
    initialData:
      loaderData.language === language
        ? { pages: [{ posts: loaderData.posts, hasMore: loaderData.hasMore }], pageParams: [1] }
        : undefined,
    staleTime: 60_000,
  })

  const allPosts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? []
  const featuredCategory = initialFeaturedPost?.categories?.[0]?.category
  const featuredCategoryLabel = featuredCategory
    ? getCategoryDisplayLabel({
        name: featuredCategory.name,
        nameEn: featuredCategory.name_en,
        slug: featuredCategory.slug,
        slugEn: featuredCategory.slug_en,
        isEnglish,
      })
    : null
  const filters = [
    q ? t('news.listing.filters.search', { query: q }) : null,
    categoria ? t('news.listing.filters.category', { category: categoria }) : null,
    tag ? t('news.listing.filters.tag', { tag }) : null,
  ].filter((item): item is string => Boolean(item))

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <NewsListingHero
        featuredPost={initialFeaturedPost}
        title={t('news.listing.title')}
        label={t('news.listing.label')}
        ctaLabel={t('news.listing.readFull')}
        featuredCategoryLabel={featuredCategoryLabel}
        filters={filters}
      />
      <NewsListingGrid
        posts={allPosts}
        isLoading={postsQuery.isLoading}
        isError={postsQuery.isError}
        hasNextPage={Boolean(postsQuery.hasNextPage)}
        isFetchingNextPage={postsQuery.isFetchingNextPage}
        onLoadMore={() => postsQuery.fetchNextPage()}
        labels={{
          error: t('news.listing.error'),
          empty: t('news.listing.empty'),
          loadMore: t('news.listing.loadMore'),
          loadingMore: t('news.listing.loadingMore'),
        }}
        locale={i18n.language === 'en' ? 'en-US' : 'pt-PT'}
        isEnglish={isEnglish}
      />
      <Footer />
    </div>
  )
}
