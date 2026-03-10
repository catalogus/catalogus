import { AuthorCard } from '@/components/author/AuthorCard'
import { Search, type AuthorData } from './authorsData'

type AuthorsListingResultsProps = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  hasSearch: boolean
  allAuthors: AuthorData[]
  isLoading: boolean
  isError: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  labels: {
    searchPlaceholder: string
    emptySearch: string
    searchCount: string
    error: string
    empty: string
    loadMore: string
    loadingMore: string
  }
}

export function AuthorsListingResults({
  searchQuery,
  setSearchQuery,
  hasSearch,
  allAuthors,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  labels,
}: AuthorsListingResultsProps) {
  return (
    <main className="bg-[#f8f4ef] py-20">
      <div className="container mx-auto px-4 lg:px-15">
        <div className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={labels.searchPlaceholder}
                className="w-full rounded-none border border-gray-300 bg-white py-4 pl-12 pr-4 text-base focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
            {hasSearch && (
              <p className="mt-3 text-sm text-gray-600">
                {allAuthors.length === 0 ? labels.emptySearch : labels.searchCount}
              </p>
            )}
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-3">
                <div className="aspect-[4/5] w-full animate-pulse bg-gray-100" />
                <div className="h-5 w-2/3 animate-pulse bg-gray-200" />
                <div className="h-4 w-1/3 animate-pulse bg-gray-100" />
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {labels.error}
          </div>
        )}

        {!isLoading && !isError && allAuthors.length === 0 && (
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {hasSearch ? labels.emptySearch : labels.empty}
          </div>
        )}

        {!isLoading && !isError && allAuthors.length > 0 && (
          <>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {allAuthors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>

            {!hasSearch && hasNextPage && (
              <div className="mt-12 flex justify-center">
                <button
                  type="button"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                  className="rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isFetchingNextPage ? labels.loadingMore : labels.loadMore}
                </button>
              </div>
            )}

            {isFetchingNextPage && (
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={`loading-more-${index}`} className="space-y-3">
                    <div className="aspect-[4/5] w-full animate-pulse bg-gray-100" />
                    <div className="h-5 w-2/3 animate-pulse bg-gray-200" />
                    <div className="h-4 w-1/3 animate-pulse bg-gray-100" />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
