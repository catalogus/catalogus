import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { NewsPostBody, NewsPostHero } from '../../features/news/NewsPostSections'
import {
  buildExcerpt,
  fetchNewsPost,
  fetchPublicTagLinks,
  fetchRecentPosts,
  fetchRelatedPosts,
  formatPostDate,
  loadNewsPostPageData,
} from '../../features/news/newsPostData'
import { publicSupabase } from '../../lib/supabasePublic'
import {
  SEO_DEFAULTS,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildSeo,
  toAbsoluteUrl,
} from '../../lib/seo'
import { sanitizeRichText } from '../../lib/sanitizeHtml'

export const Route = createFileRoute('/noticias/$slug')({
  loader: async ({ params }) => loadNewsPostPageData({ slug: params.slug }),
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

function NewsPostDetailPage() {
  const { t, i18n } = useTranslation()
  const { slug } = Route.useParams()
  const navigate = useNavigate()
  const language = i18n.language === 'en' ? 'en' : 'pt'
  const loaderData = Route.useLoaderData()
  const lastResolvedPostRef = useRef<{
    translation_group_id?: string | null
    slug?: string
    language?: string
  } | null>(null)

  const initialPost =
    loaderData.language === language && loaderData.post?.slug === slug ? loaderData.post : undefined

  const postQuery = useQuery({
    queryKey: ['news-post', slug, language],
    queryFn: () => fetchNewsPost({ slug, language }),
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
    if (!lastResolved?.translation_group_id || !lastResolved.language) return
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
    queryKey: ['post-tags', 'public', language],
    queryFn: () => fetchPublicTagLinks(language),
    initialData: loaderData.language === language ? loaderData.tags : undefined,
    staleTime: 60_000,
  })

  const recentPostsQuery = useQuery({
    queryKey: ['news-posts', 'recent', language],
    queryFn: () => fetchRecentPosts(language),
    initialData: loaderData.language === language ? loaderData.recentPosts : undefined,
    staleTime: 60_000,
  })

  const post = postQuery.data

  const relatedPostsQuery = useQuery({
    queryKey: [
      'news-post',
      slug,
      'related',
      post?.categories?.map((category) => category.id).join(',') ?? '',
      post?.tags?.map((tag) => tag.id).join(',') ?? '',
      language,
    ],
    enabled: Boolean(post && (post.categories?.length || post.tags?.length)),
    queryFn: () => fetchRelatedPosts({ post: post ?? null, language }),
    initialData:
      loaderData.language === language && loaderData.post?.slug === slug
        ? loaderData.relatedPosts
        : undefined,
    staleTime: 60_000,
  })

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
                <div className="h-4 w-32 animate-pulse bg-white/30" />
                <div className="h-10 w-full animate-pulse bg-white/20" />
                <div className="h-4 w-1/2 animate-pulse bg-white/20" />
              </div>
            </div>
          </section>
          <main className="py-20">
            <div className="container mx-auto px-4 lg:px-15">
              <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                <div className="space-y-6">
                  <div className="h-4 w-1/3 animate-pulse bg-gray-200" />
                  <div className="h-4 w-full animate-pulse bg-gray-200" />
                  <div className="h-4 w-5/6 animate-pulse bg-gray-200" />
                  <div className="h-4 w-4/6 animate-pulse bg-gray-200" />
                </div>
                <div className="space-y-6">
                  <div className="h-24 animate-pulse bg-gray-200" />
                  <div className="h-32 animate-pulse bg-gray-200" />
                </div>
              </div>
            </div>
          </main>
        </>
      )}

      {postQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('news.detail.error')}
          </div>
        </div>
      )}

      {!postQuery.isLoading && !postQuery.isError && !post && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('news.detail.notFound')}
          </div>
        </div>
      )}

      {!postQuery.isLoading && !postQuery.isError && post && (
        <>
          <NewsPostHero post={post} dateLabel={dateLabel} />
          <NewsPostBody
            post={post}
            excerpt={excerpt}
            safeBody={safeBody}
            tags={tagsQuery.data ?? []}
            recentPosts={recentPostsQuery.data ?? []}
            relatedPosts={relatedPostsQuery.data ?? []}
            labels={{
              noContent: t('news.detail.noContent'),
              categories: t('news.detail.categories'),
              tags: t('news.detail.tags'),
              relatedTitle: t('news.detail.relatedTitle'),
              recentTitle: t('news.detail.recentTitle'),
              tagsTitle: t('news.detail.tagsTitle'),
            }}
          />
        </>
      )}
    </div>
  )
}
