#!/usr/bin/env node
import { randomUUID } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { basename, extname } from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? Number(limitArg.split('=')[1]) : null
const dryRun = args.includes('--dry-run')
const importImages = (process.env.IMPORT_IMAGES ?? 'false').toLowerCase() === 'true'

const stripInlineComment = (value) => {
  let inSingle = false
  let inDouble = false
  for (let i = 0; i < value.length; i += 1) {
    const char = value[i]
    if (char === '\'' && !inDouble) {
      inSingle = !inSingle
    } else if (char === '"' && !inSingle) {
      inDouble = !inDouble
    } else if (char === '#' && !inSingle && !inDouble) {
      return value.slice(0, i).trimEnd()
    }
  }
  return value
}

const loadEnvFile = (path) => {
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const key = trimmed.slice(0, idx).trim()
    const value = stripInlineComment(trimmed.slice(idx + 1)).trim()
    if (!process.env[key]) {
      process.env[key] = value
    }
  })
}

loadEnvFile(process.env.ENV_FILE || '.env.local')

const normalizeEnvValue = (value) => {
  if (!value) return value
  const trimmed = value.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

const wpUrl = normalizeEnvValue(process.env.WP_URL)
const wpUser = normalizeEnvValue(process.env.WP_USER)
const wpAppPassword = normalizeEnvValue(process.env.WP_APP_PASSWORD)
const supabaseUrl = normalizeEnvValue(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
)
const supabaseServiceKey =
  normalizeEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  )
const defaultLanguage = normalizeEnvValue(process.env.DEFAULT_LANGUAGE) || 'pt'
const defaultAuthorId = normalizeEnvValue(process.env.DEFAULT_AUTHOR_ID) || null

if (!wpUrl || !wpUser || !wpAppPassword) {
  console.error('Missing WP_URL, WP_USER, or WP_APP_PASSWORD.')
  process.exit(1)
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const wpAuth = Buffer.from(`${wpUser}:${wpAppPassword}`).toString('base64')

const sbHeaders = {
  apikey: supabaseServiceKey,
  Authorization: `Bearer ${supabaseServiceKey}`,
  'Content-Type': 'application/json',
}

const WEBP_QUALITY = 85

const extensionFromContentType = (contentType) => {
  const normalized = (contentType || '').toLowerCase()
  if (normalized.includes('jpeg')) return 'jpg'
  if (normalized.includes('png')) return 'png'
  if (normalized.includes('webp')) return 'webp'
  if (normalized.includes('gif')) return 'gif'
  if (normalized.includes('svg')) return 'svg'
  return 'bin'
}

const shouldConvertToWebp = (contentType, filename) => {
  const normalized = (contentType || '').toLowerCase()
  if (normalized.includes('svg') || normalized.includes('gif')) return false
  const ext = extname(filename).toLowerCase()
  if (ext === '.svg' || ext === '.gif') return false
  return normalized.startsWith('image/') || ext.length > 0
}

const convertToWebp = async (buffer) =>
  sharp(buffer).rotate().webp({ quality: WEBP_QUALITY }).toBuffer()

const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const decodeHtml = (text = '') =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const wpStatusToLocal = (status) => {
  switch (status) {
    case 'publish':
      return 'published'
    case 'draft':
      return 'draft'
    case 'pending':
      return 'pending'
    case 'future':
      return 'scheduled'
    case 'trash':
      return 'trash'
    default:
      return 'draft'
  }
}

const fetchJson = async (url, options) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed (${response.status})`)
  }
  if (response.status === 204) return null
  const text = await response.text()
  if (!text.trim()) return null
  return JSON.parse(text)
}

const wpFetchAll = async (resource, params = {}) => {
  const perPage = 100
  let page = 1
  const results = []
  while (true) {
    const url = new URL(`/wp-json/wp/v2/${resource}`, wpUrl)
    url.searchParams.set('per_page', String(perPage))
    url.searchParams.set('page', String(page))
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      url.searchParams.set(key, String(value))
    })

    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${wpAuth}`,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(text || `WP request failed (${response.status})`)
    }

    const data = await response.json()
    results.push(...data)

    const totalPages = Number(response.headers.get('x-wp-totalpages') || '0')
    if (!totalPages || page >= totalPages) break
    page += 1
  }
  return results
}

const supabaseFetchAll = async (table, select) => {
  const pageSize = 1000
  let offset = 0
  const results = []

  while (true) {
    const url = new URL(`/rest/v1/${table}`, supabaseUrl)
    url.searchParams.set('select', select)
    url.searchParams.set('limit', String(pageSize))
    url.searchParams.set('offset', String(offset))

    const batch = await fetchJson(url, { headers: sbHeaders })
    if (!batch || batch.length === 0) break
    results.push(...batch)
    if (batch.length < pageSize) break
    offset += pageSize
  }

  return results
}

