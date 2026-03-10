import { SlidersHorizontal } from 'lucide-react'
import { FilterSidebar } from '@/components/shop/FilterSidebar'
import { ProductCard, type ProductCardBook } from '@/components/shop/ProductCard'
import type { PriceRange } from '@/lib/queries/shopQueries'
import type { SortOption } from './shopListingData'

type FilterProps = {
  search: string
  onSearchChange: (value: string) => void
  categories: string[]
  selectedCategories: string[]
  onSelectedCategoriesChange: (value: string[]) => void
  language: string | null
  onLanguageChange: (value: string | null) => void
  priceRange: PriceRange
  selectedPrice: PriceRange
  onPriceChange: (value: PriceRange) => void
  onClearFilters: () => void
  isLoading: boolean
}

type ShopListingLayoutProps = {
  filters: FilterProps
  books: ProductCardBook[]
  showFilters: boolean
  setShowFilters: (open: boolean) => void
  activeFiltersCount: number
  sortBy: SortOption
  setSortBy: (value: SortOption) => void
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  labels: Record<string, string>
}

export function ShopListingLayout({ filters, books, showFilters, setShowFilters, activeFiltersCount, sortBy, setSortBy, isLoading, isError, hasNextPage, isFetchingNextPage, onLoadMore, labels }: ShopListingLayoutProps) {
  return (
    <main className="py-12"><div className="container mx-auto px-4 lg:px-15"><div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-12">
      <aside className="hidden lg:block"><div className="sticky top-4"><FilterSidebar idPrefix="shop-desktop" {...filters} /></div></aside>
      <div className="mb-6 lg:hidden"><button type="button" onClick={() => setShowFilters(!showFilters)} className="flex w-full items-center justify-center gap-2 border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium"><SlidersHorizontal className="h-4 w-4" />{labels.filters}{activeFiltersCount > 0 && <span className="ml-1 rounded-full bg-[color:var(--brand)] px-2 py-0.5 text-xs text-white">{activeFiltersCount}</span>}</button>{showFilters && <div className="mt-4 space-y-4"><FilterSidebar idPrefix="shop-mobile" {...filters} /><button type="button" onClick={() => setShowFilters(false)} className="w-full bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]">{labels.closeFilters}</button></div>}</div>
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-gray-600">{books.length > 0 ? labels.resultsCount : labels.resultsNone}</p><div className="flex items-center gap-2"><label htmlFor="sort" className="text-sm text-gray-600">{labels.sortLabel}</label><select id="sort" value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} className="border border-gray-300 bg-white px-3 py-1.5 text-sm focus:border-[color:var(--brand)] focus:outline-none"><option value="newest">{labels.sortNewest}</option><option value="oldest">{labels.sortOldest}</option><option value="price-asc">{labels.sortPriceAsc}</option><option value="price-desc">{labels.sortPriceDesc}</option><option value="title">{labels.sortTitle}</option></select></div></div>
        {isLoading && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 12 }).map((_, index) => <div key={`skeleton-${index}`} className="space-y-3"><div className="aspect-[3/4] w-full animate-pulse bg-gray-200" /><div className="h-5 w-3/4 animate-pulse bg-gray-200" /><div className="h-4 w-1/2 animate-pulse bg-gray-200" /><div className="h-6 w-1/3 animate-pulse bg-gray-200" /></div>)}</div>}
        {isError && <div className="border border-gray-200 bg-white p-8 text-center"><p className="text-sm text-gray-600">{labels.error}</p></div>}
        {!isLoading && !isError && books.length === 0 && <div className="border border-gray-200 bg-white p-8 text-center"><p className="mb-4 text-lg font-semibold text-gray-900">{labels.emptyTitle}</p><p className="mb-6 text-sm text-gray-600">{labels.emptyBody}</p>{activeFiltersCount > 0 && <button type="button" onClick={filters.onClearFilters} className="bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]">{labels.clearFilters}</button>}</div>}
        {!isLoading && !isError && books.length > 0 && <><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{books.map((book) => <ProductCard key={book.id} book={book} />)}</div>{hasNextPage && <div className="mt-12 flex justify-center"><button type="button" onClick={onLoadMore} disabled={isFetchingNextPage} className="bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50">{isFetchingNextPage ? labels.loadingMore : labels.loadMore}</button></div>}{isFetchingNextPage && <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 12 }).map((_, index) => <div key={`loading-more-${index}`} className="space-y-3"><div className="aspect-[3/4] w-full animate-pulse bg-gray-200" /><div className="h-5 w-3/4 animate-pulse bg-gray-200" /><div className="h-4 w-1/2 animate-pulse bg-gray-200" /></div>)}</div>}</>}
      </div>
    </div></div></main>
  )
}
