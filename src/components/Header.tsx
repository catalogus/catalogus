import { Link, useRouterState } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthProvider'
import { buildCmsAuthUrl, buildCmsBridgeTransferUrl } from '../lib/crossSiteAuth'
import { FloatingSearch } from './search/FloatingSearch'
import { HeaderDesktopNav } from './header/HeaderDesktopNav'
import { HeaderMobileMenu } from './header/HeaderMobileMenu'

export default function Header() {
  const { session, profile, loading, signOut } = useAuth()
  const { pathname, hash } = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      hash: state.location.hash ?? '',
    }),
  })
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const currentPath = useMemo(() => `${pathname}${hash || ''}`, [pathname, hash])
  const cmsLoginUrl = useMemo(() => buildCmsAuthUrl('login', currentPath), [currentPath])
  const cmsSignupUrl = useMemo(() => buildCmsAuthUrl('sign-up', currentPath), [currentPath])

  const handleOpenCmsProfile = useCallback(() => {
    if (!session) {
      window.location.href = cmsLoginUrl
      return
    }

    const metadataRole = (session.user.user_metadata as { role?: string } | undefined)?.role
    const effectiveRole = profile?.role ?? metadataRole
    const cmsNextPath = effectiveRole === 'author' ? '/perfil' : '/'

    window.location.href = buildCmsBridgeTransferUrl(session, cmsNextPath)
  }, [session, cmsLoginUrl, profile?.role])

  const updateHeaderHeight = useCallback(() => {
    const headerEl = document.querySelector('header')
    if (headerEl) {
      document.documentElement.style.setProperty('--header-height', `${headerEl.offsetHeight}px`)
    }
  }, [])

  // Set CSS custom property for header height
  useEffect(() => {
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [updateHeaderHeight])

  // Update header height when scroll state changes (header size might change)
  useEffect(() => {
    updateHeaderHeight()
  }, [isScrolled, updateHeaderHeight])

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

          <HeaderDesktopNav
            pathname={pathname}
            hash={hash}
            loading={loading}
            session={session}
            profile={profile}
            cmsLoginUrl={cmsLoginUrl}
            cmsSignupUrl={cmsSignupUrl}
            onOpenProfile={handleOpenCmsProfile}
            onSignOut={signOut}
          />

          <HeaderMobileMenu
            pathname={pathname}
            loading={loading}
            session={session}
            profile={profile}
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
            cmsLoginUrl={cmsLoginUrl}
            cmsSignupUrl={cmsSignupUrl}
            onOpenProfile={handleOpenCmsProfile}
            onSignOut={signOut}
          />
        </div>
      </header>
      <FloatingSearch />
    </>
  )
}
