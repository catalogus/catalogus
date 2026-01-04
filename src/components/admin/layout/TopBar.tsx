import { useState } from 'react'
import { Search, LogOut, User } from 'lucide-react'
import type { AdminLevel, UserRole } from '../../../types/admin'

type TopBarProps = {
  userRole?: UserRole
  adminLevel?: AdminLevel
  userName?: string
  userEmail?: string
  onSignOut?: () => Promise<void> | void
  onProfileSettings?: () => void
}

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'CA'

const roleBadge = (role?: UserRole) => {
  switch (role) {
    case 'admin':
      return { label: 'Admin', classes: 'bg-red-100 text-red-800' }
    case 'author':
      return { label: 'Author', classes: 'bg-blue-100 text-blue-800' }
    case 'customer':
      return { label: 'Customer', classes: 'bg-green-100 text-green-800' }
    default:
      return { label: 'User', classes: 'bg-gray-100 text-gray-800' }
  }
}

const adminLevelBadge = (level?: AdminLevel) => {
  switch (level) {
    case 'full_admin':
      return { label: 'Full Admin', classes: 'bg-yellow-100 text-yellow-800' }
    case 'staff':
      return { label: 'Staff', classes: 'bg-purple-100 text-purple-800' }
    case 'technician':
      return { label: 'Technician', classes: 'bg-blue-100 text-blue-800' }
    default:
      return { label: null, classes: '' }
  }
}

export function TopBar({
  userRole = 'admin',
  adminLevel = 'full_admin',
  userName = 'Catalogus Admin',
  userEmail = 'admin@catalogus.com',
  onSignOut,
  onProfileSettings,
}: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSignOut = async () => {
    await onSignOut?.()
  }

  const { label: roleLabel, classes: roleClasses } = roleBadge(userRole)
  const { label: levelLabel, classes: levelClasses } = adminLevelBadge(adminLevel)

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xs">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu((open) => !open)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">{userEmail}</p>
            </div>
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {getInitials(userName)}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleClasses}`}
                  >
                    {roleLabel}
                  </span>
                  {levelLabel && (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${levelClasses}`}
                    >
                      {levelLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false)
                    onProfileSettings?.()
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="w-4 h-4 mr-3" />
                  Profile Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
