import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isAllowedOrigin, sanitizeInternalPath } from '../../lib/crossSiteAuth'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/auth/bridge')({
  component: StorefrontBridgePage,
})

function StorefrontBridgePage() {
  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const nextPath = sanitizeInternalPath(params.get('next'), '/')

      const fromOrigin = hash.get('from')
      const accessToken = hash.get('access_token')
      const refreshToken = hash.get('refresh_token')

      if (fromOrigin && !isAllowedOrigin(fromOrigin)) {
        window.location.replace(nextPath)
        return
      }

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
      }

      const cleanUrl = new URL(window.location.pathname, window.location.origin)
      cleanUrl.searchParams.set('next', nextPath)
      window.history.replaceState({}, document.title, `${cleanUrl.pathname}${cleanUrl.search}`)
      window.location.replace(nextPath)
    }

    void run()
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-600">
      A validar sessão...
    </div>
  )
}
