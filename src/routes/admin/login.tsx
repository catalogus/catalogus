import { useState, useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'
import { ClientOnly } from '../../components/ClientOnly'

export const Route = createFileRoute('/admin/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : null,
  }),
  component: AdminLoginRoute,
})

function AdminLoginRoute() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--brand)] px-6">
          <div className="text-sm text-gray-200">Loading...</div>
        </div>
      }
    >
      <AdminLoginPage />
    </ClientOnly>
  )
}

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
        setError('Acesso negado. Este login e apenas para administradores.')
        setSubmitting(false)
      }
    }
  }, [profile, loading, submitting, navigate, redirect, signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand)] px-6">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl p-8">
        <div className="mb-4 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <img src="/logo.svg" alt="Catalogus" className="h-4 w-auto" />
          </Link>
        </div>
        <div className="mb-6 text-center">
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Login de administrador
          </h1>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email do admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
              placeholder="admin@catalogus.co.mz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-600/20"
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
            className="w-full bg-red-600 text-white py-3 text-sm font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'A verificar credenciais...' : 'Entrar como administrador'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Apenas pessoal autorizado. Contas de admin sao criadas pelo administrador do sistema.
        </p>
      </div>
    </div>
  )
}
