import { createFileRoute } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import Header from '../../components/Header'
import { supabase } from '../../lib/supabaseClient'
import {
  formatPostDate,
  getCategoryBadgeClass,
  buildExcerpt,
} from '../../lib/newsHelpers'

export const Route = createFileRoute('/noticias/')({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
    categoria: typeof search.categoria === 'string' ? search.categoria : undefined,
    tag: typeof search.tag === 'string' ? search.tag : undefined,
  }),
  component: NewsListingPage,
})

type NewsPost = {
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
    } | null
  }[] | null
}

function NewsListingPage() {
  const { q, categoria, tag } = Route.useSearch()

  const postsQuery = useInfiniteQuery({
    queryKey: ['news-posts', 'listing', q, categoria, tag],
    queryFn: async ({ pageParam = 1 }) => {
      let query = supabase
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
          categories:post_categories_map(category:post_categories(name, slug))
        `,
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      // Apply search filter
      if (q) {
        query = query.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      }

      // Apply category filter
      if (categoria) {
        const { data: categoryData } = await supabase
          .from('post_categories')
          .select('id')
          .eq('slug', categoria)
          .maybeSingle()

        if (categoryData) {
          const { data: postIds } = await supabase
            .from('post_categories_map')
            .select('post_id')
            .eq('category_id', categoryData.id)

          const ids = postIds?.map((p) => p.post_id) ?? []
          if (ids.length > 0) {
            query = query.in('id', ids)
          } else {
            return { posts: [], hasMore: false }
          }
        } else {
          return { posts: [], hasMore: false }
        }
      }

      // Apply tag filter
      if (tag) {
        const { data: tagData } = await supabase
          .from('post_tags')
          .select('id')
          .eq('slug', tag)
          .maybeSingle()

        if (tagData) {
          const { data: postIds } = await supabase
            .from('post_tags_map')
            .select('post_id')
            .eq('tag_id', tagData.id)

          const ids = postIds?.map((p) => p.post_id) ?? []
          if (ids.length > 0) {
            query = query.in('id', ids)
          } else {
            return { posts: [], hasMore: false }
          }
        } else {
          return { posts: [], hasMore: false }
        }
      }

      // Pagination
      const from = (pageParam - 1) * 6
      const to = from + 5 // 6 posts per page
      const { data, error } = await query.range(from, to)

      if (error) throw error

      const posts: NewsPost[] =
        data?.map((entry: any) => ({
          ...entry,
          categories:
            entry.categories?.map((c: any) => ({
              category: c.category,
            })) ?? [],
        })) ?? []

      return {
        posts,
        hasMore: posts.length === 6,
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 60_000,
  })

  const allPosts = postsQuery.data?.pages.flatMap((page) => page.posts) ?? []

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
        {/* Static gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/10" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-24 lg:px-15">
            <div className="max-w-3xl space-y-5">
              <h1 className="text-2xl font-semibold leading-tight md:text-4xl">
                Notícias
              </h1>
              {/* Show active filters */}
              {(q || categoria || tag) && (
                <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  {q && <span>Pesquisa: "{q}"</span>}
                  {categoria && <span>Categoria: {categoria}</span>}
                  {tag && <span>Tag: {tag}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-4 lg:px-15">
          {/* Loading State */}
          {postsQuery.isLoading && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5"
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {postsQuery.isError && (
            <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Falha ao carregar as notícias. Tente novamente.
            </div>
          )}

          {/* Empty State */}
          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            allPosts.length === 0 && (
              <div className="rounded-none border border-white/10 bg-white/5 p-6 text-sm text-white/70">
                Nenhuma notícia encontrada.
              </div>
            )}

          {/* Posts Grid */}
          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            allPosts.length > 0 && (
              <>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {allPosts.map((post) => {
                    const category = post.categories?.[0]?.category
                    const dateLabel = formatPostDate(
                      post.published_at ?? post.created_at,
                    )
                    const excerpt =
                      post.excerpt?.trim() || buildExcerpt(post.body)
                    const categoryClass = category?.slug
                      ? getCategoryBadgeClass(category.slug)
                      : category?.name
                        ? getCategoryBadgeClass(category.name)
                        : ''

                    return (
                      <a
                        key={post.id}
                        href={`/noticias/${post.slug}`}
                        className="group relative flex min-h-105 flex-col justify-end overflow-hidden rounded-none border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1"
                      >
                        {/* Background Image or Fallback Gradient */}
                        {post.featured_image_url ? (
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                        )}

                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

                        {/* Category Badge */}
                        {category && (
                          <span
                            className={`${categoryClass} absolute left-4 top-4 rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`}
                          >
                            {category.name}
                          </span>
                        )}

                        {/* Content Section */}
                        <div className="relative z-10 space-y-3 p-6 text-white">
                          <h3 className="text-xl font-semibold leading-snug md:text-2xl">
                            {post.title}
                          </h3>

                          {/* Excerpt (2 lines max) */}
                          {excerpt && (
                            <p className="line-clamp-2 text-sm leading-relaxed text-white/90">
                              {excerpt}
                            </p>
                          )}

                          <div className="text-xs uppercase tracking-[0.2em] text-white/80">
                            {dateLabel}
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>

                {/* Load More Button */}
                {postsQuery.hasNextPage && (
                  <div className="mt-12 flex justify-center">
                    <button
                      type="button"
                      onClick={() => postsQuery.fetchNextPage()}
                      disabled={postsQuery.isFetchingNextPage}
                      className="rounded-none bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {postsQuery.isFetchingNextPage
                        ? 'Carregando...'
                        : 'Carregar mais'}
                    </button>
                  </div>
                )}

                {/* Loading More Indicator */}
                {postsQuery.isFetchingNextPage && (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div
                        key={`loading-more-${index}`}
                        className="h-[420px] animate-pulse rounded-none border border-white/10 bg-white/5"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
        </div>
      </main>
    </div>
  )
}
