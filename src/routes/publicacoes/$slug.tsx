import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { supabase } from '../../lib/supabaseClient'
import type { Publication, PublicationPage } from '../../types/publication'

// Lazy load the flipbook viewer for better initial load
const FlipbookViewer = lazy(() =>
  import('../../components/flipbook/FlipbookViewer').then(module => ({
    default: module.FlipbookViewer,
  }))
)

export const Route = createFileRoute('/publicacoes/$slug')({
  validateSearch: (search: Record<string, unknown>) => ({
    page: typeof search.page === 'string' ? parseInt(search.page, 10) : 1,
  }),
  component: PublicationViewerPage,
})

function PublicationViewerPage() {
  const { t } = useTranslation()
  const { slug } = Route.useParams()
  const { page: initialPage } = Route.useSearch()

  // Fetch publication metadata
  const publicationQuery = useQuery({
    queryKey: ['publication', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data as Publication
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch publication pages
  const pagesQuery = useQuery({
    queryKey: ['publication-pages', publicationQuery.data?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publication_pages')
        .select('*')
        .eq('publication_id', publicationQuery.data!.id)
        .order('page_number', { ascending: true })

      if (error) throw error
      return data as PublicationPage[]
    },
    enabled: !!publicationQuery.data?.id,
    staleTime: 5 * 60 * 1000,
  })

  // Loading state
  if (publicationQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-900">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-white">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
            <p>{t('publications.viewer.loading', 'A carregar publicação...')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state - publication not found
  if (publicationQuery.isError || !publicationQuery.data) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-900">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center text-white">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h1 className="mb-2 text-2xl font-semibold">
              {t('publications.viewer.notFound', 'Publicação não encontrada')}
            </h1>
            <p className="mb-6 text-gray-400">
              {t(
                'publications.viewer.notFoundDescription',
                'A publicação que procura não existe ou foi removida.'
              )}
            </p>
            <a
              href="/publicacoes"
              className="inline-flex items-center gap-2 rounded bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#a25a2c]"
            >
              {t('publications.viewer.backToList', 'Ver todas as publicações')}
            </a>
          </div>
        </div>
      </div>
    )
  }

  const publication = publicationQuery.data
  const pages = pagesQuery.data ?? []

  return (
    <div className="flex min-h-screen flex-col bg-gray-900">
      {/* Minimal header for viewer */}
      <header className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3">
        <a
          href="/publicacoes"
          className="flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span>{t('publications.viewer.back', 'Voltar')}</span>
        </a>

        <h1 className="flex-1 truncate px-4 text-center text-sm font-medium text-white">
          {publication.title}
        </h1>

        <a
          href="/"
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          <img src="/Logo branco.png" alt="Catalogus" className="h-8" />
        </a>
      </header>

      {/* Flipbook viewer */}
      <main className="flex-1">
        {pagesQuery.isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              <p>{t('publications.viewer.loadingPages', 'A carregar páginas...')}</p>
            </div>
          </div>
        ) : pages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-500"
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
              <p className="text-gray-400">
                {t(
                  'publications.viewer.noPages',
                  'Esta publicação ainda não tem páginas disponíveis.'
                )}
              </p>
            </div>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-white">
                  <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
                  <p>{t('publications.viewer.loadingViewer', 'A preparar visualizador...')}</p>
                </div>
              </div>
            }
          >
            <FlipbookViewer
              publication={publication}
              pages={pages}
              initialPage={Math.max(0, initialPage - 1)} // Convert to 0-indexed
            />
          </Suspense>
        )}
      </main>
    </div>
  )
}
