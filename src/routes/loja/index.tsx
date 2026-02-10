import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { FilterSidebar } from '../../components/shop/FilterSidebar'
import { ProductCard, type ProductCardBook } from '../../components/shop/ProductCard'
import { publicSupabase } from '../../lib/supabasePublic'
import { useShopMetadata, type PriceRange } from '../../lib/queries/shopQueries'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/loja/')({
  loader: async () => {
    const { data: metaData, error: metaError } = await publicSupabase.rpc(
      'get_shop_metadata',
    )
    if (metaError) throw metaError
    const metadata = {
      categories: (metaData?.categories || []) as string[],
      priceRange: (metaData?.priceRange || { min: 0, max: 10000 }) as PriceRange,
    }

    const { data, error } = await publicSupabase
      .from('books_shop')
      .select(
        `
            id,
            title,
            slug,
            price_mzn,
            is_digital,
            digital_access,
            promo_type,
            promo_price_mzn,
            promo_start_date,
            promo_end_date,
            promo_is_active,
            effective_price_mzn,
            stock,
            description,
            seo_description,
            cover_url,
            cover_path,
            category,
            language
          `,
      )
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(0, 11)

    if (error) throw error

    const books = (data ?? []) as ProductCardBook[]

    return {
      metadata,
      initialBooks: books as ProductCardBook[],
      hasMore: books.length === 12,
    }
  },
  head: () =>
    buildSeo({
      title: 'Editora',
      description: 'Descubra a nossa colecao de livros e autores mocambicanos.',
      path: '/loja',
      type: 'website',
    }),
  component: ShopListingPage,
})

type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title'

const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 10000 }
const PAGE_SIZE = 12

