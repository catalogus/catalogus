import { useMemo } from 'react'
import { publicSupabase } from '../lib/supabasePublic'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  bucket?: 'covers' | 'author-photos' | 'post-images' | 'hero-backgrounds'
}

/**
 * Optimized image component with lazy loading and Supabase integration
 *
 * Features:
 * - Automatic lazy loading (unless priority=true)
 * - Handles both full URLs and Supabase storage paths
 * - Shows loading skeleton while image loads
 * - Async decoding for better performance
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes,
  bucket = 'covers',
}: OptimizedImageProps) {
  const imageSrc = useMemo(() => {
    if (!src) return null
    if (src.startsWith('http')) return src

    const { data } = publicSupabase.storage.from(bucket).getPublicUrl(src)
    return data.publicUrl
  }, [src, bucket])

  if (!imageSrc) {
    // Loading skeleton
    return (
      <div
        className={`animate-pulse bg-gray-200 ${className}`}
        style={{ width, height }}
        aria-label="Loading image"
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}

/**
 * Specialized component for book covers
 * Uses the 'covers' bucket by default
 */
export function BookCover({
  src,
  title,
  className = '',
  priority = false,
  sizes,
}: {
  src: string | null | undefined
  title: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${title} cover`}
      bucket="covers"
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}

/**
 * Specialized component for author photos
 * Uses the 'author-photos' bucket by default
 */
export function AuthorPhoto({
  src,
  name,
  className = '',
  priority = false,
  sizes,
}: {
  src: string | null | undefined
  name: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name} photo`}
      bucket="author-photos"
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}

/**
 * Specialized component for post featured images
 * Uses the 'post-images' bucket by default
 */
export function PostFeaturedImage({
  src,
  title,
  className = '',
  priority = false,
  sizes,
}: {
  src: string | null | undefined
  title: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${title} featured image`}
      bucket="post-images"
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}

/**
 * Specialized component for hero backgrounds
 * Uses the 'hero-backgrounds' bucket by default
 */
export function HeroBackground({
  src,
  alt,
  className = '',
  priority = true, // Hero images are typically above the fold
}: {
  src: string | null | undefined
  alt: string
  className?: string
  priority?: boolean
  sizes?: string
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      bucket="hero-backgrounds"
      className={className}
      priority={priority}
      sizes={sizes}
    />
  )
}
