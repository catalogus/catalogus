import type { AuthorRow, GalleryImage, PublishedWork } from '@/types/author'
import {
  buildEmbedUrl,
  Calendar,
  formatDate,
  getSocialLinks,
  MapPin,
  resolveGalleryUrl,
  resolvePhotoUrl,
} from './authorDetailData'

type AuthorDetailHeroProps = {
  author: AuthorRow
  heroLabel: string
  homeLabel: string
  authorsLabel: string
}

export function AuthorDetailHero({ author, heroLabel, homeLabel, authorsLabel }: AuthorDetailHeroProps) {
  const heroPhoto = resolvePhotoUrl(author.photo_url, author.photo_path)

  return (
    <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
      {heroPhoto && (
        <img src={heroPhoto} alt={author.name} className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">{heroLabel}</p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{author.name}</h1>
            {author.author_type && (
              <p className="text-base uppercase tracking-[0.3em] text-white/70">{author.author_type}</p>
            )}
            <div className="text-xs uppercase tracking-[0.3em] text-white/60">
              <a href="/" className="hover:text-white">
                {homeLabel}
              </a>{' '}
              /{' '}
              <a href="/autores" className="hover:text-white">
                {authorsLabel}
              </a>{' '}
              / {author.name}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

type AuthorDetailBodyProps = {
  author: AuthorRow
  locale: string
  labels: Record<string, string>
}

export function AuthorDetailBody({ author, locale, labels }: AuthorDetailBodyProps) {
  const heroPhoto = resolvePhotoUrl(author.photo_url, author.photo_path)
  const socialLinks = getSocialLinks(author)
  const birthDateLabel = formatDate(author.birth_date, locale)
  const embedUrl = buildEmbedUrl(author.featured_video)

  return (
    <main className="py-20">
      <div className="container mx-auto px-4 lg:px-15">
        <div className="grid gap-12 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-8">
            <div className="border border-gray-200 bg-white p-6 rounded-none">
              <div className="aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec]">
                {heroPhoto ? (
                  <img src={heroPhoto} alt={author.name} className="h-full w-full object-cover" />
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
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.socialTitle}</p>
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
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.bioLabel}</p>
                <h2 className="mt-4 text-2xl font-semibold text-gray-900">{labels.bioTitle}</h2>
                <p className="mt-4 text-base leading-relaxed text-gray-700">{author.bio}</p>
              </div>
            )}

            {Array.isArray(author.published_works) && author.published_works.length > 0 && (
              <PublishedWorksSection works={author.published_works as PublishedWork[]} labels={labels} />
            )}

            {Array.isArray(author.author_gallery) && author.author_gallery.length > 0 && (
              <AuthorGallerySection images={author.author_gallery as GalleryImage[]} authorName={author.name} labels={labels} />
            )}

            {author.featured_video && (
              <AuthorVideoSection authorName={author.name} videoUrl={author.featured_video} embedUrl={embedUrl} labels={labels} />
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

function PublishedWorksSection({ works, labels }: { works: PublishedWork[]; labels: Record<string, string> }) {
  return (
    <div className="border border-gray-200 bg-white p-8 rounded-none">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.worksLabel}</p>
          <h2 className="mt-2 text-2xl font-semibold text-gray-900">{labels.worksTitle}</h2>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {works.map((work, index) => (
          <article key={`${work.title}-${index}`} className="border border-gray-200 bg-[#fdfbf7] p-5 rounded-none">
            <div className="flex gap-4">
              {work.cover_url ? (
                <img src={work.cover_url} alt={work.title} className="h-24 w-16 object-cover" loading="lazy" />
              ) : (
                <div className="h-24 w-16 bg-gray-200" />
              )}
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">{work.title}</h3>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{work.genre}</p>
                <p className="text-sm text-gray-600">{work.synopsis}</p>
                {work.link && (
                  <a href={work.link} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-[0.2em] text-gray-900 hover:underline">
                    {labels.worksCta}
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function AuthorGallerySection({ images, authorName, labels }: { images: GalleryImage[]; authorName: string; labels: Record<string, string> }) {
  return (
    <div className="border border-gray-200 bg-white p-8 rounded-none">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.galleryLabel}</p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-900">{labels.galleryTitle}</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => {
          const imageUrl = resolveGalleryUrl(image)
          if (!imageUrl) return null

          return (
            <figure key={`${imageUrl}-${index}`} className="group overflow-hidden bg-[#f4efe9]">
              <img
                src={imageUrl}
                alt={image.caption || authorName}
                className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              {image.caption && <figcaption className="px-3 py-2 text-xs text-gray-600">{image.caption}</figcaption>}
            </figure>
          )
        })}
      </div>
    </div>
  )
}

function AuthorVideoSection({ authorName, videoUrl, embedUrl, labels }: { authorName: string; videoUrl: string; embedUrl: string | null; labels: Record<string, string> }) {
  return (
    <div className="border border-gray-200 bg-white p-8 rounded-none">
      <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{labels.videoLabel}</p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-900">{labels.videoTitle}</h2>
      <div className="mt-6">
        {embedUrl ? (
          <div className="relative aspect-video w-full overflow-hidden bg-black">
            <iframe
              src={embedUrl}
              title={labels.videoFrameTitle.replace('{name}', authorName)}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <a href={videoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-900 hover:underline">
            {labels.videoWatch}
          </a>
        )}
      </div>
    </div>
  )
}
