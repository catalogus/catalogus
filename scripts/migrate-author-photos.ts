/**
 * Migration Script: Move WordPress author photos to Supabase Storage
 *
 * Usage:
 *   export SUPABASE_URL="your-project-url"
 *   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
 *   npx tsx scripts/migrate-author-photos.ts --dry-run --limit=25
 *
 * Notes:
 * - Keeps original dimensions (no resize).
 * - Converts to WebP when possible; falls back to original bytes for GIF/SVG.
 * - Updates photo_url + photo_path in profiles.
 */

import { createClient } from '@supabase/supabase-js'
import { basename, extname } from 'node:path'
import sharp from 'sharp'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables!')
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : null
const matchArg = args.find((arg) => arg.startsWith('--match='))
const match = matchArg ? matchArg.split('=')[1] : '/wp-content/uploads/'
const tableArg = args.find((arg) => arg.startsWith('--table='))
const tableName = tableArg ? tableArg.split('=')[1] : 'authors'
const timeoutArg = args.find((arg) => arg.startsWith('--timeout-ms='))
const retryArg = args.find((arg) => arg.startsWith('--retries='))
const retryDelayArg = args.find((arg) => arg.startsWith('--retry-delay-ms='))

const PAGE_SIZE = 50
const WEBP_QUALITY = 85
const DEFAULT_DOWNLOAD_TIMEOUT_MS = 15_000
const DEFAULT_DOWNLOAD_RETRIES = 3
const DEFAULT_DOWNLOAD_RETRY_DELAY_MS = 800

const downloadTimeoutMs = timeoutArg
  ? Number(timeoutArg.split('=')[1])
  : DEFAULT_DOWNLOAD_TIMEOUT_MS
const downloadRetries = retryArg
  ? Number(retryArg.split('=')[1])
  : DEFAULT_DOWNLOAD_RETRIES
const downloadRetryDelayMs = retryDelayArg
  ? Number(retryDelayArg.split('=')[1])
  : DEFAULT_DOWNLOAD_RETRY_DELAY_MS

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const extensionFromContentType = (contentType: string | null) => {
  const normalized = (contentType || '').toLowerCase()
  if (normalized.includes('jpeg')) return 'jpg'
  if (normalized.includes('png')) return 'png'
  if (normalized.includes('webp')) return 'webp'
  if (normalized.includes('gif')) return 'gif'
  if (normalized.includes('svg')) return 'svg'
  return 'bin'
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchWithTimeout = async (url: string, timeoutMs: number) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

const shouldConvertToWebp = (contentType: string | null, filename: string) => {
  const normalized = (contentType || '').toLowerCase()
  if (normalized.includes('svg') || normalized.includes('gif')) return false
  const ext = extname(filename).toLowerCase()
  if (ext === '.svg' || ext === '.gif') return false
  return normalized.startsWith('image/') || ext.length > 0
}

const buildTargetPath = (
  profileId: string,
  sourceName: string,
  extension: string,
) => {
  const base = sourceName.replace(/\.[^.]+$/, '') || 'photo'
  const safeExtension = extension || 'bin'
  return `author-photos/${profileId}/${Date.now()}-${base}.${safeExtension}`
}

const downloadSource = async (url: string) => {
  let lastError: unknown
  for (let attempt = 1; attempt <= downloadRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, downloadTimeoutMs)
      if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(text || `Image download failed (${response.status})`)
      }
      const arrayBuffer = await response.arrayBuffer()
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: response.headers.get('content-type'),
      }
    } catch (error) {
      lastError = error
      if (attempt < downloadRetries) {
        await sleep(downloadRetryDelayMs * attempt)
        continue
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Image download failed')
}

const convertToWebp = async (buffer: Buffer) =>
  sharp(buffer).rotate().webp({ quality: WEBP_QUALITY }).toBuffer()

const migrateImage = async (profileId: string, url: string) => {
  const sourceName = basename(new URL(url).pathname) || `photo-${Date.now()}`
  const { buffer, contentType } = await downloadSource(url)

  let uploadBuffer = buffer
  let uploadContentType = contentType || 'application/octet-stream'
  let extension =
    extname(sourceName).slice(1) || extensionFromContentType(contentType)

  if (shouldConvertToWebp(contentType, sourceName)) {
    try {
      uploadBuffer = await convertToWebp(buffer)
      uploadContentType = 'image/webp'
      extension = 'webp'
    } catch (error) {
      console.warn(
        `   ⚠️  WebP conversion failed, keeping original bytes: ${error}`,
      )
    }
  }

  const path = buildTargetPath(profileId, sourceName, extension)
  if (dryRun) {
    return { path, publicUrl: '(dry-run)', contentType: uploadContentType }
  }

  const { error: uploadError } = await supabase.storage
    .from('author-photos')
    .upload(path, uploadBuffer, {
      contentType: uploadContentType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('author-photos')
    .getPublicUrl(path)

  return { path, publicUrl: urlData.publicUrl, contentType: uploadContentType }
}

async function main() {
  console.log('\n🚀 Starting Author Photo Migration\n')
  console.log(`Table: ${tableName}`)
  console.log(`Match filter: ${match}`)
  console.log(`Dry run: ${dryRun ? 'YES' : 'NO'}`)
  if (limit) {
    console.log(`Limit: ${limit}`)
  }

  let processed = 0
  let updated = 0
  let skipped = 0
  let failed = 0

  const baseQuery = supabase
    .from(tableName)
    .select('id, photo_url, photo_path', { count: 'exact' })
    .not('photo_url', 'is', null)
    .ilike('photo_url', `%${match}%`)

  const { count } = await baseQuery
  const total = count ?? 0
  console.log(`\n📊 Found ${total} candidate ${tableName}\n`)

  for (let offset = 0; offset < total; offset += PAGE_SIZE) {
    if (limit && processed >= limit) break
    const { data: rows, error } = await baseQuery.range(
      offset,
      offset + PAGE_SIZE - 1,
    )
    if (error) {
      throw new Error(`Failed to fetch ${tableName}: ${error.message}`)
    }

    for (const row of rows ?? []) {
      if (limit && processed >= limit) break
      processed += 1

      const url = row.photo_url as string
      if (!url) {
        skipped += 1
        continue
      }

      console.log(`[${processed}/${limit ?? total}] ${row.id}`)
      console.log(`   Source: ${url}`)

      try {
        const migrated = await migrateImage(row.id as string, url)

        if (!dryRun) {
          const { error: updateError } = await supabase
            .from(tableName)
            .update({
              photo_url: migrated.publicUrl,
              photo_path: migrated.path,
            })
            .eq('id', row.id)

          if (updateError) {
            throw new Error(`DB update failed: ${updateError.message}`)
          }
        }

        console.log(`   ✅ Updated → ${migrated.publicUrl}`)
        updated += 1
      } catch (error) {
        console.error(
          `   ❌ Failed: ${error instanceof Error ? error.message : String(error)}`,
        )
        failed += 1
      }
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log('✨ Migration Complete!')
  console.log(`   ✅ Updated: ${updated}`)
  console.log(`   ⚠️  Skipped: ${skipped}`)
  console.log(`   ❌ Failed: ${failed}`)
  console.log('─'.repeat(60) + '\n')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
