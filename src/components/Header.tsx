import { Link } from '@tanstack/react-router'
import { Menu, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const navItems = [
  { label: 'Inicio', href: '/', spa: true },
  { label: 'Livros', href: '/livros' },
  { label: 'Autores', href: '/autores' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Eventos', href: '/eventos' },
  { label: 'Loja', href: '/loja' },
  { label: 'Sobre', href: '/sobre' },
] as const

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 `}
      style={{
        background: isScrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
        borderColor: isScrolled ? 'var(--header-border)' : 'transparent',
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:py-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[color:var(--header-border)] bg-white text-[color:var(--header-ink)] shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
            C
          </div>
          <div className="leading-tight">
            <p className="text-base font-semibold text-[color:var(--header-ink)] sm:text-lg">
              Catalogus
            </p>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--header-muted)]">
              Livraria & cultura
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const className =
              "relative text-sm font-medium text-[color:var(--header-ink)] transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-[color:var(--header-accent)] after:transition-transform after:duration-300 after:content-[''] hover:text-[color:var(--header-accent)] hover:after:scale-x-100"
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
          <a
            href="/carrinho"
            className="flex items-center gap-2 rounded-full border border-[color:var(--header-border)] px-3 py-2 text-sm font-medium text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)]"
          >
            <ShoppingBag className="h-4 w-4" />
            Carrinho
          </a>
          <Link
            to="/auth/sign-in"
            className="rounded-full bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
          >
            Entrar
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center text-[color:var(--header-ink)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[color:var(--header-accent)] lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" />
        </button>
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4 pt-4 text-lg">
          {navItems.map((item, index) => {
            const baseClass =
              "flex items-center justify-between border-b border-white/10 pb-3 text-white transition-all duration-300 hover:translate-x-1 hover:text-[color:var(--header-accent)]"
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
          <a
            href="/carrinho"
            className="flex items-center justify-between rounded-2xl border border-white/20 px-4 py-3 text-sm font-semibold"
          >
            Carrinho
            <ShoppingBag className="h-4 w-4" />
          </a>
          <Link
            to="/auth/sign-in"
            className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[color:var(--header-ink)]"
            onClick={() => setMenuOpen(false)}
          >
            Entrar
          </Link>
        </div>
      </aside>
    </header>
  )
}
