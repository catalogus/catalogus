import { Link, useRouterState } from '@tanstack/react-router'
import { ChevronDown, LogOut, Menu, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthProvider'
import { buildCmsAuthUrl, buildCmsBridgeTransferUrl } from '../lib/crossSiteAuth'
import { CartButton } from './shop/CartButton'
import { FloatingSearch } from './search/FloatingSearch'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog'

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

const getHrefBase = (href: string) => href.split('#')[0] ?? ''

const getHrefHash = (href: string) => {
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) return ''
  return href.slice(hashIndex)
}

const isActiveNavItem = (href: string, pathname: string) => {
  if (isExternalHref(href)) return false
  const base = getHrefBase(href)
  if (!base) return false
  return pathname === base || pathname.startsWith(`${base}/`)
}

const isActiveHashItem = (href: string, pathname: string, hash: string) => {
  if (isExternalHref(href)) return false
  const base = getHrefBase(href)
  const hrefHash = getHrefHash(href)
  if (!base || !hrefHash) return false
  return pathname === base && hash === hrefHash
}

export default function Header() {
  const { t } = useTranslation()
  const { session, profile, loading, signOut } = useAuth()
  const { pathname, hash } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      hash: state.location.hash ?? '',
    }),
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const currentPath = `${pathname}${hash || ''}`
  const cmsLoginUrl = buildCmsAuthUrl('login', currentPath)
  const cmsSignupUrl = buildCmsAuthUrl('sign-up', currentPath)

  const handleOpenCmsProfile = () => {
    if (!session) {
      window.location.href = cmsLoginUrl
      return
    }
    window.location.href = buildCmsBridgeTransferUrl(session, '/perfil')
  }

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
    if (!userMenuOpen) return
    const closeMenu = () => setUserMenuOpen(false)
    window.addEventListener('scroll', closeMenu, { passive: true })
    return () => window.removeEventListener('scroll', closeMenu)
  }, [userMenuOpen])

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: isScrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
          borderColor: isScrolled ? 'var(--header-border)' : 'transparent',
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-15 lg:py-6">
          <Link to="/" className="group flex items-center gap-3">
            <img src="/logo.svg" alt="Catalogus" className="h-4 w-auto sm:h-4" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => {
              const active = item.spa ? pathname === '/' : isActiveNavItem(item.href, pathname)
              const className =
                "relative text-(--header-ink) transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-(--header-accent) after:transition-transform after:duration-300 after:content-[''] hover:text-(--header-accent) hover:after:scale-x-100"
              const activeClassName = active
                ? ' text-(--header-accent) after:scale-x-100'
                : ''

              if (item.children && item.children.length > 0) {
                return (
                  <div key={item.labelKey} className="relative group">
                    {shouldUseRouterLink(item.href) ? (
                      <Link
                        to={item.href}
                        className={`${className}${activeClassName}`}
                        aria-haspopup="true"
                        aria-current={active ? 'page' : undefined}
                      >
                        {t(item.labelKey)}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className={`${className}${activeClassName}`}
                        aria-haspopup="true"
                        aria-current={active ? 'page' : undefined}
                      >
                        {t(item.labelKey)}
                      </a>
                    )}
                    <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                      <div className="min-w-[280px] border border-gray-200 bg-white py-3 shadow-lg">
                        {item.children.map((child) => {
                          const childActive = isActiveHashItem(child.href, pathname, hash)
                          const childClassName = `block px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#f4efe9] hover:text-[color:var(--header-accent)]${
                            childActive
                              ? ' bg-[#f4efe9] text-[color:var(--header-accent)]'
                              : ''
                          }`

                          return shouldUseRouterLink(child.href) ? (
                            <Link
                              key={child.href}
                              to={child.href}
                              className={childClassName}
                              aria-current={childActive ? 'page' : undefined}
                            >
                              {t(child.labelKey)}
                            </Link>
                          ) : (
                            <a
                              key={child.href}
                              href={child.href}
                              className={childClassName}
                              aria-current={childActive ? 'page' : undefined}
                            >
                              {t(child.labelKey)}
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              }

              if (item.spa) {
                return (
                  <Link
                    key={item.labelKey}
                    to="/"
                    className={`${className}${activeClassName}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    {t(item.labelKey)}
                  </Link>
                )
              }
              return shouldUseRouterLink(item.href) ? (
                <Link
                  key={item.labelKey}
                  to={item.href}
                  className={`${className}${activeClassName}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </Link>
              ) : (
                <a
                  key={item.labelKey}
                  href={item.href}
                  className={`${className}${activeClassName}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </a>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <CartButton className="bg-white/0" />
            {!loading && session ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((current) => !current)}
                  className="flex items-center gap-2 bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
                >
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt={profile?.name || session.user.email || 'User'}
                      className="h-6 w-6 object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>{profile?.name || session.user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white shadow-lg">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100"
                        onClick={() => {
                          setUserMenuOpen(false)
                          handleOpenCmsProfile()
                        }}
                      >
                        <User className="h-4 w-4" />
                        {t('header.auth.myProfileCms')}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100"
                        onClick={async () => {
                          setUserMenuOpen(false)
                          await signOut()
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('header.auth.signOut')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <a
                  href={cmsSignupUrl}
                  className="border border-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-[color:var(--header-ink)] transition-colors hover:border-[color:var(--header-accent)] hover:text-[color:var(--header-accent)]"
                >
                  {t('header.auth.signUp')}
                </a>
                <a
                  href={cmsLoginUrl}
                  className="bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
                >
                  {t('header.auth.signIn')}
                </a>
              </>
            )}
          </div>

          <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
            <div className="flex items-center gap-2 lg:hidden">
              <CartButton className="h-10 w-10 justify-center px-0" />
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)]"
                  aria-label={t('header.menu.open')}
                  aria-expanded={menuOpen}
                  aria-controls="mobile-menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </DialogTrigger>
            </div>

            <DialogContent
              id="mobile-menu"
              overlayClassName="bg-black/40"
              showCloseButton={false}
              className="fixed left-auto right-0 top-0 z-50 h-full w-full max-w-sm translate-x-0 translate-y-0 rounded-none border-0 bg-[color:var(--header-panel)] p-0 text-white shadow-none sm:max-w-sm"
            >
              <DialogTitle className="sr-only">{t('header.menu.title')}</DialogTitle>
              <div className="flex h-full flex-col gap-6 px-6 pb-10 pt-6">
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
                  <DialogClose asChild>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center border border-white/20 text-white"
                      aria-label={t('header.menu.close')}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </DialogClose>
                </div>

                <div className="flex flex-col gap-4 pt-4 text-lg">
                  {navItems.map((item, index) => {
                    const active = item.spa
                      ? pathname === '/'
                      : isActiveNavItem(item.href, pathname)
                    const baseClass =
                      "flex items-center justify-between border-b border-white/10 pb-3 text-white font-semibold transition-all duration-300 hover:translate-x-1 hover:text-[color:var(--header-accent)]"
                    const activeClassName = active
                      ? ' text-[color:var(--header-accent)] border-[color:var(--header-accent)]'
                      : ''
                    const style = { transitionDelay: `${index * 40}ms` }
                    if (item.spa) {
                      return (
                        <Link
                          key={item.labelKey}
                          to="/"
                          className={`${baseClass}${activeClassName}`}
                          style={style}
                          onClick={() => setMenuOpen(false)}
                          aria-current={active ? 'page' : undefined}
                        >
                          {t(item.labelKey)}
                        </Link>
                      )
                    }
                    return shouldUseRouterLink(item.href) ? (
                      <Link
                        key={item.labelKey}
                        to={item.href}
                        className={`${baseClass}${activeClassName}`}
                        style={style}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        {t(item.labelKey)}
                      </Link>
                    ) : (
                      <a
                        key={item.labelKey}
                        href={item.href}
                        className={`${baseClass}${activeClassName}`}
                        style={style}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? 'page' : undefined}
                      >
                        {t(item.labelKey)}
                      </a>
                    )
                  })}
                </div>

                <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
                  {!loading && session ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
                        onClick={() => {
                          setMenuOpen(false)
                          handleOpenCmsProfile()
                        }}
                      >
                        <User className="h-4 w-4" />
                        {t('header.auth.myProfileCms')}
                      </button>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]"
                        onClick={async () => {
                          setMenuOpen(false)
                          await signOut()
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        {t('header.auth.signOut')}
                      </button>
                    </>
                  ) : (
                    <>
                      <a
                        href={cmsSignupUrl}
                        className="flex items-center justify-center border border-white/20 px-4 py-3 text-sm font-semibold text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('header.auth.signUp')}
                      </a>
                      <a
                        href={cmsLoginUrl}
                        className="flex items-center justify-center bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('header.auth.signIn')}
                      </a>
                    </>
                  )}
                  <div className="text-xs text-white/65">Catalogus</div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>
      <FloatingSearch />
    </>
  )
}
