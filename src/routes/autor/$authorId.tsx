import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { AuthorDetailBody, AuthorDetailHero } from '../../features/authors/AuthorDetailSections'
import {
  type AuthorResult,
  loadAuthorResult,
  resolvePhotoUrl,
} from '../../features/authors/authorDetailData'
import {
  SEO_DEFAULTS,
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
  buildSeo,
  toAbsoluteUrl,
} from '../../lib/seo'

export const Route = createFileRoute('/autor/$authorId')({
  loader: async ({ params }) => {
    const result = await loadAuthorResult({
      authorId: params.authorId,
      fallbackName: 'Autor',
      registeredType: 'Autor registado',
    })

    return { ...result, language: 'pt' as const }
  },
  head: ({ loaderData, params }) => {
    const author = loaderData?.author ?? null
    const slug = author?.wp_slug ?? params.authorId
    const path = `/autor/${slug}`

    if (!author) {
      return buildSeo({
        title: 'Autor nao encontrado',
        description: SEO_DEFAULTS.description,
        path,
        noindex: true,
      })
    }

    const photoUrl = resolvePhotoUrl(author.photo_url, author.photo_path)
    const description = author.bio || SEO_DEFAULTS.description
    const socialLinks = Object.values(author.social_links ?? {}).filter(
      (value): value is string => typeof value === 'string' && value.length > 0,
    )
    const canonical = toAbsoluteUrl(path)

    return buildSeo({
      title: author.name,
      description,
      image: photoUrl,
      path,
      type: 'profile',
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Autores', path: '/autores' },
          { name: author.name, path },
        ]),
        buildPersonJsonLd({
          name: author.name,
          description,
          image: photoUrl,
          url: canonical,
          sameAs: socialLinks,
        }),
      ],
    })
  },
  component: AuthorPublicPage,
})

function AuthorPublicPage() {
  const { authorId } = Route.useParams()
  const { t, i18n } = useTranslation()
  const loaderData = Route.useLoaderData()
  const fallbackName = t('authors.listing.fallbackName')
  const registeredType = t('authors.listing.registeredType')
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'
  const currentLanguage = i18n.language === 'en' ? 'en' : 'pt'

  const authorQuery = useQuery<AuthorResult>({
    queryKey: ['author', authorId, i18n.language],
    queryFn: () => loadAuthorResult({ authorId, fallbackName, registeredType }),
    initialData:
      loaderData.language === currentLanguage
        ? {
            author: loaderData.author,
            isProfileOnly: loaderData.isProfileOnly,
          }
        : undefined,
    staleTime: 60_000,
  })

  const author = authorQuery.data?.author ?? null

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {authorQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-72 animate-pulse rounded-none border border-gray-200 bg-gray-100" />
        </div>
      )}

      {authorQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('authorDetail.error')}
          </div>
        </div>
      )}

      {!authorQuery.isLoading && !authorQuery.isError && !author && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="rounded-none border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('authorDetail.notFound')}
          </div>
        </div>
      )}

      {!authorQuery.isLoading && !authorQuery.isError && author && (
        <>
          <AuthorDetailHero
            author={author}
            heroLabel={t('authorDetail.heroLabel')}
            homeLabel={t('authorDetail.breadcrumb.home')}
            authorsLabel={t('authorDetail.breadcrumb.authors')}
          />

          <AuthorDetailBody
            author={author}
            locale={locale}
            labels={{
              socialTitle: t('authorDetail.socialTitle'),
              bioLabel: t('authorDetail.bio.label'),
              bioTitle: t('authorDetail.bio.title'),
              worksLabel: t('authorDetail.works.label'),
              worksTitle: t('authorDetail.works.title'),
              worksCta: t('authorDetail.works.cta'),
              galleryLabel: t('authorDetail.gallery.label'),
              galleryTitle: t('authorDetail.gallery.title'),
              videoLabel: t('authorDetail.video.label'),
              videoTitle: t('authorDetail.video.title'),
              videoWatch: t('authorDetail.video.watch'),
              videoFrameTitle: t('authorDetail.video.frameTitle', { name: '{name}' }),
            }}
          />
        </>
      )}
    </div>
  )
}
