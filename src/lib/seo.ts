type MetaEntry = {
  title?: string
  name?: string
  property?: string
  content?: string
  charSet?: string
}

type LinkEntry = {
  rel: string
  href: string
  sizes?: string
  type?: string
  crossOrigin?: string
}

type ScriptEntry = {
  type: string
  children: string
}

export type SeoInput = {
  title?: string
  description?: string | null
  path?: string
  canonical?: string | null
  image?: string | null
  type?: string
  noindex?: boolean
  locale?: string
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image'
  publishedTime?: string | null
  modifiedTime?: string | null
  jsonLd?: Array<Record<string, any>>
}

export const SEO_DEFAULTS = {
  siteName: 'Catalogus',
  title: 'Catalogus',
  description:
    'Catalogus e uma plataforma cultural e editorial de Mocambique, promovendo autores, livros e projectos literarios.',
  image: '/covers_banners/catalogos.webp',
  locale: 'pt_MZ',
  twitterCard: 'summary_large_image' as const,
}

export const getSiteUrl = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  const envUrl =
    (typeof process !== 'undefined' && process.env?.SITE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SITE_URL) ||
    (typeof import.meta !== 'undefined' &&
      typeof import.meta.env !== 'undefined' &&
      (import.meta.env.VITE_SITE_URL as string | undefined))
  return envUrl || 'https://catalogus.co.mz'
}

export const normalizePath = (path: string) => {
  if (!path) return '/'
  if (path === '/') return '/'
  const trimmed = path.startsWith('/') ? path : `/${path}`
  return trimmed.replace(/\/+$/, '')
}

export const toAbsoluteUrl = (value?: string | null, siteUrl = getSiteUrl()) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  if (value.startsWith('//')) return `https:${value}`
  return `${siteUrl}${normalizePath(value)}`
}

export const stripHtml = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const truncateText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trim()}...`
}

export const buildTitle = (value?: string | null, siteName = SEO_DEFAULTS.siteName) => {
  const base = (value ?? '').trim()
  if (!base) return siteName
  const normalizedSite = siteName.toLowerCase()
  if (base.toLowerCase().includes(normalizedSite)) return base
  return `${base} | ${siteName}`
}

export const normalizeDescription = (
  value?: string | null,
  fallback = SEO_DEFAULTS.description,
  maxLength = 160,
) => {
  const cleaned = stripHtml(value ?? '')
  if (!cleaned) return fallback
  return truncateText(cleaned, maxLength)
}

export const buildSeo = (input: SeoInput) => {
  const siteUrl = getSiteUrl()
  const canonical =
    typeof input.canonical === 'string'
      ? input.canonical
      : input.path
        ? toAbsoluteUrl(normalizePath(input.path), siteUrl)
        : null
  const title = buildTitle(input.title, input.siteName ?? SEO_DEFAULTS.siteName)
  const description = normalizeDescription(input.description)
  const image = toAbsoluteUrl(input.image ?? SEO_DEFAULTS.image, siteUrl)
  const locale = input.locale ?? SEO_DEFAULTS.locale
  const twitterCard = input.twitterCard ?? SEO_DEFAULTS.twitterCard

  const meta: MetaEntry[] = [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: input.noindex ? 'noindex, nofollow' : 'index, follow' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: input.type ?? 'website' },
    { property: 'og:url', content: canonical ?? siteUrl },
    { property: 'og:site_name', content: input.siteName ?? SEO_DEFAULTS.siteName },
    { property: 'og:locale', content: locale },
    { property: 'og:image', content: image },
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ]

  if (input.publishedTime) {
    meta.push({ property: 'article:published_time', content: input.publishedTime })
  }
  if (input.modifiedTime) {
    meta.push({ property: 'article:modified_time', content: input.modifiedTime })
  }

  const links: LinkEntry[] = canonical ? [{ rel: 'canonical', href: canonical }] : []
  const headScripts: ScriptEntry[] =
    input.jsonLd?.map((schema) => ({
      type: 'application/ld+json',
      children: JSON.stringify(schema),
    })) ?? []

  return { meta, links, headScripts }
}

export const buildOrganizationJsonLd = (siteUrl = getSiteUrl()) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${siteUrl}#organization`,
  name: SEO_DEFAULTS.siteName,
  url: siteUrl,
  logo: toAbsoluteUrl('/logo.svg', siteUrl),
})

export const buildWebsiteJsonLd = (siteUrl = getSiteUrl()) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${siteUrl}#website`,
  url: siteUrl,
  name: SEO_DEFAULTS.siteName,
  publisher: { '@id': `${siteUrl}#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/pesquisa?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
})

export const buildBreadcrumbJsonLd = (
  items: Array<{ name: string; path: string }>,
  siteUrl = getSiteUrl(),
) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: toAbsoluteUrl(item.path, siteUrl),
  })),
})

export const buildBookJsonLd = ({
  title,
  description,
  image,
  url,
  isbn,
  authorNames,
  language,
  publisher,
  price,
  availability,
}: {
  title: string
  description?: string | null
  image?: string | null
  url: string
  isbn?: string | null
  authorNames?: string[]
  language?: string | null
  publisher?: string | null
  price?: number | null
  availability?: 'InStock' | 'OutOfStock'
}) => {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: title,
    url,
  }

  if (description) schema.description = normalizeDescription(description)
  if (image) schema.image = [image]
  if (isbn) schema.isbn = isbn
  if (language) schema.inLanguage = language
  if (publisher) schema.publisher = { '@type': 'Organization', name: publisher }
  if (authorNames && authorNames.length > 0) {
    schema.author = authorNames.map((name) => ({ '@type': 'Person', name }))
  }
  if (typeof price === 'number') {
    schema.offers = {
      '@type': 'Offer',
      price,
      priceCurrency: 'MZN',
      availability: `https://schema.org/${availability ?? 'InStock'}`,
      url,
    }
  }

  return schema
}

export const buildArticleJsonLd = ({
  title,
  description,
  image,
  url,
  publishedAt,
  modifiedAt,
  authorName,
}: {
  title: string
  description?: string | null
  image?: string | null
  url: string
  publishedAt?: string | null
  modifiedAt?: string | null
  authorName?: string | null
}) => {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    url,
    mainEntityOfPage: url,
    publisher: { '@id': `${getSiteUrl()}#organization` },
  }

  if (description) schema.description = normalizeDescription(description)
  if (image) schema.image = [image]
  if (publishedAt) schema.datePublished = publishedAt
  if (modifiedAt) schema.dateModified = modifiedAt
  if (authorName) schema.author = { '@type': 'Person', name: authorName }

  return schema
}

export const buildPersonJsonLd = ({
  name,
  description,
  image,
  url,
  sameAs,
}: {
  name: string
  description?: string | null
  image?: string | null
  url: string
  sameAs?: string[]
}) => {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url,
  }

  if (description) schema.description = normalizeDescription(description, SEO_DEFAULTS.description, 200)
  if (image) schema.image = [image]
  if (sameAs && sameAs.length > 0) schema.sameAs = sameAs

  return schema
}

export const shouldNoIndex = (pathname: string, search: string) => {
  const path = normalizePath(pathname)

  const privatePrefixes = [
    '/checkout',
    '/carrinho',
    '/pedido',
    '/newsletter',
    '/demo',
  ]

  if (privatePrefixes.some((prefix) => path.startsWith(prefix))) return true
  if (path === '/pesquisa') return true

  if (path === '/noticias' && search) {
    const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
    if (params.get('q') || params.get('categoria') || params.get('tag')) return true
  }

  return false
}
