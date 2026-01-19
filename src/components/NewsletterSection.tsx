import { useState } from 'react'
import { cn } from '@/lib/utils'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)

    // Simulate API call - will be replaced with Substack integration
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setIsSuccess(true)
    setEmail('')
  }

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
              Subscreva a nossa newsletter!
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              Receba actualizações mensais da plataforma Catalogus.
            </p>
          </div>

          {isSuccess ? (
            <div className="flex items-center gap-2 bg-green-50 px-6 py-3 text-sm font-medium text-green-800">
              <svg
                className="h-5 w-5"
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
              Subscrito com sucesso!
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto"
            >
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O seu email"
                required
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 sm:w-64"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'whitespace-nowrap bg-[#1c1b1a] px-6 py-3 text-sm font-semibold text-white transition-colors',
                  'hover:bg-[#c07238] disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isSubmitting ? 'A subscrever...' : 'Subscrever newsletter'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
