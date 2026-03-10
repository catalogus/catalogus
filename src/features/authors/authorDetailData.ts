import {
  Calendar,
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { fetchPublicProfileById } from '@/lib/publicProfiles'
import { publicSupabase } from '@/lib/supabasePublic'
import type { AuthorRow, GalleryImage, PublishedWork, SocialLinks } from '@/types/author'

const authorSelectFields =
  'id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, claim_status, profile_id'

export type ProfileAuthor = {
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

export type AuthorResult = {
  author: AuthorRow | null
  isProfileOnly: boolean
}

export type AuthorSocialLink = {
  key: string
  href: string
  icon: LucideIcon
  label: string
}

export { Calendar, MapPin }

export const attachProfileToAuthor = async (author: AuthorRow) => {
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
      status: (profile.status as AuthorRow['claim_status']) ?? null,
      role: (profile.role as ProfileAuthor['role']) ?? null,
    },
  }
}

export const resolvePhotoUrl = (photoUrl?: string | null, photoPath?: string | null) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return publicSupabase.storage.from('author-photos').getPublicUrl(photoPath).data.publicUrl
  }
  return null
}

export const resolveGalleryUrl = (image: GalleryImage) => {
  if (image.url) return image.url
  if (image.path) {
    return publicSupabase.storage.from('author-photos').getPublicUrl(image.path).data.publicUrl
  }
  return ''
}

export const formatDate = (value: string | null | undefined, locale: string) => {
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

export const buildEmbedUrl = (value?: string | null) => {
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
    const pathId = pathParts[0] === 'embed' || pathParts[0] === 'shorts' ? pathParts[1] : null
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

export const getSocialLinks = (author: AuthorRow | null) => {
  const links = author?.social_links ?? {}
  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    { key: 'linkedin', href: links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'facebook', href: links.facebook, icon: Facebook, label: 'Facebook' },
    { key: 'instagram', href: links.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item): item is AuthorSocialLink => Boolean(item.href))
}

export const isUuid = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)

export const mapProfileToAuthor = (
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

export const loadAuthorResult = async ({
  authorId,
  fallbackName,
  registeredType,
}: {
  authorId: string
  fallbackName: string
  registeredType: string
}): Promise<AuthorResult> => {
  const { data: bySlug, error: slugError } = await publicSupabase
    .from('authors')
    .select(authorSelectFields)
    .eq('wp_slug', authorId)
    .maybeSingle()
  if (slugError) throw slugError

  if (bySlug) {
    const author = await attachProfileToAuthor(bySlug as AuthorRow)
    return { author, isProfileOnly: false }
  }

  if (isUuid(authorId)) {
    const [{ data: byId, error: idError }, { data: profileMatch, error: profileError }] = await Promise.all([
      publicSupabase.from('authors').select(authorSelectFields).eq('id', authorId).maybeSingle(),
      publicSupabase
        .from('public_profiles')
        .select(
          'id, name, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, status, role',
        )
        .eq('id', authorId)
        .eq('role', 'author')
        .maybeSingle(),
    ])

    if (idError) throw idError
    if (profileError) throw profileError

    if (byId) {
      const author = await attachProfileToAuthor(byId as AuthorRow)
      return { author, isProfileOnly: false }
    }

    if (profileMatch) {
      return {
        author: mapProfileToAuthor(profileMatch, fallbackName, registeredType),
        isProfileOnly: true,
      }
    }
  }

  return { author: null, isProfileOnly: false }
}
