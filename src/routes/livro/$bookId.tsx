import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { ProductCard, type ProductCardBook } from '../../components/shop/ProductCard'
import { QuantitySelector } from '../../components/shop/QuantitySelector'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog'
import { NewsletterSignupForm } from '../../components/newsletter/NewsletterSignupForm'
import { useCart } from '../../lib/useCart'
import { BookCover } from '../../components/OptimizedImage'
import {
  formatPrice,
  getMaxQuantity,
  getStockStatusColor,
  getDiscountPercent,
  getEffectivePrice,
  isInStock,
  isPromoActive,
  truncateText,
} from '../../lib/shopHelpers'
import { publicSupabase } from '../../lib/supabasePublic'
import { useBook, useRelatedBooks, type BookDetail } from '../../lib/queries/bookQueries'
import { getFreeDigitalDownloadUrl } from '../../server/newsletter'

export const Route = createFileRoute('/livro/$bookId')({
  loader: async ({ params }) => {
    const { bookId } = params
    const selectFields =
      'id, title, slug, price_mzn, is_digital, digital_access, promo_type, promo_price_mzn, promo_start_date, promo_end_date, promo_is_active, effective_price_mzn, stock, description, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))'

    const { data: bySlug, error: slugError } = await publicSupabase
      .from('books_shop')
      .select(selectFields)
      .eq('slug', bookId)
      .eq('is_active', true)
      .maybeSingle()

    if (slugError) throw slugError
    const book = (bySlug as BookDetail | null) ?? null

    const resolvedBook = book
      ? book
        : ((await publicSupabase
          .from('books_shop')
          .select(selectFields)
          .eq('id', bookId)
          .eq('is_active', true)
          .maybeSingle()).data as BookDetail | null) ?? null

    let relatedBooks = [] as ProductCardBook[]
    if (resolvedBook?.category) {
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
          language,
          authors:authors_books(author:authors(id, name, wp_slug))
        `,
        )
        .eq('is_active', true)
        .eq('category', resolvedBook.category)
        .neq('id', resolvedBook.id)
        .limit(4)

      if (error) throw error
      relatedBooks =
        (data ?? []).map((entry: any) => ({
          ...entry,
          authors:
            entry.authors?.map((a: any) => ({
              author: a.author,
            })) ?? [],
        })) ?? []
    }

    return { book: resolvedBook, relatedBooks }
  },
  component: BookDetailPage,
})

const resolveCoverUrl = (book: BookDetail | null) => {
  if (!book) return null
  if (book.cover_url) return book.cover_url
  if (book.cover_path) {
    return publicSupabase.storage.from('covers').getPublicUrl(book.cover_path).data
      .publicUrl
  }
  return null
}

function BookDetailPage() {
  const { bookId } = Route.useParams()
  const loaderData = Route.useLoaderData()
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [downloadModalOpen, setDownloadModalOpen] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Use query factory hooks
  const bookQuery = useBook(bookId, loaderData.book)
  const book = bookQuery.data ?? null
  const relatedBooksQuery = useRelatedBooks(
    bookId,
    book?.category,
    loaderData.book?.category === book?.category ? loaderData.relatedBooks : undefined,
  )

  const coverUrl = resolveCoverUrl(book)
  const stock = book?.stock ?? 0
  const isDigital = !!book?.is_digital
  const maxQuantity = getMaxQuantity(stock, 10, isDigital)
  const inStock = isInStock(stock, isDigital)
  const stockColor = isDigital ? 'text-blue-600' : getStockStatusColor(stock)
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'
  const promoIsActive = book ? isPromoActive(book) : false
  const discountPercent = book ? getDiscountPercent(book) : null
  const effectivePrice = book ? getEffectivePrice(book) : null
  const promoLabel =
    promoIsActive && book?.promo_type
      ? t(
          `shop.promo.labels.${
            book.promo_type === 'pre-venda' ? 'preVenda' : 'promocao'
          }`,
        )
      : ''
  const stockLabel = isDigital
    ? t('shop.detail.digital')
    : inStock
      ? stock <= 5
        ? t('shop.detail.stock.low', { count: stock })
        : t('shop.detail.stock.inStock')
      : t('shop.detail.stock.outOfStock')

  useEffect(() => {
    if (!book) return
    if (!inStock) {
      setQuantity(1)
      return
    }
    setQuantity((prev) => Math.min(Math.max(prev, 1), maxQuantity || 1))
  }, [book, inStock, maxQuantity])

  const authorLinks =
    book?.authors
      ?.map((item) => {
        if (!item.author) return null
        const slug = item.author.wp_slug || item.author.id
        return {
          id: item.author.id,
          name: item.author.name,
          href: `/autor/${slug}`,
        }
      })
      .filter(Boolean) ?? []

  const handleAddToCart = () => {
    if (!book) return
    if (book.is_digital && book.digital_access === 'free') {
      setDownloadModalOpen(true)
      return
    }
    if (!inStock) {
      toast.error(t('shop.detail.toasts.outOfStock'))
      return
    }

    addToCart(
      {
        id: book.id,
        title: book.title,
        slug: book.slug ?? book.id,
        price_mzn: effectivePrice ?? book.price_mzn ?? 0,
        stock: stock,
        cover_url: coverUrl,
        is_digital: book.is_digital ?? false,
        digital_access: book.digital_access ?? null,
      },
      quantity,
    )

    toast.success(
      t('shop.detail.toasts.addSuccess', {
        title: truncateText(book.title, 40),
      }),
    )
  }

  const handleFreeDownload = async () => {
    if (!book) return
    setDownloadError(null)
    setIsDownloading(true)
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('catalogus_newsletter_download_token')
          : null
      if (!token) {
        setDownloadModalOpen(true)
        return
      }
      const result = await getFreeDigitalDownloadUrl({
        data: { bookId: book.id, downloadToken: token },
      })
      window.open(result.url, '_blank')
    } catch (error) {
      console.error('Free download error', error)
      setDownloadError(t('shop.detail.downloadError'))
      setDownloadModalOpen(true)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {bookQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      )}

      {bookQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('shop.detail.error')}
          </div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && !book && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('shop.detail.notFound')}
          </div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && book && (
        <>
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
                  <h1 className="text-4xl font-semibold md:text-6xl">
                    {book.title}
                  </h1>
                  <div className="text-xs uppercase tracking-[0.3em] text-white/70">
                    <a href="/" className="hover:text-white">
                      {t('shop.detail.breadcrumb.home')}
                    </a>{' '}
                    /{' '}
                    <a href="/loja" className="hover:text-white">
                      {t('shop.detail.breadcrumb.shop')}
                    </a>{' '}
                    / {book.title}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="container mx-auto px-4 py-16 lg:px-15">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_1fr]">
              <div className="shadow-sm">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-white">
                  {book.cover_path || coverUrl ? (
                    <BookCover
                      src={book.cover_path || coverUrl}
                      title={book.title}
                      className="h-full w-full object-cover"
                      priority={true}
                    />
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
                  <h2 className="text-3xl font-semibold md:text-4xl">
                    {book.title}
                  </h2>
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
                  <p>
                    {book.description ||
                      book.seo_description ||
                      t('shop.detail.descriptionFallback')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  {!(book.is_digital && book.digital_access === 'free') && (
                    <QuantitySelector
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={maxQuantity || 1}
                      disabled={!inStock}
                    />
                  )}
                  {book.is_digital && book.digital_access === 'free' ? (
                    <button
                      type="button"
                      onClick={handleFreeDownload}
                      className="flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                      disabled={isDownloading}
                    >
                      {t('shop.detail.download')}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!inStock}
                      className="flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {inStock
                        ? t('shop.detail.addToCart')
                        : t('shop.detail.stock.outOfStock')}
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-xs uppercase tracking-wider text-gray-500">
                  <p>
                    {t('shop.detail.categoryLabel')}{' '}
                    <span className="text-gray-700 normal-case">
                      {book.category || t('shop.detail.notProvided')}
                    </span>
                  </p>
                  <p>
                    {t('shop.detail.languageLabel')}{' '}
                    <span className="text-gray-700 normal-case">
                      {book.language?.toUpperCase() || t('shop.detail.notProvided')}
                    </span>
                  </p>
                  <p>
                    {t('shop.detail.isbnLabel')}{' '}
                    <span className="text-gray-700 normal-case">
                      {book.isbn || t('shop.detail.notProvided')}
                    </span>
                  </p>
                  <p>
                    {t('shop.detail.idLabel')}{' '}
                    <span className="text-gray-700 normal-case">{book.id}</span>
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-12">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'description'
                      ? 'bg-[color:var(--brand)] text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('shop.detail.tabs.description')}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    activeTab === 'reviews'
                      ? 'bg-[color:var(--brand)] text-white'
                      : 'bg-white text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {t('shop.detail.tabs.reviews')}
                </button>
              </div>
              <div className="mt-4 border border-gray-200 bg-white p-6 text-sm text-gray-700">
                {activeTab === 'description' ? (
                  <p>
                    {book.description ||
                      book.seo_description ||
                      t('shop.detail.descriptionFallback')}
                  </p>
                ) : (
                  <p>{t('shop.detail.tabs.noReviews')}</p>
                )}
              </div>
            </section>

            <section className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-semibold md:text-3xl">
                {t('shop.detail.relatedTitle')}
              </h2>
            </div>

            {relatedBooksQuery.isLoading && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`related-skeleton-${index}`} className="space-y-3">
                    <div className="aspect-[3/4] w-full animate-pulse bg-gray-200" />
                    <div className="h-5 w-3/4 animate-pulse bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {relatedBooksQuery.isError && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                {t('shop.detail.relatedError')}
              </div>
            )}

            {!relatedBooksQuery.isLoading &&
              !relatedBooksQuery.isError &&
              (relatedBooksQuery.data?.length ?? 0) === 0 && (
                <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
                  {t('shop.detail.relatedEmpty')}
                </div>
              )}

            {!relatedBooksQuery.isLoading &&
              !relatedBooksQuery.isError &&
              (relatedBooksQuery.data?.length ?? 0) > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {(relatedBooksQuery.data ?? []).map((related) => (
                    <ProductCard key={related.id} book={related} compact />
                  ))}
                </div>
              )}
          </section>
        </main>
        </>
      )}

      <Dialog open={downloadModalOpen} onOpenChange={setDownloadModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('shop.detail.newsletterTitle')}</DialogTitle>
            <DialogDescription>
              {t('shop.detail.newsletterBody')}
            </DialogDescription>
          </DialogHeader>
          {downloadError && (
            <p className="text-sm text-rose-600">{downloadError}</p>
          )}
          <NewsletterSignupForm bookId={book?.id} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
