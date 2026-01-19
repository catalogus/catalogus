import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'catalogus_newsletter_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the modal recently
    const dismissedAt = localStorage.getItem(STORAGE_KEY)
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      if (Date.now() - dismissedTime < DISMISS_DURATION_MS) {
        return
      }
    }

    // Show modal after 3 seconds
    const timer = setTimeout(() => {
      setIsOpen(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)

    // Simulate API call - will be replaced with Substack integration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSuccess(true)

    // Close modal after success
    setTimeout(() => {
      handleClose()
    }, 2000)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_1.2fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="hidden lg:block">
          <img
            src="/newsletter-bg.jpg"
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback gradient if image doesn't exist
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement!.style.background =
                'linear-gradient(135deg, #1c1b1a 0%, #3d2f23 50%, #c07238 100%)'
            }}
          />
        </div>

        {/* Content Side */}
        <div className="relative px-8 py-12 lg:px-10">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-gray-400 transition-colors hover:text-gray-900"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                Subscrição confirmada!
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Obrigado por se juntar à nossa comunidade.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9a8776]">
                Newsletter
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
                Junte-se à nossa comunidade
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
                Receba actualizações mensais sobre novos livros, eventos
                culturais, autores em destaque e muito mais.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="O seu email"
                    required
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'w-full bg-[#1c1b1a] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-white transition-colors',
                    'hover:bg-[#c07238] disabled:cursor-not-allowed disabled:opacity-50'
                  )}
                >
                  {isSubmitting ? 'A subscrever...' : 'Subscrever'}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-500">
                Pode cancelar a subscrição a qualquer momento.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
