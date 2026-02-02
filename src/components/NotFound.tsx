import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function NotFound() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-24 lg:px-15">
        <div className="max-w-2xl border border-gray-200 bg-white p-8 rounded-none">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
            {t('common.notFoundLabel', 'Not Found')}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            {t('common.notFoundTitle', 'Page not found')}
          </h1>
          <p className="mt-4 text-sm text-gray-600">
            {t(
              'common.notFoundDescription',
              'The page you are looking for does not exist or may have been moved.',
            )}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center bg-[color:var(--brand)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#a25a2c] rounded-none"
            >
              {t('common.notFoundCta', 'Go home')}
            </Link>
            <Link
              to="/noticias"
              className="inline-flex items-center border border-gray-300 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-800 transition hover:border-gray-500 rounded-none"
            >
              {t('common.notFoundNews', 'Read news')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
