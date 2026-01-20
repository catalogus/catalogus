import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const STORAGE_KEY = 'catalogus_newsletter_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false)

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

          <p className="text-xs uppercase tracking-[0.3em] text-[#9a8776]">
            Newsletter
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
            Junte-se à nossa comunidade
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
            Receba actualizações mensais sobre novos livros, eventos culturais,
            autores em destaque e muito mais.
          </p>

          <div className="mt-6">
            <iframe
              src="https://catalogusautores.substack.com/embed"
              className="h-40 w-full border border-gray-200 bg-white"
              title="Substack newsletter subscription"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
