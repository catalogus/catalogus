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
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { publicSupabase } from '../../lib/supabasePublic'
import {
  SEO_DEFAULTS,
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
  buildSeo,
  toAbsoluteUrl,
} from '../../lib/seo'
import { fetchPublicProfileById } from '../../lib/publicProfiles'
import type { AuthorRow, GalleryImage, PublishedWork, SocialLinks } from '../../types/author'

const attachProfileToAuthor = async (author: AuthorRow) => {
  if (author.claim_status !== 'approved' || !author.profile_id) return author
  const profile = await fetchPublicProfileById(author.profile_id)
  if (!profile) return author
  return {
    ...author,
    name: profile.name ?? author.name,
    bio: profile.bio ?? author.bio,
    photo_url: profile.photo_url ?? author.photo_url,
    photo_path: profile.photo_path ?? author.photo_path,
    social_links: profile.social_links ?? author.social_links,
    profile: {
      id: profile.id,
      name: profile.name ?? author.name,
      bio: profile.bio ?? null,
      photo_url: profile.photo_url ?? null,
      photo_path: profile.photo_path ?? null,
      social_links: profile.social_links ?? null,
      birth_date: profile.birth_date ?? null,
      residence_city: profile.residence_city ?? null,
      province: profile.province ?? null,
      published_works: profile.published_works ?? null,
      author_gallery: profile.author_gallery ?? null,
      featured_video: profile.featured_video ?? null,
      author_type: profile.author_type ?? null,
      status: (profile.status as any) ?? null,
      role: (profile.role as any) ?? null,
    },
  }
}

export const Route = createFileRoute('/autor/$authorId')({
  loader: async ({ params }) => {
    const { authorId } = params
    const selectFields =
      `id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, claim_status, profile_id`

    const { data: bySlug, error: slugError } = await publicSupabase
      .from('authors')
      .select(selectFields)
      .eq('wp_slug', authorId)
      .maybeSingle()
    if (slugError) throw slugError
    if (bySlug) {
      const author = await attachProfileToAuthor(bySlug as AuthorRow)
      return { author, isProfileOnly: false, language: 'pt' as const }
    }

    if (isUuid(authorId)) {
      const { data: byId, error: idError } = await publicSupabase
        .from('authors')
        .select(selectFields)
        .eq('id', authorId)
        .maybeSingle()
      if (idError) throw idError
      if (byId) {
        const author = await attachProfileToAuthor(byId as AuthorRow)
        return { author, isProfileOnly: false, language: 'pt' as const }
      }

      const { data: profileMatch, error: profileError } = await publicSupabase
        .from('public_profiles')
        .select(
          'id, name, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, status, role',
        )
        .eq('id', authorId)
        .eq('role', 'author')
        .maybeSingle()
      if (profileError) throw profileError
      if (profileMatch) {
        return {
          author: mapProfileToAuthor(profileMatch, 'Autor', 'Autor registado'),
          isProfileOnly: true,
          language: 'pt' as const,
        }
      }
    }
    return { author: null, isProfileOnly: false, language: 'pt' as const }
  },
  head: ({ loaderData, params }) => {
    const author = loaderData?.author ?? null
    const slug = author?.wp_slug ?? params.authorId
    const path = `/autor/${slug}`

    if (!author) {
      return buildSeo({
        title: 'Autor nao encontrado',
        description: SEO_DEFAULTS.description,
        path,
        noindex: true,
      })
    }

    const photoUrl = resolvePhotoUrl(author.photo_url, author.photo_path)
    const description = author.bio || SEO_DEFAULTS.description
    const socialLinks = Object.values(author.social_links ?? {}).filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    const canonical = toAbsoluteUrl(path)

    return buildSeo({
      title: author.name,
      description,
      image: photoUrl,
      path,
      type: 'profile',
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Autores', path: '/autores' },
          { name: author.name, path },
        ]),
        buildPersonJsonLd({
          name: author.name,
          description,
          image: photoUrl,
          url: canonical,
          sameAs: socialLinks,
        }),
      ],
    })
  },
  component: AuthorPublicPage,
})

const resolvePhotoUrl = (photoUrl?: string | null, photoPath?: string | null) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return publicSupabase.storage.from('author-photos').getPublicUrl(photoPath).data.publicUrl
  }
  return null
}

const resolveGalleryUrl = (image: GalleryImage) => {
  if (image.url) return image.url
  if (image.path) {
    return publicSupabase.storage.from('author-photos').getPublicUrl(image.path).data.publicUrl
  }
  return ''
}

