import type { ReactNode } from 'react'
import { getCategoryBadgeClass, type RelatedPost, type TagLink, type CategoryLink } from './newsPostData'
import type { PostRow } from '@/types/post'

export const SidebarCard = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="rounded-none border border-gray-200 bg-white p-6">
    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-600">{title}</h3>
    <div className="mt-4">{children}</div>
  </div>
)

type NewsPostHeroProps = {
  post: PostRow
  dateLabel: string
}

export function NewsPostHero({ post, dateLabel }: NewsPostHeroProps) {
  const primaryCategory = post.categories?.[0] as CategoryLink | undefined
  const featuredImage = post.featured_image_url

  return (
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
                  primaryCategory.slug_base || primaryCategory.slug || primaryCategory.name_base || primaryCategory.name,
                )} inline-flex rounded-none px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]`}
              >
                {primaryCategory.name}
              </span>
            )}
            <h1 className="text-2xl font-semibold leading-tight md:text-4xl">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.3em] text-white/70">
              {dateLabel && <span>{dateLabel}</span>}
              {post.author?.name && <span>{post.author.name}</span>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type NewsPostBodyProps = {
  post: PostRow
  excerpt: string
  safeBody: string
  tags: TagLink[]
  recentPosts: RelatedPost[]
  relatedPosts: RelatedPost[]
  labels: Record<string, string>
}

export function NewsPostBody({
  post,
  excerpt,
  safeBody,
  tags,
  recentPosts,
  relatedPosts,
  labels,
}: NewsPostBodyProps) {
  return (
    <main className="py-20">
      <div className="container mx-auto px-4 lg:px-15">
        <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
          <article className="space-y-10">
            {excerpt && <p className="text-lg leading-relaxed text-gray-700">{excerpt}</p>}

            {safeBody ? (
              <div className="post-content text-gray-700" dangerouslySetInnerHTML={{ __html: safeBody }} />
            ) : (
              <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">{labels.noContent}</div>
            )}

            {(post.categories?.length || post.tags?.length) && (
              <div className="space-y-4 border-t border-gray-200 pt-6">
                {post.categories && post.categories.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{labels.categories}</span>
                    {post.categories.map((category: any) => (
                      <a
                        key={category.id}
                        href={`/noticias?categoria=${category.slug}`}
                        className="rounded-none border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400"
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">{labels.tags}</span>
                    {post.tags.map((tag: any) => (
                      <a
                        key={tag.id}
                        href={`/noticias?tag=${tag.slug}`}
                        className="rounded-none border border-gray-200 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {relatedPosts.length > 0 && (
              <section className="space-y-6 border-t border-gray-200 pt-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">{labels.relatedTitle}</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {relatedPosts.map((related) => (
                    <a key={related.id} href={`/noticias/${related.slug}`} className="group block border border-gray-200 bg-white transition-colors hover:border-gray-900">
                      <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                        {related.featured_image_url ? (
                          <img src={related.featured_image_url} alt={related.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs uppercase tracking-[0.3em] text-gray-400">
                            Catalogus
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 p-5">
                        {related.categories?.[0] && (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                            {related.categories[0].name}
                          </span>
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{related.title}</h3>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-6">
            <SidebarCard title={labels.recentTitle}>
              <div className="space-y-4">
                {recentPosts.map((item) => (
                  <a key={item.id} href={`/noticias/${item.slug}`} className="block border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  </a>
                ))}
              </div>
            </SidebarCard>

            <SidebarCard title={labels.tagsTitle}>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <a
                    key={tag.id}
                    href={`/noticias?tag=${tag.slug}`}
                    className="rounded-none border border-gray-200 px-3 py-2 text-xs uppercase tracking-[0.2em] text-gray-700 transition-colors hover:border-gray-400"
                  >
                    {tag.name}
                  </a>
                ))}
              </div>
            </SidebarCard>
          </aside>
        </div>
      </div>
    </main>
  )
}
