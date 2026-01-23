import { useState, useEffect } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'
import { User, BookOpen, ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/auth/sign-up')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === 'string' ? search.redirect : null,
  }),
  component: SignUpPage,
})

type AccountType = 'customer' | 'author' | null

function HomeLink() {
  return (
    <div className="mb-6 flex justify-center">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
      >
        <img src="/logo.svg" alt="Catalogus" className="h-4 w-auto" />
      </Link>
    </div>
  )
}

function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType>(null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--brand)] px-6 py-12">
      <div className="w-full max-w-2xl">
        {accountType === null ? (
          <AccountTypeSelection onSelect={setAccountType} />
        ) : accountType === 'customer' ? (
          <CustomerSignUpForm onBack={() => setAccountType(null)} />
        ) : (
          <AuthorSignUpForm onBack={() => setAccountType(null)} />
        )}
      </div>
    </div>
  )
}

function AccountTypeSelection({ onSelect }: { onSelect: (type: AccountType) => void }) {
  return (
    <div className="bg-white backdrop-blur-sm  shadow-xl p-8">
      <HomeLink />
      <div className="text-center mb-8">
        <h1 className="mt-4 text-3xl font-semibold text-gray-900">
          Crie a sua conta
        </h1>
        <p className="mt-2 text-gray-600">
          Escolha o tipo de conta que pretende criar
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('customer')}
          className="group relative overflow-hidden border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full transition-all group-hover:w-full group-hover:h-full" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center  bg-blue-100 text-blue-600 mb-4">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Conta de cliente
            </h3>
            <p className="text-sm text-gray-600">
              Explore e compre livros, gere pedidos e descubra o nosso catalogo
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('author')}
          className="group relative overflow-hidden border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-green-500 hover:shadow-lg"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full transition-all group-hover:w-full group-hover:h-full" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center bg-green-100 text-green-600 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Conta de autor
            </h3>
            <p className="text-sm text-gray-600">
              Publique conteudo, gira o seu perfil de autor e conecte-se com leitores
            </p>
          </div>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Ja tem uma conta?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}

function CustomerSignUpForm({ onBack }: { onBack: () => void }) {
  const { signUp, profile, loading } = useAuth()
  const navigate = useNavigate()
  const { redirect } = Route.useSearch()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setSubmitting(true)

    const { error: signUpError } = await signUp(email, password, name)

    if (signUpError) {
      setError(signUpError.message)
      setSubmitting(false)
      return
    }

    // Profile will load via React Query after signUp
    // We'll handle redirect in useEffect below
  }

  // Handle redirect after profile loads
  useEffect(() => {
    if (submitting && profile && !loading) {
      navigate({ to: redirect ?? '/account/profile' })
    }
  }, [profile, loading, submitting, navigate, redirect])

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-xl p-8">
      <HomeLink />
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar a selecao de conta
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-3">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Criar conta de cliente
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Comece a explorar e comprar livros na Catalogus
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Seu nome"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="voce@exemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Minimo 8 caracteres"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar senha <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Digite novamente a senha"
          />
        </div>

        {error && (
          <div className=" border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full  bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'A criar conta...' : 'Criar conta de cliente'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Ja tem uma conta?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}

function AuthorSignUpForm({ onBack }: { onBack: () => void }) {
  const { signUpAuthor } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    bio: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    if (file && file.size > 5 * 1024 * 1024) {
      setError('A foto deve ter menos de 5MB')
      return
    }
    setPhotoFile(file)
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    } else {
      setPhotoPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setSubmitting(true)

    try {
      const { error: signUpError } = await signUpAuthor(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.bio,
        photoFile,
      )

      if (signUpError) {
        setError(signUpError.message || 'Falha ao criar conta de autor')
        setSubmitting(false)
        return
      }

      // Redirect to author sign-in with success message
      navigate({
        to: '/author/sign-in',
        search: { message: 'Conta criada! Aguarde a aprovacao do admin.' },
      })
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado')
      setSubmitting(false)
    }
  }

  const bioLength = formData.bio.length
  const bioMaxLength = 500

  return (
    <div className="bg-white/90 backdrop-blur-sm shadow-xl p-8">
      <HomeLink />
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar a selecao de conta
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white mb-3">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Criar conta de autor
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          A sua conta sera revista pela nossa equipa antes da aprovacao
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Nome Apelido"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            placeholder="autor@exemplo.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar senha <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Digite novamente a senha"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            placeholder="+258 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biografia
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            maxLength={bioMaxLength}
            rows={4}
            className="w-full  border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            placeholder="Fale sobre si e o seu trabalho..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {bioLength}/{bioMaxLength} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto de perfil
          </label>
          <div className="flex items-start gap-4">
            {photoPreview && (
              <img
                src={photoPreview}
                alt="Preview"
                className="h-20 w-20 rounded-lg object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tamanho maximo do ficheiro: 5MB. Formatos suportados: JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className=" border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200  p-4">
          <p className="text-sm text-blue-900">
            <strong>Nota:</strong> As contas de autor exigem aprovacao do admin. Vai receber um
            email quando a conta for revista.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full  bg-green-600 text-white py-3 text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'A criar conta...' : 'Criar conta de autor'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Ja tem uma conta?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
