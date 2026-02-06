import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import {
  getFreeDigitalDownloadUrl,
  verifyNewsletterSubscription,
} from '../../server/newsletter'

export const Route = createFileRoute('/newsletter/verify')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    book: typeof search.book === 'string' ? search.book : undefined,
  }),
  component: NewsletterVerifyPage,
})

const STORAGE_KEY = 'catalogus_newsletter_download_token'

function NewsletterVerifyPage() {
  const { token, book } = Route.useSearch()
  const { t } = useTranslation()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [message, setMessage] = useState<string | null>(null)
  const [downloadToken, setDownloadToken] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('newsletter.verify.missingToken'))
      return
    }

    const verify = async () => {
      setStatus('loading')
      setMessage(null)
      try {
        const result = await verifyNewsletterSubscription({ data: { token } })
        localStorage.setItem(STORAGE_KEY, result.downloadToken)
        setDownloadToken(result.downloadToken)
        setStatus('success')
        setMessage(t('newsletter.verify.success'))
      } catch (error) {
        console.error('Newsletter verification failed', error)
        setStatus('error')
        setMessage(t('newsletter.verify.error'))
      }
    }

    verify()
  }, [token, t])

  const handleDownload = async () => {
    if (!downloadToken || !book) return
    try {
      const result = await getFreeDigitalDownloadUrl({
        data: { bookId: book, downloadToken },
      })
      setDownloadUrl(result.url)
      window.open(result.url, '_blank')
    } catch (error) {
      console.error('Download error', error)
      setMessage(t('newsletter.verify.downloadError'))
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-16 lg:px-15">
        <div className="mx-auto max-w-2xl border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-semibold md:text-3xl">
            {t('newsletter.verify.title')}
          </h1>
          <p className="mt-3 text-sm text-gray-600">
            {status === 'loading'
              ? t('newsletter.verify.loading')
              : message ?? t('newsletter.verify.helper')}
          </p>

          {status === 'success' && book && (
            <button
              type="button"
              onClick={handleDownload}
              className="mt-6 bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
            >
              {t('newsletter.verify.download')}
            </button>
          )}

          {status === 'success' && !book && (
            <Link
              to="/loja"
              className="mt-6 inline-flex items-center justify-center border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400"
            >
              {t('newsletter.verify.backToShop')}
            </Link>
          )}

          {downloadUrl && (
            <p className="mt-4 text-xs text-gray-500">
              {t('newsletter.verify.downloadReady')}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
