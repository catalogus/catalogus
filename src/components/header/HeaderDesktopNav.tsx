import type { Session } from '@supabase/supabase-js'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { CartButton } from '../shop/CartButton'
import { HeaderUserMenu } from './HeaderUserMenu'
import { isActiveHashItem, isActiveNavItem, navItems, shouldUseRouterLink } from './navConfig'

type HeaderProfile = {
  role: 'admin' | 'author' | 'customer'
  name: string
  photo_url: string | null
} | null

type HeaderDesktopNavProps = {
  pathname: string
  hash: string
  loading: boolean
  session: Session | null
  profile: HeaderProfile
  cmsLoginUrl: string
  cmsSignupUrl: string
  onOpenProfile: () => void
  onSignOut: () => Promise<void>
}

const navLinkClassName =
  "relative text-(--header-ink) transition-colors duration-200 after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:w-full after:origin-left after:scale-x-0 after:bg-(--header-accent) after:transition-transform after:duration-300 after:content-[''] hover:text-(--header-accent) hover:after:scale-x-100"

export function HeaderDesktopNav({
  pathname,
  hash,
  loading,
  session,
  profile,
  cmsLoginUrl,
  cmsSignupUrl,
  onOpenProfile,
  onSignOut,
}: HeaderDesktopNavProps) {
  const { t } = useTranslation()

  return (
    <>
      <nav className="hidden items-center gap-6 lg:flex">
        {navItems.map((item) => {
          const active = item.spa ? pathname === '/' : isActiveNavItem(item.href, pathname)
          const activeClassName = active ? ' text-(--header-accent) after:scale-x-100' : ''

          if (item.children && item.children.length > 0) {
            return (
              <div key={item.labelKey} className="relative group">
                {shouldUseRouterLink(item.href) ? (
                  <Link
                    to={item.href}
                    className={`${navLinkClassName}${activeClassName}`}
                    aria-haspopup="true"
                    aria-current={active ? 'page' : undefined}
                  >
                    {t(item.labelKey)}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className={`${navLinkClassName}${activeClassName}`}
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
                        childActive ? ' bg-[#f4efe9] text-[color:var(--header-accent)]' : ''
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
                className={`${navLinkClassName}${activeClassName}`}
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
              className={`${navLinkClassName}${activeClassName}`}
              aria-current={active ? 'page' : undefined}
            >
              {t(item.labelKey)}
            </Link>
          ) : (
            <a
              key={item.labelKey}
              href={item.href}
              className={`${navLinkClassName}${activeClassName}`}
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
          <HeaderUserMenu
            session={session}
            profile={profile}
            onOpenProfile={onOpenProfile}
            onSignOut={onSignOut}
          />
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
    </>
  )
}
