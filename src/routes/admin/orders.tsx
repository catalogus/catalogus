import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { StatusBadge } from '../../components/admin/ui/StatusBadge'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/orders')({
  component: AdminOrdersPage,
})

type OrderRow = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  total: number
  status: string
  created_at: string
}

function AdminOrdersPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const ordersQuery = useInfiniteQuery({
    queryKey: ['admin', 'orders', { search, status: statusFilter }],
    queryFn: async ({ pageParam = 1 }) => {
      const from = (pageParam - 1) * 20
      const to = from + 19

      let query = supabase
        .from('orders')
        .select(
          'id, order_number, customer_name, customer_email, total, status, created_at',
        )
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,order_number.ilike.%${search}%`,
        )
      }

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error } = await query
      if (error) throw error

      return {
        orders: data as OrderRow[],
        hasMore: data.length === 20,
      }
    },
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 10_000,
  })

  const allOrders = ordersQuery.data?.pages.flatMap((page) => page.orders) ?? []

  const updateStatus = useMutation({
    mutationFn: async (payload: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: payload.status })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    },
  })

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      maximumFractionDigits: 0,
    }).format(value)

  const statusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success'
      case 'processing':
        return 'info'
      case 'failed':
      case 'cancelled':
        return 'danger'
      default:
        return 'muted'
    }
  }

  return (
    <AdminGuard>
      <DashboardLayout
        userRole={profile?.role ?? 'admin'}
        userName={userName}
        userEmail={userEmail}
            onSignOut={signOut}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Commerce</p>
              <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              M-Pesa status feed will surface here.
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {ordersQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading orders…</p>
            ) : ordersQuery.isError ? (
              <p className="text-sm text-rose-600">
                Failed to load orders. Check connection or permissions.
              </p>
            ) : allOrders.length === 0 ? (
              <p className="text-sm text-gray-500">No orders found.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-3">Order</th>
                        <th className="py-2 pr-3">Customer</th>
                        <th className="py-2 pr-3">Total</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Created</th>
                        <th className="py-2 pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {allOrders.map((order) => (
                        <tr key={order.id}>
                          <td className="py-3 pr-3 font-medium text-gray-900">
                            {order.order_number}
                          </td>
                          <td className="py-3 pr-3 text-gray-700">
                            <div>{order.customer_name}</div>
                            <div className="text-xs text-gray-500">
                              {order.customer_email}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-gray-900">
                            {formatPrice(order.total)}
                          </td>
                          <td className="py-3 pr-3">
                            <StatusBadge
                              label={order.status}
                              variant={statusVariant(order.status)}
                            />
                          </td>
                          <td className="py-3 pr-3 text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 pr-3 text-sm">
                            <select
                              defaultValue={order.status}
                              onChange={(e) =>
                                updateStatus.mutate({
                                  id: order.id,
                                  status: e.target.value,
                                })
                              }
                              className="rounded-lg border border-gray-300 px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Load More Button */}
                {ordersQuery.hasNextPage && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => ordersQuery.fetchNextPage()}
                      disabled={ordersQuery.isFetchingNextPage}
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {ordersQuery.isFetchingNextPage
                        ? 'Loading...'
                        : 'Load More'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
