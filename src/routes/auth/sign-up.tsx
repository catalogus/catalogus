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

function SignUpPage() {
  const [accountType, setAccountType] = useState<AccountType>(null)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 px-6 py-12">
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
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-white font-semibold">
          C
        </div>
        <h1 className="mt-4 text-3xl font-semibold text-gray-900">
          Create your account
        </h1>
        <p className="mt-2 text-gray-600">
          Choose the type of account you want to create
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onSelect('customer')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-blue-500 hover:shadow-lg"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-bl-full transition-all group-hover:w-full group-hover:h-full" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4">
              <User className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Customer Account
            </h3>
            <p className="text-sm text-gray-600">
              Browse and purchase books, manage orders, and explore our catalog
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onSelect('author')}
          className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-6 text-left transition-all hover:border-green-500 hover:shadow-lg"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-bl-full transition-all group-hover:w-full group-hover:h-full" />
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Author Account
            </h3>
            <p className="text-sm text-gray-600">
              Publish content, manage your author profile, and connect with readers
            </p>
          </div>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Sign in
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
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
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
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to account type selection
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white mb-3">
          <User className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Create customer account
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Start browsing and purchasing books from Catalogus
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Your name"
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
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Minimum 8 characters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Re-enter your password"
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || submitting}
          className="w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating account...' : 'Create customer account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Sign in
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
      setError('Photo size must be less than 5MB')
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
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
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
        setError(signUpError.message || 'Failed to create author account')
        setSubmitting(false)
        return
      }

      // Redirect to author sign-in with success message
      navigate({
        to: '/author/sign-in',
        search: { message: 'Account created! Awaiting admin approval.' },
      })
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  const bioLength = formData.bio.length
  const bioMaxLength = 500

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to account type selection
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-green-600 text-white mb-3">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Create author account
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Your account will be reviewed by our team before approval
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="John Doe"
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
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="author@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              placeholder="Re-enter password"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            placeholder="+258 XX XXX XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            maxLength={bioMaxLength}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            placeholder="Tell us about yourself and your work..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {bioLength}/{bioMaxLength} characters
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile photo
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
                Max file size: 5MB. Supported formats: JPG, PNG, WebP
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Author accounts require admin approval. You'll receive an email
            once your account is reviewed.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-green-600 text-white py-3 text-sm font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Creating account...' : 'Create author account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/auth/sign-in" className="font-semibold text-gray-900 underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
