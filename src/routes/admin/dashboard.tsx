import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''

  const metricsQuery = useQuery({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const [ordersToday, activeBooks, authorsCount] = await Promise.all([
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('books')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('authors')
          .select('id', { count: 'exact', head: true }),
      ])

      if (ordersToday.error) throw ordersToday.error
      if (activeBooks.error) throw activeBooks.error
      if (authorsCount.error) throw authorsCount.error

      return {
        ordersToday: ordersToday.count ?? 0,
        activeBooks: activeBooks.count ?? 0,
        authorsCount: authorsCount.count ?? 0,
      }
    },
    staleTime: 30_000,
  })

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
        onSignOut={signOut}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Overview</p>
              <h1 className="text-2xl font-semibold text-gray-900">
                Catalogus dashboard
              </h1>
              <p className="text-sm text-gray-500">
                Quick snapshot of orders, books, and authors.
              </p>
            </div>
            {metricsQuery.isFetching && (
              <span className="text-xs text-gray-500">Updating…</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                label: 'Orders today',
                value:
                  metricsQuery.data?.ordersToday?.toString() ??
                  (metricsQuery.isLoading ? '…' : '0'),
              },
              {
                label: 'Active books',
                value:
                  metricsQuery.data?.activeBooks?.toString() ??
                  (metricsQuery.isLoading ? '…' : '0'),
              },
              {
                label: 'Authors',
                value:
                  metricsQuery.data?.authorsCount?.toString() ??
                  (metricsQuery.isLoading ? '…' : '0'),
              },
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
