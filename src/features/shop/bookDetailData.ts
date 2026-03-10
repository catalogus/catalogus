import type { ProductCardBook } from '@/components/shop/ProductCard'
import type { BookDetail } from '@/lib/queries/bookQueries'
import { publicSupabase } from '@/lib/supabasePublic'

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

const bookSelectFields =
  'id, title, slug, price_mzn, is_digital, digital_access, promo_type, promo_price_mzn, promo_start_date, promo_end_date, promo_is_active, effective_price_mzn, stock, description, seo_title, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))'

export const resolveCoverUrl = (book: BookDetail | null) => {
  if (!book) return null
  if (book.cover_url) return book.cover_url
  if (book.cover_path) {
    return publicSupabase.storage.from('covers').getPublicUrl(book.cover_path).data.publicUrl
  }
  return null
}

export const loadBookDetailPageData = async ({ bookId }: { bookId: string }) => {
  const [slugResult, idResult] = await Promise.all([
    publicSupabase.from('books_shop').select(bookSelectFields).eq('slug', bookId).eq('is_active', true).maybeSingle(),
    isUuid(bookId)
      ? publicSupabase.from('books_shop').select(bookSelectFields).eq('id', bookId).eq('is_active', true).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  const { data: bySlug, error: slugError } = slugResult
  if (slugError) throw slugError
  if (idResult.error) throw idResult.error

  const resolvedBook = ((bySlug ?? idResult.data) as BookDetail | null) ?? null

  let relatedBooks = [] as ProductCardBook[]
  if (resolvedBook?.category) {
    const { data, error } = await publicSupabase
      .from('books_shop')
      .select(bookSelectFields)
      .eq('is_active', true)
      .eq('category', resolvedBook.category)
      .neq('id', resolvedBook.id)
      .limit(4)
    if (error) throw error

    relatedBooks =
      (data ?? []).map((entry: any) => ({
        ...entry,
        authors:
          entry.authors?.map((authorEntry: any) => ({
            author: authorEntry.author,
          })) ?? [],
      })) ?? []
  }

  return { book: resolvedBook, relatedBooks }
}
