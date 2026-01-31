import { createClient } from '@supabase/supabase-js'

type Args = {
  limit: number
  offset: number
  status: string | null
  language: string | null
  dryRun: boolean
}

const parseArgs = (): Args => {
  const args = process.argv.slice(2)
  const parsed: Args = {
    limit: 50,
    offset: 0,
    status: null,
    language: null,
    dryRun: false,
  }

  args.forEach((arg) => {
    if (arg.startsWith('--limit=')) parsed.limit = Number(arg.split('=')[1])
    if (arg.startsWith('--offset=')) parsed.offset = Number(arg.split('=')[1])
    if (arg.startsWith('--status=')) parsed.status = arg.split('=')[1] || null
    if (arg.startsWith('--language=')) parsed.language = arg.split('=')[1] || null
    if (arg === '--dry-run') parsed.dryRun = true
  })

  return parsed
}

const requireEnv = (key: string) => {
  const value = process.env[key]
  if (!value) throw new Error(`Missing ${key} env var.`)
  return value
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const main = async () => {
  const { limit, offset, status, language, dryRun } = parseArgs()
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN
  const functionUrl =
    process.env.TRANSLATE_FUNCTION_URL ||
    (supabaseUrl ? `${supabaseUrl}/functions/v1/translate-post` : '')
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceRoleKey || !adminAccessToken || !functionUrl) {
    throw new Error(
      'Missing SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, ADMIN_ACCESS_TOKEN, or TRANSLATE_FUNCTION_URL.',
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  let pageOffset = offset
  let processed = 0

  while (true) {
    let query = supabase
      .from('posts')
      .select('id, language, status, source_post_id, created_at', {
        count: 'exact',
      })
      .is('source_post_id', null)
      .neq('status', 'trash')
      .order('created_at', { ascending: true })
      .range(pageOffset, pageOffset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (language && language !== 'all') {
      query = query.eq('language', language)
    }

    const { data, error } = await query
    if (error) throw error
    if (!data || data.length === 0) break

    for (const post of data) {
      processed += 1
      if (dryRun) {
        console.log(`[dry-run] translate ${post.id} (${post.language})`)
        continue
      }

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminAccessToken}`,
          ...(supabaseAnonKey ? { apikey: supabaseAnonKey } : {}),
        },
        body: JSON.stringify({ post_id: post.id }),
      })

      if (!response.ok) {
        const text = await response.text()
        console.warn(
          `Failed to translate ${post.id} (${post.language}): ${response.status} ${text}`,
        )
      } else {
        const payload = await response.json()
        console.log(`Translated ${post.id} (${post.language}):`, payload?.status)
      }

      await sleep(150)
    }

    pageOffset += limit
  }

  console.log(`Backfill complete. Processed ${processed} posts.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
