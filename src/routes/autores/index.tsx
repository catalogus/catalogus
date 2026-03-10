import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { buildSeo } from '../../lib/seo'
import {
  fetchAuthorsPage,
  fetchFeaturedAuthor,
  fetchStandaloneAuthors,
  loadAuthorsPageData,
} from '../../features/authors/authorsData'
import { AuthorsListingHero } from '../../features/authors/AuthorsListingHero'
import { AuthorsListingResults } from '../../features/authors/AuthorsListingResults'

export const Route = createFileRoute('/autores/')({
  staleTime: 5 * 60_000,
  preload: true,
  preloadStaleTime: 10 * 60_000,
  gcTime: 30 * 60_000,
  loader: loadAuthorsPageData,
  head: () =>
    buildSeo({
      title: 'Autores',
      description: 'Conheca os autores em destaque na Catalogus.',
      path: '/autores',
      type: 'website',
    }),
  component: AutoresListingPage,
})

function AutoresListingPage() {
  const { t, i18n } = useTranslation()
  const loaderData = Route.useLoaderData()
  const [searchQuery, setSearchQuery] = useState('')
  const trimmedSearch = searchQuery.trim()
  const hasSearch = trimmedSearch.length > 0

  // Query for featured author (hero spotlight)
  const featuredAuthorQuery = useQuery({
    queryKey: ['authors', 'featured-spotlight'],
    queryFn: fetchFeaturedAuthor,
    initialData: loaderData.featuredAuthor ?? null,
    staleTime: 60_000,
  })

  const authorsQuery = useInfiniteQuery({
    queryKey: ['authors', 'listing', featuredAuthorQuery.data?.id, trimmedSearch],
    queryFn: ({ pageParam = 1 }) =>
      fetchAuthorsPage({
        pageParam,
        featuredAuthorId: featuredAuthorQuery.data?.id,
        search: trimmedSearch || undefined,
      }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    initialData: !hasSearch
      ? {
          pages: [
            { authors: loaderData.authors, hasMore: loaderData.authorsHasMore },
          ],
          pageParams: [1],
        }
      : undefined,
    staleTime: 60_000,
  })

  const standaloneAuthorsQuery = useQuery({
    queryKey: ['authors', 'standalone', trimmedSearch, i18n.language],
    queryFn: () =>
      fetchStandaloneAuthors({
        search: trimmedSearch || undefined,
        fallbackName: t('authors.listing.fallbackName'),
        registeredType: t('authors.listing.registeredType'),
      }),
    initialData: !hasSearch ? loaderData.standaloneAuthors : undefined,
    staleTime: 60_000,
  })

  const featuredAuthor = featuredAuthorQuery.data

  const authorsFromTable = authorsQuery.data?.pages.flatMap((page) => page.authors) ?? []
  const standaloneAuthors = standaloneAuthorsQuery.data ?? []
  const allAuthors = useMemo(() => {
    const combined = [...authorsFromTable, ...standaloneAuthors]
    return combined.sort((a, b) => a.name.localeCompare(b.name))
  }, [authorsFromTable, standaloneAuthors])

  const isLoading = authorsQuery.isLoading || standaloneAuthorsQuery.isLoading
  const isError = authorsQuery.isError || standaloneAuthorsQuery.isError
  const searchCountLabel = t('authors.listing.searchCount', { count: allAuthors.length })

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <AuthorsListingHero
        author={featuredAuthor}
        title={t('authors.listing.title')}
        heroFeaturedLabel={t('authors.listing.heroFeatured')}
        heroDefaultLabel={t('authors.listing.heroDefault')}
        ctaLabel={t('authors.listing.ctaProfile')}
      />

      <AuthorsListingResults
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        hasSearch={hasSearch}
        allAuthors={allAuthors}
        isLoading={isLoading}
        isError={isError}
        hasNextPage={Boolean(authorsQuery.hasNextPage)}
        isFetchingNextPage={authorsQuery.isFetchingNextPage}
        onLoadMore={() => authorsQuery.fetchNextPage()}
        labels={{
          searchPlaceholder: t('authors.listing.searchPlaceholder'),
          emptySearch: t('authors.listing.emptySearch'),
          searchCount: searchCountLabel,
          error: t('authors.listing.error'),
          empty: t('authors.listing.empty'),
          loadMore: t('authors.listing.loadMore'),
          loadingMore: t('authors.listing.loadingMore'),
        }}
      />

      <Footer />
    </div>
  )
}
