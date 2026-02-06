import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { publicSupabase } from '../../lib/supabasePublic'
import {
  SEO_DEFAULTS,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildSeo,
  toAbsoluteUrl,
} from '../../lib/seo'
import { sanitizeRichText } from '../../lib/sanitizeHtml'
import type { PostRow } from '../../types/post'

export const Route = createFileRoute('/noticias/$slug')({
  loader: async ({ params }) => {
    const language: 'pt' | 'en' = 'pt'
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
          updated_at,
          author_id,
          view_count,
          translation_group_id,
          categories:post_categories_map(category:post_categories(id, name, slug, name_en, slug_en)),
          tags:post_tags_map(tag:post_tags(id, name, slug, name_en, slug_en))
        `,
      )
      .eq('status', 'published')
      .eq('language', language)
      .eq('slug', params.slug)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return {
        post: null as PostRow | null,
        tags: [] as TagLink[],
        recentPosts: [] as RelatedPost[],
        relatedPosts: [] as RelatedPost[],
        language,
      }
    }

    const categories =
      data.categories?.map((entry: any) => entry.category).filter(Boolean) ?? []
    const tags = data.tags?.map((entry: any) => entry.tag).filter(Boolean) ?? []

    let author = null
    if (data.author_id) {
      const { data: profile, error: profileError } = await publicSupabase
        .from('profiles')
        .select('id, name, email, photo_url')
        .eq('id', data.author_id)
        .maybeSingle()
      if (!profileError) {
        author = profile
      }
    }

    const localizedCategories = categories.map((category: any) => ({
      ...category,
      name: isEnglish ? category.name_en ?? category.name : category.name,
      slug: isEnglish ? category.slug_en ?? category.slug : category.slug,
      slug_base: category.slug,
      name_base: category.name,
    }))

    const localizedTags = tags.map((tag: any) => ({
      ...tag,
      name: isEnglish ? tag.name_en ?? tag.name : tag.name,
      slug: isEnglish ? tag.slug_en ?? tag.slug : tag.slug,
    }))

    const post = {
      ...data,
      categories: localizedCategories,
      tags: localizedTags,
      author,
    } as PostRow

    const { data: tagData, error: tagError } = await publicSupabase
      .from('post_tags')
      .select('id, name, slug, name_en, slug_en')
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(12)
    if (tagError) throw tagError
    const tagsList = (tagData ?? []).map((tag: any) => ({
      ...tag,
      name: isEnglish ? tag.name_en ?? tag.name : tag.name,
      slug: isEnglish ? tag.slug_en ?? tag.slug : tag.slug,
    })) as TagLink[]

    const { data: recentData, error: recentError } = await publicSupabase
      .from('posts')
      .select('id, title, slug, featured_image_url, published_at, created_at')
      .eq('status', 'published')
      .eq('language', language)
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(4)
    if (recentError) throw recentError
    const recentPosts = (recentData ?? []) as RelatedPost[]

    const categoryIds = localizedCategories.map((category: any) => category.id)
    const tagIds = localizedTags.map((tag: any) => tag.id)

    let relatedPosts: RelatedPost[] = []
    if (categoryIds.length || tagIds.length) {
      const relatedIds = new Set<string>()

      if (categoryIds.length > 0) {
        const { data: categoryMatches, error: categoryError } = await publicSupabase
          .from('post_categories_map')
          .select('post_id')
          .in('category_id', categoryIds)
        if (categoryError) throw categoryError
        categoryMatches?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

      if (tagIds.length > 0) {
        const { data: tagMatches, error: tagError } = await publicSupabase
          .from('post_tags_map')
          .select('post_id')
          .in('tag_id', tagIds)
        if (tagError) throw tagError
        tagMatches?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

      relatedIds.delete(post.id)
      const relatedList = Array.from(relatedIds)
      if (relatedList.length > 0) {
        const { data: relatedData, error: relatedError } = await publicSupabase
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

        if (relatedError) throw relatedError

        relatedPosts =
          (relatedData ?? []).map((entry: any) => {
            const relatedCategories =
              entry.categories?.map((categoryEntry: any) => categoryEntry.category).filter(Boolean) ??
              []
            const localizedRelated = relatedCategories.map((category: any) => ({
              ...category,
              name: isEnglish ? category.name_en ?? category.name : category.name,
              slug: isEnglish ? category.slug_en ?? category.slug : category.slug,
              slug_base: category.slug,
              name_base: category.name,
            }))
            return {
              ...entry,
              categories: localizedRelated,
            }
          }) ?? []
      }
    }

    return { post, tags: tagsList, recentPosts, relatedPosts, language }
  },
  head: ({ loaderData, params }) => {
    const post = loaderData?.post ?? null
    const path = `/noticias/${params.slug}`

    if (!post) {
      return buildSeo({
        title: 'Noticia nao encontrada',
        description: SEO_DEFAULTS.description,
        path,
        noindex: true,
      })
    }

    const description = post.excerpt || post.body || SEO_DEFAULTS.description
    const image = post.featured_image_url || null
    const canonical = toAbsoluteUrl(path)

    return buildSeo({
      title: post.title,
      description,
      image,
      path,
      type: 'article',
      publishedTime: post.published_at ?? post.created_at,
      modifiedTime: post.updated_at ?? post.published_at ?? post.created_at,
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Noticias', path: '/noticias' },
          { name: post.title, path },
        ]),
        buildArticleJsonLd({
          title: post.title,
          description,
          image,
          url: canonical,
          publishedAt: post.published_at ?? post.created_at,
          modifiedAt: post.updated_at ?? post.published_at ?? post.created_at,
          authorName: post.author?.name ?? null,
        }),
      ],
    })
  },
  component: NewsPostDetailPage,
})

type CategoryLink = {
  id: string
  name: string
  slug: string
  slug_base?: string
  name_base?: string
}

type TagLink = {
  id: string
  name: string
  slug: string
}

type RelatedPost = Pick<
  PostRow,
  'id' | 'title' | 'slug' | 'featured_image_url' | 'published_at' | 'created_at'
> & {
  categories?: CategoryLink[]
}

const formatPostDate = (value: string | null, locale: string) => {
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

const buildExcerpt = (value?: string | null) => {
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

const getCategoryBadgeClass = (value: string) => {
  const key = normalizeCategoryKey(value)
  return categoryBadgeClasses[key] ?? 'bg-[#c6f36d] text-black'
}

const SidebarCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="border border-gray-200 bg-white p-6 rounded-none">
    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-600">
      {title}
    </h3>
    <div className="mt-4">{children}</div>
  </div>
)

function NewsPostDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const language = i18n.language === 'en' ? 'en' : 'pt'
  const isEnglish = language === 'en'
  const loaderData = Route.useLoaderData()
  const lastResolvedPostRef = useRef<{
    translation_group_id?: string | null
    slug?: string
    language?: string
  } | null>(null)

  const initialPost =
    loaderData.language === language && loaderData.post?.slug === slug
      ? loaderData.post
      : undefined

  const postQuery = useQuery({
    queryKey: ['news-post', slug, language],
    queryFn: async () => {
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

      const categories =
        data.categories?.map((entry: any) => entry.category).filter(Boolean) ?? []
      const tags = data.tags?.map((entry: any) => entry.tag).filter(Boolean) ?? []

      let author = null
      if (data.author_id) {
        const { data: profile, error: profileError } = await publicSupabase
          .from('profiles')
          .select('id, name, email, photo_url')
          .eq('id', data.author_id)
          .maybeSingle()
        if (!profileError) {
          author = profile
        }
      }

      const localizedCategories = categories.map((category: any) => ({
        ...category,
        name: isEnglish ? category.name_en ?? category.name : category.name,
        slug: isEnglish ? category.slug_en ?? category.slug : category.slug,
        slug_base: category.slug,
        name_base: category.name,
      }))

      const localizedTags = tags.map((tag: any) => ({
        ...tag,
        name: isEnglish ? tag.name_en ?? tag.name : tag.name,
        slug: isEnglish ? tag.slug_en ?? tag.slug : tag.slug,
      }))

      return {
        ...data,
        categories: localizedCategories,
        tags: localizedTags,
        author,
      } as PostRow
    },
    initialData: initialPost,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (!postQuery.data) return
    lastResolvedPostRef.current = {
      translation_group_id: postQuery.data.translation_group_id ?? postQuery.data.id,
      slug: postQuery.data.slug,
      language: postQuery.data.language,
    }
  }, [postQuery.data])

  useEffect(() => {
    const lastResolved = lastResolvedPostRef.current
    if (!lastResolved?.translation_group_id) return
    if (!lastResolved.language) return
    if (lastResolved.language === language) return

    let cancelled = false

    const resolveTranslation = async () => {
      const { data, error } = await publicSupabase
        .from('posts')
        .select('slug, language')
        .eq('translation_group_id', lastResolved.translation_group_id)
        .eq('language', language)
        .maybeSingle()
      if (cancelled || error || !data?.slug) return
      if (data.slug !== slug) {
        navigate({ to: '/noticias/$slug', params: { slug: data.slug } })
      }
    }

    void resolveTranslation()
    return () => {
      cancelled = true
    }
  }, [language, navigate, slug])

  const tagsQuery = useQuery({
    queryKey: ['post-tags', 'public'],
    queryFn: async () => {
      const { data, error } = await publicSupabase
        .from('post_tags')
        .select('id, name, slug, name_en, slug_en')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(12)
      if (error) throw error
      const localized = (data ?? []).map((tag: any) => ({
        ...tag,
        name: isEnglish ? tag.name_en ?? tag.name : tag.name,
        slug: isEnglish ? tag.slug_en ?? tag.slug : tag.slug,
      }))
      return localized as TagLink[]
    },
    initialData: loaderData.language === language ? loaderData.tags : undefined,
    staleTime: 60_000,
  })

  const recentPostsQuery = useQuery({
    queryKey: ['news-posts', 'recent', language],
    queryFn: async () => {
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
    },
    initialData: loaderData.language === language ? loaderData.recentPosts : undefined,
    staleTime: 60_000,
  })

  const post = postQuery.data
  const categoryIds = post?.categories?.map((category) => category.id) ?? []
  const tagIds = post?.tags?.map((tag) => tag.id) ?? []

  const relatedPostsQuery = useQuery({
    queryKey: [
      'news-post',
      slug,
      'related',
      categoryIds.join(','),
      tagIds.join(','),
      language,
    ],
    enabled: Boolean(post && (categoryIds.length || tagIds.length)),
    queryFn: async () => {
      if (!post) return [] as RelatedPost[]
      const relatedIds = new Set<string>()

      if (categoryIds.length > 0) {
        const { data, error } = await publicSupabase
          .from('post_categories_map')
          .select('post_id')
          .in('category_id', categoryIds)
        if (error) throw error
        data?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

      if (tagIds.length > 0) {
        const { data, error } = await publicSupabase
          .from('post_tags_map')
          .select('post_id')
          .in('tag_id', tagIds)
        if (error) throw error
        data?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

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
        const relatedCategories =
          entry.categories?.map((categoryEntry: any) => categoryEntry.category).filter(Boolean) ??
          []
        const localizedCategories = relatedCategories.map((category: any) => ({
          ...category,
          name: isEnglish ? category.name_en ?? category.name : category.name,
          slug: isEnglish ? category.slug_en ?? category.slug : category.slug,
          slug_base: category.slug,
          name_base: category.name,
        }))
        return {
          ...entry,
          categories: localizedCategories,
        }
      }) as RelatedPost[]
    },
    initialData:
      loaderData.language === language && loaderData.post?.slug === slug
        ? loaderData.relatedPosts
        : undefined,
    staleTime: 60_000,
  })

  const primaryCategory = post?.categories?.[0]
  const featuredImage = post?.featured_image_url
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'
  const dateLabel = formatPostDate(post?.published_at ?? post?.created_at ?? null, locale)
  const excerpt = post?.excerpt?.trim() || buildExcerpt(post?.body)
  const safeBody = post?.body ? sanitizeRichText(post.body) : ''

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {postQuery.isLoading && (
        <>
          <section className="bg-[#1c1b1a] text-white">
            <div className="container mx-auto px-4 py-24 lg:px-15">
              <div className="max-w-3xl space-y-4">
                <div className="h-4 w-32 bg-white/30 animate-pulse" />
                <div className="h-10 w-full bg-white/20 animate-pulse" />
                <div className="h-4 w-1/2 bg-white/20 animate-pulse" />
              </div>
            </div>
          </section>
          <main className="py-20">
            <div className="container mx-auto px-4 lg:px-15">
              <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <div className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse" />
                  <div className="h-4 w-5/6 bg-gray-200 animate-pulse" />
                  <div className="h-4 w-4/6 bg-gray-200 animate-pulse" />
                </div>
                <div className="space-y-6">
                  <div className="h-24 bg-gray-200 animate-pulse" />
                  <div className="h-32 bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {postQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('news.detail.error')}
          </div>
        </div>
      )}

      {!postQuery.isLoading && !postQuery.isError && !post && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('news.detail.notFound')}
          </div>
        </div>
      )}

      {!postQuery.isLoading && !postQuery.isError && post && (
        <>
          <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
            {featuredImage ? (
              <img
                src={featuredImage}
                alt={post.title}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />
            <div className="relative z-10">
              <div className="container mx-auto px-4 py-24 lg:px-15">
                <div className="max-w-3xl space-y-5">
                  {primaryCategory && (
                    <span
                      className={`${getCategoryBadgeClass(
                        primaryCategory.slug_base ||
                          primaryCategory.slug ||
                          primaryCategory.name_base ||
                          primaryCategory.name,
                      )} inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`}
                    >
                      {primaryCategory.name}
                    </span>
                  )}
                  <h1 className="text-2xl font-semibold leading-tight md:text-4xl">
                    {post.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/70">
                    {dateLabel && <span>{dateLabel}</span>}
                    {post.author?.name && <span>{post.author.name}</span>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="py-20">
            <div className="container mx-auto px-4 lg:px-15">
              <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                <article className="space-y-10">
                  {excerpt && (
                    <p className="text-lg leading-relaxed text-gray-700">
                      {excerpt}
                    </p>
                  )}
                  
                  {safeBody ? (
                    <div
                      className="post-content text-gray-700"
                      dangerouslySetInnerHTML={{ __html: safeBody }}
                    />
                  ) : (
                    <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
                      {t('news.detail.noContent')}
                    </div>
                  )}

                  {(post.categories?.length || post.tags?.length) && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                            {t('news.detail.categories')}
                          </span>
                          {post.categories.map((category) => (
                            <a
                              key={category.id}
                              href={`/noticias?categoria=${category.slug}`}
                              className="border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none"
                            >
                              {category.name}
                            </a>
                          ))}
                        </div>
                      )}

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                            {t('news.detail.tags')}
                          </span>
                          {post.tags.map((tag) => (
                            <a
                              key={tag.id}
                              href={`/noticias?tag=${tag.slug}`}
                              className="border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none"
                            >
                              {tag.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {post.author && (
                    <div className="border border-gray-200 bg-white p-6 rounded-none">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="h-16 w-16 overflow-hidden bg-[#f4f1ec]">
                          {post.author.photo_url ? (
                            <img
                              src={post.author.photo_url}
                              alt={post.author.name ?? t('news.detail.authorLabel')}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-gray-400">
                              {(post.author.name ?? 'A').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                            {t('news.detail.authorLabel')}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {post.author.name ?? t('news.detail.authorFallback')}
                          </p>
                          {post.author.email && (
                            <p className="text-sm text-gray-600">{post.author.email}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {relatedPostsQuery.isLoading && (
                    <div className="space-y-4">
                      <div className="h-6 w-48 bg-gray-200 animate-pulse" />
                      <div className="grid gap-6 md:grid-cols-2">
                        {Array.from({ length: 2 }).map((_, index) => (
                          <div
                            key={`related-skeleton-${index}`}
                            className="h-48 bg-gray-200 animate-pulse"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {!relatedPostsQuery.isLoading &&
                    !relatedPostsQuery.isError &&
                    (relatedPostsQuery.data?.length ?? 0) > 0 && (
                      <section className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-semibold text-gray-900">
                            {t('news.detail.related')}
                          </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          {relatedPostsQuery.data?.map((related) => {
                            const relatedCategory = related.categories?.[0]
                            const relatedCategoryClass = relatedCategory
                              ? getCategoryBadgeClass(
                                  relatedCategory.slug_base ||
                                    relatedCategory.slug ||
                                    relatedCategory.name_base ||
                                    relatedCategory.name,
                                )
                              : ''
                            const relatedDate = formatPostDate(
                              related.published_at ?? related.created_at,
                              locale,
                            )
                            return (
                              <a
                                key={related.id}
                                href={`/noticias/${related.slug}`}
                                className="group relative flex min-h-56 flex-col justify-end overflow-hidden border border-gray-200 bg-white text-left transition-transform hover:-translate-y-1 rounded-none"
                              >
                                {related.featured_image_url ? (
                                  <img
                                    src={related.featured_image_url}
                                    alt={related.title}
                                    className="absolute inset-0 h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="absolute inset-0 bg-gradient-to-br from-[#e6ddd3] to-[#cbbfb4]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
                                {relatedCategory && (
                                  <span
                                    className={`${relatedCategoryClass} absolute left-4 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`}
                                  >
                                    {relatedCategory.name}
                                  </span>
                                )}
                                <div className="relative z-10 space-y-3 p-6 text-white">
                                  <h3 className="text-lg font-semibold leading-snug md:text-xl">
                                    {related.title}
                                  </h3>
                                  <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                                    {relatedDate}
                                  </div>
                                </div>
                              </a>
                            )
                          })}
                        </div>
                      </section>
                    )}
                </article>

                <aside className="space-y-8">
                  <SidebarCard title={t('news.detail.searchTitle')}>
                    <form action="/noticias" method="get" className="flex gap-2">
                      <input
                        type="search"
                        name="q"
                        placeholder={t('news.detail.searchPlaceholder')}
                        className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none rounded-none"
                      />
                      <button
                        type="submit"
                        className="bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] rounded-none"
                      >
                        {t('news.detail.searchSubmit')}
                      </button>
                    </form>
                  </SidebarCard>

                  <SidebarCard title={t('news.detail.recentTitle')}>
                    {recentPostsQuery.isLoading && (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`recent-skeleton-${index}`}
                            className="h-10 w-full bg-gray-200 animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {recentPostsQuery.isError && (
                      <p className="text-sm text-gray-600">
                        {t('news.detail.recentError')}
                      </p>
                    )}
                    {!recentPostsQuery.isLoading &&
                      !recentPostsQuery.isError &&
                      (recentPostsQuery.data ?? []).length === 0 && (
                        <p className="text-sm text-gray-600">
                          {t('news.detail.recentEmpty')}
                        </p>
                      )}
                    {!recentPostsQuery.isLoading &&
                      !recentPostsQuery.isError &&
                      (recentPostsQuery.data ?? []).length > 0 && (
                        <ul className="space-y-4 text-sm text-gray-700">
                          {recentPostsQuery.data
                            ?.filter((entry) => entry.id !== post.id)
                            .map((entry) => (
                              <li key={entry.id} className="space-y-1">
                                <a
                                  href={`/noticias/${entry.slug}`}
                                  className="font-semibold text-gray-900 hover:text-[color:var(--brand)]"
                                >
                                  {entry.title}
                                </a>
                                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                                  {formatPostDate(
                                    entry.published_at ?? entry.created_at,
                                    locale,
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                  </SidebarCard>

                  <SidebarCard title={t('news.detail.tagsTitle')}>
                    {tagsQuery.isLoading && (
                      <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div
                            key={`tag-skeleton-${index}`}
                            className="h-7 w-16 bg-gray-200 animate-pulse"
                          />
                        ))}
                      </div>
                    )}
                    {tagsQuery.isError && (
                      <p className="text-sm text-gray-600">
                        {t('news.detail.tagsError')}
                      </p>
                    )}
                    {!tagsQuery.isLoading &&
                      !tagsQuery.isError &&
                      (tagsQuery.data ?? []).length === 0 && (
                        <p className="text-sm text-gray-600">
                          {t('news.detail.tagsEmpty')}
                        </p>
                      )}
                    {!tagsQuery.isLoading &&
                      !tagsQuery.isError &&
                      (tagsQuery.data ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tagsQuery.data?.map((tag) => (
                            <a
                              key={tag.id}
                              href={`/noticias?tag=${tag.slug}`}
                              className="border border-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400 rounded-none"
                            >
                              {tag.name}
                            </a>
                          ))}
                        </div>
                      )}
                  </SidebarCard>
                </aside>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
