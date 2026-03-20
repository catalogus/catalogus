import type { Session } from '@supabase/supabase-js'
import { LogOut, Menu, User, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CartButton } from '../shop/CartButton'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { isActiveNavItem, navItems } from './navConfig'

type HeaderMobileMenuProps = {
  pathname: string
  loading: boolean
  session: Session | null
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  cmsLoginUrl: string
  cmsSignupUrl: string
  onOpenProfile: () => void
  onSignOut: () => Promise<void>
}

export function HeaderMobileMenu({
  pathname,
  loading,
  session,
  menuOpen,
  setMenuOpen,
  cmsLoginUrl,
  cmsSignupUrl,
  onOpenProfile,
  onSignOut,
}: HeaderMobileMenuProps) {
  const { t } = useTranslation()

  return (
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
            <DialogClose asChild>
              <a href="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/10">
                  C
                </div>
                <div className="leading-tight">
                  <p className="text-base font-semibold">Catalogus</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[color:var(--header-panel-muted)]">
                    {t('header.mobile.tagline')}
                  </p>
                </div>
              </a>
            </DialogClose>
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
              const active = item.spa ? pathname === '/' : isActiveNavItem(item.href, pathname)
              const baseClass =
                'flex items-center justify-between border-b border-white/10 pb-3 text-white font-semibold transition-all duration-300 hover:translate-x-1 hover:text-[color:var(--header-accent)]'
              const activeClassName = active
                ? ' text-[color:var(--header-accent)] border-[color:var(--header-accent)]'
                : ''
              const style = { transitionDelay: `${index * 40}ms` }

              const href = item.spa ? '/' : item.href

              return (
                <DialogClose asChild key={item.labelKey}>
                  <a
                    href={href}
                    className={`${baseClass}${activeClassName}`}
                    style={style}
                    aria-current={active ? 'page' : undefined}
                  >
                    {t(item.labelKey)}
                  </a>
                </DialogClose>
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
                    onOpenProfile()
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
                    await onSignOut()
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
  )
}
