export type NavChild = {
  labelKey: string
  href: string
}

export type NavItem = {
  labelKey: string
  href: string
  spa?: boolean
  children?: NavChild[]
}

export const navItems: NavItem[] = [
  { labelKey: 'header.nav.authors', href: '/autores' },
  { labelKey: 'header.nav.publisher', href: '/loja' },
  { labelKey: 'header.nav.news', href: '/noticias' },
  { labelKey: 'header.nav.literaryMap', href: '/publicacoes' },
  {
    labelKey: 'header.nav.projects',
    href: '/projectos',
    children: [
      {
        labelKey: 'header.nav.award',
        href: '/projectos#premio-literario-carlos-morgado',
      },
      { labelKey: 'header.nav.podcast', href: '/projectos#anonimus-podcast' },
      { labelKey: 'header.nav.workshops', href: '/projectos#oficinas-criativas' },
    ],
  },
  { labelKey: 'header.nav.production', href: '/producao' },
  { labelKey: 'header.nav.about', href: '/sobre' },
  { labelKey: 'header.nav.contacts', href: '/contactos' },
]

export const isExternalHref = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:')

export const isHashLink = (href: string) => href.includes('#')

export const shouldUseRouterLink = (href: string) => !isExternalHref(href) && !isHashLink(href)

const getHrefBase = (href: string) => href.split('#')[0] ?? ''

const getHrefHash = (href: string) => {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return ''
  return href.slice(hashIndex)
}

export const isActiveNavItem = (href: string, pathname: string) => {
  if (isExternalHref(href)) return false
  const base = getHrefBase(href)
  if (!base) return false
  return pathname === base || pathname.startsWith(`${base}/`)
}

export const isActiveHashItem = (href: string, pathname: string, hash: string) => {
  if (isExternalHref(href)) return false
  const base = getHrefBase(href)
  const hrefHash = getHrefHash(href)
  if (!base || !hrefHash) return false
  return pathname === base && hash === hrefHash
}
