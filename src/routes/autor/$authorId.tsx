import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Calendar,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Twitter,
  Youtube,
} from 'lucide-react'
import Header from '../../components/Header'
import { supabase } from '../../lib/supabaseClient'
import type { AuthorRow, GalleryImage, PublishedWork } from '../../types/author'

export const Route = createFileRoute('/autor/$authorId')({
  component: AuthorPublicPage,
})

const resolvePhotoUrl = (photoUrl?: string | null, photoPath?: string | null) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return supabase.storage.from('author-photos').getPublicUrl(photoPath).data.publicUrl
  }
  return null
}

const resolveGalleryUrl = (image: GalleryImage) => {
  if (image.url) return image.url
  if (image.path) {
    return supabase.storage.from('author-photos').getPublicUrl(image.path).data.publicUrl
  }
  return ''
}

const formatDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const extractVideoUrl = (value?: string | null) => {
  if (!value) return null
  const trimmed = value.trim()
  const iframeMatch = trimmed.match(/<iframe[^>]+src=["']([^"']+)["']/i)
  if (iframeMatch?.[1]) return iframeMatch[1]
  const srcMatch = trimmed.match(/src=["']([^"']+)["']/i)
  if (srcMatch?.[1]) return srcMatch[1]
  if (trimmed.startsWith('<')) return null
  return trimmed
}

const buildEmbedUrl = (value?: string | null) => {
  const rawUrl = extractVideoUrl(value)
  if (!rawUrl) return null
  const normalized = rawUrl.startsWith('//') ? `https:${rawUrl}` : rawUrl
  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    return null
  }
  const hostname = parsed.hostname.replace(/^www\./, '')
  if (hostname === 'youtu.be') {
    const id = parsed.pathname.slice(1)
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (hostname.endsWith('youtube.com') || hostname.endsWith('youtube-nocookie.com')) {
    const pathParts = parsed.pathname.split('/').filter(Boolean)
    const pathId =
      pathParts[0] === 'embed' || pathParts[0] === 'shorts' ? pathParts[1] : null
    const id = parsed.searchParams.get('v') || pathId
    return id ? `https://www.youtube.com/embed/${id}` : null
  }
  if (hostname === 'player.vimeo.com' || hostname.endsWith('vimeo.com')) {
    const parts = parsed.pathname.split('/').filter(Boolean)
    const id = parts[parts.length - 1]
    return id ? `https://player.vimeo.com/video/${id}` : null
  }
  return null
}

const getSocialLinks = (author: AuthorRow | null) => {
  const links = author?.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    { key: 'linkedin', href: links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'facebook', href: links.facebook, icon: Facebook, label: 'Facebook' },
    { key: 'instagram', href: links.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item) => item.href)
}