const buildInFilter = (values) =>
  values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(',')

const fetchExistingPostsBySlug = async (slugs) => {
  const chunkSize = 100
  const existing = []

  for (let i = 0; i < slugs.length; i += chunkSize) {
    const chunk = slugs.slice(i, i + chunkSize)
    if (chunk.length === 0) continue

    const url = new URL('/rest/v1/posts', supabaseUrl)
    url.searchParams.set('select', 'id,slug')
    url.searchParams.set('slug', `in.(${buildInFilter(chunk)})`)

    const batch = await fetchJson(url, { headers: sbHeaders })
    if (batch && batch.length > 0) {
      existing.push(...batch)
    }
  }

  return existing
}

const supabaseInsert = async (table, rows, onConflict) => {
  if (!rows.length) return
  const url = new URL(`/rest/v1/${table}`, supabaseUrl)
  if (onConflict) url.searchParams.set('on_conflict', onConflict)
  await fetchJson(url, {
    method: 'POST',
    headers: {
      ...sbHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
}

const supabasePatch = async (table, id, patch) => {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl)
  url.searchParams.set('id', `eq.${id}`)
  await fetchJson(url, {
    method: 'PATCH',
    headers: {
      ...sbHeaders,
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(patch),
  })
}

const uploadImage = async (postId, imageUrl) => {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Image download failed (${response.status})`)
  }
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const contentType = response.headers.get('content-type') || 'application/octet-stream'
  const sourceName = basename(new URL(imageUrl).pathname) || `image-${Date.now()}`
  const baseName = sourceName.replace(/\.[^.]+$/, '') || 'image'

  let uploadBuffer = buffer
  let uploadContentType = contentType
  let extension = extname(sourceName).slice(1) || extensionFromContentType(contentType)

  if (shouldConvertToWebp(contentType, sourceName)) {
    try {
      uploadBuffer = await convertToWebp(buffer)
      uploadContentType = 'image/webp'
      extension = 'webp'
    } catch (error) {
      console.warn(`WebP conversion failed, keeping original bytes: ${error}`)
    }
  }

  const filename = `${Date.now()}-${baseName}.${extension}`
  const path = `post-images/${postId}/${filename}`
  const encodedPath = path.split('/').map(encodeURIComponent).join('/')

  const uploadUrl = `${supabaseUrl}/storage/v1/object/post-images/${encodedPath}`
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      'Content-Type': uploadContentType,
      'x-upsert': 'true',
    },
    body: uploadBuffer,
  })

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text()
    throw new Error(text || `Image upload failed (${uploadResponse.status})`)
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/post-images/${encodedPath}`
  return { path, publicUrl }
}

const main = async () => {
  console.log('Fetching WordPress categories and tags...')
  const wpCategories = await wpFetchAll('categories')
  const wpTags = await wpFetchAll('tags')

  console.log('Syncing categories...')
  const existingCategories = await supabaseFetchAll('post_categories', 'id,slug,parent_id')
  const categoryBySlug = new Map(existingCategories.map((cat) => [cat.slug, cat]))

  const newCategories = wpCategories
    .filter((cat) => !categoryBySlug.has(cat.slug))
    .map((cat) => ({
      name: decodeHtml(cat.name),
      slug: cat.slug,
      description: cat.description || null,
      parent_id: null,
      order_weight: 0,
      is_active: true,
    }))

  if (!dryRun) {
    await supabaseInsert('post_categories', newCategories, 'slug')
  }

  const allCategories = await supabaseFetchAll('post_categories', 'id,slug,parent_id')
  const refreshedCategoryBySlug = new Map(allCategories.map((cat) => [cat.slug, cat]))
  const wpCategoryById = new Map(wpCategories.map((cat) => [cat.id, cat]))

  if (!dryRun) {
    for (const wpCategory of wpCategories) {
      if (!wpCategory.parent) continue
      const parent = wpCategoryById.get(wpCategory.parent)
      if (!parent) continue
      const current = refreshedCategoryBySlug.get(wpCategory.slug)
      const parentRow = refreshedCategoryBySlug.get(parent.slug)
      if (!current || !parentRow) continue
      if (current.parent_id === parentRow.id) continue
      await supabasePatch('post_categories', current.id, { parent_id: parentRow.id })
    }
  }

  console.log('Syncing tags...')
  const existingTags = await supabaseFetchAll('post_tags', 'id,slug')
  const tagBySlug = new Map(existingTags.map((tag) => [tag.slug, tag]))

  const newTags = wpTags
    .filter((tag) => !tagBySlug.has(tag.slug))
    .map((tag) => ({
      name: decodeHtml(tag.name),
      slug: tag.slug,
      description: tag.description || null,
      is_active: true,
    }))

  if (!dryRun) {
    await supabaseInsert('post_tags', newTags, 'slug')
  }

  const allTags = await supabaseFetchAll('post_tags', 'id,slug')
  const refreshedTagBySlug = new Map(allTags.map((tag) => [tag.slug, tag]))

  console.log('Fetching WordPress posts...')
  let wpPosts = []
  try {
    wpPosts = await wpFetchAll('posts', { status: 'any', context: 'edit', _embed: 1 })
  } catch (error) {
    console.warn('Failed to fetch all statuses, falling back to published only.')
    console.warn(error.message)
    wpPosts = await wpFetchAll('posts', { status: 'publish', _embed: 1 })
  }
  const filteredPosts = limit ? wpPosts.slice(0, limit) : wpPosts

  console.log('Loading existing posts...')
  const slugsToCheck = filteredPosts
    .map((post) => post.slug)
    .filter(Boolean)
  const existingPosts = await fetchExistingPostsBySlug(slugsToCheck)
  const existingSlugs = new Set(existingPosts.map((post) => post.slug))

  let created = 0
  let skipped = 0

  for (const wpPost of filteredPosts) {
    const slug = wpPost.slug
    if (!slug) {
      skipped += 1
      continue
    }

    if (existingSlugs.has(slug)) {
      skipped += 1
      continue
    }

    const postId = randomUUID()
    const status = wpStatusToLocal(wpPost.status)
    const publishedAt = status === 'published' || status === 'scheduled'
      ? wpPost.date_gmt || wpPost.date
      : null

    let featuredImageUrl = ''
    let featuredImagePath = ''

    const embedded = wpPost._embedded || {}
    const media = embedded['wp:featuredmedia']
    const mediaUrl = Array.isArray(media) && media[0] ? media[0].source_url : null

    if (importImages && mediaUrl) {
      try {
        const uploaded = await uploadImage(postId, mediaUrl)
        featuredImageUrl = uploaded.publicUrl
        featuredImagePath = uploaded.path
      } catch (error) {
        console.warn(`Image upload failed for ${slug}:`, error.message)
      }
    } else if (mediaUrl) {
      featuredImageUrl = mediaUrl
    }

    const payload = {
      id: postId,
      title: decodeHtml(wpPost.title?.rendered || ''),
      slug,
      excerpt: stripHtml(wpPost.excerpt?.rendered || ''),
      body: wpPost.content?.rendered || '',
      featured_image_url: featuredImageUrl || null,
      featured_image_path: featuredImagePath || null,
      author_id: defaultAuthorId,
      status,
      published_at: publishedAt,
      featured: Boolean(wpPost.sticky),
      language: defaultLanguage,
      post_type: 'post',
      view_count: 0,
      created_at: wpPost.date_gmt || wpPost.date || null,
      updated_at: wpPost.modified_gmt || wpPost.modified || null,
    }

    if (dryRun) {
      console.log('Dry run insert:', payload.slug)
      created += 1
      continue
    }

    await supabaseInsert('posts', [payload], 'slug')
    created += 1

    const categoryIds = (wpPost.categories || [])
      .map((id) => wpCategoryById.get(id))
      .filter(Boolean)
      .map((cat) => refreshedCategoryBySlug.get(cat.slug))
      .filter(Boolean)
      .map((cat) => cat.id)

    const tagIds = (wpPost.tags || [])
      .map((id) => wpTags.find((tag) => tag.id === id))
      .filter(Boolean)
      .map((tag) => refreshedTagBySlug.get(tag.slug))
      .filter(Boolean)
      .map((tag) => tag.id)

    const categoryRows = categoryIds.map((categoryId) => ({
      post_id: postId,
      category_id: categoryId,
    }))

    const tagRows = tagIds.map((tagId) => ({
      post_id: postId,
      tag_id: tagId,
    }))

    if (categoryRows.length > 0) {
      await supabaseInsert('post_categories_map', categoryRows, 'post_id,category_id')
    }

    if (tagRows.length > 0) {
      await supabaseInsert('post_tags_map', tagRows, 'post_id,tag_id')
    }
  }

  console.log(`Done. Created: ${created}. Skipped: ${skipped}.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
