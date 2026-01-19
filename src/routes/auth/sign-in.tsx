import { useState, useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/auth/sign-in')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : null,
  }),
  component: SignInPage,
})

function SignInPage() {
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

    // Profile will load via React Query after signIn
    // We'll handle redirect in useEffect below
  }

  // Handle role-based redirect after profile loads
  useEffect(() => {
    if (submitting && profile && !loading) {
      if (profile.role === 'customer') {
        navigate({ to: redirect ?? '/account/profile' })
      } else if (profile.role === 'author') {
        navigate({ to: redirect ?? '/author/profile' })
      } else if (profile.role === 'admin') {
        // Admins shouldn't use public login
        signOut()
        setError('Administradores devem usar o portal de admin.')
        setSubmitting(false)
      } else {
        // Unknown role
        setError('Nao foi possivel determinar o tipo de conta. Contacte o suporte.')
        setSubmitting(false)
      }
    }
  }, [profile, loading, submitting, navigate, redirect, signOut])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand)] px-6">
      <div className="w-full max-w-md bg-white backdrop-blur-sm shadow-xl p-8">
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="mx-auto inline-flex h-8 w-auto items-center justify-center"
          >
            <img src="/logo.svg" alt="Catalogus" className="h-6 w-auto" />
          </Link>
          <h1 className="mt-4 text-2xl font-semibold text-gray-900">
            Entrar na sua conta
          </h1>
          <p className="text-sm text-gray-500">
            Aceda a sua conta para ver livros e gerir pedidos.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-black focus:outline-none"
            placeholder="voce@exemplo.com"
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
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-black focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || submitting}
            className="w-full rounded-xl bg-black text-white py-3 text-sm font-semibold hover:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Precisa de uma conta?{' '}
          <Link to="/auth/sign-up" className="font-semibold text-gray-900 underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
