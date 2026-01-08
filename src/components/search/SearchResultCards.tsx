import { buildExcerpt, formatPostDate } from '../../lib/newsHelpers'
import { formatPrice, truncateText } from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'
import { AuthorCard, type AuthorCardData } from '../author/AuthorCard'

export type SearchBook = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  cover_url: string | null
  cover_path: string | null
  description?: string | null
  seo_description?: string | null
  authors?: Array<{
    author: {
      id: string
      name: string
      wp_slug: string | null
    } | null
  }> | null
}

export type SearchAuthor = AuthorCardData

export type SearchPost = {
  id: string
  title: string
  slug: string | null
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  created_at: string
}

const coverUrlFor = (book: SearchBook) => {
  if (book.cover_url) return book.cover_url
  if (book.cover_path) {
    return supabase.storage.from('covers').getPublicUrl(book.cover_path).data
      .publicUrl
  }
  return null
}

export function BookResultCard({ book }: { book: SearchBook }) {
  const coverUrl = coverUrlFor(book)
  const href = `/livro/${book.slug ?? book.id}`
  const priceLabel =
    book.price_mzn === null || book.price_mzn === undefined
      ? ''
      : formatPrice(book.price_mzn)
  const description = truncateText(
    book.description || book.seo_description || '',
    140,
  )
  const authors = (book.authors ?? [])
    .map((item) => item.author?.name)
    .filter(Boolean)
    .join(', ')

  return (
    <a
      href={href}
      className="group flex gap-4 border border-gray-200 bg-white p-4 transition hover:border-gray-300"
    >
      <div className="h-24 w-20 overflow-hidden bg-[#e6e0db]">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
            Sem capa
          </div>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Livro</p>
          {priceLabel && (
            <p className="text-sm font-semibold text-[color:var(--brand)]">
              {priceLabel}
            </p>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{book.title}</h3>
        {authors && <p className="text-sm text-gray-500">{authors}</p>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </a>
  )
}

export function AuthorResultCard({ author }: { author: SearchAuthor }) {
  return <AuthorCard author={author} />
}

export function PostResultCard({ post }: { post: SearchPost }) {
  const href = post.slug ? `/noticias/${post.slug}` : '/noticias'
  const dateLabel = formatPostDate(post.published_at ?? post.created_at)
  const summary = buildExcerpt(post.excerpt)

  return (
    <a
      href={href}
      className="group border border-gray-200 bg-white p-4 transition hover:border-gray-300"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Post</p>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            {dateLabel}
          </p>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{post.title}</h3>
        {summary && <p className="text-sm text-gray-600">{summary}</p>}
      </div>
    </a>
  )
}
