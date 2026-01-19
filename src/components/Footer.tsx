import { Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

type FooterLink = {
  label: string
  href: string
  external?: boolean
}

type FooterColumn = {
  title: string
  links: FooterLink[]
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Projectos',
    links: [
      { label: 'Prémio Literário Carlos Morgado', href: '/projectos#premio-literario-carlos-morgado' },
      { label: 'Anonimus Podcast', href: '/projectos#anonimus-podcast' },
      { label: 'Oficinas Criativas', href: '/projectos#oficinas-criativas' },
    ],
  },
  {
    title: 'Serviços',
    links: [
      { label: 'Editora', href: '/loja' },
      { label: 'Produção', href: '/producao' },
    ],
  },
  {
    title: 'Noticias',
    links: [
      { label: 'Eventos', href: '/noticias' },
    ],
  },
  {
    title: 'Plataforma',
    links: [
      { label: 'Sobre nós', href: '/sobre' },
      { label: 'Contactos', href: '/contactos' },
      { label: 'Mapa Literario', href: 'https://www.calameo.com/read/0075442149b5bd3a18181', external: true },
    ],
  },
]

const legalLinks: FooterLink[] = [
  { label: 'Informação Legal', href: '/legal' },
  { label: 'Política de Privacidade', href: '/privacidade' },
  { label: 'Termos de Uso', href: '/termos' },
  { label: 'Cookies', href: '/cookies' },
]

export default function Footer() {
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
            <div key={column.title}>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                {column.title}
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
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-gray-600 transition-colors hover:text-gray-900"
                      >
                        {link.label}
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
            &copy; {currentYear} Catalogus Copyright
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
