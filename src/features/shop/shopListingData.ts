import type { ProductCardBook } from '@/components/shop/ProductCard'
import type { PriceRange } from '@/lib/queries/shopQueries'
import { publicSupabase } from '@/lib/supabasePublic'

export type SortOption = 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title'

export const DEFAULT_PRICE_RANGE: PriceRange = { min: 0, max: 10000 }
export const PAGE_SIZE = 12

export const loadShopListingPageData = async () => {
  const { data: metaData, error: metaError } = await publicSupabase.rpc('get_shop_metadata')
  if (metaError) throw metaError

  const metadata = {
    categories: (metaData?.categories || []) as string[],
    priceRange: (metaData?.priceRange || DEFAULT_PRICE_RANGE) as PriceRange,
  }

  const page = await fetchShopBooksPage({
    search: '',
    selectedCategories: [],
    language: null,
    selectedPrice: metadata.priceRange,
    sortBy: 'newest',
    priceRange: metadata.priceRange,
    pageParam: 1,
  })

  return { metadata, initialBooks: page.books, hasMore: page.hasMore }
}

export const fetchShopBooksPage = async ({
  search,
  selectedCategories,
  language,
  selectedPrice,
  sortBy,
  priceRange,
  pageParam = 1,
}: {
  search: string
  selectedCategories: string[]
  language: string | null
  selectedPrice: PriceRange
  sortBy: SortOption
  priceRange: PriceRange
  pageParam?: number
}) => {
  let query = publicSupabase
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
        language
      `,
      { count: 'exact' },
    )
    .eq('is_active', true)

  const trimmedSearch = search.trim()
  if (trimmedSearch) {
    query = query.or(`title.ilike.%${trimmedSearch}%,description.ilike.%${trimmedSearch}%`)
  }

  if (selectedCategories.length > 0) query = query.in('category', selectedCategories)
  if (language) query = query.eq('language', language)
  if (selectedPrice.min > priceRange.min) query = query.gte('effective_price_mzn', selectedPrice.min)
  if (selectedPrice.max < priceRange.max) query = query.lte('effective_price_mzn', selectedPrice.max)

  switch (sortBy) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'oldest':
      query = query.order('created_at', { ascending: true })
      break
    case 'price-asc':
      query = query.order('effective_price_mzn', { ascending: true, nullsFirst: false })
      break
    case 'price-desc':
      query = query.order('effective_price_mzn', { ascending: false, nullsFirst: false })
      break
    case 'title':
      query = query.order('title', { ascending: true })
      break
  }

  const from = (pageParam - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const { data, error, count } = await query.range(from, to)
  if (error) throw error

  const books = (data ?? []) as ProductCardBook[]
  const loaded = from + books.length
  const hasMore = count === null ? books.length === PAGE_SIZE : loaded < count

  return { books, hasMore }
}
