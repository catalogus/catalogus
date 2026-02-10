import { Link2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { BookCover } from '../OptimizedImage'
import {
  getDiscountPercent,
  getEffectivePrice,
  isPromoActive,
  type PromoType,
} from '../../lib/shopHelpers'

type FeaturedBook = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  is_digital?: boolean | null
  digital_access?: 'paid' | 'free' | null
  promo_type?: PromoType | null
  promo_price_mzn?: number | null
  promo_start_date?: string | null
  promo_end_date?: string | null
  promo_is_active?: boolean | null
  effective_price_mzn?: number | null
  description: string | null
  seo_description: string | null
  cover_url: string | null
  cover_path: string | null
}

const formatPrice = (value: number | null, locale: string) => {
  if (value === null || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MZN',
    maximumFractionDigits: 0,
  }).format(value)
}

const bookLinkFor = (book: FeaturedBook) => `/livro/${book.id}`

const copyText = async (value: string) => {
  if (
    typeof window !== 'undefined' &&
    window.isSecureContext &&
    navigator.clipboard?.writeText
  ) {
    try {
      await navigator.clipboard.writeText(value)
      return true
    } catch {
      // Fall back to legacy copy path.
    }
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.top = '-1000px'
  textarea.style.left = '-1000px'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const success = document.execCommand('copy')
  document.body.removeChild(textarea)
  return success
}

type FeaturedBooksSectionProps = {
  books: FeaturedBook[]
  hasError?: boolean
}

export default function FeaturedBooksSection({
  books,
  hasError = false,
}: FeaturedBooksSectionProps) {
  const { t, i18n } = useTranslation()

  return (
    <section className="bg-white text-gray-900">
      <div className="container mx-auto px-4 py-24 lg:px-15">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            {t('home.featuredBooks.label')}
          </p>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {t('home.featuredBooks.title')}
            </h2>
            <div className="mt-3 h-1 w-12 bg-[color:var(--brand)]" />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {hasError && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
              {t('home.featuredBooks.error')}
            </div>
          )}

          {!hasError &&
            books.map((book) => {
              const coverSrc = book.cover_path || book.cover_url
              const promoIsActive = isPromoActive(book)
              const discountPercent = getDiscountPercent(book)
              const effectivePrice = getEffectivePrice(book)
              const isDigital = !!book.is_digital
              const canAddToCart = !isDigital || book.digital_access === 'paid'
              const priceLabel = formatPrice(
                effectivePrice,
                i18n.language === 'en' ? 'en-US' : 'pt-MZ',
              )
              const originalPriceLabel =
                promoIsActive && discountPercent !== null
                  ? formatPrice(
                      book.price_mzn,
                      i18n.language === 'en' ? 'en-US' : 'pt-MZ',
                    )
                  : ''
              const promoLabel =
                promoIsActive && book.promo_type
                  ? t(
                      `shop.promo.labels.${
                        book.promo_type === 'pre-venda' ? 'preVenda' : 'promocao'
                      }`,
                    )
                  : ''
              const handleAddToCart = () => {
                if (typeof window === 'undefined') return
                if (isDigital && book.digital_access === 'free') {
                  toast.error(t('shop.card.freeDownload'))
                  return
                }
                try {
                  const key = 'catalogus-cart'
                  const raw = window.localStorage.getItem(key)
                  const items = raw
                    ? (JSON.parse(raw) as Array<{ id: string; quantity: number }>)
                    : []
                  const existing = items.find((item) => item.id === book.id)
                  if (existing) {
                    existing.quantity += 1
                  } else {
                    items.push({ id: book.id, quantity: 1 })
                  }
                  window.localStorage.setItem(key, JSON.stringify(items))
                } catch {
                  // Ignore storage failures and still show feedback.
                }
                toast.success(t('home.featuredBooks.addSuccess'))
              }
              const handleCopyBookLink = async () => {
                if (typeof window === 'undefined') return
                const href = new URL(bookLinkFor(book), window.location.origin).toString()
                try {
                  const copied = await copyText(href)
                  if (!copied) {
                    toast.error(t('home.featuredBooks.copyError'))
                    return
                  }
                  toast.success(t('home.featuredBooks.copySuccess'))
                } catch {
                  toast.error(t('home.featuredBooks.copyError'))
                }
              }
              return (
                <div key={book.id} className="group space-y-4">
                  <div className="relative bg-[#e6e0db] rounded-none">
                    <div className="aspect-[3/4] w-full overflow-hidden bg-white/60 rounded-none">
                      {coverSrc ? (
                        <BookCover
                          src={coverSrc}
                          title={book.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          priority={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-400">
                          {t('home.featuredBooks.noCover')}
                        </div>
                      )}
                    </div>
                    {promoIsActive && (promoLabel || discountPercent !== null) && (
                      <div className="absolute left-3 top-3 flex items-center gap-2">
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
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                      {canAddToCart && (
                        <button
                          type="button"
                          onClick={handleAddToCart}
                          className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105"
                          aria-label={t('home.featuredBooks.addToCart')}
                        >
                          <ShoppingCart className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleCopyBookLink}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105"
                        aria-label={t('home.featuredBooks.copyLink')}
                      >
                        <Link2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={bookLinkFor(book)}
                      className="block text-xl font-semibold text-gray-900 transition-colors hover:text-gray-700"
                    >
                      {book.title}
                    </a>
                    {priceLabel && (
                      <div className="flex flex-wrap items-baseline gap-2">
                        {originalPriceLabel && (
                          <span className="text-sm text-gray-400 line-through">
                            {originalPriceLabel}
                          </span>
                        )}
                        <span className="text-lg font-semibold text-[color:var(--brand)]">
                          {priceLabel}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

          {!hasError && books.length === 0 && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
                {t('home.featuredBooks.empty')}
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