function ShopListingPage() {
  const { t } = useTranslation()
  const loaderData = Route.useLoaderData()
  const [search, setSearch] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [language, setLanguage] = useState<string | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<PriceRange>(
    loaderData.metadata.priceRange ?? DEFAULT_PRICE_RANGE,
  )
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const priceRangeRef = useRef<PriceRange>(DEFAULT_PRICE_RANGE)

  // Use query factory hook
  const metadataQuery = useShopMetadata(loaderData.metadata)
  const categories = metadataQuery.data?.categories ?? []
  const priceRange = metadataQuery.data?.priceRange ?? DEFAULT_PRICE_RANGE

  useEffect(() => {
    const prevRange = priceRangeRef.current
    if (selectedPrice.max === 0) {
      setSelectedPrice(priceRange)
    } else if (
      selectedPrice.min === prevRange.min &&
      selectedPrice.max === prevRange.max
    ) {
      setSelectedPrice(priceRange)
    }
    priceRangeRef.current = priceRange
  }, [priceRange, selectedPrice.max, selectedPrice.min])

  const booksQuery = useInfiniteQuery({
    queryKey: [
      'books',
      'shop',
      {
        search,
        selectedCategories,
        language,
        selectedPrice,
        sortBy,
      },
    ],
    queryFn: async ({ pageParam = 1 }) => {
      let query = publicSupabase
        .from('books_shop')
        .select(
          `
          id,
          title,
          slug,
          price_mzn,
          is_digital,
          digital_access,
          promo_type,
          promo_price_mzn,
          promo_start_date,
          promo_end_date,
          promo_is_active,
          effective_price_mzn,
          stock,
          description,
          seo_description,
          cover_url,
          cover_path,
          category,
          language
        `,
          { count: 'exact' },
        )
        .eq('is_active', true)

      const trimmedSearch = search.trim()
      if (trimmedSearch) {
        query = query.or(
          `title.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`,
        )
      }

      if (selectedCategories.length > 0) {
        query = query.in('category', selectedCategories)
      }

      if (language) {
        query = query.eq('language', language)
      }

      if (selectedPrice.min > priceRange.min) {
        query = query.gte('effective_price_mzn', selectedPrice.min)
      }

      if (selectedPrice.max < priceRange.max) {
        query = query.lte('effective_price_mzn', selectedPrice.max)
      }

      switch (sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'price-asc':
          query = query.order('effective_price_mzn', {
            ascending: true,
            nullsFirst: false,
          })
          break
        case 'price-desc':
          query = query.order('effective_price_mzn', {
            ascending: false,
            nullsFirst: false,
          })
          break
        case 'title':
          query = query.order('title', { ascending: true })
          break
      }

      const from = (pageParam - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1
      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      const books: ProductCardBook[] = (data ?? []) as ProductCardBook[]

      const loaded = from + books.length
      const hasMore = count === null ? books.length === PAGE_SIZE : loaded < count

      return {
        books,
        hasMore,
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    initialData:
      !search.trim() &&
      selectedCategories.length === 0 &&
      !language &&
      sortBy === 'newest' &&
      selectedPrice.min === priceRange.min &&
      selectedPrice.max === priceRange.max
        ? {
            pages: [
              {
                books: loaderData.initialBooks,
                hasMore: loaderData.hasMore,
              },
            ],
            pageParams: [1],
          }
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

      <section
        className="bg-[#1c1b1a] text-white"
        style={{
          backgroundImage: "url('/oficinas.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container mx-auto px-4 py-16 lg:px-15">
          <h1 className="text-4xl font-semibold md:text-6xl">
            {t('shop.listing.title')}
          </h1>
          <p className="mt-4 text-lg text-white/80">
            {t('shop.listing.subtitle')}
          </p>
        </div>
      </section>

      <main className="py-12">
        <div className="container mx-auto px-4 lg:px-15">
          <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
            <aside className="hidden lg:block">
              <div className="sticky top-4">
                <FilterSidebar
                  idPrefix="shop-desktop"
                  search={search}
                  onSearchChange={setSearch}
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onSelectedCategoriesChange={setSelectedCategories}
                  language={language}
                  onLanguageChange={setLanguage}
                  priceRange={priceRange}
                  selectedPrice={selectedPrice}
                  onPriceChange={setSelectedPrice}
                  onClearFilters={handleClearFilters}
                  isLoading={metadataQuery.isLoading}
                />
              </div>
            </aside>

            <div className="mb-6 lg:hidden">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {t('shop.listing.filters')}
                {activeFiltersCount > 0 && (
                  <span className="ml-1 rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-xs text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {showFilters && (
                <div className="mt-4 space-y-4">
                  <FilterSidebar
                    idPrefix="shop-mobile"
                    search={search}
                    onSearchChange={setSearch}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onSelectedCategoriesChange={setSelectedCategories}
                    language={language}
                    onLanguageChange={setLanguage}
                    priceRange={priceRange}
                    selectedPrice={selectedPrice}
                    onPriceChange={setSelectedPrice}
                    onClearFilters={handleClearFilters}
                    isLoading={metadataQuery.isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
                  >
                    {t('shop.listing.closeFilters')}
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  {booksQuery.isSuccess && (
                    <>
                      {allBooks.length > 0
                        ? t('shop.listing.resultsCount', { count: allBooks.length })
                        : t('shop.listing.resultsNone')}
                    </>
                  )}
                </p>

                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm text-gray-600">
                    {t('shop.listing.sortLabel')}
                  </label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[color:var(--brand)] focus:outline-none"
                  >
                    <option value="newest">{t('shop.listing.sortOptions.newest')}</option>
                    <option value="oldest">{t('shop.listing.sortOptions.oldest')}</option>
                    <option value="price-asc">{t('shop.listing.sortOptions.priceAsc')}</option>
                    <option value="price-desc">{t('shop.listing.sortOptions.priceDesc')}</option>
                    <option value="title">{t('shop.listing.sortOptions.title')}</option>
                  </select>
                </div>
              </div>

              {booksQuery.isLoading && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="space-y-3">
                      <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
                      <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
                      <div className="h-4 w-1/2 animate-pulse bg-gray-200" />
                      <div className="h-6 w-1/3 animate-pulse bg-gray-200" />
                    </div>
                  ))}
                </div>
              )}

              {booksQuery.isError && (
                <div className="border border-gray-200 bg-white p-8 text-center">
                  <p className="text-sm text-gray-600">
                    {t('shop.listing.error')}
                  </p>
                </div>
              )}

              {!booksQuery.isLoading &&
                !booksQuery.isError &&
                allBooks.length === 0 && (
                  <div className="border border-gray-200 bg-white p-8 text-center">
                    <p className="mb-4 text-lg font-semibold text-gray-900">
                      {t('shop.listing.emptyTitle')}
                    </p>
                    <p className="mb-6 text-sm text-gray-600">
                      {t('shop.listing.emptyBody')}
                    </p>
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
                      >
                        {t('shop.listing.clearFilters')}
                      </button>
                    )}
                  </div>
                )}

              {!booksQuery.isLoading &&
                !booksQuery.isError &&
                allBooks.length > 0 && (
                  <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {allBooks.map((book) => (
                        <ProductCard key={book.id} book={book} />
                      ))}
                    </div>

                    {booksQuery.hasNextPage && (
                      <div className="mt-12 flex justify-center">
                        <button
                          type="button"
                          onClick={() => booksQuery.fetchNextPage()}
                          disabled={booksQuery.isFetchingNextPage}
                        className="bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {booksQuery.isFetchingNextPage
                          ? t('shop.listing.loadingMore')
                          : t('shop.listing.loadMore')}
                      </button>
                    </div>
                  )}

                    {booksQuery.isFetchingNextPage && (
                      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                          <div key={`loading-more-${index}`} className="space-y-3">
                            <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
                            <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
                            <div className="h-4 w-1/2 animate-pulse bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
