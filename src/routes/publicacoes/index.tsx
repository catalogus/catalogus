import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { publicSupabase } from '../../lib/supabasePublic'
import { buildSeo } from '../../lib/seo'
import type { Publication } from '../../types/publication'

export const Route = createFileRoute('/publicacoes/')({
  loader: async () => {
    try {
      const { data, error } = await publicSupabase
        .from('publications')
        .select('*')
        .eq('is_active', true)
        .order('publish_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      return { publications: (data ?? []) as Publication[], hasError: false }
    } catch (error) {
      console.error('Publications loader failed:', error)
      return { publications: [] as Publication[], hasError: true }
    }
  },
  head: () =>
    buildSeo({
      title: 'Mapa Literário',
      description:
        'O teu satélite de tudo que acontece no mercado literário em Moçambique.',
      path: '/publicacoes',
      type: 'website',
    }),
  component: PublicationsListingPage,
})

function PublicationsListingPage() {
  const { t } = useTranslation()
  const { publications, hasError } = Route.useLoaderData()

  const featuredPublications = publications.filter(p => p.is_featured)
  const regularPublications = publications.filter(p => !p.is_featured)

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-[#1c1b1a] text-white"
        style={{
          backgroundImage: "url('/Quem-somos-768x513.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#3d2f23]/70 to-[#0f0c0a]/70" />

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-24 lg:px-15">
            <div className="max-w-3xl space-y-5">
              <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                {t('publications.listing.label', '')}
              </p>
              <h1 className="text-2xl font-semibold leading-tight md:text-4xl">
                {t('publications.listing.title', 'Mapa Literário')}
              </h1>
              <p className="text-lg text-white/80">
                {t(
                  'publications.listing.subtitle',
                  'O teu satélite de tudo que acontece no mercado literário em Moçambique.'
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="py-20">
        <div className="container mx-auto px-4 lg:px-15">
          {/* Error State */}
          {hasError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {t('publications.listing.error', 'Erro ao carregar publicações.')}
            </div>
          )}

          {/* Empty State */}
          {!hasError && publications.length === 0 && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <p className="mt-4 text-gray-600">
                  {t('publications.listing.empty', 'Nenhuma publicação disponível.')}
                </p>
              </div>
            )}

          {/* Featured Publications */}
          {featuredPublications.length > 0 && (
            <section className="mb-16">
              <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                {t('publications.listing.featured', 'Em Destaque')}
              </h2>
              <div className="grid gap-8 md:grid-cols-2">
                {featuredPublications.map(publication => (
                  <PublicationCard key={publication.id} publication={publication} featured />
                ))}
              </div>
            </section>
          )}

          {/* Regular Publications */}
          {regularPublications.length > 0 && (
            <section>
              {featuredPublications.length > 0 && (
                <h2 className="mb-8 text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">
                  {t('publications.listing.all', 'Todas as Publicações')}
                </h2>
              )}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {regularPublications.map(publication => (
                  <PublicationCard key={publication.id} publication={publication} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PublicationCard({
  publication,
  featured = false,
}: {
  publication: Publication
  featured?: boolean
}) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <a
      href={`/publicacoes/${publication.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:-translate-y-1 hover:shadow-xl ${
        featured ? 'md:flex-row' : ''
      }`}
    >
      {/* Cover Image */}
      <div
        className={`relative bg-gray-50 ${
          featured ? 'aspect-[3/4] md:w-1/2' : 'aspect-[3/4]'
        }`} 
      >
        {publication.cover_url ? (
          <img
            src={publication.cover_url}
            alt={publication.title}
            className="h-full w-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#3d2f23] to-[#0f0c0a]">
            <svg
              className="h-16 w-16 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute left-4 top-4 rounded bg-[color:var(--brand)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Destaque
          </div>
        )}

        {/* Page count badge */}
        {publication.page_count && (
          <div className="absolute bottom-4 right-4 rounded bg-black/70 px-2 py-1 text-xs text-white">
            {publication.page_count} páginas
          </div>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex flex-1 flex-col ${featured ? 'p-6 md:justify-center' : 'p-4'}`}
      >
        <h3 className={`font-semibold leading-snug ${featured ? 'text-2xl' : 'text-base'}`}>
          {publication.title}
        </h3>

        {publication.description && (
          <p
            className={`mt-2 text-gray-600 ${
              featured ? 'line-clamp-4' : 'line-clamp-2'
            } text-sm`}
          >
            {publication.description}
          </p>
        )}

        {publication.publish_date && (
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gray-400">
            {formatDate(publication.publish_date)}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[color:var(--brand)] group-hover:underline">
          <span>Ler publicação</span>
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </div>
      </div>
    </a>
  )
}
