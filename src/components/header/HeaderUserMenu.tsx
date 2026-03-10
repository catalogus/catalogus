import type { Session } from '@supabase/supabase-js'
import { ChevronDown, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type HeaderProfile = {
  role: 'admin' | 'author' | 'customer'
  name: string
  photo_url: string | null
} | null

type HeaderUserMenuProps = {
  session: Session
  profile: HeaderProfile
  onOpenProfile: () => void
  onSignOut: () => Promise<void>
}

export function HeaderUserMenu({
  session,
  profile,
  onOpenProfile,
  onSignOut,
}: HeaderUserMenuProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 bg-[color:var(--header-ink)] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--header-accent)]"
      >
        {profile?.photo_url ? (
          <img
            src={profile.photo_url}
            alt={profile.name || session.user.email || 'User'}
            className="h-6 w-6 object-cover"
          />
        ) : (
          <User className="h-4 w-4" />
        )}
        <span>{profile?.name || session.user.email}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-56 border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100"
              onClick={() => {
                setOpen(false)
                onOpenProfile()
              }}
            >
              <User className="h-4 w-4" />
              {t('header.auth.myProfileCms')}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-gray-900 transition-colors hover:bg-gray-100"
              onClick={async () => {
                setOpen(false)
                await onSignOut()
              }}
            >
              <LogOut className="h-4 w-4" />
              {t('header.auth.signOut')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
