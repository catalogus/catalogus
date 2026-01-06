#!/usr/bin/env node
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const limitArg = args.find((arg) => arg.startsWith('--limit='))
const limitValue = limitArg ? Number(limitArg.split('=')[1]) : null
const limit = Number.isFinite(limitValue) ? limitValue : null
const dryRun = args.includes('--dry-run')
const updateExisting = args.includes('--update-existing')
const forceStatus = args.includes('--force-status')
const rolesArg = args.find((arg) => arg.startsWith('--roles='))
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
const supabaseUrl = normalizeEnvValue(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
)
const supabaseServiceKey =
  normalizeEnvValue(
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY,
  )
const defaultAuthorStatus = normalizeEnvValue(process.env.AUTHOR_STATUS) || 'approved'
const rolesFilterRaw =
  rolesArg?.split('=')[1] ?? normalizeEnvValue(process.env.WP_AUTHOR_ROLES) ?? ''

if (!wpUrl || !wpUser || !wpAppPassword) {
  console.error('Missing WP_URL, WP_USER, or WP_APP_PASSWORD.')
  process.exit(1)
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL (or VITE_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const authorStatus = (statusArg?.split('=')[1] ?? defaultAuthorStatus).toLowerCase()
const validStatuses = new Set(['pending', 'approved', 'rejected'])
if (!validStatuses.has(authorStatus)) {
  console.error(`Invalid author status "${authorStatus}". Use pending, approved, or rejected.`)
  process.exit(1)
}

const rolesFilter = rolesFilterRaw
  .split(',')
  .map((role) => role.trim().toLowerCase())
  .filter(Boolean)

const wpAuth = Buffer.from(`${wpUser}:${wpAppPassword}`).toString('base64')

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

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

const normalizeEmail = (email) => {
  if (!email) return null
  const trimmed = email.trim().toLowerCase()
  return trimmed || null
}

const resolveAvatarUrl = (avatarUrls) => {
  if (!avatarUrls || typeof avatarUrls !== 'object') return null
  const entries = Object.entries(avatarUrls)
    .filter((entry) => entry[1])
    .sort((a, b) => Number(b[0]) - Number(a[0]))
  if (!entries.length) return null
  return entries[0][1]
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

const fetchExistingProfilesByEmail = async (emails) => {
  const chunkSize = 100
  const existing = []

  for (let i = 0; i < emails.length; i += chunkSize) {
    const chunk = emails.slice(i, i + chunkSize)
    if (!chunk.length) continue

    const url = new URL('/rest/v1/profiles', supabaseUrl)
    url.searchParams.set(
      'select',
      'id,email,role,status,name,bio,photo_url,social_links,author_type',
    )
    url.searchParams.set('email', `in.(${buildInFilter(chunk)})`)

    const batch = await fetchJson(url, { headers: sbHeaders })
    if (batch && batch.length > 0) {
      existing.push(...batch)
    }
  }

  return existing
}

const supabaseUpsertProfile = async (payload) => {
  const url = new URL('/rest/v1/profiles', supabaseUrl)
  url.searchParams.set('on_conflict', 'id')
  await fetchJson(url, {
    method: 'POST',
    headers: {
      ...sbHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify([payload]),
  })
}

const generatePassword = () => randomBytes(16).toString('hex')

const findAuthUserByEmail = async (email) => {
  const perPage = 1000
  let page = 1
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    })
    if (error) throw error
    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    )
    if (match) return match
    if (data.users.length < perPage) break
    page += 1
  }
  return null
}

const createOrFindAuthUser = async (email, name, wpUserId) => {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: generatePassword(),
    email_confirm: true,
    user_metadata: { name, wp_user_id: wpUserId },
  })

  if (!error && data.user) {
    return { user: data.user, created: true }
  }

  if (error && /already registered|already exists/i.test(error.message)) {
    const existing = await findAuthUserByEmail(email)
    if (!existing) {
      throw new Error(`User already exists but could not be loaded for ${email}`)
    }
    return { user: existing, created: false }
  }

  throw error
}

const shouldIncludeRoles = (user) => {
  if (!rolesFilter.length) return true
  const roles = Array.isArray(user.roles) ? user.roles.map((role) => role.toLowerCase()) : []
  if (!roles.length) return true
  return roles.some((role) => rolesFilter.includes(role))
}

const buildSocialLinks = (user) => {
  if (!user.url) return null
  return { website: user.url }
}

