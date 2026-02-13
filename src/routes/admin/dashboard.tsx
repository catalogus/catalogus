import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { RefreshCcw } from 'lucide-react'
import { DashboardLayout } from '../../components/admin/layout'
import { withAdminGuard } from '../../components/admin/withAdminGuard'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table'
import { useAuth } from '../../contexts/AuthProvider'
import { getFreshSession } from '../../lib/supabaseAuth'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/admin/dashboard')({
  component: withAdminGuard(AdminDashboardPage),
})

const MAPUTO_TZ = 'Africa/Maputo'
const DASHBOARD_RPC_TIMEOUT_MS = 20_000

const currencyFormatter = new Intl.NumberFormat('pt-MZ', {
  style: 'currency',
  currency: 'MZN',
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  maximumFractionDigits: 1,
})

type DashboardMetrics = {
  last_updated: string
  range: {
    start_date: string
    end_date: string
    days: number
    timezone: string
  }
  compare_range: {
    start_date: string
    end_date: string
    days: number
  }
  summary: SummaryMetrics
  summary_compare: Partial<SummaryMetrics>
  trend: TrendPoint[]
  status_breakdown: StatusCount[]
  top_books: TopBook[]
  inventory: InventoryMetrics
  recent_orders: RecentOrder[]
}

type SummaryMetrics = {
  revenue: number | null
  paid_orders: number | null
  total_orders: number | null
  avg_order_value: number | null
  paid_rate: number | null
  new_customers: number | null
  newsletter_signups: number | null
  newsletter_verified: number | null
  active_books: number | null
  low_stock: number | null
  out_of_stock: number | null
  digital_books: number | null
  physical_books: number | null
}

type TrendPoint = {
  date: string
  revenue: number
  paid_orders: number
  total_orders: number
}

type StatusCount = {
  status: string
  count: number
}

type TopBook = {
  book_id: string
  title: string
  units_sold: number
  revenue: number
  stock: number | null
  is_digital: boolean
}

type InventoryBook = {
  id: string
  title: string
  stock: number | null
  cover_url: string | null
  is_digital: boolean
}

type InventoryMetrics = {
  low_stock_books: InventoryBook[]
  out_of_stock_books: InventoryBook[]
  digital_count: number
  physical_count: number
}

type RecentOrder = {
  id: string
  order_number: string
  customer_name: string
  status: string
  total: number
  created_at: string
}

type RangePreset = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'custom'

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'ytd', label: 'Year to date' },
  { value: 'custom', label: 'Custom range' },
]

const statusColors: Record<string, string> = {
  paid: 'bg-emerald-500',
  pending: 'bg-amber-400',
  processing: 'bg-blue-500',
  failed: 'bg-rose-500',
  cancelled: 'bg-slate-300',
}

const statusBadges: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  failed: 'bg-rose-100 text-rose-700 border-rose-200',
  cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
}

function AdminDashboardPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const authKey = session?.user.id ?? 'anon'
  const canQuery = !!session?.access_token

  const [rangePreset, setRangePreset] = useState<RangePreset>('7d')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [compareEnabled, setCompareEnabled] = useState(true)

  const range = useMemo(() => {
    const today = formatDateInTimeZone(new Date(), MAPUTO_TZ)
    if (rangePreset === 'today') {
      return { start: today, end: today, label: 'Today' }
    }
    if (rangePreset === '7d') {
      return {
        start: addDays(today, -6),
        end: today,
        label: 'Last 7 days',
      }
    }
    if (rangePreset === '30d') {
      return {
        start: addDays(today, -29),
        end: today,
        label: 'Last 30 days',
      }
    }
    if (rangePreset === '90d') {
      return {
        start: addDays(today, -89),
        end: today,
        label: 'Last 90 days',
      }
    }
    if (rangePreset === 'ytd') {
      return {
        start: `${today.slice(0, 4)}-01-01`,
        end: today,
        label: 'Year to date',
      }
    }
    const start = customStart || today
    const end = customEnd || today
    const normalized =
      end < start ? { start: end, end: start } : { start, end }
    return {
      ...normalized,
      label: 'Custom range',
    }
  }, [rangePreset, customStart, customEnd])

  const metricsQueryKey = useMemo(
    () => ['admin', 'dashboard-metrics', authKey, range.start, range.end],
    [authKey, range.start, range.end],
  )

  const metricsQuery = useQuery({
    queryKey: metricsQueryKey,
    queryFn: async ({ signal }) => {
      const { session: freshSession } = await getFreshSession()
      if (!freshSession?.access_token) {
        throw new Error('Missing auth session. Please sign in again.')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, DASHBOARD_RPC_TIMEOUT_MS)

      const handleAbort = () => controller.abort()
      signal.addEventListener('abort', handleAbort, { once: true })

      try {
        const { data, error } = await supabase
          .rpc('get_admin_dashboard_metrics', {
            p_start_date: range.start,
            p_end_date: range.end,
            p_timezone: MAPUTO_TZ,
            p_low_stock_threshold: 5,
            p_top_books_limit: 5,
            p_recent_orders_limit: 6,
          })
          .abortSignal(controller.signal)

        if (error) throw error
        return data as DashboardMetrics
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error('Dashboard metrics request timed out. Please try again.')
        }
        throw error
      } finally {
        clearTimeout(timeoutId)
        signal.removeEventListener('abort', handleAbort)
      }
    },
    enabled: canQuery,
    staleTime: 60_000,
  })

  const summary = metricsQuery.data?.summary
  const compare = metricsQuery.data?.summary_compare ?? {}
  const trend = metricsQuery.data?.trend ?? []
  const statusBreakdown = metricsQuery.data?.status_breakdown ?? []
  const topBooks = metricsQuery.data?.top_books ?? []
  const inventory = metricsQuery.data?.inventory
  const recentOrders = metricsQuery.data?.recent_orders ?? []
  const lastUpdated = metricsQuery.data?.last_updated

  const rangeLabel = `${formatDateLabel(range.start, MAPUTO_TZ)} – ${formatDateLabel(
    range.end,
    MAPUTO_TZ,
  )}`

  const kpis: KpiCard[] = [
    {
      label: 'Revenue',
      value: formatCurrency(summary?.revenue),
      delta: compareEnabled
        ? formatDelta(summary?.revenue, compare.revenue)
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'Paid orders',
      value: formatNumber(summary?.paid_orders),
      delta: compareEnabled
        ? formatDelta(summary?.paid_orders, compare.paid_orders)
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'Total orders',
      value: formatNumber(summary?.total_orders),
      delta: compareEnabled
        ? formatDelta(summary?.total_orders, compare.total_orders)
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'Avg order value',
      value: formatCurrency(summary?.avg_order_value),
      delta: compareEnabled
        ? formatDelta(summary?.avg_order_value, compare.avg_order_value)
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'Paid rate',
      value: formatRate(summary?.paid_rate),
      delta: compareEnabled
        ? formatDelta(summary?.paid_rate, compare.paid_rate, {
            mode: 'percentage-points',
          })
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'New customers',
      value: formatNumber(summary?.new_customers),
      delta: compareEnabled
        ? formatDelta(summary?.new_customers, compare.new_customers)
        : null,
      helper: compareEnabled ? 'vs previous period' : rangeLabel,
    },
    {
      label: 'Active books',
      value: formatNumber(summary?.active_books),
      delta: null,
      helper: 'Currently active',
    },
    {
      label: 'Low stock',
      value: formatNumber(summary?.low_stock),
      delta: null,
      helper: 'Threshold: 5',
      accent: 'warning',
    },
  ]

  return (
    <DashboardLayout
      userRole={profile?.role ?? 'admin'}
      userName={userName}
      userEmail={userEmail}
      onSignOut={signOut}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase text-gray-500">Overview</p>
            <h1 className="text-2xl font-semibold text-gray-900">
              Catalogus dashboard
            </h1>
            <p className="text-sm text-gray-500">
              Sales, catalog health, and operational KPIs.
            </p>
            <p className="text-xs text-gray-400 mt-2">{rangeLabel}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex items-center gap-2">
              <Select
                value={rangePreset}
                onValueChange={(value) =>
                  setRangePreset(value as RangePreset)
                }
              >
                <SelectTrigger size="sm" className="min-w-[170px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {rangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {rangePreset === 'custom' && (
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(event) => setCustomStart(event.target.value)}
                    className="h-8"
                  />
                  <span className="text-xs text-gray-500">to</span>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(event) => setCustomEnd(event.target.value)}
                    className="h-8"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={compareEnabled}
                onCheckedChange={setCompareEnabled}
              />
              <span className="text-sm text-gray-600">Compare previous</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => metricsQuery.refetch()}
              className="gap-2"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Last updated:{' '}
            {lastUpdated ? formatDateTime(lastUpdated, MAPUTO_TZ) : '—'}
          </span>
          {metricsQuery.isFetching && <span>Refreshing data…</span>}
        </div>

        {metricsQuery.isError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Failed to load dashboard metrics. Please check the connection and
            permissions.
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => (
            <KpiTile key={kpi.label} {...kpi} />
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Revenue & orders trend
                </h2>
                <p className="text-xs text-gray-500">
                  Daily totals for the selected range.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Orders
                </span>
              </div>
            </div>
            <div className="mt-4">
              <TrendChart data={trend} />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Order status
            </h2>
            <p className="text-xs text-gray-500">Breakdown by status.</p>
            <div className="mt-4">
              <StatusBreakdown data={statusBreakdown} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Top books
                </h2>
                <p className="text-xs text-gray-500">
                  Best sellers for the selected range.
                </p>
              </div>
              <span className="text-xs text-gray-400">Paid orders only</span>
            </div>
            <div className="mt-4">
              {topBooks.length === 0 ? (
                <EmptyState message="No book sales in this range." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Book</TableHead>
                      <TableHead>Units</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topBooks.map((book) => (
                      <TableRow key={book.book_id}>
                        <TableCell className="font-medium text-gray-900">
                          {book.title}
                        </TableCell>
                        <TableCell>{formatNumber(book.units_sold)}</TableCell>
                        <TableCell>{formatCurrency(book.revenue)}</TableCell>
                        <TableCell>
                          {book.is_digital ? (
                            <Badge variant="secondary">Digital</Badge>
                          ) : (
                            formatNumber(book.stock ?? 0)
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory health
            </h2>
            <p className="text-xs text-gray-500">
              Physical stock status and digital split.
            </p>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-xs uppercase text-gray-500">Digital</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(summary?.digital_books)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-gray-500">Physical</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(summary?.physical_books)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Low stock</p>
                <div className="mt-2 space-y-2">
                  {inventory?.low_stock_books?.length ? (
                    inventory.low_stock_books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                      >
                        <span className="font-medium">{book.title}</span>
                        <span>{formatNumber(book.stock ?? 0)} left</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">
                      No low-stock alerts.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase text-gray-500">Out of stock</p>
                <div className="mt-2 space-y-2">
                  {inventory?.out_of_stock_books?.length ? (
                    inventory.out_of_stock_books.map((book) => (
                      <div
                        key={book.id}
                        className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-xs text-rose-900"
                      >
                        <span className="font-medium">{book.title}</span>
                        <span>0 left</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400">
                      No out-of-stock items.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent orders
                </h2>
                <p className="text-xs text-gray-500">
                  Latest orders in the selected period.
                </p>
              </div>
              <span className="text-xs text-gray-400">
                {formatNumber(recentOrders.length)} shown
              </span>
            </div>
            <div className="mt-4">
              {recentOrders.length === 0 ? (
                <EmptyState message="No orders in this range." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium text-gray-900">
                          {order.order_number}
                        </TableCell>
                        <TableCell>{order.customer_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`border ${statusBadges[order.status] ?? 'border-gray-200 text-gray-600'}`}
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          {formatDateTime(order.created_at, MAPUTO_TZ)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Engagement</h2>
            <p className="text-xs text-gray-500">
              Newsletter signups and quality.
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase text-gray-500">
                  Newsletter signups
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(summary?.newsletter_signups)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Verified: {formatNumber(summary?.newsletter_verified)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs uppercase text-gray-500">New customers</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {formatNumber(summary?.new_customers)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  First order in this range
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  )
}

type KpiCard = {
  label: string
  value: string
  delta: DeltaResult | null
  helper: string
  accent?: 'warning'
}

type DeltaResult = {
  label: string
  direction: 'up' | 'down' | 'flat' | 'new'
}

function KpiTile({ label, value, delta, helper, accent }: KpiCard) {
  const deltaColor =
    delta?.direction === 'up'
      ? 'text-emerald-600'
      : delta?.direction === 'down'
        ? 'text-rose-600'
        : 'text-gray-500'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
        {delta && (
          <span className={`text-xs font-medium ${deltaColor}`}>
            {delta.label}
          </span>
        )}
      </div>
      <p
        className={`mt-2 text-2xl font-semibold ${
          accent === 'warning' ? 'text-amber-600' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{helper}</p>
    </div>
  )
}

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return <EmptyState message="No trend data yet." />
  }

  const width = 600
  const height = 180
  const pointsCount = data.length

  const revenueMax = Math.max(...data.map((point) => point.revenue), 0)
  const ordersMax = Math.max(...data.map((point) => point.total_orders), 0)

  if (revenueMax === 0 && ordersMax === 0) {
    return <EmptyState message="No activity in this range." />
  }

  const points = data.map((point, index) => {
    const ratio = pointsCount === 1 ? 0 : index / (pointsCount - 1)
    const x = ratio * width
    const revenueY =
      height - (revenueMax ? (point.revenue / revenueMax) * height : 0)
    const ordersY =
      height - (ordersMax ? (point.total_orders / ordersMax) * height : 0)
    return { x, revenueY, ordersY }
  })

  const revenueLine = points.map((p) => `${p.x},${p.revenueY}`).join(' ')
  const ordersLine = points.map((p) => `${p.x},${p.ordersY}`).join(' ')
  const revenueArea = `0,${height} ${revenueLine} ${width},${height}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-[180px]"
      role="img"
      aria-label="Revenue and orders trend"
    >
      <polygon points={revenueArea} fill="rgba(16,185,129,0.12)" />
      <polyline
        points={revenueLine}
        fill="none"
        stroke="#10B981"
        strokeWidth="2"
      />
      <polyline
        points={ordersLine}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
      />
    </svg>
  )
}

function StatusBreakdown({ data }: { data: StatusCount[] }) {
  const total = data.reduce((acc, item) => acc + item.count, 0)

  if (!data.length) {
    return <EmptyState message="No orders in this range." />
  }

  return (
    <div className="space-y-4">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-gray-100">
        {data.map((item) => {
          const percent = total ? (item.count / total) * 100 : 0
          return (
            <div
              key={item.status}
              className={statusColors[item.status] ?? 'bg-gray-300'}
              style={{ width: `${percent}%` }}
            />
          )
        })}
      </div>
      <div className="space-y-2">
        {data.map((item) => {
          const percent = total ? (item.count / total) * 100 : 0
          return (
            <div
              key={item.status}
              className="flex items-center justify-between text-xs text-gray-600"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${statusColors[item.status] ?? 'bg-gray-300'}`}
                />
                <span className="capitalize">{item.status}</span>
              </div>
              <span>
                {formatNumber(item.count)} • {percent.toFixed(1)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return currencyFormatter.format(value)
}

function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return numberFormatter.format(value)
}

function formatRate(value: number | null | undefined) {
  if (value === null || value === undefined) return '—'
  return percentFormatter.format(value)
}

type DeltaOptions = {
  mode?: 'percent' | 'percentage-points'
}

function formatDelta(
  current: number | null | undefined,
  previous: number | null | undefined,
  options: DeltaOptions = {},
): DeltaResult | null {
  if (current === null || current === undefined) return null
  if (previous === null || previous === undefined) return null

  if (options.mode === 'percentage-points') {
    const diff = current - previous
    if (diff === 0) return { label: '0.0pp', direction: 'flat' }
    return {
      label: `${diff > 0 ? '+' : ''}${(diff * 100).toFixed(1)}pp`,
      direction: diff > 0 ? 'up' : 'down',
    }
  }

  if (previous === 0) {
    if (current === 0) return { label: '0%', direction: 'flat' }
    return { label: 'New', direction: 'new' }
  }

  const delta = (current - previous) / Math.abs(previous)
  const label = `${delta > 0 ? '+' : ''}${(delta * 100).toFixed(1)}%`

  return {
    label,
    direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
  }
}

function formatDateInTimeZone(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function parseISODate(dateString: string) {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

function addDays(dateString: string, days: number) {
  const date = parseISODate(dateString)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

function formatDateLabel(dateString: string, timeZone: string) {
  const date = parseISODate(dateString)
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(dateString: string, timeZone: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
