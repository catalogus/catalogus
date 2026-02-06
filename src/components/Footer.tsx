import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CATALOGUS_SOCIAL_LINKS } from '../lib/socialLinks.tsx'

type FooterLink = {
  labelKey: string
  href: string
  external?: boolean
}

type FooterColumn = {
  titleKey: string
  links: FooterLink[]
}

const isExternalHref = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:')

const isHashLink = (href: string) => href.includes('#')

const shouldUseRouterLink = (href: string) => !isExternalHref(href) && !isHashLink(href)

const footerColumns: FooterColumn[] = [
  {
    titleKey: 'footer.columns.projects',
    links: [
      { labelKey: 'footer.links.award', href: '/projectos#premio-literario-carlos-morgado' },
      { labelKey: 'footer.links.podcast', href: '/projectos#anonimus-podcast' },
      { labelKey: 'footer.links.workshops', href: '/projectos#oficinas-criativas' },
    ],
  },
  {
    titleKey: 'footer.columns.services',
    links: [
      { labelKey: 'footer.links.publisher', href: '/loja' },
      { labelKey: 'footer.links.production', href: '/producao' },
    ],
  },
  {
    titleKey: 'footer.columns.social',
    links: CATALOGUS_SOCIAL_LINKS.map((link) => ({
      labelKey: link.labelKey,
      href: link.href,
      external: true,
    })),
  },
  {
    titleKey: 'footer.columns.platform',
    links: [
      { labelKey: 'footer.links.about', href: '/sobre' },
      { labelKey: 'footer.links.contacts', href: '/contactos' },
      { labelKey: 'footer.links.literaryMap', href: '/publicacoes' },
      { labelKey: 'footer.links.events', href: '/noticias' },
    ],
  },
]

const legalLinks: FooterLink[] = [
  { labelKey: 'footer.legal.legalInfo', href: '/legal' },
  { labelKey: 'footer.legal.privacy', href: '/privacidade' },
  { labelKey: 'footer.legal.terms', href: '/termos' },
  { labelKey: 'footer.legal.cookies', href: '/cookies' },
]

export default function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#f4efe9]">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Logo and language */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block">
              <img
                src="/logo.svg"
                alt="Catalogus"
                className="h-6 w-auto"
              />
            </Link>
          </div>

          {/* Navigation columns */}
          {footerColumns.map((column) => (
            <div key={column.titleKey}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                {t(column.titleKey)}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {t(link.labelKey)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : shouldUseRouterLink(link.href) ? (
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {t(link.labelKey)}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-200">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row md:px-8">
          <p className="text-sm text-gray-600">
            &copy; {currentYear} {t('footer.copyright')}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {legalLinks.map((link) => (
              shouldUseRouterLink(link.href) ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  {t(link.labelKey)}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                >
                  {t(link.labelKey)}
                </a>
              )
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