const buildProfilePayload = ({ userId, email, name, bio, photoUrl, socialLinks, authorType }) => {
  const payload = {
    id: userId,
    role: 'author',
    email,
  }

  if (name) payload.name = name
  if (bio) payload.bio = bio
  if (photoUrl) payload.photo_url = photoUrl
  if (socialLinks) payload.social_links = socialLinks
  if (authorType) payload.author_type = authorType

  return payload
}

const main = async () => {
  console.log('Fetching WordPress users...')
  const wpUsers = await wpFetchAll('users', { context: 'edit' })
  const filteredUsers = limit ? wpUsers.slice(0, limit) : wpUsers

  if (rolesFilter.length) {
    console.log(`Filtering WP users by roles: ${rolesFilter.join(', ')}`)
  }

  const authorCandidates = filteredUsers.filter(shouldIncludeRoles)
  const emailSet = new Set()
  const normalizedEmails = []
  let skippedNoEmail = 0
  let skippedDuplicateEmail = 0

  for (const user of authorCandidates) {
    const email = normalizeEmail(user.email)
    if (!email) {
      skippedNoEmail += 1
      continue
    }
    if (emailSet.has(email)) {
      skippedDuplicateEmail += 1
      continue
    }
    emailSet.add(email)
    normalizedEmails.push(email)
  }

  console.log('Loading existing profiles...')
  const existingProfiles = await fetchExistingProfilesByEmail(normalizedEmails)
  const existingByEmail = new Map(
    existingProfiles
      .filter((profile) => profile.email)
      .map((profile) => [profile.email.toLowerCase(), profile]),
  )

  let createdUsers = 0
  let updatedProfiles = 0
  let skippedAdmins = 0
  let skippedExisting = 0
  const processedEmails = new Set()

  for (const wpUser of authorCandidates) {
    const email = normalizeEmail(wpUser.email)
    if (!email || emailSet.has(email) === false) continue
    if (processedEmails.has(email)) continue
    processedEmails.add(email)

    const existing = existingByEmail.get(email)
    if (existing?.role === 'admin') {
      skippedAdmins += 1
      continue
    }

    const nameRaw = decodeHtml(
      wpUser.name || wpUser.display_name || wpUser.slug || '',
    ).trim()
    const name = nameRaw || email.split('@')[0] || 'Author'
    const bio = stripHtml(decodeHtml(wpUser.description || '')) || null
    const photoUrl = resolveAvatarUrl(wpUser.avatar_urls)
    const socialLinks = buildSocialLinks(wpUser)
    const authorType = wpUser.author_type || wpUser?.meta?.author_type || null

    if (existing && !updateExisting && existing.role === 'author') {
      if (!existing.status) {
        const payload = {
          id: existing.id,
          role: 'author',
          email,
          status: authorStatus,
        }
        if (dryRun) {
          console.log(`Dry run update status: ${email}`)
        } else {
          await supabaseUpsertProfile(payload)
        }
        updatedProfiles += 1
      } else {
        skippedExisting += 1
      }
      continue
    }

    let userId = existing?.id ?? null
    if (!userId) {
      if (dryRun) {
        console.log(`Dry run create user: ${email}`)
        userId = 'dry-run'
        createdUsers += 1
      } else {
        const created = await createOrFindAuthUser(email, name, wpUser.id)
        userId = created.user.id
        if (created.created) createdUsers += 1
      }
    }

    if (!userId) {
      continue
    }

    const payload = buildProfilePayload({
      userId,
      email,
      name,
      bio,
      photoUrl,
      socialLinks,
      authorType,
    })

    if (!existing || updateExisting || !existing.status || forceStatus) {
      payload.status = existing?.status && !forceStatus ? existing.status : authorStatus
    }

    if (dryRun) {
      console.log(`Dry run upsert profile: ${email}`)
    } else {
      await supabaseUpsertProfile(payload)
    }
    updatedProfiles += 1
  }

  console.log('Done.')
  console.log(`Created auth users: ${createdUsers}`)
  console.log(`Upserted profiles: ${updatedProfiles}`)
  console.log(`Skipped admins: ${skippedAdmins}`)
  console.log(`Skipped existing: ${skippedExisting}`)
  console.log(`Skipped missing email: ${skippedNoEmail}`)
  console.log(`Skipped duplicate email: ${skippedDuplicateEmail}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
