import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import Header from '../../components/Header'
import { BookDownloadDialog } from '../../features/shop/BookDownloadDialog'
import {
  BookDetailHero,
  BookDetailTabs,
  BookPurchasePanel,
  BookRelatedSection,
} from '../../features/shop/BookDetailSections'
import { loadBookDetailPageData, resolveCoverUrl } from '../../features/shop/bookDetailData'
import {
  SEO_DEFAULTS,
  buildBookJsonLd,
  buildBreadcrumbJsonLd,
  buildSeo,
  toAbsoluteUrl,
} from '../../lib/seo'
import { useBook, useRelatedBooks, type BookDetail } from '../../lib/queries/bookQueries'
import {
  getDiscountPercent,
  getEffectivePrice,
  getMaxQuantity,
  getStockStatusColor,
  isInStock,
  isPromoActive,
  truncateText,
} from '../../lib/shopHelpers'
import { useCart } from '../../lib/useCart'
import { getFreeDigitalDownloadUrl } from '../../server/newsletter'

export const Route = createFileRoute('/livro/$bookId')({
  loader: async ({ params }) => loadBookDetailPageData({ bookId: params.bookId }),
  head: ({ loaderData, params }) => {
    const book = loaderData?.book ?? null
    const slug = book?.slug ?? params.bookId
    const path = `/livro/${slug}`

    if (!book) {
      return buildSeo({
        title: 'Livro nao encontrado',
        description: SEO_DEFAULTS.description,
        path,
        noindex: true,
      })
    }

    const coverUrl = resolveCoverUrl(book)
    const description = book.seo_description || book.description || SEO_DEFAULTS.description
    const authorNames = book.authors?.map((item) => item.author?.name ?? null).filter((name): name is string => Boolean(name)) ?? []
    const priceValue = book.effective_price_mzn ?? book.price_mzn ?? null
    const availability = book.is_digital ? 'InStock' : (book.stock ?? 0) > 0 ? 'InStock' : 'OutOfStock'
    const canonical = toAbsoluteUrl(path)

    return buildSeo({
      title: book.seo_title || book.title,
      description,
      image: coverUrl,
      path,
      type: 'book',
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Editora', path: '/loja' },
          { name: book.title, path },
        ]),
        buildBookJsonLd({
          title: book.seo_title || book.title,
          description,
          image: coverUrl,
          url: canonical,
          isbn: book.isbn,
          authorNames,
          language: book.language,
          publisher: book.publisher,
          price: typeof priceValue === 'number' ? priceValue : null,
          availability,
        }),
      ],
    })
  },
  component: BookDetailPage,
})

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
      ? t(`shop.promo.labels.${book.promo_type === 'pre-venda' ? 'preVenda' : 'promocao'}`)
      : ''
  const stockLabel =
    isDigital
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
        return {
          id: item.author.id,
          name: item.author.name,
          href: `/autor/${item.author.wp_slug || item.author.id}`,
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
        stock,
        cover_url: coverUrl,
        is_digital: book.is_digital ?? false,
        digital_access: book.digital_access ?? null,
      },
      quantity,
    )

    toast.success(t('shop.detail.toasts.addSuccess', { title: truncateText(book.title, 40) }))
  }

  const handleFreeDownload = async () => {
    if (!book) return
    setDownloadError(null)
    setIsDownloading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('catalogus_newsletter_download_token') : null
      if (!token) {
        setDownloadModalOpen(true)
        return
      }
      const result = await getFreeDigitalDownloadUrl({ data: { bookId: book.id, downloadToken: token } })
      const popup = window.open(result.url, '_blank', 'noopener')
      if (popup) popup.opener = null
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
          <div className="h-72 animate-pulse rounded-none border border-gray-200 bg-gray-100" />
        </div>
      )}

      {bookQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">{t('shop.detail.error')}</div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && !book && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">{t('shop.detail.notFound')}</div>
        </div>
      )}

      {!bookQuery.isLoading && !bookQuery.isError && book && (
        <>
          <BookDetailHero book={book} coverUrl={coverUrl} homeLabel={t('shop.detail.breadcrumb.home')} shopLabel={t('shop.detail.breadcrumb.shop')} />
          <main className="container mx-auto px-4 py-16 lg:px-15">
            <BookPurchasePanel
              book={book}
              coverUrl={coverUrl}
              authorLinks={authorLinks}
              promoIsActive={promoIsActive}
              discountPercent={discountPercent}
              promoLabel={promoLabel}
              effectivePrice={effectivePrice}
              locale={locale}
              stockColor={stockColor}
              stockLabel={stockLabel}
              quantity={quantity}
              maxQuantity={maxQuantity || 1}
              inStock={inStock}
              isDownloading={isDownloading}
              onQuantityChange={setQuantity}
              onAddToCart={handleAddToCart}
              onFreeDownload={handleFreeDownload}
              labels={{
                descriptionFallback: t('shop.detail.descriptionFallback'),
                download: t('shop.detail.download'),
                addToCart: t('shop.detail.addToCart'),
                outOfStock: t('shop.detail.stock.outOfStock'),
                categoryLabel: t('shop.detail.categoryLabel'),
                languageLabel: t('shop.detail.languageLabel'),
                isbnLabel: t('shop.detail.isbnLabel'),
                idLabel: t('shop.detail.idLabel'),
                notProvided: t('shop.detail.notProvided'),
              }}
            />

            <BookDetailTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              description={book.description || book.seo_description || t('shop.detail.descriptionFallback')}
              labels={{
                description: t('shop.detail.tabs.description'),
                reviews: t('shop.detail.tabs.reviews'),
                noReviews: t('shop.detail.tabs.noReviews'),
              }}
            />

            <BookRelatedSection
              isLoading={relatedBooksQuery.isLoading}
              isError={relatedBooksQuery.isError}
              books={relatedBooksQuery.data ?? []}
              title={t('shop.detail.relatedTitle')}
              emptyLabel={t('shop.detail.relatedEmpty')}
              errorLabel={t('shop.detail.relatedError')}
            />
          </main>
        </>
      )}

      <BookDownloadDialog
        open={downloadModalOpen}
        onOpenChange={setDownloadModalOpen}
        title={t('shop.detail.newsletterTitle')}
        body={t('shop.detail.newsletterBody')}
        error={downloadError}
        bookId={book?.id}
      />
    </div>
  )
}
