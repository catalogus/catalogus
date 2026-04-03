import { fetchPublicProfileById } from '@/lib/publicProfiles'
import { getCategoryDisplayLabel } from '@/lib/newsHelpers'
import { publicSupabase } from '@/lib/supabasePublic'
import type { PostRow } from '@/types/post'

export type CategoryLink = {
  id: string
  name: string
  slug: string
  slug_base?: string
  name_base?: string
}

export type TagLink = {
  id: string
  name: string
  slug: string
}

export type RelatedPost = Pick<
  PostRow,
  'id' | 'title' | 'slug' | 'featured_image_url' | 'published_at' | 'created_at'
> & {
  categories?: CategoryLink[]
}

type NewsLoaderData = {
  post: PostRow | null
  tags: TagLink[]
  recentPosts: RelatedPost[]
  relatedPosts: RelatedPost[]
  language: 'pt' | 'en'
}

const localizeCategories = (categories: any[], isEnglish: boolean) =>
  categories.map((category: any) => ({
    ...category,
    name: getCategoryDisplayLabel({
      name: category.name,
      nameEn: category.name_en,
      slug: category.slug,
      slugEn: category.slug_en,
      isEnglish,
    }),
    slug: isEnglish ? category.slug_en ?? category.slug : category.slug,
    slug_base: category.slug,
    name_base: category.name,
  }))

const localizeTags = (tags: any[], isEnglish: boolean) =>
  tags.map((tag: any) => ({
    ...tag,
    name: isEnglish ? tag.name_en ?? tag.name : tag.name,
    slug: isEnglish ? tag.slug_en ?? tag.slug : tag.slug,
  }))

export const formatPostDate = (value: string | null, locale: string) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const stripHtml = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const buildExcerpt = (value?: string | null) => {
  const text = stripHtml(value)
  if (!text) return ''
  if (text.length <= 220) return text
  return `${text.slice(0, 220).trim()}...`
}

const normalizeCategoryKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const categoryBadgeClasses: Record<string, string> = {
  noticias: 'bg-[#c6f36d] text-black',
  eventos: 'bg-[#ffd166] text-black',
  cultura: 'bg-[#5de2ff] text-black',
  literatura: 'bg-[#ff8fab] text-black',
  opiniao: 'bg-[#bdb2ff] text-black',
  entrevistas: 'bg-[#a6ff8f] text-black',
  lancamentos: 'bg-[#ffc6ff] text-black',
}

export const getCategoryBadgeClass = (value: string) => {
  const key = normalizeCategoryKey(value)
  return categoryBadgeClasses[key] ?? 'bg-[#c6f36d] text-black'
}

export const fetchNewsPost = async ({ slug, language }: { slug: string; language: 'pt' | 'en' }) => {
  const isEnglish = language === 'en'
  const { data, error } = await publicSupabase
    .from('posts')
    .select(
      `
        id,
        title,
        slug,
        language,
        excerpt,
        body,
        featured_image_url,
        published_at,
        created_at,
        author_id,
        view_count,
        translation_group_id,
        categories:post_categories_map(category:post_categories(id, name, slug, name_en, slug_en)),
        tags:post_tags_map(tag:post_tags(id, name, slug, name_en, slug_en))
      `,
    )
    .eq('status', 'published')
    .eq('language', language)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const categories = data.categories?.map((entry: any) => entry.category).filter(Boolean) ?? []
  const tags = data.tags?.map((entry: any) => entry.tag).filter(Boolean) ?? []

  let author = null
  if (data.author_id) {
    const profile = await fetchPublicProfileById(data.author_id)
    if (profile) {
      author = {
        id: profile.id,
        name: profile.name ?? 'Autor',
        email: null,
        photo_url: profile.photo_url ?? null,
      }
    }
  }

  return {
    ...data,
    categories: localizeCategories(categories, isEnglish),
    tags: localizeTags(tags, isEnglish),
    author,
  } as PostRow
}

export const fetchPublicTagLinks = async (language: 'pt' | 'en') => {
  const isEnglish = language === 'en'
  const { data, error } = await publicSupabase
    .from('post_tags')
    .select('id, name, slug, name_en, slug_en')
    .eq('is_active', true)
    .order('name', { ascending: true })
    .limit(12)
  if (error) throw error
  return localizeTags(data ?? [], isEnglish) as TagLink[]
}

export const fetchRecentPosts = async (language: 'pt' | 'en') => {
  const { data, error } = await publicSupabase
    .from('posts')
    .select('id, title, slug, featured_image_url, published_at, created_at')
    .eq('status', 'published')
    .eq('language', language)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(4)
  if (error) throw error
  return (data ?? []) as RelatedPost[]
}

export const fetchRelatedPosts = async ({
  post,
  language,
}: {
  post: PostRow | null
  language: 'pt' | 'en'
}) => {
  if (!post) return [] as RelatedPost[]

  const isEnglish = language === 'en'
  const categoryIds = post.categories?.map((category: any) => category.id) ?? []
  const tagIds = post.tags?.map((tag: any) => tag.id) ?? []
  if (!categoryIds.length && !tagIds.length) return [] as RelatedPost[]

  const relatedIds = new Set<string>()

  const [categoryMatches, tagMatches] = await Promise.all([
    categoryIds.length > 0
      ? publicSupabase.from('post_categories_map').select('post_id').in('category_id', categoryIds)
      : Promise.resolve({ data: null, error: null }),
    tagIds.length > 0
      ? publicSupabase.from('post_tags_map').select('post_id').in('tag_id', tagIds)
      : Promise.resolve({ data: null, error: null }),
  ])

  if (categoryMatches.error) throw categoryMatches.error
  if (tagMatches.error) throw tagMatches.error

  categoryMatches.data?.forEach((entry: any) => relatedIds.add(entry.post_id))
  tagMatches.data?.forEach((entry: any) => relatedIds.add(entry.post_id))

  relatedIds.delete(post.id)
  const relatedList = Array.from(relatedIds)
  if (relatedList.length === 0) return [] as RelatedPost[]

  const { data, error } = await publicSupabase
    .from('posts')
    .select(
      `
        id,
        title,
        slug,
        featured_image_url,
        published_at,
        created_at,
        categories:post_categories_map(category:post_categories(name, slug, name_en, slug_en))
      `,
    )
    .eq('status', 'published')
    .eq('language', language)
    .in('id', relatedList)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(3)

  if (error) throw error

  return (data ?? []).map((entry: any) => {
    const relatedCategories = entry.categories?.map((categoryEntry: any) => categoryEntry.category).filter(Boolean) ?? []
    return {
      ...entry,
      categories: localizeCategories(relatedCategories, isEnglish),
    }
  }) as RelatedPost[]
}

export const loadNewsPostPageData = async ({ slug }: { slug: string }): Promise<NewsLoaderData> => {
  const language: 'pt' | 'en' = 'pt'
  const post = await fetchNewsPost({ slug, language })

  if (!post) {
    return {
      post: null,
      tags: [],
      recentPosts: [],
      relatedPosts: [],
      language,
    }
  }

  const [tags, recentPosts, relatedPosts] = await Promise.all([
    fetchPublicTagLinks(language),
    fetchRecentPosts(language),
    fetchRelatedPosts({ post, language }),
  ])

  return { post, tags, recentPosts, relatedPosts, language }
}
