import { Facebook, Globe, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { buildCmsAuthUrl } from '../../lib/crossSiteAuth'
import type { SocialLinks } from '../../types/author'
import { AuthorPhoto } from '../OptimizedImage'

type FeaturedAuthor = {
  id: string
  wp_slug: string | null
  name: string
  author_type: string | null
  photo_url: string | null
  photo_path: string | null
  social_links?: SocialLinks | null
  claim_status?: 'unclaimed' | 'pending' | 'approved' | 'rejected'
  profile_id?: string | null
  profile?: {
    id: string
    name: string
    photo_url?: string | null
    photo_path?: string | null
    social_links?: SocialLinks | null
  } | null
}

const getSocialLinks = (author: FeaturedAuthor) => {
  const links = author.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    { key: 'linkedin', href: links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'facebook', href: links.facebook, icon: Facebook, label: 'Facebook' },
    { key: 'instagram', href: links.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item) => item.href)
}

type FeaturedAuthorsSectionProps = {
  authors: FeaturedAuthor[]
  hasError?: boolean
}

export default function FeaturedAuthorsSection({
  authors,
  hasError = false,
}: FeaturedAuthorsSectionProps) {
  const { t } = useTranslation()
  const signupHref = buildCmsAuthUrl('sign-up', '/autores')

  return (
    <section className="bg-[#f4efe9] text-gray-900">
      <div className="container mx-auto px-4 py-24 lg:px-15">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
              {t('home.featuredAuthors.label')}
            </p>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
                {t('home.featuredAuthors.title')}
              </h2>
              <div className="mt-3 h-1 w-12 bg-[color:var(--brand)]" />
            </div>
          </div>
          <a
            href="/autores"
            className="inline-flex items-center gap-3 border border-gray-900/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-900 transition-colors hover:border-gray-900 hover:text-gray-900 rounded-none"
          >
            {t('home.featuredAuthors.cta')}
          </a>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {hasError && (
            <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
              {t('home.featuredAuthors.error')}
            </div>
          )}

          {!hasError &&
            authors.map((author) => {
              const photoSrc = author.photo_path || author.photo_url
              const typeLabel = author.author_type || t('home.featuredAuthors.typeFallback')
              const socialLinks = getSocialLinks(author)
              const authorHref = `/autor/${author.wp_slug || author.id}`
              return (
                <div key={author.id} className="space-y-3">
                  <div className="group relative aspect-[4/5] w-full overflow-hidden bg-[#f4f1ec] rounded-none">
                    {photoSrc ? (
                      <AuthorPhoto
                        src={photoSrc}
                        name={author.name}
                        className="h-full w-full object-cover"
                        priority={false}
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
                      <a
                        href={authorHref}
                        className="hover:underline"
                        aria-label={t('home.featuredAuthors.viewAuthor', { name: author.name })}
                      >
                        {author.name}
                      </a>
                    </h3>
                    <p className="text-sm text-gray-600">{typeLabel}</p>
                  </div>
                </div>
              )
            })}

          {!hasError && authors.length === 0 && (
              <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600 rounded-none">
                {t('home.featuredAuthors.empty')}
              </div>
            )}
        </div>

        <div className="mt-16">
          <div
            className="relative overflow-hidden border border-white/10 text-white"
            style={{
              backgroundImage: "url('/catalogos-authors.webp')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),transparent_60%)]" />
            <div className="absolute inset-0 bg-black/55" />
            <div className="relative z-10 flex flex-col items-center gap-4 px-6 py-14 text-center md:px-10 lg:px-20">
              <h3 className="text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
                {t('home.featuredAuthors.joinTitle')}
              </h3>
              <p className="max-w-2xl text-sm text-white/85 md:text-base">
                {t('home.featuredAuthors.joinSubtitle')}
              </p>
              <a
                href={signupHref}
                className="mt-2 inline-flex items-center justify-center bg-[color:var(--brand)] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]"
              >
                {t('home.featuredAuthors.joinCta')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
