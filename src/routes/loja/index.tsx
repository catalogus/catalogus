import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Footer from '../../components/Footer'
import Header from '../../components/Header'
import { ShopListingLayout } from '../../features/shop/ShopListingSections'
import {
  DEFAULT_PRICE_RANGE,
  fetchShopBooksPage,
  loadShopListingPageData,
  type SortOption,
} from '../../features/shop/shopListingData'
import { useShopMetadata, type PriceRange } from '../../lib/queries/shopQueries'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/loja/')({
  loader: loadShopListingPageData,
  head: () =>
    buildSeo({
      title: 'Editora',
      description: 'Descubra a nossa coleção de livros e autores moçambicanos.',
      path: '/loja',
      type: 'website',
    }),
  component: ShopListingPage,
})

function ShopListingPage() {
  const { t } = useTranslation()
  const loaderData = Route.useLoaderData()
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [language, setLanguage] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>(loaderData.metadata.priceRange ?? DEFAULT_PRICE_RANGE)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const priceRangeRef = useRef<PriceRange>(DEFAULT_PRICE_RANGE)
  const metadataQuery = useShopMetadata(loaderData.metadata)
  const categories = metadataQuery.data?.categories ?? []
  const priceRange = metadataQuery.data?.priceRange ?? DEFAULT_PRICE_RANGE

  useEffect(() => {
    const prevRange = priceRangeRef.current
    if (selectedPrice.max === 0) {
      setSelectedPrice(priceRange)
    } else if (selectedPrice.min === prevRange.min && selectedPrice.max === prevRange.max) {
      setSelectedPrice(priceRange)
    }
    priceRangeRef.current = priceRange
  }, [priceRange, selectedPrice.max, selectedPrice.min])

  const booksQuery = useInfiniteQuery({
    queryKey: ['books', 'shop', { search, selectedCategories, language, selectedPrice, sortBy }],
    queryFn: ({ pageParam = 1 }) =>
      fetchShopBooksPage({
        search,
        selectedCategories,
        language,
        selectedPrice,
        sortBy,
        priceRange,
        pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => (lastPage.hasMore ? allPages.length + 1 : undefined),
    initialPageParam: 1,
    initialData:
      !search.trim() &&
      selectedCategories.length === 0 &&
      !language &&
      sortBy === 'newest' &&
      selectedPrice.min === priceRange.min &&
      selectedPrice.max === priceRange.max
        ? { pages: [{ books: loaderData.initialBooks, hasMore: loaderData.hasMore }], pageParams: [1] }
        : undefined,
    staleTime: 60_000,
  })

  const allBooks = booksQuery.data?.pages.flatMap((page) => page.books) ?? []
  const handleClearFilters = () => {
    setSearch('')
    setSelectedCategories([])
    setLanguage(null)
    setSelectedPrice(priceRange)
    setSortBy('newest')
  }
  const activeFiltersCount =
    (search ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (language ? 1 : 0) +
    (selectedPrice.min > priceRange.min || selectedPrice.max < priceRange.max ? 1 : 0)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      <section className="bg-[#1c1b1a] text-white" style={{ backgroundImage: "url('/oficinas.webp')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container mx-auto px-4 py-16 lg:px-15">
          <h1 className="text-4xl font-semibold md:text-6xl">{t('shop.listing.title')}</h1>
          <p className="mt-4 text-lg text-white/80">{t('shop.listing.subtitle')}</p>
        </div>
      </section>
      <ShopListingLayout
        filters={{
          search,
          onSearchChange: setSearch,
          categories,
          selectedCategories,
          onSelectedCategoriesChange: setSelectedCategories,
          language,
          onLanguageChange: setLanguage,
          priceRange,
          selectedPrice,
          onPriceChange: setSelectedPrice,
          onClearFilters: handleClearFilters,
          isLoading: metadataQuery.isLoading,
        }}
        books={allBooks}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeFiltersCount={activeFiltersCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        isLoading={booksQuery.isLoading}
        isError={booksQuery.isError}
        hasNextPage={Boolean(booksQuery.hasNextPage)}
        isFetchingNextPage={booksQuery.isFetchingNextPage}
        onLoadMore={() => booksQuery.fetchNextPage()}
        labels={{
          filters: t('shop.listing.filters'),
          closeFilters: t('shop.listing.closeFilters'),
          resultsCount: t('shop.listing.resultsCount', { count: allBooks.length }),
          resultsNone: t('shop.listing.resultsNone'),
          sortLabel: t('shop.listing.sortLabel'),
          sortNewest: t('shop.listing.sortOptions.newest'),
          sortOldest: t('shop.listing.sortOptions.oldest'),
          sortPriceAsc: t('shop.listing.sortOptions.priceAsc'),
          sortPriceDesc: t('shop.listing.sortOptions.priceDesc'),
          sortTitle: t('shop.listing.sortOptions.title'),
          error: t('shop.listing.error'),
          emptyTitle: t('shop.listing.emptyTitle'),
          emptyBody: t('shop.listing.emptyBody'),
          clearFilters: t('shop.listing.clearFilters'),
          loadMore: t('shop.listing.loadMore'),
          loadingMore: t('shop.listing.loadingMore'),
        }}
      />
      <Footer />
    </div>
  )
}
