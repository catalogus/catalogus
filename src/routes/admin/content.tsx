import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/admin/layout'
import { withAdminGuard } from '../../components/admin/withAdminGuard'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/content')({
  component: withAdminGuard(AdminContentPage),
})

function AdminContentPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''

  return (
    <DashboardLayout
      userRole={profile?.role ?? 'admin'}
      userName={userName}
      userEmail={userEmail}
      onSignOut={signOut}
    >
      <div className="space-y-3">
        <div>
          <p className="text-sm uppercase text-gray-500">Content</p>
          <h1 className="text-2xl font-semibold text-gray-900">Content hub</h1>
          <p className="text-sm text-gray-500">
            Posts, partners, services, and projects share this layout.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500 text-sm">
          Select a section from the sidebar to manage specific content types.
        </div>
      </div>
    </DashboardLayout>
  )
}