const resolveWorkCoverUrl = (work: PublishedWork) => {
  if (work.cover_url) return work.cover_url
  if (work.cover_path) {
    return publicSupabase.storage.from('covers').getPublicUrl(work.cover_path).data.publicUrl
  }
  return ''
}

const normalizeText = (value?: string | null) => {
  if (!value) return ''
  return value.trim()
}

const areSameLocation = (first?: string | null, second?: string | null) => {
  const normalizedFirst = normalizeText(first).toLocaleLowerCase()
  const normalizedSecond = normalizeText(second).toLocaleLowerCase()
  return normalizedFirst.length > 0 && normalizedFirst === normalizedSecond
}

const getLocationParts = (city?: string | null, province?: string | null) => {
  const normalizedCity = normalizeText(city)
  const normalizedProvince = normalizeText(province)
  if (!normalizedCity && !normalizedProvince) return [] as string[]
  if (areSameLocation(normalizedCity, normalizedProvince)) return [normalizedCity]
  return [normalizedCity, normalizedProvince].filter(Boolean)
}

const getValidGalleryImages = (gallery?: GalleryImage[] | null) => {
  if (!Array.isArray(gallery)) return [] as Array<{ image: GalleryImage; url: string }>
  return gallery
    .map((image) => ({ image, url: resolveGalleryUrl(image) }))
    .filter(({ url }) => url.length > 0)
}

