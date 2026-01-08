import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import type { AdminLevel, UserRole } from '../../../types/admin'

type DashboardLayoutProps = {
  children: React.ReactNode
  userRole?: UserRole
  adminLevel?: AdminLevel
  userName?: string
  userEmail?: string
  onSignOut?: () => Promise<void> | void
}

export function DashboardLayout({
  children,
  userRole = 'admin',
  adminLevel = 'full_admin',
  userName = 'Catalogus Admin',
  userEmail = 'admin@catalogus.com',
  onSignOut,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="admin-shell min-h-screen bg-[#FAFAFA] flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <Sidebar userRole={userRole} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          userRole={userRole}
          adminLevel={adminLevel}
          userName={userName}
          userEmail={userEmail}
          onSignOut={onSignOut}
        />

        <main className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="p-6 bg-white rounded-3xl shadow-[0_2px_8px_0_rgba(0,0,0,0.1)]">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? (
          <X className="w-6 h-6 text-gray-600" />
        ) : (
          <Menu className="w-6 h-6 text-gray-600" />
        )}
      </button>
    </div>
  )
}
