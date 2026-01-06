import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import type { PostRow } from '../../types/post'

type NewsPost = Pick<
  PostRow,
  'id' | 'title' | 'slug' | 'featured_image_url' | 'published_at' | 'created_at'
> & {
  categories?: { category?: { name?: string | null; slug?: string | null } | null }[] | null
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

export default function NewsSection() {
  const postsQuery = useQuery({
    queryKey: ['home', 'latest-posts'],
    queryFn: async () => {
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
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(4)
      if (error) throw error
      return (data ?? []) as NewsPost[]
    },
    staleTime: 60_000,
  })

  return (
    <section className="bg-[#050505] text-white">
      <div className="container mx-auto px-4 py-32 lg:px-15">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">
              Fique a par
            </p>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Últimas Notícias
            </h2>
          </div>
          <a
            href="/noticias"
            className="inline-flex items-center gap-3 border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:border-white hover:text-white rounded-none"
          >
            Ver todas as atualizações
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {postsQuery.isLoading && (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`news-skeleton-${index}`}
                  className="h-[420px] bg-white/5 border border-white/10 rounded-none animate-pulse"
                />
              ))}
            </>
          )}

          {postsQuery.isError && (
            <div className="border border-white/10 bg-white/5 p-6 text-sm text-white/70 rounded-none">
              Falha ao carregar as notícias.
            </div>
          )}

          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            (postsQuery.data ?? []).map((post) => {
              const href = post.slug ? `/noticias/${post.slug}` : '/noticias'
              const dateLabel = formatPostDate(
                post.published_at ?? post.created_at,
              )
              const category = post.categories?.[0]?.category
              const categoryLabel = category?.name
              const categoryClass = category?.slug
                ? getCategoryBadgeClass(category.slug)
                : categoryLabel
                  ? getCategoryBadgeClass(categoryLabel)
                  : ''
              return (
                <a
                  key={post.id}
                  href={href}
                  className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden border border-white/10 bg-white/5 text-left transition-transform hover:-translate-y-1 rounded-none"
                >
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                  {categoryLabel && (
                    <span
                      className={`${categoryClass} absolute left-4 top-4 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] rounded-none`}
                    >
                      {categoryLabel}
                    </span>
                  )}

                  <div className="relative z-10 space-y-4 p-6">
                    <h3 className="text-xl font-semibold leading-snug text-white md:text-2xl">
                      {post.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/80">
                      <span>{dateLabel}</span>
                    </div>
                  </div>
                </a>
              )
            })}

          {!postsQuery.isLoading &&
            !postsQuery.isError &&
            (postsQuery.data?.length ?? 0) === 0 && (
              <div className="border border-white/10 bg-white/5 p-6 text-sm text-white/70 rounded-none">
                Sem noticias publicadas.
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