const formatDate = (value: string | null | undefined, locale: string) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString(locale, {
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

const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

type ProfileAuthor = {
  id: string
  name: string | null
  bio?: string | null
  photo_url?: string | null
  photo_path?: string | null
  social_links?: SocialLinks | null
  birth_date?: string | null
  residence_city?: string | null
  province?: string | null
  published_works?: PublishedWork[] | null
  author_gallery?: GalleryImage[] | null
  featured_video?: string | null
  author_type?: string | null
  status?: string | null
  role?: 'author' | 'customer' | null
}

const mapProfileToAuthor = (
  profile: ProfileAuthor,
  fallbackName: string,
  registeredType: string,
): AuthorRow => ({
  id: profile.id,
  wp_slug: null,
  name: profile.name || fallbackName,
  bio: profile.bio ?? null,
  photo_url: profile.photo_url ?? null,
  photo_path: profile.photo_path ?? null,
  social_links: profile.social_links ?? null,
  birth_date: profile.birth_date ?? null,
  residence_city: profile.residence_city ?? null,
  province: profile.province ?? null,
  published_works: profile.published_works ?? null,
  author_gallery: profile.author_gallery ?? null,
  featured_video: profile.featured_video ?? null,
  author_type: profile.author_type ?? registeredType,
  profile_id: profile.id,
  claim_status: profile.status === 'approved' ? 'approved' : 'pending',
  profile: {
    id: profile.id,
    name: profile.name || fallbackName,
    bio: profile.bio ?? null,
    photo_url: profile.photo_url ?? null,
    photo_path: profile.photo_path ?? null,
    social_links: profile.social_links ?? null,
    birth_date: profile.birth_date ?? null,
    residence_city: profile.residence_city ?? null,
    province: profile.province ?? null,
    published_works: profile.published_works ?? null,
    author_gallery: profile.author_gallery ?? null,
    featured_video: profile.featured_video ?? null,
    author_type: profile.author_type ?? null,
    status: (profile.status as 'pending' | 'approved' | 'rejected' | null) ?? null,
    role: profile.role ?? null,
  },
})

type AuthorResult = {
  author: AuthorRow | null
  isProfileOnly: boolean
}

function AuthorPublicPage() {
  const { authorId } = Route.useParams()
  const { t, i18n } = useTranslation()
  const loaderData = Route.useLoaderData()
  const fallbackName = t('authors.listing.fallbackName')
  const registeredType = t('authors.listing.registeredType')
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'
  const currentLanguage = i18n.language === 'en' ? 'en' : 'pt'

  const authorQuery = useQuery<AuthorResult>({
    queryKey: ['author', authorId, i18n.language],
    queryFn: async () => {
      const selectFields =
        `id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, claim_status, profile_id`

      const { data: bySlug, error: slugError } = await publicSupabase
        .from('authors')
        .select(selectFields)
        .eq('wp_slug', authorId)
        .maybeSingle()
      if (slugError) throw slugError
      if (bySlug) {
        const author = await attachProfileToAuthor(bySlug as AuthorRow)
        return { author, isProfileOnly: false }
      }

      if (isUuid(authorId)) {
        const { data: byId, error: idError } = await publicSupabase
          .from('authors')
          .select(selectFields)
          .eq('id', authorId)
          .maybeSingle()
      if (idError) throw idError
      if (byId) {
        const author = await attachProfileToAuthor(byId as AuthorRow)
        return { author, isProfileOnly: false }
      }

        const { data: profileMatch, error: profileError } = await publicSupabase
          .from('public_profiles')
          .select(
            'id, name, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, status, role',
          )
          .eq('id', authorId)
          .eq('role', 'author')
          .maybeSingle()
        if (profileError) throw profileError
        if (profileMatch) {
          return {
            author: mapProfileToAuthor(profileMatch, fallbackName, registeredType),
            isProfileOnly: true,
          }
        }
      }
      return { author: null, isProfileOnly: false }
    },
    initialData:
      loaderData.language === currentLanguage ? {
        author: loaderData.author,
        isProfileOnly: loaderData.isProfileOnly,
      } : undefined,
    staleTime: 60_000,
  })

  const author = authorQuery.data?.author ?? null
  const heroPhoto = resolvePhotoUrl(author?.photo_url, author?.photo_path)
  const socialLinks = getSocialLinks(author)
  const birthDateLabel = formatDate(author?.birth_date, locale)
  const embedUrl = buildEmbedUrl(author?.featured_video)
  const locationParts = getLocationParts(author?.residence_city, author?.province)
  const galleryItems = getValidGalleryImages(author?.author_gallery)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {authorQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-72 rounded-none border border-gray-200 bg-gray-100 animate-pulse" />
        </div>
      )}

      {authorQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('authorDetail.error')}
          </div>
        </div>
      )}

      {!authorQuery.isLoading && !authorQuery.isError && !author && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
            {t('authorDetail.notFound')}
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
                    {t('authorDetail.heroLabel')}
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
                      {t('authorDetail.breadcrumb.home')}
                    </a>{' '}
                    /{' '}
                    <a href="/autores" className="hover:text-white">
                      {t('authorDetail.breadcrumb.authors')}
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
                      {locationParts.length > 0 && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{locationParts.join(', ')}</span>
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
                        {t('authorDetail.socialTitle')}
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
                        {t('authorDetail.bio.label')}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                        {t('authorDetail.bio.title')}
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
                              {t('authorDetail.works.label')}
                            </p>
                            <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                              {t('authorDetail.works.title')}
                            </h2>
                          </div>
                        </div>

                        <div className="mt-8 grid gap-6 md:grid-cols-2">
                          {(author.published_works as PublishedWork[]).map(
                            (work, index) => {
                              const workCoverUrl = resolveWorkCoverUrl(work)
                              return (
                                <article
                                  key={`${work.title}-${index}`}
                                  className=""
                                >
                                  <div className="flex gap-5">
                                    {workCoverUrl ? (
                                      <img
                                        src={workCoverUrl}
                                        alt={work.title}
                                        className="h-52 w-36 shrink-0 object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="h-52 w-36 shrink-0 bg-gray-200" />
                                    )}
                                    <div className="flex-1 space-y-2">
                                      <h3 className="text-lg capitalize font-semibold text-gray-900">
                                        {work.title}
                                      </h3>
                                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                                        {work.genre}
                                      </p>
                                      <p className="text-base leading-relaxed text-gray-600">
                                        {work.synopsis}
                                      </p>
                                      {work.link && (
                                        <a
                                          href={work.link}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs uppercase tracking-[0.2em] text-gray-900 hover:underline"
                                        >
                                          {t('authorDetail.works.cta')}
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                </article>
                              )
                            },
                          )}
                        </div>
                      </div>
                    )}

                  {galleryItems.length > 0 && (
                      <div className="border border-gray-200 bg-white p-8 rounded-none">
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                          {t('authorDetail.gallery.label')}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                          {t('authorDetail.gallery.title')}
                        </h2>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {galleryItems.map(({ image, url }, index) => (
                            <figure
                              key={`${url}-${index}`}
                              className="group overflow-hidden bg-[#f4efe9]"
                            >
                              <img
                                src={url}
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
                          ))}
                        </div>
                      </div>
                    )}

                  {author.featured_video && (
                    <div className="border border-gray-200 bg-white p-8 rounded-none">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
                        {t('authorDetail.video.label')}
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                        {t('authorDetail.video.title')}
                      </h2>
                      <div className="mt-6">
                        {embedUrl ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-black">
                            <iframe
                              src={embedUrl}
                              title={t('authorDetail.video.frameTitle', {
                                name: author.name,
                              })}
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
                            {t('authorDetail.video.watch')}
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
