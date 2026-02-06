import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { buildSeo } from '../../lib/seo'

export const Route = createFileRoute('/sobre/')({
  head: () =>
    buildSeo({
      title: 'Sobre',
      description: 'Saiba mais sobre a Catalogus e o nosso trabalho cultural.',
      path: '/sobre',
      type: 'website',
    }),
  component: AboutPage,
})

function AboutPage() {
  const { t } = useTranslation()
  const introText = t('about.hero.intro')
  const focusAreas = t('about.focus.items', { returnObjects: true }) as Array<{
    title: string
    description: string
  }>
  const services = t('about.services.items', { returnObjects: true }) as string[]
  const galleryImages = [
    {
      src: '/Quem-somos-768x513.jpg',
      alt: t('about.gallery.images.team'),
    },
    {
      src: '/Consultoria-768x512.jpg',
      alt: t('about.gallery.images.editorial'),
    },
    {
      src: '/oficinas.webp',
      alt: t('about.gallery.images.workshops'),
    },
  ]

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      <main>
        <section className="relative overflow-hidden bg-[#f7f2ed]">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/capulana-bg.jpg"
              alt=""
              className="h-full w-full object-cover opacity-20"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#f7f2ed]/95 via-[#f4efe9]/90 to-[#efe6db]/95" />
          </div>
          <div className="absolute -top-10 right-0 h-64 w-64 rounded-full bg-[#c07238]/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#1f1b16]/10 blur-3xl" />
          <div className="container relative z-10 mx-auto px-4 py-24 lg:px-15">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-center">
              <div className="max-w-3xl space-y-6">
                <p className="text-xs uppercase tracking-[0.35em] text-gray-600">
                  {t('about.hero.label')}
                </p>
                <h1 className="text-3xl font-semibold leading-tight text-gray-900 md:text-5xl">
                  {t('about.hero.title')}
                </h1>
                <p className="text-base leading-relaxed text-gray-700 md:text-lg">
                  {introText}
                </p>
              </div>
              <div className="relative">
                <div
                  className="absolute -right-6 -top-6 h-32 w-32 border border-[#c07238]/30"
                  aria-hidden="true"
                />
                <img
                  src="/Quem-somos-768x513.jpg"
                  alt=""
                  className="relative h-64 w-full border border-gray-200 object-cover shadow-sm sm:h-80 lg:h-[360px]"
                  loading="eager"
                  decoding="async"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-4 py-20 lg:px-15">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">
                {t('about.focus.label')}
              </p>
              <h2 className="text-3xl font-semibold leading-tight text-gray-900 md:text-4xl">
                {t('about.focus.title')}
              </h2>
            </div>

            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              {focusAreas.map((area, index) => (
                <article
                  key={area.title}
                  className="relative border border-gray-200 bg-white p-8"
                >
                  <span className="absolute -top-5 right-6 text-4xl font-semibold text-[#d7c2b1]/70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {area.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-gray-700 md:text-base">
                    {area.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#1f1b16] text-white">
          <div className="absolute inset-0" aria-hidden="true">
            <img
              src="/capulana-bg.jpg"
              alt=""
              className="h-full w-full object-cover opacity-20"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-[#1f1b16]/75" />
          </div>
          <div className="container relative mx-auto px-4 py-20 lg:px-15">
            <div className="max-w-2xl space-y-4">
              <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                {t('about.services.title')}
              </h2>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service}
                  className="border border-white/15 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90"
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
