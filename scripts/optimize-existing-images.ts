/**
 * Migration Script: Optimize Existing Images
 *
 * This script optimizes all existing images in Supabase Storage buckets:
 * - Downloads images from storage
 * - Optimizes them using browser-image-compression
 * - Uploads optimized versions
 * - Updates database references
 * - Deletes old files
 *
 * IMPORTANT: Run this on a backup first! This modifies production data.
 *
 * Usage:
 *   export SUPABASE_URL="your-project-url"
 *   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   npx tsx scripts/optimize-existing-images.ts
 */

import { createClient } from '@supabase/supabase-js'
import { OPTIMIZATION_PRESETS } from '../src/lib/imageOptimization'

let sharpImport: Promise<typeof import('sharp').default> | null = null

async function loadSharp() {
  if (!sharpImport) {
    sharpImport = import('sharp').then(module => module.default)
  }

  try {
    return await sharpImport
  } catch {
    throw new Error('Missing dependency "sharp". Install with `pnpm add -D sharp`.')
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface BucketMigration {
  bucketName: string
  tableName: string
  pathColumn: string
  urlColumn: string
  preset: keyof typeof OPTIMIZATION_PRESETS
}

const MIGRATIONS: BucketMigration[] = [
  {
    bucketName: 'covers',
    tableName: 'books',
    pathColumn: 'cover_path',
    urlColumn: 'cover_url',
    preset: 'bookCover',
  },
  {
    bucketName: 'author-photos',
    tableName: 'authors',
    pathColumn: 'photo_path',
    urlColumn: 'photo_url',
    preset: 'authorPhoto',
  },
  {
    bucketName: 'hero-backgrounds',
    tableName: 'hero_slides',
    pathColumn: 'background_image_path',
    urlColumn: 'background_image_url',
    preset: 'heroBackground',
  },
  {
    bucketName: 'post-images',
    tableName: 'posts',
    pathColumn: 'featured_image_path',
    urlColumn: 'featured_image_url',
    preset: 'postFeaturedImage',
  },
]

async function optimizeImageBlob(
  fileData: Blob,
  preset: keyof typeof OPTIMIZATION_PRESETS,
): Promise<Buffer> {
  const options = OPTIMIZATION_PRESETS[preset]
  const sharp = await loadSharp()
  const inputBuffer = Buffer.from(await fileData.arrayBuffer())
  const maxBytes = options.maxSizeMB * 1024 * 1024
  const base = sharp(inputBuffer).rotate().resize({
    width: options.maxWidthOrHeight,
    height: options.maxWidthOrHeight,
    fit: 'inside',
    withoutEnlargement: true,
  })

  const minQuality = 45
  let quality = Math.round(options.quality * 100)
  let optimizedBuffer = await base.clone().webp({ quality }).toBuffer()
  let attempts = 0

  while (optimizedBuffer.length > maxBytes && quality > minQuality && attempts < 6) {
    quality = Math.max(minQuality, quality - 10)
    optimizedBuffer = await base.clone().webp({ quality }).toBuffer()
    attempts++
  }

  return optimizedBuffer
}

async function migrateBucket(migration: BucketMigration, dryRun: boolean = false) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`🔄 Migrating bucket: ${migration.bucketName}`)
  console.log(`   Table: ${migration.tableName}`)
  console.log(`   Preset: ${migration.preset}`)
  console.log(`   Dry run: ${dryRun ? 'YES (no changes will be made)' : 'NO'}`)
  console.log(`${'='.repeat(60)}\n`)

  // Fetch all records with images
  const { data: records, error } = await supabase
    .from(migration.tableName)
    .select(`id, ${migration.pathColumn}`)
    .not(migration.pathColumn, 'is', null)

  if (error) {
    console.error(`❌ Error fetching records: ${error.message}`)
    return
  }

  console.log(`📊 Found ${records.length} images to process\n`)

  let optimized = 0
  let skipped = 0
  let failed = 0
  const maxTargetSize = OPTIMIZATION_PRESETS[migration.preset].maxSizeMB * 1024 * 1024

  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const oldPath = record[migration.pathColumn]

    console.log(`[${i + 1}/${records.length}] Processing: ${oldPath}`)

    try {
      // Download file to check size
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(migration.bucketName)
        .download(oldPath)

      if (downloadError || !fileData) {
        console.log(`   ⚠️  File not found in storage, skipping`)
        skipped++
        continue
      }

      const fileSizeMB = fileData.size / 1024 / 1024

      // Skip if already optimized (within 120% of target size)
      if (fileData.size < maxTargetSize * 1.2) {
        console.log(`   ✓ Already optimized (${fileSizeMB.toFixed(2)}MB), skipping`)
        skipped++
        continue
      }

      console.log(`   🔧 Optimizing ${fileSizeMB.toFixed(2)}MB image...`)

      if (dryRun) {
        console.log(`   [DRY RUN] Would optimize this image`)
        optimized++
        continue
      }

      // Optimize image
      const optimizedBuffer = await optimizeImageBlob(fileData, migration.preset)
      const newSizeMB = optimizedBuffer.length / 1024 / 1024

      // Generate new path with optimized/ prefix
      const fileExt = 'webp'
      const newPath = `optimized/${crypto.randomUUID()}.${fileExt}`

      // Upload optimized version
      const { error: uploadError } = await supabase.storage
        .from(migration.bucketName)
        .upload(newPath, optimizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      // Get new public URL
      const { data: urlData } = supabase.storage
        .from(migration.bucketName)
        .getPublicUrl(newPath)

      // Update database record
      const { error: updateError } = await supabase
        .from(migration.tableName)
        .update({
          [migration.pathColumn]: newPath,
          [migration.urlColumn]: urlData.publicUrl,
        })
        .eq('id', record.id)

      if (updateError) {
        throw new Error(`Database update failed: ${updateError.message}`)
      }

      // Delete old file
      const { error: deleteError } = await supabase.storage
        .from(migration.bucketName)
        .remove([oldPath])

      if (deleteError) {
        console.log(`   ⚠️  Warning: Could not delete old file: ${deleteError.message}`)
      }

      const savings = ((fileSizeMB - newSizeMB) / fileSizeMB * 100).toFixed(1)
      console.log(`   ✅ Success: ${fileSizeMB.toFixed(2)}MB → ${newSizeMB.toFixed(2)}MB (${savings}% reduction)`)
      optimized++

    } catch (error) {
      console.error(`   ❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      failed++
    }
  }

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📊 ${migration.bucketName} Summary:`)
  console.log(`   ✅ Optimized: ${optimized}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log(`${'─'.repeat(60)}\n`)

  return { optimized, skipped, failed }
}

async function main() {
  console.log('\n🚀 Starting Image Optimization Migration\n')
  console.log('This script will optimize all large images in Supabase Storage.')
  console.log('Images will be converted to WebP and compressed.\n')

  // Check if dry run
  const isDryRun = process.argv.includes('--dry-run')

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE: No changes will be made\n')
  } else {
    console.log('⚠️  LIVE MODE: This will modify your database and storage\n')
    console.log('Press Ctrl+C now to cancel, or wait 5 seconds to continue...\n')
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  const totalStats = {
    optimized: 0,
    skipped: 0,
    failed: 0,
  }

  for (const migration of MIGRATIONS) {
    const stats = await migrateBucket(migration, isDryRun)
    if (stats) {
      totalStats.optimized += stats.optimized
      totalStats.skipped += stats.skipped
      totalStats.failed += stats.failed
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('✨ Migration Complete!')
  console.log('='.repeat(60))
  console.log(`   ✅ Total Optimized: ${totalStats.optimized}`)
  console.log(`   ⚠️  Total Skipped: ${totalStats.skipped}`)
  console.log(`   ❌ Total Failed: ${totalStats.failed}`)
  console.log('='.repeat(60) + '\n')

  if (!isDryRun && totalStats.optimized > 0) {
    console.log('💡 Next steps:')
    console.log('   1. Verify images display correctly on your site')
    console.log('   2. Check Supabase Storage dashboard for size reduction')
    console.log('   3. Monitor for any broken image links')
    console.log('   4. Consider running git repository cleanup (see plan)')
  }
}

main().catch(console.error)
