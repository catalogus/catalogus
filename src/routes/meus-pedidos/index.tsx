import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthProvider'
import { formatPrice, getOrderStatusColor, getOrderStatusLabel } from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/meus-pedidos/')({
  component: OrdersHistoryPage,
})

type OrderItem = {
  id: number
  quantity: number
  price: number
  book: {
    title: string | null
    cover_url: string | null
    cover_path: string | null
  } | null
}

type OrderSummary = {
  id: string
  order_number: string
  total: number
  status: string
  created_at: string
  items?: OrderItem[] | null
}

function OrdersHistoryPage() {
  const { session, profile } = useAuth()
  const [statusFilter, setStatusFilter] = useState('all')

  const email = profile?.email ?? session?.user?.email ?? null

  const ordersQuery = useQuery({
    queryKey: ['my-orders', email],
    queryFn: async () => {
      if (!email) return []
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          order_number,
          total,
          status,
          created_at,
          items:order_items(
            id,
            quantity,
            price,
            book:books(title, cover_url, cover_path)
          )
        `,
        )
        .eq('customer_email', email)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as OrderSummary[]) ?? []
    },
    enabled: !!email,
    staleTime: 60_000,
  })

  const filteredOrders = useMemo(() => {
    const orders = ordersQuery.data ?? []
    if (statusFilter === 'all') return orders
    return orders.filter((order) => order.status === statusFilter)
  }, [ordersQuery.data, statusFilter])

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      <main className="container mx-auto px-4 py-16 lg:px-15">
        <h1 className="text-3xl font-semibold md:text-5xl">Meus pedidos</h1>

        {!email && (
          <div className="mt-8 border border-gray-200 bg-white p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">
              Faça login para ver os seus pedidos
            </p>
            <Link
              to="/auth/sign-in"
              className="mt-6 inline-flex items-center justify-center bg-[color:var(--brand)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
            >
              Entrar
            </Link>
          </div>
        )}

        {email && (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <label className="text-sm text-gray-600" htmlFor="order-status">
                Filtrar status
              </label>
              <select
                id="order-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[color:var(--brand)] focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {ordersQuery.isLoading && (
              <div className="mt-6 space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`orders-skeleton-${index}`}
                    className="h-24 animate-pulse border border-gray-200 bg-gray-100"
                  />
                ))}
              </div>
            )}

            {ordersQuery.isError && (
              <div className="mt-6 border border-gray-200 bg-white p-6 text-sm text-gray-600">
                Falha ao carregar pedidos. Tente novamente.
              </div>
            )}

            {!ordersQuery.isLoading &&
              !ordersQuery.isError &&
              filteredOrders.length === 0 && (
                <div className="mt-6 border border-gray-200 bg-white p-6 text-sm text-gray-600">
                  Nenhum pedido encontrado.
                </div>
              )}

            {!ordersQuery.isLoading &&
              !ordersQuery.isError &&
              filteredOrders.length > 0 && (
                <div className="mt-6 space-y-4">
                  {filteredOrders.map((order) => {
                    const statusColor = getOrderStatusColor(order.status)
                    const statusLabel = getOrderStatusLabel(order.status)
                    const createdAt = new Date(order.created_at)
                    const dateLabel = createdAt.toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    return (
                      <div
                        key={order.id}
                        className="flex flex-col gap-4 border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-3">
                            <p className="text-base font-semibold text-gray-900">
                              {order.order_number}
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <p className="text-xs uppercase tracking-wider text-gray-500">
                            {dateLabel}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <Link
                          to={`/pedido/${order.id}`}
                          className="inline-flex items-center justify-center border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
          </>
        )}
      </main>
    </div>
  )
}
