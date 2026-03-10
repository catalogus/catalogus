import { ShoppingCart } from 'lucide-react'
import { ProductCard, type ProductCardBook } from '@/components/shop/ProductCard'
import { QuantitySelector } from '@/components/shop/QuantitySelector'
import { BookCover } from '@/components/OptimizedImage'
import { formatPrice } from '@/lib/shopHelpers'
import type { BookDetail } from '@/lib/queries/bookQueries'

type AuthorLink = {
  id: string
  name: string
  href: string
}

type BookDetailHeroProps = {
  book: BookDetail
  coverUrl: string | null
  homeLabel: string
  shopLabel: string
}

export function BookDetailHero({ book, coverUrl, homeLabel, shopLabel }: BookDetailHeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-[#1c1b1a] text-white"
      style={
        coverUrl
          ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-20 lg:px-15">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold md:text-6xl">{book.title}</h1>
            <div className="text-xs uppercase tracking-[0.3em] text-white/70">
              <a href="/" className="hover:text-white">
                {homeLabel}
              </a>{' '}
              /{' '}
              <a href="/loja" className="hover:text-white">
                {shopLabel}
              </a>{' '}
              / {book.title}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type BookPurchasePanelProps = {
  book: BookDetail
  coverUrl: string | null
  authorLinks: AuthorLink[]
  promoIsActive: boolean
  discountPercent: number | null
  promoLabel: string
  effectivePrice: number | null
  locale: string
  stockColor: string
  stockLabel: string
  quantity: number
  maxQuantity: number
  inStock: boolean
  isDownloading: boolean
  onQuantityChange: (value: number) => void
  onAddToCart: () => void
  onFreeDownload: () => void
  labels: {
    descriptionFallback: string
    download: string
    addToCart: string
    outOfStock: string
    categoryLabel: string
    languageLabel: string
    isbnLabel: string
    idLabel: string
    notProvided: string
  }
}

export function BookPurchasePanel({
  book,
  coverUrl,
  authorLinks,
  promoIsActive,
  discountPercent,
  promoLabel,
  effectivePrice,
  locale,
  stockColor,
  stockLabel,
  quantity,
  maxQuantity,
  inStock,
  isDownloading,
  onQuantityChange,
  onAddToCart,
  onFreeDownload,
  labels,
}: BookPurchasePanelProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
      <div className="shadow-sm">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
          {book.cover_path || coverUrl ? (
            <BookCover src={book.cover_path || coverUrl} title={book.title} className="h-full w-full object-cover" priority={true} />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl font-semibold text-gray-300">
              {book.title.charAt(0).toUpperCase()}
            </div>
          )}
          {promoIsActive && (promoLabel || discountPercent !== null) && (
            <div className="absolute left-4 top-4 flex items-center gap-2">
              {discountPercent !== null && (
                <span className="bg-[#c7372f] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  -{discountPercent}%
                </span>
              )}
              {promoLabel && (
                <span className="bg-[#c7372f] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                  {promoLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold md:text-4xl">{book.title}</h2>
          {authorLinks.length > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              {authorLinks.map((author, index) => (
                <span key={author.id}>
                  <a href={author.href} className="hover:text-gray-900">
                    {author.name}
                  </a>
                  {index < authorLinks.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline gap-3">
            {promoIsActive && discountPercent !== null && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(book.price_mzn ?? 0, locale)}
              </span>
            )}
            <span className="text-2xl font-bold text-[color:var(--brand)]">
              {formatPrice(effectivePrice ?? book.price_mzn ?? 0, locale)}
            </span>
          </div>
          <p className={`text-sm font-medium ${stockColor}`}>{stockLabel}</p>
        </div>

        <div className="space-y-4 text-sm text-gray-700">
          <p>{book.description || book.seo_description || labels.descriptionFallback}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {!(book.is_digital && book.digital_access === 'free') && (
            <QuantitySelector
              value={quantity}
              onChange={onQuantityChange}
              min={1}
              max={maxQuantity || 1}
              disabled={!inStock}
            />
          )}

          {book.is_digital && book.digital_access === 'free' ? (
            <button
              type="button"
              onClick={onFreeDownload}
              className="flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              disabled={isDownloading}
            >
              {labels.download}
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddToCart}
              disabled={!inStock}
              className="flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              <ShoppingCart className="h-4 w-4" />
              {inStock ? labels.addToCart : labels.outOfStock}
            </button>
          )}
        </div>

        <div className="space-y-2 text-xs uppercase tracking-wider text-gray-500">
          <p>
            {labels.categoryLabel}{' '}
            <span className="normal-case text-gray-700">{book.category || labels.notProvided}</span>
          </p>
          <p>
            {labels.languageLabel}{' '}
            <span className="normal-case text-gray-700">{book.language?.toUpperCase() || labels.notProvided}</span>
          </p>
          <p>
            {labels.isbnLabel}{' '}
            <span className="normal-case text-gray-700">{book.isbn || labels.notProvided}</span>
          </p>
          <p>
            {labels.idLabel} <span className="normal-case text-gray-700">{book.id}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

type BookDetailTabsProps = {
  activeTab: 'description' | 'reviews'
  setActiveTab: (tab: 'description' | 'reviews') => void
  description: string
  labels: {
    description: string
    reviews: string
    noReviews: string
  }
}

export function BookDetailTabs({ activeTab, setActiveTab, description, labels }: BookDetailTabsProps) {
  return (
    <section className="mt-12">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('description')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'description' ? 'bg-[color:var(--brand)] text-white' : 'bg-white text-gray-600 hover:text-gray-900'
          }`}
        >
          {labels.description}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            activeTab === 'reviews' ? 'bg-[color:var(--brand)] text-white' : 'bg-white text-gray-600 hover:text-gray-900'
          }`}
        >
          {labels.reviews}
        </button>
      </div>
      <div className="mt-4 border border-gray-200 bg-white p-6 text-sm text-gray-700">
        {activeTab === 'description' ? <p>{description}</p> : <p>{labels.noReviews}</p>}
      </div>
    </section>
  )
}

type BookRelatedSectionProps = {
  isLoading: boolean
  isError: boolean
  books: ProductCardBook[]
  title: string
  emptyLabel: string
  errorLabel: string
}

export function BookRelatedSection({
  isLoading,
  isError,
  books,
  title,
  emptyLabel,
  errorLabel,
}: BookRelatedSectionProps) {
  return (
    <section className="mt-16">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
      </div>

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`related-skeleton-${index}`} className="space-y-3">
              <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
              <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {isError && <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">{errorLabel}</div>}

      {!isLoading && !isError && books.length === 0 && (
        <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">{emptyLabel}</div>
      )}

      {!isLoading && !isError && books.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {books.map((related) => (
            <ProductCard key={related.id} book={related} compact />
          ))}
        </div>
      )}
    </section>
  )
}
