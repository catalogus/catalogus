import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  MapPin,
  Search,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react'
import { publicSupabase } from '@/lib/supabasePublic'
import { fetchPublicProfilesByIds } from '@/lib/publicProfiles'
import type { SocialLinks } from '@/types/author'

export type AuthorData = {
  id: string
  wp_slug: string | null
  name: string
  author_type: string | null
  bio?: string | null
  photo_url: string | null
  photo_path: string | null
  social_links?: SocialLinks | null
  residence_city?: string | null
  province?: string | null
  claim_status?: 'unclaimed' | 'pending' | 'approved' | 'rejected'
  profile_id?: string | null
  profile?: {
    id: string
    name: string
    photo_url?: string | null
    photo_path?: string | null
    bio?: string | null
    social_links?: SocialLinks | null
  } | null
}

export type SocialLinkItem = {
  key: string
  href: string
  icon: LucideIcon
  label: string
}

const authorSelectFields =
  'id, wp_slug, name, author_type, photo_url, photo_path, social_links, residence_city, province, claim_status, profile_id'

const featuredSelectFields =
  'id, wp_slug, name, author_type, bio, photo_url, photo_path, social_links, residence_city, province, claim_status, profile_id'

export const getMergedAuthorData = (author: AuthorData): AuthorData => {
  if (author.claim_status === 'approved' && author.profile) {
    return {
      ...author,
      name: author.profile.name || author.name,
      photo_url: author.profile.photo_url || author.photo_url,
      photo_path: author.profile.photo_path || author.photo_path,
      bio: author.profile.bio || author.bio,
      social_links: author.profile.social_links || author.social_links,
    }
  }

  return author
}

export const attachProfiles = async (authors: AuthorData[]) => {
  const profileIds = authors
    .map((author) => author.profile_id)
    .filter((id): id is string => Boolean(id))

  if (profileIds.length === 0) return authors

  const profilesMap = await fetchPublicProfilesByIds(profileIds)

  return authors.map((author) => {
    const profile = author.profile_id ? profilesMap.get(author.profile_id) : null
    if (!profile) return author

    return {
      ...author,
      profile: {
        id: profile.id,
        name: profile.name ?? author.name,
        photo_url: profile.photo_url ?? null,
        photo_path: profile.photo_path ?? null,
        bio: profile.bio ?? null,
        social_links: profile.social_links ?? null,
      },
    }
  })
}

export const resolvePhotoUrl = (photoUrl?: string | null, photoPath?: string | null) => {
  if (photoUrl) return photoUrl
  if (photoPath) {
    return publicSupabase.storage.from('author-photos').getPublicUrl(photoPath).data.publicUrl
  }
  return null
}

export const getSocialLinks = (author: AuthorData) => {
  const links = author.social_links ?? {}

  return [
    { key: 'website', href: links.website, icon: Globe, label: 'Website' },
    { key: 'linkedin', href: links.linkedin, icon: Linkedin, label: 'LinkedIn' },
    { key: 'facebook', href: links.facebook, icon: Facebook, label: 'Facebook' },
    { key: 'instagram', href: links.instagram, icon: Instagram, label: 'Instagram' },
    { key: 'twitter', href: links.twitter, icon: Twitter, label: 'Twitter' },
    { key: 'youtube', href: links.youtube, icon: Youtube, label: 'YouTube' },
  ].filter((item): item is SocialLinkItem => Boolean(item.href))
}

export const fetchFeaturedAuthor = async () => {
  const { data: featuredData, error: featuredError } = await publicSupabase
    .from('authors')
    .select(featuredSelectFields)
    .eq('featured', true)

  if (featuredError) throw featuredError

  const featuredAuthorRaw = featuredData?.length
    ? (featuredData[Math.floor(Math.random() * featuredData.length)] as AuthorData)
    : null

  return featuredAuthorRaw ? getMergedAuthorData((await attachProfiles([featuredAuthorRaw]))[0]) : null
}

export const fetchAuthorsPage = async ({
  pageParam = 1,
  featuredAuthorId,
  search,
}: {
  pageParam?: number
  featuredAuthorId?: string | null
  search?: string
}) => {
  const pageSize = 12
  const searchLimit = 1000
  const hasSearch = Boolean(search)
  const from = hasSearch ? 0 : (pageParam - 1) * pageSize
  const to = hasSearch ? searchLimit - 1 : from + pageSize - 1

  let query = publicSupabase
    .from('authors')
    .select(authorSelectFields)
    .order('name', { ascending: true })
    .neq('id', featuredAuthorId || '00000000-0000-0000-0000-000000000000')

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query.range(from, to)
  if (error) throw error

  const authorsWithProfiles = await attachProfiles((data ?? []) as AuthorData[])

  return {
    authors: authorsWithProfiles.map(getMergedAuthorData),
    hasMore: !hasSearch && data?.length === pageSize,
  }
}

export const fetchStandaloneAuthors = async ({
  search,
  fallbackName,
  registeredType,
}: {
  search?: string
  fallbackName: string
  registeredType: string
}) => {
  let query = publicSupabase
    .from('public_profiles')
    .select('id, name, bio, photo_url, photo_path, social_links, role, status')
    .eq('role', 'author')
    .order('name', { ascending: true })

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const [{ data: profiles, error: profilesError }, { data: linkedAuthors, error: linkedError }] = await Promise.all([
    query,
    publicSupabase.from('authors').select('profile_id').not('profile_id', 'is', null),
  ])

  if (profilesError) throw profilesError
  if (linkedError) throw linkedError

  const linkedProfileIds = new Set(linkedAuthors?.map((author) => author.profile_id).filter(Boolean) || [])
  const standaloneProfiles = (profiles || []).filter((profile) => !linkedProfileIds.has(profile.id))

  return standaloneProfiles.map((profile) => ({
    id: profile.id,
    wp_slug: null,
    name: profile.name || fallbackName,
    author_type: registeredType,
    bio: profile.bio || null,
    photo_url: profile.photo_url || null,
    photo_path: profile.photo_path || null,
    social_links: profile.social_links || null,
    residence_city: null,
    province: null,
    claim_status: 'approved' as const,
    profile_id: profile.id,
    profile: {
      id: profile.id,
      name: profile.name || fallbackName,
      photo_url: profile.photo_url || null,
      photo_path: profile.photo_path || null,
      bio: profile.bio || null,
      social_links: profile.social_links || null,
    },
  })) as AuthorData[]
}

export const loadAuthorsPageData = async () => {
  const [featuredAuthor, standaloneAuthors] = await Promise.all([
    fetchFeaturedAuthor(),
    fetchStandaloneAuthors({
      fallbackName: 'Autor',
      registeredType: 'Autor registado',
    }),
  ])

  const authorsPage = await fetchAuthorsPage({ featuredAuthorId: featuredAuthor?.id })

  return {
    featuredAuthor,
    authors: authorsPage.authors,
    authorsHasMore: authorsPage.hasMore,
    standaloneAuthors,
  }
}

export { MapPin, Search }
