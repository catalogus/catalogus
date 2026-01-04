import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/books')({
  component: AdminBooksPage,
})

type BookRow = {
  id: string
  title: string
  price_mzn: number
  stock: number
  category: string | null
  language: string
  is_active: boolean
}

function AdminBooksPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()

  const booksQuery = useQuery({
    queryKey: ['admin', 'books'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, price_mzn, stock, category, language, is_active')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as BookRow[]
    },
    staleTime: 30_000,
  })

  const toggleActive = useMutation({
    mutationFn: async (payload: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('books')
        .update({ is_active: payload.is_active })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
    },
  })

  const updateStock = useMutation({
    mutationFn: async (payload: { id: string; stock: number }) => {
      const { error } = await supabase
        .from('books')
        .update({ stock: payload.stock })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
    },
  })

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      maximumFractionDigits: 0,
    }).format(value)

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
              <p className="text-sm uppercase text-gray-500">Catalog</p>
              <h1 className="text-2xl font-semibold text-gray-900">Books</h1>
            </div>
            <button className="px-4 py-2 rounded-full bg-black text-white text-sm">
              Add book
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {booksQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading books…</p>
            ) : booksQuery.isError ? (
              <p className="text-sm text-rose-600">
                Failed to load books. Check connection or permissions.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Title</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Language</th>
                      <th className="py-2 pr-3">Price</th>
                      <th className="py-2 pr-3">Stock</th>
                      <th className="py-2 pr-3">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {booksQuery.data?.map((book) => (
                      <tr key={book.id} className="align-middle">
                        <td className="py-3 pr-3">
                          <div className="font-medium text-gray-900">
                            {book.title}
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {book.category ?? '—'}
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {book.language?.toUpperCase()}
                        </td>
                        <td className="py-3 pr-3 text-gray-900">
                          {formatPrice(book.price_mzn)}
                        </td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={0}
                              defaultValue={book.stock}
                              onBlur={(e) =>
                                updateStock.mutate({
                                  id: book.id,
                                  stock: Number(e.target.value || 0),
                                })
                              }
                              className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                            />
                            {updateStock.isPending && (
                              <span className="text-xs text-gray-500">
                                Saving…
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <label className="inline-flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={book.is_active}
                              onChange={(e) =>
                                toggleActive.mutate({
                                  id: book.id,
                                  is_active: e.target.checked,
                                })
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <span className="text-gray-700">
                              {book.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
