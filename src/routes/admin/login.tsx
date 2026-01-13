import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : null,
  }),
  component: AdminLoginPage,
})

function AdminLoginPage() {
  const { signIn, signOut, profile, loading } = useAuth()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    // Profile will be loaded via React Query after signIn
    // We'll check the role in useEffect below
  }

  // Check role after profile loads
  useEffect(() => {
    if (submitting && profile && !loading) {
      if (profile.role === 'admin') {
        navigate({ to: redirect ?? '/admin/dashboard' })
      } else {
        // Not an admin - sign them out immediately
        signOut()
        setError('Access denied. This login is for administrators only.')
        setSubmitting(false)
      }
    }
  }, [profile, loading, submitting, navigate, redirect, signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white font-semibold">
            A
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Administrator Login
          </h1>
          <p className="text-sm text-gray-600">
            This is a restricted admin area.
          </p>
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            All access attempts are logged
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
              placeholder="admin@catalogus.co.mz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <svg
                  className="h-5 w-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full rounded-xl bg-red-600 text-white py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Verifying credentials...' : 'Sign in as Administrator'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Authorized personnel only. Admins are provisioned by the system administrator.
        </p>
      </div>
    </div>
  )
}
