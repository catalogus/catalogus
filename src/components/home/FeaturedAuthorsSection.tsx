import { useQuery } from '@tanstack/react-query'
import { Globe, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import type { SocialLinks } from '../../types/author'

type FeaturedAuthor = {
  id: string
  name: string
  author_type: string | null
  photo_url: string | null
  photo_path: string | null
  social_links?: SocialLinks | null
}

const photoUrlFor = (author: FeaturedAuthor) => {
  if (author.photo_url) return author.photo_url
  if (author.photo_path) {
    return supabase.storage.from('author-photos').getPublicUrl(author.photo_path)
      .data.publicUrl
  }
  return null
}

const fetchAuthors = async (useFeatured: boolean) => {
  const selectFields = useFeatured
    ? 'id, name, author_type, photo_url, photo_path, social_links, featured'
    : 'id, name, author_type, photo_url, photo_path, social_links'
  let query = supabase
    .from('profiles')
    .select(selectFields)
    .eq('role', 'author')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(4)

  if (useFeatured) {
    query = query.eq('featured', true)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as FeaturedAuthor[]
}

const getSocialLinks = (author: FeaturedAuthor) => {
  const links = author.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'linkedin', href: links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'instagram', href: links.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item) => item.href)
}

export default function FeaturedAuthorsSection() {
  const authorsQuery = useQuery({
    queryKey: ['home', 'featured-authors'],
    queryFn: async () => {
      try {
        return await fetchAuthors(true)
      } catch (error: any) {
        if (error?.code === '42703' || /featured/i.test(error?.message ?? '')) {
          return await fetchAuthors(false)
        }
        throw error
      }
    },
    staleTime: 60_000,
  })

  return (
    <section className="bg-[#f4efe9] text-gray-900">
      <div className="container mx-auto px-4 py-24 lg:px-15">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
            Autores
          </p>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Autores em destaque
            </h2>
            <div className="mt-3 h-1 w-12 bg-[#f97316]" />
          </div>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {authorsQuery.isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`featured-author-skeleton-${index}`} className="space-y-4">
                <div className="aspect-[4/5] w-full bg-gray-100 animate-pulse" />
                <div className="h-5 w-2/3 bg-gray-200 animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 animate-pulse" />
              </div>
            ))}

          {authorsQuery.isError && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
              Falha ao carregar autores em destaque.
            </div>
          )}

          {!authorsQuery.isLoading &&
            !authorsQuery.isError &&
            (authorsQuery.data ?? []).map((author) => {
              const photoUrl = photoUrlFor(author)
              const typeLabel = author.author_type || 'Autor'
              const socialLinks = getSocialLinks(author)
              return (
                <div key={author.id} className="space-y-3">
                  <div className="group relative aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec] rounded-none">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={author.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-gray-300">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {socialLinks.length > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        {socialLinks.map((item) => {
                          const Icon = item.icon
                          return (
                            <a
                              key={item.key}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-10 w-10 items-center justify-center bg-white text-gray-900 transition-transform hover:scale-105"
                              aria-label={item.label}
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {author.name}
                    </h3>
                    <p className="text-sm text-gray-600">{typeLabel}</p>
                  </div>
                </div>
              )
            })}

          {!authorsQuery.isLoading &&
            !authorsQuery.isError &&
            (authorsQuery.data?.length ?? 0) === 0 && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
                Sem autores em destaque.
              </div>
            )}
        </div>
      </div>
    </section>
  )
}
