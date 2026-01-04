export type SocialLinks = {
  twitter?: string
  linkedin?: string
  website?: string
  instagram?: string
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
  social_links?: SocialLinks | null
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
}
