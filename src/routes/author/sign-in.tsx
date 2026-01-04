import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute('/author/sign-in')({
  component: AuthorSignInPage,
})

function AuthorSignInPage() {
  const { signIn, profile, loading } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { error } = await signIn(formData.email, formData.password)

      if (error) {
        toast.error(error.message || 'Failed to sign in')
        return
      }

      // Small delay to let the profile load
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Redirect based on role will be handled by effect below
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  // Redirect after profile loads
  if (!loading && profile) {
    if (profile.role === 'author') {
      if (profile.status === 'pending') {
        toast.info('Your account is pending admin approval')
      } else if (profile.status === 'rejected') {
        toast.error('Your account has been rejected. Please contact admin.')
      }
      navigate({ to: '/author/profile' })
    } else if (profile.role === 'admin') {
      navigate({ to: '/admin/dashboard' })
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Author Sign In</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to manage your author profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              placeholder="author@example.com"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting || loading}
            className="w-full"
          >
            {submitting || loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a
            href="/author/sign-up"
            className="font-semibold text-gray-900 hover:underline"
          >
            Sign up
          </a>
        </div>
      </div>
    </div>
  )
}
