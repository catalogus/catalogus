import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { requestNewsletterSubscription } from '../../server/newsletter'
import { isValidEmail } from '../../lib/shopHelpers'

type NewsletterSignupFormProps = {
  bookId?: string | null
  compact?: boolean
  onSubmitted?: () => void
}

export function NewsletterSignupForm({
  bookId,
  compact = false,
  onSubmitted,
}: NewsletterSignupFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!isValidEmail(trimmed)) {
      setStatus('error')
      setMessage(t('newsletter.form.invalidEmail'))
      return
    }

    setStatus('submitting')
    setMessage(null)
    try {
      await requestNewsletterSubscription({ data: { email: trimmed, bookId } })
      setStatus('success')
      setMessage(t('newsletter.form.success'))
      onSubmitted?.()
    } catch (error) {
      console.error('Newsletter subscription error', error)
      setStatus('error')
      setMessage(t('newsletter.form.error'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="hidden text-sm font-medium text-gray-700" htmlFor="newsletter-email">
        {t('newsletter.form.label')}
      </label>
      <div className={compact ? 'flex flex-col gap-2' : 'flex flex-col gap-3 sm:flex-row'}>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t('newsletter.form.placeholder')}
          className="flex-1 border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-[color:var(--brand)] focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="bg-[color:var(--brand)] px-6 py-2 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting'
            ? t('newsletter.form.submitting')
            : t('newsletter.form.cta')}
        </button>
      </div>
      {message && (
        <p
          className={`text-sm ${
            status === 'error' ? 'text-rose-600' : 'text-green-600'
          }`}
        >
          {message}
        </p>
      )}
    </form>
  )
}
