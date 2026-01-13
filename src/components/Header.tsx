import { Link } from '@tanstack/react-router'
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { CartButton } from './shop/CartButton'
import { FloatingSearch } from './search/FloatingSearch'

type NavChild = {
  label: string
  href: string
}

type NavItem = {
  label: string
  href: string
  spa?: boolean
  children?: NavChild[]
}

const navItems: NavItem[] = [
  { label: 'Autores', href: '/autores' },
  { label: 'Editora', href: '/loja' },
  { label: 'Noticias', href: '/noticias' },
  {
    label: 'Mapa Literario',
    href: 'https://www.calameo.com/read/0075442149b5bd3a18181',
  },
  {
    label: 'Projectos',
    href: '/projectos',
    children: [
      {
        label: 'Prémio Literário Carlos Morgado',
        href: '/projectos#premio-literario-carlos-morgado',
      },
      { label: 'Anonimus Podcast', href: '/projectos#anonimus-podcast' },
      { label: 'Oficinas Criativas', href: '/projectos#oficinas-criativas' },
    ],
  },
  { label: 'Produção', href: '/producao' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Sobre', href: '/sobre' },
]

export default function Header() {
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
              "relative text-xl font-medium text-[color:var(--header-ink)] transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-[color:var(--header-accent)] after:transition-transform after:duration-300 after:content-[''] hover:text-[color:var(--header-accent)] hover:after:scale-x-100"

            if (item.children && item.children.length > 0) {
              return (
                <div key={item.label} className="relative group">
                  <a
                    href={item.href}
                    className={className}
                    aria-haspopup="true"
                  >
                    {item.label}
                  </a>
                  <div className="pointer-events-none absolute left-0 top-full pt-3 opacity-0 transition duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100">
                    <div className="min-w-[280px] border border-gray-200 bg-white py-3 shadow-lg">
                      {item.children.map((child) => (
                        <a
                          key={child.href}
                          href={child.href}
                          className="block px-5 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-[#f4efe9] hover:text-[color:var(--header-accent)]"
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }

            if (item.spa) {
              return (
                <Link key={item.label} to="/" className={className}>
                  {item.label}
                </Link>
              )
            }
            return (
              <a key={item.label} href={item.href} className={className}>
                {item.label}
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
                className="flex items-center gap-2 bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
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
                        Painel Admin
                      </Link>
                    )}
                    {profile.role === 'author' && (
                      <Link
                        to="/author/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                    )}
                    {profile.role === 'customer' && (
                      <Link
                        to="/account/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Minha Conta
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
                      Sair
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
              Entrar
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <CartButton className="h-10 w-10 justify-center px-0" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)]"
            aria-label="Abrir menu"
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
                Livraria & cultura
              </p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-white"
            aria-label="Fechar menu"
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
                  key={item.label}
                  to="/"
                  className={baseClass}
                  style={style}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            }
            return (
              <a
                key={item.label}
                href={item.href}
                className={baseClass}
                style={style}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
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
                      {profile.name ?? 'Usuário'}
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
                  Painel Admin
                </Link>
              )}

              {profile.role === 'author' && (
                <Link
                  to="/author/profile"
                  className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Meu Perfil
                </Link>
              )}

              {profile.role === 'customer' && (
                <Link
                  to="/account/profile"
                  className="flex items-center gap-2 bg-white/10 px-4 py-3 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Minha Conta
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
                Sair
              </button>
            </>
          ) : (
            <Link
              to="/auth/sign-in"
              className="flex items-center justify-between bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]"
              onClick={() => setMenuOpen(false)}
            >
              Entrar
            </Link>
          )}
        </div>
      </aside>
      </header>
      <FloatingSearch />
    </>
  )
}
