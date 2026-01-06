#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limitValue = limitArg ? Number(limitArg.split('=')[1]) : null
const limit = Number.isFinite(limitValue) ? limitValue : null
const dryRun = args.includes('--dry-run')
const updateExisting = args.includes('--update-existing')
const statusArg = args.find((arg) => arg.startsWith('--status='))

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
const wpPostType = normalizeEnvValue(process.env.WP_AUTHOR_CPT) || 'autores'
const wpStatus = statusArg?.split('=')[1] || normalizeEnvValue(process.env.WP_AUTHOR_STATUS) || 'publish'
const supabaseUrl = normalizeEnvValue(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
)
const supabaseServiceKey =
  normalizeEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  )

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

const stripHtml = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

const decodeHtml = (text = '') =>
  text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const normalizeUrl = (value) => {
  if (!value) return null
  const trimmed = String(value).trim()
  return trimmed || null
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

const buildInFilter = (values) =>
  values.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(',')

const fetchExistingAuthorsByWpId = async (wpIds) => {
  const chunkSize = 100
  const existing = []

  for (let i = 0; i < wpIds.length; i += chunkSize) {
    const chunk = wpIds.slice(i, i + chunkSize)
    if (!chunk.length) continue

    const url = new URL('/rest/v1/authors', supabaseUrl)
    url.searchParams.set('select', 'id,wp_id')
    url.searchParams.set('wp_id', `in.(${buildInFilter(chunk)})`)

    const batch = await fetchJson(url, { headers: sbHeaders })
    if (batch && batch.length > 0) {
      existing.push(...batch)
    }
  }

  return existing
}

const supabaseUpsertAuthors = async (rows) => {
  if (!rows.length) return
  const url = new URL('/rest/v1/authors', supabaseUrl)
  url.searchParams.set('on_conflict', 'wp_id')
  await fetchJson(url, {
    method: 'POST',
    headers: {
      ...sbHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  })
}

const normalizeBirthDate = (value) => {
  if (!value) return null
  const trimmed = String(value).trim()
  if (!trimmed) return null
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`
  return null
}

const resolveFeaturedImageUrl = (wpAuthor) => {
  const embedded = wpAuthor?._embedded || {}
  const media = embedded['wp:featuredmedia']
  if (Array.isArray(media) && media[0]) {
    return (
      media[0].source_url ||
      media[0]?.media_details?.sizes?.large?.source_url ||
      media[0]?.media_details?.sizes?.full?.source_url ||
      null
    )
  }
  return null
}

const normalizePublishedWorks = (works) => {
  if (!Array.isArray(works)) return []
  return works.map((work) => {
    const cover = work?.cover || null
    return {
      cover_url: cover?.url || null,
      cover_path: null,
      title: work?.titulo_da_obra || '',
      genre: work?.genero_literario || '',
      synopsis: work?.sinopse_da_obra || '',
      link: work?.link_da_obra || null,
    }
  })
}

const normalizeGallery = (gallery) => {
  if (!Array.isArray(gallery)) return []
  return gallery.map((item) => ({
    url: item?.url || '',
    path: null,
    caption: item?.caption || item?.title || undefined,
  }))
}

const buildSocialLinks = (acf) => {
  if (!acf) return null
  const links = {
    website: normalizeUrl(acf.website),
    linkedin: normalizeUrl(acf.linkedin),
    facebook: normalizeUrl(acf.facebook),
    instagram: normalizeUrl(acf.instagram),
    twitter: normalizeUrl(acf.twitter),
    youtube: normalizeUrl(acf.youtube),
  }
  const filtered = Object.fromEntries(
    Object.entries(links).filter(([, value]) => value),
  )
  return Object.keys(filtered).length ? filtered : null
}

const buildAuthorPayload = (wpAuthor) => {
  const acf = wpAuthor.acf || {}
  const firstName = decodeHtml(acf.nome_do_autor || '').trim()
  const lastName = decodeHtml(acf.apelido_do_autor || '').trim()
  const titleName = decodeHtml(wpAuthor.title?.rendered || '').trim()
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const name = fullName || titleName || `Autor ${wpAuthor.id}`
  const bioSource =
    wpAuthor.excerpt?.rendered ||
    wpAuthor.content?.rendered ||
    ''
  const bio = stripHtml(decodeHtml(bioSource)) || null
  const phone = acf.contacto_autor ? String(acf.contacto_autor) : null
  const authorType = acf.author_type || acf.tipo_de_autor || null
  const socialLinks = buildSocialLinks(acf)

  return {
    wp_id: wpAuthor.id,
    wp_slug: wpAuthor.slug || null,
    name,
    bio,
    photo_url: resolveFeaturedImageUrl(wpAuthor),
    phone,
    birth_date: normalizeBirthDate(acf.data_de_nascimento),
    residence_city: acf.cidade_de_residencia || null,
    province: acf.cidade_de_nascimento || null,
    published_works: normalizePublishedWorks(acf.obras_publicadas),
    author_gallery: normalizeGallery(acf.galeria_do_autor),
    featured_video: acf.video_do_youtube || null,
    author_type: authorType,
    social_links: socialLinks,
  }
}

const main = async () => {
  console.log(`Fetching WordPress CPT "${wpPostType}"...`)
  let wpAuthors = []
  try {
    wpAuthors = await wpFetchAll(wpPostType, { status: wpStatus, _embed: 1 })
  } catch (error) {
    console.warn('Failed to fetch with status filter, retrying without status.')
    console.warn(error.message)
    wpAuthors = await wpFetchAll(wpPostType, { _embed: 1 })
  }

  const filteredAuthors = limit ? wpAuthors.slice(0, limit) : wpAuthors
  if (!filteredAuthors.length) {
    console.log('No authors found.')
    return
  }

  const wpIds = filteredAuthors.map((author) => author.id).filter(Boolean)
  console.log('Loading existing authors...')
  const existingAuthors = await fetchExistingAuthorsByWpId(wpIds)
  const existingByWpId = new Set(existingAuthors.map((row) => row.wp_id))

  const toUpsert = []
  let skippedExisting = 0

  for (const wpAuthor of filteredAuthors) {
    if (!wpAuthor?.id) continue
    if (!updateExisting && existingByWpId.has(wpAuthor.id)) {
      skippedExisting += 1
      continue
    }
    toUpsert.push(buildAuthorPayload(wpAuthor))
  }

  if (dryRun) {
    console.log(`Dry run: would upsert ${toUpsert.length} authors.`)
    console.log(`Skipped existing: ${skippedExisting}`)
    return
  }

  const chunkSize = 100
  for (let i = 0; i < toUpsert.length; i += chunkSize) {
    const chunk = toUpsert.slice(i, i + chunkSize)
    await supabaseUpsertAuthors(chunk)
  }

  console.log('Done.')
  console.log(`Upserted: ${toUpsert.length}`)
  console.log(`Skipped existing: ${skippedExisting}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
