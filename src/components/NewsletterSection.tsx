import { useTranslation } from 'react-i18next'
import { NewsletterSignupForm } from './newsletter/NewsletterSignupForm'

export function NewsletterSection() {
  const { t } = useTranslation()

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-xl">
            <h2 className="text-xl font-semibold text-gray-900 md:text-2xl">
              {t('newsletter.section.title')}
            </h2>
            <p className="mt-2 text-sm text-gray-600 md:text-base">
              {t('newsletter.section.body')}
            </p>
          </div>

          <div className="w-full lg:w-auto">
            <div className="bg-white p-4 lg:w-96">
              <NewsletterSignupForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
