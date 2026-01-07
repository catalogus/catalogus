import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode } from 'react'
import Header from '../../components/Header'
import { supabase } from '../../lib/supabaseClient'
import type { PostRow } from '../../types/post'

export const Route = createFileRoute('/noticias/$slug')({
  component: NewsPostDetailPage,
})

type CategoryLink = {
  id: string
  name: string
  slug: string
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

const formatPostDate = (value: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('pt-PT', {
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
  const { slug } = Route.useParams()

  const postQuery = useQuery({
    queryKey: ['news-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          title,
          slug,
          excerpt,
          body,
          featured_image_url,
          published_at,
          created_at,
          author_id,
          view_count,
          categories:post_categories_map(category:post_categories(id, name, slug)),
          tags:post_tags_map(tag:post_tags(id, name, slug))
        `,
        )
        .eq('status', 'published')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      if (!data) return null

      const categories =
        data.categories?.map((entry: any) => entry.category).filter(Boolean) ?? []
      const tags = data.tags?.map((entry: any) => entry.tag).filter(Boolean) ?? []

      let author = null
      if (data.author_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, email, photo_url')
          .eq('id', data.author_id)
          .maybeSingle()
        if (!profileError) {
          author = profile
        }
      }

      return {
        ...data,
        categories,
        tags,
        author,
      } as PostRow
    },
    staleTime: 60_000,
  })

  const tagsQuery = useQuery({
    queryKey: ['post-tags', 'public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('post_tags')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name', { ascending: true })
        .limit(12)
      if (error) throw error
      return (data ?? []) as TagLink[]
    },
    staleTime: 60_000,
  })

  const recentPostsQuery = useQuery({
    queryKey: ['news-posts', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, featured_image_url, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(4)
      if (error) throw error
      return (data ?? []) as RelatedPost[]
    },
    staleTime: 60_000,
  })

  const post = postQuery.data
  const categoryIds = post?.categories?.map((category) => category.id) ?? []
  const tagIds = post?.tags?.map((tag) => tag.id) ?? []

  const relatedPostsQuery = useQuery({
    queryKey: ['news-post', slug, 'related', categoryIds.join(','), tagIds.join(',')],
    enabled: Boolean(post && (categoryIds.length || tagIds.length)),
    queryFn: async () => {
      if (!post) return [] as RelatedPost[]
      const relatedIds = new Set<string>()

      if (categoryIds.length > 0) {
        const { data, error } = await supabase
          .from('post_categories_map')
          .select('post_id')
          .in('category_id', categoryIds)
        if (error) throw error
        data?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

      if (tagIds.length > 0) {
        const { data, error } = await supabase
          .from('post_tags_map')
          .select('post_id')
          .in('tag_id', tagIds)
        if (error) throw error
        data?.forEach((entry: any) => relatedIds.add(entry.post_id))
      }

      relatedIds.delete(post.id)
      const relatedList = Array.from(relatedIds)
      if (relatedList.length === 0) return [] as RelatedPost[]

      const { data, error } = await supabase
        .from('posts')
        .select(
          `
          id,
          title,
          slug,
          featured_image_url,
          published_at,
          created_at,
          categories:post_categories_map(category:post_categories(name, slug))
        `,
        )
        .eq('status', 'published')
        .in('id', relatedList)
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error

      return (data ?? []).map((entry: any) => ({
        ...entry,
        categories:
          entry.categories?.map((categoryEntry: any) => categoryEntry.category).filter(Boolean) ??
          [],
      })) as RelatedPost[]
    },
    staleTime: 60_000,
  })

  const primaryCategory = post?.categories?.[0]
  const featuredImage = post?.featured_image_url
  const dateLabel = formatPostDate(post?.published_at ?? post?.created_at ?? null)
  const excerpt = post?.excerpt?.trim() || buildExcerpt(post?.body)

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
            Falha ao carregar esta noticia. Tente novamente.
          </div>
        </div>
      )}

      {!postQuery.isLoading && !postQuery.isError && !post && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            Noticia nao encontrada.
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
                      className={`${getCategoryBadgeClass(primaryCategory.slug || primaryCategory.name)} inline-flex px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`}
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
                  
                  {post.body ? (
                    <div
                      className="post-content text-gray-700"
                      dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                  ) : (
                    <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
                      Este post ainda nao tem conteudo publicado.
                    </div>
                  )}

                  {(post.categories?.length || post.tags?.length) && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                            Categorias
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
                            Tags
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
                              alt={post.author.name ?? 'Autor'}
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
                            Autor
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {post.author.name ?? 'Equipe'}
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
                            Posts relacionados
                          </h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                          {relatedPostsQuery.data?.map((related) => {
                            const relatedCategory = related.categories?.[0]
                            const relatedCategoryClass = relatedCategory
                              ? getCategoryBadgeClass(
                                  relatedCategory.slug || relatedCategory.name,
                                )
                              : ''
                            const relatedDate = formatPostDate(
                              related.published_at ?? related.created_at,
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
                  <SidebarCard title="Pesquisar">
                    <form action="/noticias" method="get" className="flex gap-2">
                      <input
                        type="search"
                        name="q"
                        placeholder="Buscar..."
                        className="w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none rounded-none"
                      />
                      <button
                        type="submit"
                        className="bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] rounded-none"
                      >
                        Ir
                      </button>
                    </form>
                  </SidebarCard>

                  <SidebarCard title="Noticias recentes">
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
                      <p className="text-sm text-gray-600">Falha ao carregar noticias.</p>
                    )}
                    {!recentPostsQuery.isLoading &&
                      !recentPostsQuery.isError &&
                      (recentPostsQuery.data ?? []).length === 0 && (
                        <p className="text-sm text-gray-600">Sem noticias publicadas.</p>
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
                                  )}
                                </div>
                              </li>
                            ))}
                        </ul>
                      )}
                  </SidebarCard>

                  <SidebarCard title="Tags">
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
                      <p className="text-sm text-gray-600">Falha ao carregar tags.</p>
                    )}
                    {!tagsQuery.isLoading &&
                      !tagsQuery.isError &&
                      (tagsQuery.data ?? []).length === 0 && (
                        <p className="text-sm text-gray-600">Sem tags disponiveis.</p>
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
