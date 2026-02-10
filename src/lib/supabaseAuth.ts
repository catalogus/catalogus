import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabaseClient'

const REFRESH_BUFFER_MS = 60_000
const MIN_REFRESH_INTERVAL_MS = 10_000
let lastRefreshAt = 0

type FreshSessionResult = {
  session: Session | null
  refreshed: boolean
}

const shouldRefresh = (session: Session, bufferMs: number) => {
  if (!session.expires_at) return true
  const expiresAtMs = session.expires_at * 1000
  return expiresAtMs - Date.now() <= bufferMs
}

export const getFreshSession = async (
  bufferMs: number = REFRESH_BUFFER_MS,
): Promise<FreshSessionResult> => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    throw new Error(error.message)
  }

  const session = data.session
  if (!session) {
    return { session: null, refreshed: false }
  }

  if (!shouldRefresh(session, bufferMs)) {
    return { session, refreshed: false }
  }

  const now = Date.now()
  if (now - lastRefreshAt < MIN_REFRESH_INTERVAL_MS) {
    return { session, refreshed: false }
  }

  const { data: refreshed, error: refreshError } =
    await supabase.auth.refreshSession()
  if (refreshError) {
    throw new Error(refreshError.message)
  }

  lastRefreshAt = now
  return { session: refreshed.session ?? session, refreshed: true }
}

export const forceRefreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession()
  if (error) {
    throw new Error(error.message)
  }
  lastRefreshAt = Date.now()
  return data.session ?? null
}

export const getFreshAccessToken = async (
  bufferMs: number = REFRESH_BUFFER_MS,
) => {
  const { session } = await getFreshSession(bufferMs)
  return session?.access_token ?? null
}

type AuthorizedFetchOptions = {
  retryOnAuthFailure?: boolean
}

export const authorizedFetch = async (
  input: RequestInfo | URL,
  init: RequestInit,
  options: AuthorizedFetchOptions = {},
) => {
  const retryOnAuthFailure = options.retryOnAuthFailure !== false

  const withToken = (token: string) => {
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    return fetch(input, { ...init, headers })
  }

  const token = await getFreshAccessToken()
  if (!token) {
    throw new Error('Missing auth session. Please sign in again.')
  }

  const response = await withToken(token)
  if (!retryOnAuthFailure || (response.status !== 401 && response.status !== 403)) {
    return response
  }

  const refreshedSession = await forceRefreshSession()
  const refreshedToken = refreshedSession?.access_token
  if (!refreshedToken) {
    return response
  }

  return withToken(refreshedToken)
}
