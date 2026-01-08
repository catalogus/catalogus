import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Twitter,
  Youtube,
} from 'lucide-react'
import { supabase } from '../../lib/supabaseClient'
import type { SocialLinks } from '../../types/author'

export type AuthorCardData = {
  id: string
  wp_slug?: string | null
  name: string
  author_type?: string | null
  photo_url?: string | null
  photo_path?: string | null
  social_links?: SocialLinks | null
  residence_city?: string | null
  province?: string | null
}

const resolvePhotoUrl = (photoUrl?: string | null, photoPath?: string | null) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return supabase.storage.from('author-photos').getPublicUrl(photoPath).data
      .publicUrl
  }
  return null
}

const getSocialLinks = (author: AuthorCardData) => {
  const links = author.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    {
      key: 'linkedin',
      href: links.linkedin,
      icon: Linkedin,
      label: 'LinkedIn',
    },
    {
      key: 'facebook',
      href: links.facebook,
      icon: Facebook,
      label: 'Facebook',
    },
    {
      key: 'instagram',
      href: links.instagram,
      icon: Instagram,
      label: 'Instagram',
    },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item) => item.href)
}

export function AuthorCard({ author }: { author: AuthorCardData }) {
  const photoUrl = resolvePhotoUrl(author.photo_url, author.photo_path)
  const socialLinks = getSocialLinks(author)
  const authorHref = `/autor/${author.wp_slug || author.id}`

  return (
    <div className="space-y-3">
      <div className="group relative aspect-[4/5] w-full overflow-hidden border border-gray-200 bg-[#f4f1ec] transition-all hover:border-gray-400">
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
                  onClick={(event) => event.stopPropagation()}
                >
                  <Icon className="h-4 w-4" />
                </a>
              )
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          <a href={authorHref} className="hover:underline">
            {author.name}
          </a>
        </h3>

        {author.author_type && (
          <p className="text-sm text-gray-600">{author.author_type}</p>
        )}

        {(author.residence_city || author.province) && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>
              {[author.residence_city, author.province]
                .filter(Boolean)
                .join(', ')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
