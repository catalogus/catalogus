import { Link2, ShoppingCart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useCart } from '../../lib/useCart'
import {
  getDiscountPercent,
  getEffectivePrice,
  isInStock,
  isPromoActive,
  truncateText,
  type PromoType,
} from '../../lib/shopHelpers'
import { publicSupabase } from '../../lib/supabasePublic'
import { BookCover } from '../OptimizedImage'

export type ProductCardBook = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  promo_type?: PromoType | null
  promo_price_mzn?: number | null
  promo_start_date?: string | null
  promo_end_date?: string | null
  promo_is_active?: boolean | null
  effective_price_mzn?: number | null
  stock: number | null
  cover_url: string | null
  cover_path: string | null
  description?: string | null
  seo_description?: string | null
  authors?: Array<{
    author: {
      name: string
      id: string
      wp_slug: string | null
    } | null
  }> | null
}

type ProductCardProps = {
  book: ProductCardBook
  compact?: boolean
}

const MAX_DESCRIPTION_LENGTH = 350
const MAX_DESCRIPTION_LENGTH_COMPACT = 160

const formatPrice = (value: number | null | undefined, locale: string) => {
  if (value === null || value === undefined || Number.isNaN(value)) return ''
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MZN',
    maximumFractionDigits: 0,
  }).format(value)
}

const coverUrlFor = (book: ProductCardBook) => {
  if (book.cover_url) return book.cover_url
  if (book.cover_path) {
    return publicSupabase.storage.from('covers').getPublicUrl(book.cover_path).data
      .publicUrl
  }
  return null
}

const bookLinkFor = (book: ProductCardBook) => `/livro/${book.slug ?? book.id}`

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

export function ProductCard({ book, compact = false }: ProductCardProps) {
  const { t, i18n } = useTranslation()
  const { addToCart } = useCart()
  const coverUrl = coverUrlFor(book)
  const promoIsActive = isPromoActive(book)
  const discountPercent = getDiscountPercent(book)
  const effectivePrice = getEffectivePrice(book)
  const priceLabel = formatPrice(
    effectivePrice,
    i18n.language === 'en' ? 'en-US' : 'pt-MZ',
  )
  const originalPriceLabel =
    promoIsActive && discountPercent !== null
      ? formatPrice(book.price_mzn, i18n.language === 'en' ? 'en-US' : 'pt-MZ')
      : ''
  const promoLabel =
    promoIsActive && book.promo_type
      ? t(
          `shop.promo.labels.${
            book.promo_type === 'pre-venda' ? 'preVenda' : 'promocao'
          }`,
        )
      : ''
  const description = book.description || book.seo_description || ''
  const summary = description
    ? truncateText(
        description,
        compact ? MAX_DESCRIPTION_LENGTH_COMPACT : MAX_DESCRIPTION_LENGTH,
      )
    : t('shop.card.descriptionFallback')
  const inStock = isInStock(book.stock ?? 0)

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error(t('shop.card.outOfStock'))
      return
    }

    addToCart({
      id: book.id,
      title: book.title,
      slug: book.slug ?? book.id,
      price_mzn: effectivePrice ?? book.price_mzn ?? 0,
      stock: book.stock ?? 0,
      cover_url: coverUrl,
    })

    toast.success(t('shop.card.addSuccess'))
  }

  const copyBookLink = async () => {
    if (typeof window === 'undefined') return
    const href = new URL(bookLinkFor(book), window.location.origin).toString()
    try {
      const copied = await copyText(href)
      if (!copied) {
        toast.error(t('shop.card.copyError'))
        return
      }
      toast.success(t('shop.card.copySuccess'))
    } catch {
      toast.error(t('shop.card.copyError'))
    }
  }

  return (
    <div className={`group ${compact ? 'space-y-3' : 'space-y-4'}`}>
      <div className="relative bg-[#e6e0db] rounded-none">
        <div className="aspect-[3/4] w-full overflow-hidden bg-white/60 rounded-none">
          {book.cover_path || coverUrl ? (
            <BookCover
              src={book.cover_path || coverUrl}
              title={book.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-400">
              {t('shop.card.noCover')}
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
          <button
            type="button"
            onClick={handleAddToCart}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105"
            aria-label={t('shop.card.addToCart')}
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={copyBookLink}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--brand)] text-white transition-transform hover:scale-105"
            aria-label={t('shop.card.copyLink')}
          >
            <Link2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <a
          href={bookLinkFor(book)}
          className={`block font-semibold text-gray-900 transition-colors hover:text-gray-700 ${
            compact ? 'text-lg' : 'text-xl'
          }`}
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
            <span
              className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-[color:var(--brand)]`}
            >
              {priceLabel}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
