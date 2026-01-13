import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '../../components/Header'
import { useAuth } from '../../contexts/AuthProvider'
import { CustomerGuard } from '../../components/customer/CustomerGuard'
import { supabase } from '../../lib/supabaseClient'

export const Route = createFileRoute('/account/profile')({
  component: CustomerProfilePage,
})

function CustomerProfilePage() {
  return (
    <CustomerGuard>
      <CustomerProfileContent />
    </CustomerGuard>
  )
}

function CustomerProfileContent() {
  const { profile, session, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Fetch recent orders
  const ordersQuery = useQuery({
    queryKey: ['customer-recent-orders', profile?.email],
    queryFn: async () => {
      if (!profile?.email) return []
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('customer_email', profile.email)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) throw error
      return data || []
    },
    enabled: !!profile?.email,
  })

  const handleSaveProfile = async () => {
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', profile?.id)

      if (error) throw error

      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setName(profile?.name || '')
    setPhone(profile?.phone || '')
    setIsEditing(false)
    setSaveError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name}!
          </h1>
          <p className="text-gray-600">Manage your account and view your orders</p>
        </div>

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Profile Information
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Edit
              </button>
            )}
          </div>

          {saveSuccess && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              Profile updated successfully!
            </div>
          )}

          {saveError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {saveError}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              ) : (
                <p className="text-gray-900">{profile?.name || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-gray-900">{profile?.email || session?.user?.email}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="+258 XX XXX XXXX"
                />
              ) : (
                <p className="text-gray-900">{profile?.phone || 'Not set'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link
              to="/meus-pedidos"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all orders →
            </Link>
          </div>

          {ordersQuery.isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading orders...</p>
            </div>
          ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
            <div className="space-y-3">
              {ordersQuery.data.map((order) => (
                <Link
                  key={order.id}
                  to="/pedido/$orderId"
                  params={{ orderId: order.id }}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('pt-PT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {order.total.toFixed(2)} MZN
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{order.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg
                className="h-12 w-12 text-gray-400 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-gray-600 mb-2">No orders yet</p>
              <Link
                to="/loja"
                className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Start shopping →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              to="/loja"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-gray-900 font-medium">Browse Books</span>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <Link
              to="/meus-pedidos"
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
            >
              <span className="text-gray-900 font-medium">Order History</span>
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
            <button
              onClick={() => signOut()}
              className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50/50 transition-colors text-left"
            >
              <span className="text-red-600 font-medium">Sign Out</span>
              <svg
                className="h-5 w-5 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
