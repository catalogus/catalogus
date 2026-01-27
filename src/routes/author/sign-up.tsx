import { useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute('/author/sign-up')({
  component: AuthorSignUpPage,
})

function AuthorSignUpPage() {
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
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPhotoFile(file)
    if (file) {
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setSubmitting(true)

    try {
      const { error } = await signUpAuthor(
        formData.email,
        formData.password,
        formData.name,
        formData.phone,
        formData.bio,
        photoFile,
      )

      if (error) {
        toast.error(error.message || 'Falha ao criar conta')
        return
      }

      toast.success(
        'Conta criada com sucesso! Aguarde a aprovação do administrador. Já pode iniciar sessão.',
      )
      navigate({ to: '/author/sign-in' })
    } catch (err: any) {
      toast.error(err.message || 'Ocorreu um erro inesperado')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8">
        <div className="mb-4 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            <img src="/logo.svg" alt="Catalogus" className="h-4 w-auto" />
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Criar conta de autor</h1>
          <p className="mt-2 text-sm text-gray-600">
            Crie a sua conta de autor para começar a publicar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              minLength={2}
              maxLength={100}
              placeholder="Nome Apelido"
              className="rounded-none"
            />
          </div>

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
              placeholder="autor@exemplo.com"
              className="rounded-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">
                Senha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className="rounded-none"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirmar senha <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
                minLength={8}
                placeholder="Digite novamente a senha"
                className="rounded-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+258 84 123 4567"
              className="rounded-none"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Biografia (opcional)</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Fale sobre si (máximo 500 caracteres)"
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
            <p className="text-xs text-gray-500">
              {formData.bio.length}/500 caracteres
            </p>
          </div>

          {/* Photo */}
          <div className="space-y-2">
            <Label htmlFor="photo">Foto de perfil (opcional)</Label>
            {photoPreview && (
              <div className="mb-2">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="h-24 w-24 object-cover border border-gray-200"
                />
              </div>
            )}
            <Input
              id="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="rounded-none"
            />
            <p className="text-xs text-gray-500">
              Máximo 5MB. Formatos suportados: JPG, PNG, WEBP, GIF
            </p>
          </div>

          {/* Submit */}
          <Button type="submit" disabled={submitting} className="w-full rounded-none">
            {submitting ? 'A criar conta...' : 'Criar conta'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <a
            href="/author/sign-in"
            className="font-semibold text-gray-900 hover:underline"
          >
            Iniciar sessão
          </a>
        </div>
      </div>
    </div>
  )
}
