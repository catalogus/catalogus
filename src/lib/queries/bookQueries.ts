import { useQuery } from '@tanstack/react-query'
import { publicSupabase } from '../supabasePublic'
import type { ProductCardBook } from '../../components/shop/ProductCard'

// Query key factory for books
export const bookKeys = {
  all: () => ['books'] as const,
  lists: () => [...bookKeys.all(), 'list'] as const,
  list: (filters: Record<string, any>) => [...bookKeys.lists(), filters] as const,
  details: () => [...bookKeys.all(), 'detail'] as const,
  detail: (id: string) => [...bookKeys.details(), id] as const,
  related: (category: string) => ['related-books', category] as const,
}

// Book detail type
export type BookDetail = {
  id: string
  title: string
  slug: string | null
  price_mzn: number | null
  is_digital?: boolean | null
  digital_access?: 'paid' | 'free' | null
  promo_type?: 'promocao' | 'pre-venda' | null
  promo_price_mzn?: number | null
  promo_start_date?: string | null
  promo_end_date?: string | null
  promo_is_active?: boolean | null
  effective_price_mzn?: number | null
  stock: number | null
  description: string | null
  seo_description: string | null
  cover_url: string | null
  cover_path: string | null
  isbn: string | null
  publisher: string | null
  category: string | null
  language: string | null
  authors?: Array<{
    author: {
      id: string
      name: string
      wp_slug: string | null
    } | null
  }> | null
}

// Reusable book query hook
export const useBook = (bookId: string, initialData?: BookDetail | null) => {
  return useQuery({
    queryKey: bookKeys.detail(bookId),
    queryFn: async () => {
      const selectFields =
        'id, title, slug, price_mzn, is_digital, digital_access, promo_type, promo_price_mzn, promo_start_date, promo_end_date, promo_is_active, effective_price_mzn, stock, description, seo_description, cover_url, cover_path, isbn, publisher, category, language, authors:authors_books(author:authors(id, name, wp_slug))'

      const { data: bySlug, error: slugError } = await publicSupabase
        .from('books_shop')
        .select(selectFields)
        .eq('slug', bookId)
        .eq('is_active', true)
        .maybeSingle()

      if (slugError) throw slugError
      if (bySlug) return bySlug as BookDetail

      const { data: byId, error: idError } = await publicSupabase
        .from('books_shop')
        .select(selectFields)
        .eq('id', bookId)
        .eq('is_active', true)
        .maybeSingle()

      if (idError) throw idError
      return (byId as BookDetail | null) ?? null
    },
    initialData,
    staleTime: 60_000,
  })
}

// Reusable related books query hook
export const useRelatedBooks = (
  bookId: string,
  category: string | null | undefined,
  initialData?: ProductCardBook[],
) => {
  return useQuery({
    queryKey: ['related-books', bookId, category],
    queryFn: async () => {
      if (!category) return []

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
        .eq('category', category)
        .neq('id', bookId)
        .limit(4)

      if (error) throw error

      return (
        data?.map((entry: any) => ({
          ...entry,
          authors:
            entry.authors?.map((a: any) => ({
              author: a.author,
            })) ?? [],
        })) ?? []
      ) as ProductCardBook[]
    },
    initialData,
    staleTime: 60_000,
  })
}
