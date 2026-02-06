import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NewsletterSignupForm } from './newsletter/NewsletterSignupForm'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'

const STORAGE_KEY = 'catalogus_newsletter_dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export function NewsletterModal() {
  const { t } = useTranslation()
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

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem(STORAGE_KEY, Date.now().toString())
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) handleClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="relative w-full max-w-2xl overflow-hidden bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_1.2fr] p-0 rounded-none border-0"
        overlayClassName="bg-black/60"
        showCloseButton={false}
      >
        {/* Image Side */}
        <div className="hidden lg:block">
          <img
            src="/catalogos-1024x555.webp"
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
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
            aria-label={t('newsletter.modal.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <p className="text-xs uppercase tracking-[0.3em] text-[#9a8776]">
            {t('newsletter.modal.label')}
          </p>
          <DialogTitle className="mt-3 text-2xl font-semibold text-gray-900 md:text-3xl">
            {t('newsletter.modal.title')}
          </DialogTitle>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 md:text-base">
            {t('newsletter.modal.body')}
          </p>

          <div className="mt-6">
            <NewsletterSignupForm compact onSubmitted={handleClose} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
