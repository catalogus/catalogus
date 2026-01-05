// Post status enum matching database
export type PostStatus = 'draft' | 'published' | 'scheduled' | 'trash' | 'pending'

// Category type (hierarchical)
export type Category = {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  order_weight: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Category with children (for hierarchical display)
export type CategoryTree = Category & {
  children?: CategoryTree[]
  depth?: number
}

// Tag type (flat)
export type Tag = {
  id: string
  name: string
  slug: string
  description?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Form values for creating/editing posts
export type PostFormValues = {
  title: string
  slug: string
  excerpt: string
  body: string  // HTML output from TipTap
  featured_image_url: string
  featured_image_path: string
  author_id: string
  status: PostStatus
  published_at: string | null
  featured: boolean
  language: 'pt' | 'en'
  category_ids: string[]  // Category IDs
  tag_ids: string[]  // Tag IDs (for existing tags)
  new_tags: string[]  // New tag names to create
}

// Database row for posts (with relations)
export type PostRow = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string | null
  featured_image_url: string | null
  featured_image_path: string | null
  author_id: string | null
  status: PostStatus
  published_at: string | null
  featured: boolean
  language: string
  view_count: number
  post_type: string
  created_at: string
  updated_at: string
  // Relations
  author?: {
    id: string
    name: string
    email: string
    photo_url?: string | null
  } | null
  categories?: Category[]
  tags?: Tag[]
}

// Filter/search params for posts query
export type PostsFilterParams = {
  search?: string
  status?: PostStatus | 'all'
  category_id?: string
  tag_id?: string
  author_id?: string
  featured?: boolean
  sort_by?: 'newest' | 'oldest' | 'title_asc' | 'title_desc' | 'featured'
  page?: number
  per_page?: number
}

// Bulk action types
export type BulkAction =
  | 'trash'
  | 'restore'
  | 'delete_permanent'
  | 'set_published'
  | 'set_draft'
  | 'set_featured'
  | 'unset_featured'
