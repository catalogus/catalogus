// Content type enum - what the slide links to
export type ContentType = 'book' | 'author' | 'post' | 'custom'

// Database row for hero slides
export type HeroSlide = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  cta_text: string | null
  cta_url: string | null
  background_image_url: string | null
  background_image_path: string | null
  accent_color: string | null
  content_type: ContentType
  content_id: string | null
  order_weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Form values for creating/editing hero slides
export type HeroSlideFormValues = {
  title: string
  subtitle: string
  description: string
  cta_text: string
  cta_url: string
  background_image_url: string
  background_image_path: string
  accent_color: string
  content_type: ContentType
  content_id: string | null
  order_weight: number
  is_active: boolean
}

// Extended slide with linked content data (for display)
export type HeroSlideWithContent = HeroSlide & {
  linked_content?: {
    id: string
    title?: string
    name?: string
    slug?: string
    cover_url?: string
    photo_url?: string
  } | null
}
