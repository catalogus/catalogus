// Display mode enum matching database
export type DisplayMode = 'single' | 'double'

// Table of contents item
export type TableOfContentsItem = {
  title: string
  pageNumber: number
  level?: number
}

// Publication database row
export type Publication = {
  id: string
  title: string
  slug: string
  description: string | null
  pdf_path: string
  pdf_url: string | null
  file_size_bytes: number | null
  page_count: number | null
  cover_path: string | null
  cover_url: string | null
  table_of_contents: TableOfContentsItem[] | null
  display_mode: DisplayMode
  page_width: number
  page_height: number
  is_active: boolean
  is_featured: boolean
  publish_date: string | null
  seo_title: string | null
  seo_description: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

// Publication page database row
export type PublicationPage = {
  id: string
  publication_id: string
  page_number: number
  image_path: string
  image_url: string | null
  thumbnail_path: string | null
  thumbnail_url: string | null
  width: number | null
  height: number | null
  text_content: string | null
  created_at: string
}

// Form values for creating/editing publications
export type PublicationFormValues = {
  title: string
  slug: string
  description: string
  display_mode: DisplayMode
  page_width: number
  page_height: number
  is_active: boolean
  is_featured: boolean
  publish_date: string
  seo_title: string
  seo_description: string
  table_of_contents: TableOfContentsItem[]
}

// Filter/search params for publications query
export type PublicationsFilterParams = {
  search?: string
  featured?: boolean
  is_active?: boolean
  sort_by?: 'newest' | 'oldest' | 'title_asc' | 'title_desc'
  page?: number
  per_page?: number
}

// Publication with pages (for viewer)
export type PublicationWithPages = Publication & {
  pages: PublicationPage[]
}

// Processing status for PDF upload
export type ProcessingStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'rendering'
  | 'completed'
  | 'error'

export type ProcessingProgress = {
  status: ProcessingStatus
  currentPage?: number
  totalPages?: number
  message?: string
  error?: string
}
