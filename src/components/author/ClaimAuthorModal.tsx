import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../ui/button'

type ClaimVerificationData = {
  authorId: string
  authorName: string
  email: string
  phone: string
  message: string
}

type ClaimAuthorModalProps = {
  isOpen: boolean
  onClose: () => void
  authorId: string
  authorName: string
  onSubmit: (data: ClaimVerificationData) => void
}

export function ClaimAuthorModal({
  isOpen,
  onClose,
  authorId,
  authorName,
  onSubmit,
}: ClaimAuthorModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }

    if (!phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!message.trim()) {
      newErrors.message = 'Mensagem é obrigatória'
    } else if (message.trim().length < 20) {
      newErrors.message = 'A mensagem deve ter pelo menos 20 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    onSubmit({
      authorId,
      authorName,
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 shadow-2xl rounded-none">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#fafafa] px-8 py-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 tracking-tight">
              Reivindicar Perfil de Autor
            </h2>
            <p className="text-xs text-gray-600 mt-1 uppercase tracking-[0.2em]">
              Verificação de identidade
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-900 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="px-8 py-6">
          <div className="mb-6 bg-[#f8f4ef] border border-gray-200 p-4 rounded-none">
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-1">
              Perfil a reivindicar
            </p>
            <p className="text-lg font-semibold text-gray-900">{authorName}</p>
          </div>

          <p className="text-sm text-gray-700 mb-6 leading-relaxed">
            Para verificar que este perfil é seu, forneça as seguintes informações. Um
            administrador irá revisar a sua solicitação antes de aprovar.
          </p>

          <div className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2.5 border bg-white text-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                }`}
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                Telefone <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`w-full px-4 py-2.5 border bg-white text-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${
                  errors.phone
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                }`}
                placeholder="+258 XX XXX XXXX"
              />
              {errors.phone && (
                <p className="mt-1.5 text-xs text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                Porque este perfil é seu? <span className="text-red-600">*</span>
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                className={`w-full px-4 py-2.5 border bg-white text-gray-900 rounded-none focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none transition-all ${
                  errors.message
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-gray-900 focus:border-gray-900'
                }`}
                placeholder="Explique porque este perfil pertence a você. Inclua detalhes que apenas o autor conheceria, como obras publicadas, eventos em que participou, ou outras informações verificáveis..."
              />
              {errors.message && (
                <p className="mt-1.5 text-xs text-red-600">{errors.message}</p>
              )}
              <p className="mt-1.5 text-xs text-gray-500">
                Mínimo 20 caracteres • {message.length}/20
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 bg-white text-gray-900 text-sm font-medium rounded-none hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-none hover:bg-gray-800 transition-colors"
            >
              Continuar para Criar Conta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
