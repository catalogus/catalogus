import { Link } from '@tanstack/react-router'
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthProvider'
import { CartButton } from './shop/CartButton'
import { FloatingSearch } from './search/FloatingSearch'

type NavChild = {
  labelKey: string
  href: string
}

type NavItem = {
  labelKey: string
  href: string
  spa?: boolean
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { labelKey: 'header.nav.authors', href: '/autores' },
  { labelKey: 'header.nav.publisher', href: '/loja' },
  { labelKey: 'header.nav.news', href: '/noticias' },
  {
    labelKey: 'header.nav.literaryMap',
    href: '/publicacoes',
  },
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

const isExternalHref = (href: string) =>
  href.startsWith('http://') ||
  href.startsWith('https://') ||
  href.startsWith('mailto:') ||
  href.startsWith('tel:')

const isHashLink = (href: string) => href.includes('#')

const shouldUseRouterLink = (href: string) => !isExternalHref(href) && !isHashLink(href)

export default function Header() {
  const { t } = useTranslation()
  const { session, profile, signOut } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Set CSS custom property for header height
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header')
      if (headerEl) {
        document.documentElement.style.setProperty(
          '--header-height',
          `${headerEl.offsetHeight}px`
        )
      }
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [])

  // Update header height when scroll state changes (header size might change)
  useEffect(() => {
    const headerEl = document.querySelector('header')
    if (headerEl) {
      document.documentElement.style.setProperty(
        '--header-height',
        `${headerEl.offsetHeight}px`
      )
    }
  }, [isScrolled])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = ''
      return
    }
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  // Close user menu on scroll
  useEffect(() => {
    if (!userMenuOpen) return

    const handleScroll = () => setUserMenuOpen(false)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [userMenuOpen])

  return (
    <>
      <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 `}
      style={{
        background: isScrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
        borderColor: isScrolled ? 'var(--header-border)' : 'transparent',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-15 lg:py-6">
        <Link to="/" className="group flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Catalogus"
            className="h-4 w-auto sm:h-4"
          />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const className =
              "relative text-(--header-ink) transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-(--header-accent) after:transition-transform after:duration-300 after:content-[''] hover:text-(--header-accent) hover:after:scale-x-100"

            if (item.children && item.children.length > 0) {
              return (
                <div key={item.labelKey} className="relative group">
                  {shouldUseRouterLink(item.href) ? (
                    <Link to={item.href} className={className} aria-haspopup="true">
                      {t(item.labelKey)}
                    </Link>
                  ) : (
                    <a href={item.href} className={className} aria-haspopup="true">
                      {t(item.labelKey)}
                    </a>
                  )}
                  <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <div className="min-w-[280px] border border-gray-200 bg-white py-3 shadow-lg">
                      {item.children.map((child) => (
                        shouldUseRouterLink(child.href) ? (
                          <Link
                            key={child.href}
                            to={child.href}
                            className="block px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#f4efe9] hover:text-[color:var(--header-accent)]"
                          >
                            {t(child.labelKey)}
                          </Link>
                        ) : (
                          <a
                            key={child.href}
                            href={child.href}
                            className="block px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#f4efe9] hover:text-[color:var(--header-accent)]"
                          >
                            {t(child.labelKey)}
                          </a>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            if (item.spa) {
              return (
                <Link key={item.labelKey} to="/" className={className}>
                  {t(item.labelKey)}
                </Link>
              )
            }
            return shouldUseRouterLink(item.href) ? (
              <Link key={item.labelKey} to={item.href} className={className}>
                {t(item.labelKey)}
              </Link>
            ) : (
              <a key={item.labelKey} href={item.href} className={className}>
                {t(item.labelKey)}
              </a>
            )
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <CartButton className="bg-white/0" />
          {session && profile ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-(--header-ink) px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-(--header-accent)"
              >
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name ?? 'User'}
                    className="h-6 w-6 object-cover"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span>{profile.name ?? session.user.email}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg z-50">
                    {profile.role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t('header.auth.adminPanel')}
                      </Link>
                    )}
                    {profile.role === 'author' && (
                      <Link
                        to="/author/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {t('header.auth.myProfile')}
                      </Link>
                    )}
                    {profile.role === 'customer' && (
                      <Link
                        to="/account/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        {t('header.auth.myAccount')}
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        setUserMenuOpen(false)
                        await signOut()
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('header.auth.signOut')}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/auth/sign-in"
              className="bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
            >
              {t('header.auth.signIn')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton className="h-10 w-10 justify-center px-0" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)]"
            aria-label={t('header.menu.open')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        id="mobile-menu"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col gap-6 px-6 pb-10 pt-6 text-white transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'var(--header-panel)' }}
        aria-hidden={!menuOpen}
        aria-modal={menuOpen ? 'true' : undefined}
        aria-label={t('header.menu.open')}
        role="dialog"
      >
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setMenuOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10">
              C
            </div>
            <div className="leading-tight">
              <p className="text-base font-semibold">Catalogus</p>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--header-panel-muted)]">
                {t('header.mobile.tagline')}
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-white"
            aria-label={t('header.menu.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4 text-lg">
          {navItems.map((item, index) => {
            const baseClass =
              "flex items-center justify-between border-b border-white/10 pb-3 text-white font-semibold transition-all duration-300 hover:translate-x-1 hover:text-[color:var(--header-accent)]"
            const style = { transitionDelay: `${index * 40}ms` }
            if (item.spa) {
              return (
                <Link
                  key={item.labelKey}
                  to="/"
                  className={baseClass}
                  style={style}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </Link>
              )
            }
            return (
              shouldUseRouterLink(item.href) ? (
                <Link
                  key={item.labelKey}
                  to={item.href}
                  className={baseClass}
                  style={style}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  key={item.labelKey}
                  href={item.href}
                  className={baseClass}
                  style={style}
                  onClick={() => setMenuOpen(false)}
                >
                  {t(item.labelKey)}
                </a>
              )
            )
          })}
        </div>

        <div className="mt-auto space-y-3">
          {session && profile ? (
            <>
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center gap-3 px-4 py-2">
                  {profile.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile.name ?? 'User'}
                      className="h-10 w-10 object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center bg-white/10 border-2 border-white/20">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">
                      {profile.name ?? t('header.mobile.userFallback')}
                    </p>
                    <p className="text-xs text-white/60">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {profile.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('header.auth.adminPanel')}
                </Link>
              )}

              {profile.role === 'author' && (
                <Link
                  to="/author/profile"
                  className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('header.auth.myProfile')}
                </Link>
              )}

              {profile.role === 'customer' && (
                <Link
                  to="/account/profile"
                  className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  {t('header.auth.myAccount')}
                </Link>
              )}

              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false)
                  await signOut()
                }}
                className="flex w-full items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)] hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('header.auth.signOut')}
              </button>
            </>
          ) : (
            <Link
              to="/auth/sign-in"
              className="flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]"
              onClick={() => setMenuOpen(false)}
            >
              {t('header.auth.signIn')}
            </Link>
          )}
        </div>
      </aside>
      </header>
      <FloatingSearch />
    </>
  )
}
