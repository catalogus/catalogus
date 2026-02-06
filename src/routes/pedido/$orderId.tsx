import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import Header from '../../components/Header'
import { formatPrice, getOrderStatusColor } from '../../lib/shopHelpers'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'
import { refreshMpesaStatus } from '../../server/mpesa'

type OrderItem = {
  id: number
  quantity: number
  price: number
  book: {
    id: string
    title: string
    cover_url: string | null
    cover_path: string | null
  } | null
}

type OrderDetail = {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  total: number
  status: string
  created_at: string
  items?: OrderItem[] | null
}

const resolveCoverUrl = (item: OrderItem) => {
  if (item.book?.cover_url) return item.book.cover_url
  if (item.book?.cover_path) {
    return supabase.storage.from('covers').getPublicUrl(item.book.cover_path).data
      .publicUrl
  }
  return null
}

export const Route = createFileRoute('/pedido/$orderId')({
  component: OrderConfirmationPage,
})

function OrderConfirmationPage() {
  const { orderId } = Route.useParams()
  const { t, i18n } = useTranslation()
  const { session } = useAuth()
  const locale = i18n.language === 'en' ? 'en-US' : 'pt-PT'

  const orderQuery = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          id,
          order_number,
          customer_name,
          customer_email,
          customer_phone,
          total,
          status,
          created_at,
          items:order_items(
            id,
            quantity,
            price,
            book:books(id, title, cover_url, cover_path)
          )
        `,
        )
        .eq('id', orderId)
        .maybeSingle()

      if (error) throw error
      return (data as OrderDetail | null) ?? null
    },
    staleTime: 60_000,
    refetchInterval: (query) => {
      const status = (query.state.data as OrderDetail | null)?.status
      if (!status) return false
      if (['paid', 'failed', 'cancelled'].includes(status)) return false
      return 10_000
    },
  })

  const order = orderQuery.data
  const orderNumber = order?.order_number ?? ''
  const statusLabel = order
    ? t(`orders.status.${order.status}`, { defaultValue: order.status })
    : ''
  const statusColor = order ? getOrderStatusColor(order.status) : ''

  const paymentMessage = order
    ? order.status === 'paid'
      ? t('orders.detail.paymentPaid')
      : order.status === 'failed'
        ? t('orders.detail.paymentFailed')
        : t('orders.detail.paymentPending')
    : t('orders.detail.paymentFallback')

  const refreshStatusMutation = useMutation({
    mutationFn: async () => {
      if (!session?.access_token || !order?.id) {
        throw new Error('Missing access token')
      }
      return refreshMpesaStatus({
        data: { orderId: order.id, accessToken: session.access_token },
      })
    },
    onSuccess: async () => {
      await orderQuery.refetch()
    },
  })

  return (
    <div className="min-h-screen bg-[#f8f4ef] text-gray-900">
      <Header />

      {orderQuery.isLoading && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="h-64 animate-pulse border border-gray-200 bg-gray-100" />
        </div>
      )}

      {orderQuery.isError && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('orders.detail.error')}
          </div>
        </div>
      )}

      {!orderQuery.isLoading && !orderQuery.isError && !order && (
        <div className="container mx-auto px-4 py-24 lg:px-15">
          <div className="border border-gray-200 bg-white p-6 text-sm text-gray-600">
            {t('orders.detail.notFound')}
          </div>
        </div>
      )}

      {!orderQuery.isLoading && !orderQuery.isError && order && (
        <main className="container mx-auto px-4 py-16 lg:px-15">
          <div className="space-y-6 border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  {t('orders.detail.confirmed')}
                </p>
                <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                  {orderNumber}
                </h1>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="grid gap-4 text-sm text-gray-700 md:grid-cols-2">
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500">
                  {t('orders.detail.customer')}
                </span>
                <span>{order.customer_name}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-gray-500">
                  {t('orders.detail.contact')}
                </span>
                <span>
                  {order.customer_email} | {order.customer_phone}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('orders.detail.items')}
              </h2>
              <div className="mt-4 space-y-4">
                {(order.items ?? []).map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div className="h-16 w-12 flex-shrink-0 bg-gray-100">
                      {resolveCoverUrl(item) ? (
                        <img
                          src={resolveCoverUrl(item) ?? ''}
                          alt={item.book?.title ?? t('orders.detail.bookFallback')}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-300">
                          {item.book?.title?.charAt(0).toUpperCase() ?? 'L'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {item.book?.title ?? t('orders.detail.bookFallback')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x {formatPrice(item.price, locale)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-sm text-gray-700">
              <span>{t('orders.detail.total')}</span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(order.total, locale)}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-4 text-sm text-gray-700">
              <h3 className="text-xs uppercase tracking-wider text-gray-500">
                {t('orders.detail.paymentTitle')}
              </h3>
              <p className="mt-2">{paymentMessage}</p>
              {order &&
                !['paid', 'failed', 'cancelled'].includes(order.status) && (
                  <button
                    type="button"
                    onClick={() => refreshStatusMutation.mutate()}
                    disabled={refreshStatusMutation.isPending}
                    className="mt-4 border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {refreshStatusMutation.isPending
                      ? t('orders.detail.refreshingStatus')
                      : t('orders.detail.refreshStatus')}
                  </button>
                )}
            </div>

            <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="border border-gray-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-700 hover:border-gray-400"
              >
                {t('orders.detail.print')}
              </button>
              <Link
                to="/loja"
                className="bg-[color:var(--brand)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#a25a2c]"
              >
                {t('orders.detail.backToShop')}
              </Link>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}
