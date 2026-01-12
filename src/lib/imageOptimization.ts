import imageCompression from 'browser-image-compression'

export interface ImageOptimizationOptions {
  maxSizeMB: number
  maxWidthOrHeight: number
  useWebP: boolean
  quality: number
}

export const OPTIMIZATION_PRESETS = {
  bookCover: {
    maxSizeMB: 0.15, // 150KB max
    maxWidthOrHeight: 1200, // Sufficient for high-DPI displays
    useWebP: true,
    quality: 0.85,
  },
  authorPhoto: {
    maxSizeMB: 0.1, // 100KB max
    maxWidthOrHeight: 800,
    useWebP: true,
    quality: 0.85,
  },
  heroBackground: {
    maxSizeMB: 0.3, // 300KB max (larger viewport)
    maxWidthOrHeight: 1920,
    useWebP: true,
    quality: 0.85,
  },
  postFeaturedImage: {
    maxSizeMB: 0.2, // 200KB max
    maxWidthOrHeight: 1200,
    useWebP: true,
    quality: 0.85,
  },
  postInlineImage: {
    maxSizeMB: 0.15, // 150KB max
    maxWidthOrHeight: 1000,
    useWebP: true,
    quality: 0.85,
  },
} as const

export async function optimizeImage(
  file: File,
  preset: keyof typeof OPTIMIZATION_PRESETS,
): Promise<File> {
  const options = OPTIMIZATION_PRESETS[preset]

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: options.maxSizeMB,
      maxWidthOrHeight: options.maxWidthOrHeight,
      useWebWorker: true,
      fileType: options.useWebP ? 'image/webp' : 'image/jpeg',
      quality: options.quality,
    })

    console.log(
      `Optimized ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(
        compressedFile.size /
        1024 /
        1024
      ).toFixed(2)}MB`,
    )

    return compressedFile
  } catch (error) {
    console.error('Image optimization failed:', error)
    throw new Error('Failed to optimize image. Please try a different file.')
  }
}

export async function validateAndOptimizeImage(
  file: File,
  preset: keyof typeof OPTIMIZATION_PRESETS,
): Promise<File> {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images.')
  }

  // Validate file size (max 50MB raw upload)
  const maxSizeMB = 50
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File too large. Maximum size is ${maxSizeMB}MB.`)
  }

  // Optimize
  return await optimizeImage(file, preset)
}
