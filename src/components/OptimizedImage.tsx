import { useState, useEffect } from 'react'
import { publicSupabase } from '../lib/supabasePublic'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
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
  bucket = 'covers',
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!src) return

    // If it's already a full URL, use it directly
    if (src.startsWith('http')) {
      setImageSrc(src)
      return
    }

    // Otherwise, get public URL from Supabase Storage
    const { data } = publicSupabase.storage.from(bucket).getPublicUrl(src)
    setImageSrc(data.publicUrl)
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
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
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
}: {
  src: string | null | undefined
  title: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${title} cover`}
      bucket="covers"
      className={className}
      priority={priority}
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
}: {
  src: string | null | undefined
  name: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${name} photo`}
      bucket="author-photos"
      className={className}
      priority={priority}
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
}: {
  src: string | null | undefined
  title: string
  className?: string
  priority?: boolean
}) {
  return (
    <OptimizedImage
      src={src}
      alt={`${title} featured image`}
      bucket="post-images"
      className={className}
      priority={priority}
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
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      bucket="hero-backgrounds"
      className={className}
      priority={priority}
    />
  )
}
