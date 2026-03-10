import { resolvePhotoUrl, getSocialLinks, MapPin, type AuthorData } from './authorsData'

type AuthorsListingHeroProps = {
  author: AuthorData | null
  title: string
  heroFeaturedLabel: string
  heroDefaultLabel: string
  ctaLabel: string
}

export function AuthorsListingHero({
  author,
  title,
  heroFeaturedLabel,
  heroDefaultLabel,
  ctaLabel,
}: AuthorsListingHeroProps) {
  const heroPhoto = author ? resolvePhotoUrl(author.photo_url, author.photo_path) : null
  const socialLinks = author ? getSocialLinks(author) : []

  return (
    <section className="relative overflow-hidden bg-[#1c1b1a] text-white">
      {author && heroPhoto && (
        <img src={heroPhoto} alt={author.name} className="absolute inset-0 h-full w-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs uppercase tracking-[0.4em] text-white/70">
              {author ? heroFeaturedLabel : heroDefaultLabel}
            </p>

            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              {author ? author.name : title}
            </h1>

            {author?.author_type && (
              <p className="text-base uppercase tracking-[0.3em] text-white/70">{author.author_type}</p>
            )}

            {author?.bio && author.bio.length > 50 && (
              <p className="line-clamp-3 text-base leading-relaxed text-white/90">
                {author.bio.slice(0, 200)}...
              </p>
            )}

            {author && (author.residence_city || author.province) && (
              <div className="flex flex-wrap gap-4 text-sm text-white/80">
                {author.residence_city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{author.residence_city}</span>
                  </div>
                )}
                {author.province && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{author.province}</span>
                  </div>
                )}
              </div>
            )}

            {author && socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10 text-white transition hover:bg-white hover:text-gray-900"
                      aria-label={item.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  )
                })}
              </div>
            )}

            {author && (
              <a
                href={`/autor/${author.wp_slug || author.id}`}
                className="inline-flex items-center gap-2 bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]"
              >
                {ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