function AuthorPublicPage() {
  const { authorId } = Route.useParams()

  const authorQuery = useQuery({
    queryKey: ['author', authorId],
    queryFn: async () => {
      const selectFields =
        'id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video'

      const { data: bySlug, error: slugError } = await supabase
        .from('authors')
        .select(selectFields)
        .eq('wp_slug', authorId)
        .maybeSingle()
      if (slugError) throw slugError
      if (bySlug) return bySlug as AuthorRow

      const { data: byId, error: idError } = await supabase
        .from('authors')
        .select(selectFields)
        .eq('id', authorId)
        .maybeSingle()
      if (idError) throw idError
      return (byId as AuthorRow | null) ?? null
    },
    staleTime: 60_000,
  })

  const author = authorQuery.data ?? null
  const heroPhoto = resolvePhotoUrl(author?.photo_url, author?.photo_path)
  const socialLinks = getSocialLinks(author)
  const birthDateLabel = formatDate(author?.birth_date)
  const embedUrl = buildEmbedUrl(author?.featured_video)

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      {authorQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      )}

      {authorQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            Falha ao carregar o autor. Tente novamente.
          </div>
        </div>
      )}

      {!authorQuery.isLoading && !authorQuery.isError && !author && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            Autor não encontrado.
          </div>
        </div>
      )}

      {!authorQuery.isLoading && !authorQuery.isError && author && (
        <>
          <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
            {heroPhoto && (
              <img
                src={heroPhoto}
                alt={author.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
            <div className="relative z-10">
              <div className="container mx-auto px-4 py-24 lg:px-15">
                <div className="max-w-3xl space-y-5">
                  <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                    Autor em destaque
                  </p>
                  <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                    {author.name}
                  </h1>
                  {author.author_type && (
                    <p className="text-base uppercase tracking-[0.3em] text-white/70">
                      {author.author_type}
                    </p>
                  )}
                  <div className="text-xs uppercase tracking-[0.3em] text-white/60">
                    <a href="/" className="hover:text-white">
                      Home
                    </a>{' '}
                    /{' '}
                    <a href="/autores" className="hover:text-white">
                      Autores
                    </a>{' '}
                    / {author.name}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <main className="py-20">
            <div className="container mx-auto px-4 lg:px-15">
              <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
                <aside className="space-y-8">
                  <div className="border border-gray-200 bg-white p-6 rounded-none">
                    <div className="aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec]">
                      {heroPhoto ? (
                        <img
                          src={heroPhoto}
                          alt={author.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-5xl font-semibold text-gray-300">
                          {author.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-gray-600">
                      {author.residence_city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{author.residence_city}</span>
                        </div>
                      )}
                      {author.province && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{author.province}</span>
                        </div>
                      )}
                      {birthDateLabel && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{birthDateLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="border border-gray-200 bg-white p-6 rounded-none">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Redes sociais
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {socialLinks.map((item) => {
                          const Icon = item.icon
                          return (
                            <a
                              key={item.key}
                              href={item.href}
                              target="_blank"
                              rel="noreferrer"
                              className="flex h-10 w-10 items-center justify-center border border-gray-200 text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                              aria-label={item.label}
                            >
                              <Icon className="h-4 w-4" />
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </aside>

                <section className="space-y-10">
                  {author.bio && (
                    <div className="border border-gray-200 bg-white p-8 rounded-none">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Biografia
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                        Conheça o autor
                      </h2>
                      <p className="mt-4 text-base leading-relaxed text-gray-700">
                        {author.bio}
                      </p>
                    </div>
                  )}

                  {Array.isArray(author.published_works) &&
                    author.published_works.length > 0 && (
                      <div className="border border-gray-200 bg-white p-8 rounded-none">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                              Obras publicadas
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                              Bibliografia selecionada
                            </h2>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                          {(author.published_works as PublishedWork[]).map(
                            (work, index) => (
                              <article
                                key={`${work.title}-${index}`}
                                className="border border-gray-200 bg-[#fdfbf7] p-5 rounded-none"
                              >
                                <div className="flex gap-4">
                                  {work.cover_url ? (
                                    <img
                                      src={work.cover_url}
                                      alt={work.title}
                                      className="h-24 w-16 object-cover"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="h-24 w-16 bg-gray-200" />
                                  )}
                                  <div className="flex-1 space-y-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {work.title}
                                    </h3>
                                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                                      {work.genre}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {work.synopsis}
                                    </p>
                                    {work.link && (
                                      <a
                                        href={work.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs uppercase tracking-[0.2em] text-gray-900 hover:underline"
                                      >
                                        Ver obra
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </article>
                            ),
                          )}
                        </div>
                      </div>
                    )}

                  {Array.isArray(author.author_gallery) &&
                    author.author_gallery.length > 0 && (
                      <div className="border border-gray-200 bg-white p-8 rounded-none">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                          Galeria do autor
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                          Momentos e bastidores
                        </h2>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {(author.author_gallery as GalleryImage[]).map(
                            (image, index) => {
                              const imageUrl = resolveGalleryUrl(image)
                              if (!imageUrl) return null
                              return (
                                <figure
                                  key={`${imageUrl}-${index}`}
                                  className="group overflow-hidden bg-[#f4efe9]"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={image.caption || author.name}
                                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    loading="lazy"
                                  />
                                  {image.caption && (
                                    <figcaption className="px-3 py-2 text-xs text-gray-600">
                                      {image.caption}
                                    </figcaption>
                                  )}
                                </figure>
                              )
                            },
                          )}
                        </div>
                      </div>
                    )}

                  {author.featured_video && (
                    <div className="border border-gray-200 bg-white p-8 rounded-none">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        Video em destaque
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                        Conversa com o autor
                      </h2>
                      <div className="mt-6">
                        {embedUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-black">
                            <iframe
                              src={embedUrl}
                              title={`Video de ${author.name}`}
                              className="absolute inset-0 h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <a
                            href={author.featured_video}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-gray-900 hover:underline"
                          >
                            Assistir video
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  )
}
