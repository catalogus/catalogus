import type { Session } from '@supabase/supabase-js'

const DEFAULT_STOREFRONT_URL = 'https://catalogus.co.mz'
const DEFAULT_CMS_URL = 'https://admin.catalogus.co.mz'

export const STOREFRONT_URL =
  import.meta.env.VITE_STOREFRONT_URL || DEFAULT_STOREFRONT_URL
export const CMS_URL = import.meta.env.VITE_CMS_URL || DEFAULT_CMS_URL

const localOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174']

const allowedOrigins = new Set(
  [STOREFRONT_URL, CMS_URL, ...localOrigins]
    .map((value) => {
      try {
        return new URL(value).origin
      } catch {
        return null
      }
    })
    .filter((value): value is string => Boolean(value))
)

export function isAllowedOrigin(origin: string) {
  return allowedOrigins.has(origin)
}

export function sanitizeInternalPath(path: string | null | undefined, fallback = '/') {
  if (!path) return fallback
  if (!path.startsWith('/')) return fallback
  if (path.startsWith('//')) return fallback
  return path
}

export function buildStorefrontBridgeUrl(nextPath: string) {
  const safeNext = sanitizeInternalPath(nextPath, '/')
  const bridge = new URL('/auth/bridge', STOREFRONT_URL)
  bridge.searchParams.set('next', safeNext)
  return bridge.toString()
}

export function buildCmsAuthUrl(kind: 'login' | 'sign-up', nextPath: string) {
  const safeNext = sanitizeInternalPath(nextPath, '/')
  const target = new URL(kind === 'login' ? '/auth/login' : '/auth/author-sign-up', CMS_URL)
  target.searchParams.set('return_to', buildStorefrontBridgeUrl(safeNext))
  return target.toString()
}

export function buildCmsBridgeTransferUrl(session: Session, nextPath: string) {
  const target = new URL('/auth/bridge', CMS_URL)
  target.searchParams.set('next', sanitizeInternalPath(nextPath, '/perfil'))

  const hash = new URLSearchParams({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    from: STOREFRONT_URL,
  })

  return `${target.toString()}#${hash.toString()}`
}
