import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
        onSignOut={signOut}
      >
        <div className="space-y-6">
          <div>
            <p className="text-sm uppercase text-gray-500">Overview</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              Catalogus dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Quick snapshot of orders, books, and authors.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Orders Today', value: '—' },
              { label: 'Active Books', value: '—' },
              { label: 'Pending Authors', value: '—' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-gray-200 p-4 bg-gray-50"
              >
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {item.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
