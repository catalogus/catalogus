import { publicSupabase } from './supabasePublic'
import type { GalleryImage, PublishedWork, SocialLinks } from '../types/author'

export type PublicProfileRow = {
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
  role?: 'admin' | 'author' | 'customer' | null
  status?: string | null
}

export const fetchPublicProfilesByIds = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, PublicProfileRow>()

  const { data, error } = await publicSupabase
    .from('public_profiles')
    .select(
      'id, name, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, role, status',
    )
    .in('id', ids)

  if (error) throw error

  return new Map((data ?? []).map((row) => [row.id, row as PublicProfileRow]))
}

export const fetchPublicProfileById = async (id: string) => {
  const { data, error } = await publicSupabase
    .from('public_profiles')
    .select(
      'id, name, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type, role, status',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return (data as PublicProfileRow | null) ?? null
}
