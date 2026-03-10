import { publicSupabase } from '@/lib/supabasePublic'

export type NewsPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  featured_image_url: string | null
  published_at: string | null
  created_at: string
  categories?: {
    category?: {
      name?: string | null
      slug?: string | null
      name_en?: string | null
      slug_en?: string | null
    } | null
  }[] | null
}

const buildSelectQuery = ({ categoria, tag }: { categoria?: string; tag?: string }) => {
  let selectQuery = `
    id,
    title,
    slug,
    excerpt,
    body,
    featured_image_url,
    published_at,
    created_at,
    categories:post_categories_map${categoria ? '!inner' : ''}(category:post_categories${categoria ? '!inner' : ''}(name, slug, name_en, slug_en))
  `

  if (tag) {
    selectQuery += `,tags:post_tags_map!inner(tag:post_tags!inner(name, slug, name_en, slug_en))`
  }

  return selectQuery
}

const normalizePosts = (data: any[] | null | undefined) =>
  data?.map((entry: any) => ({
    ...entry,
    categories:
      entry.categories?.map((categoryEntry: any) => ({
        category: categoryEntry.category,
      })) ?? [],
  })) ?? []

export const fetchFeaturedNewsPost = async (language: 'pt' | 'en') => {
  const { data, error } = await publicSupabase
    .from('posts')
    .select(
      `
        id,
        title,
        slug,
        featured_image_url,
        categories:post_categories_map(category:post_categories(name, slug, name_en, slug_en))
      `,
    )
    .eq('status', 'published')
    .eq('language', language)
    .eq('featured', true)
  if (error) throw error
  return data?.length ? (data[Math.floor(Math.random() * data.length)] as NewsPost) : null
}

export const fetchNewsListingPage = async ({
  language,
  q,
  categoria,
  tag,
  featuredPostId,
  pageParam = 1,
}: {
  language: 'pt' | 'en'
  q?: string
  categoria?: string
  tag?: string
  featuredPostId?: string | null
  pageParam?: number
}) => {
  const isEnglish = language === 'en'
  let query = publicSupabase
    .from('posts')
    .select(buildSelectQuery({ categoria, tag }))
    .eq('status', 'published')
    .eq('language', language)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (featuredPostId) query = query.neq('id', featuredPostId)
  if (q) query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
  if (categoria) query = query.eq(isEnglish ? 'categories.category.slug_en' : 'categories.category.slug', categoria)
  if (tag) query = query.eq(isEnglish ? 'tags.tag.slug_en' : 'tags.tag.slug', tag)

  const from = (pageParam - 1) * 6
  const to = from + 5
  const { data, error } = await query.range(from, to)
  if (error) throw error

  const posts = normalizePosts(data)
  return { posts, hasMore: posts.length === 6 }
}

export const loadNewsListingPageData = async ({ q, categoria, tag }: { q?: string; categoria?: string; tag?: string }) => {
  const language: 'pt' | 'en' = 'pt'
  const featuredPost = await fetchFeaturedNewsPost(language)
  const page = await fetchNewsListingPage({ language, q, categoria, tag, featuredPostId: featuredPost?.id, pageParam: 1 })
  return { featuredPost, posts: page.posts, hasMore: page.hasMore, language }
}
