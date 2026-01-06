export type SocialLinks = {
  twitter?: string
  linkedin?: string
  website?: string
  instagram?: string
  youtube?: string
}

export type GalleryImage = {
  url: string
  path: string
  caption?: string
}

export type PublishedWork = {
  cover_url?: string
  cover_path?: string
  title: string
  genre: string
  synopsis: string
  link?: string
}

export type AuthorStatus = 'pending' | 'approved' | 'rejected'

export type AuthorFormValues = {
  name: string
  email: string
  password?: string
  phone: string
  bio: string
  photo_url: string
  photo_path: string
  social_links: SocialLinks
  status: AuthorStatus
  role: 'author'
  birth_date: string
  residence_city: string
  province: string
  published_works: PublishedWork[]
  author_gallery: GalleryImage[]
  featured_video: string
  author_type: string
}

export type AuthorRow = {
  id: string
  name: string
  email?: string
  phone?: string | null
  bio?: string | null
  photo_url?: string | null
  photo_path?: string | null
  status: string | null
  featured?: boolean | null
  social_links?: SocialLinks | null
  birth_date?: string | null
  residence_city?: string | null
  province?: string | null
  published_works?: PublishedWork[] | null
  author_gallery?: GalleryImage[] | null
  featured_video?: string | null
  author_type?: string | null
  created_at?: string
  updated_at?: string
}

export type ProfileUpdateValues = {
  name: string
  phone: string
  bio: string
  photo_url: string
  photo_path: string
  social_links: SocialLinks
  birth_date: string
  residence_city: string
  province: string
  published_works: PublishedWork[]
  author_gallery: GalleryImage[]
  featured_video: string
  author_type: string
}
