import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { StatusBadge } from '../../components/admin/ui/StatusBadge'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/authors')({
  component: AdminAuthorsPage,
})

type AuthorRow = {
  id: string
  name: string
  email?: string
  status: string | null
  phone?: string | null
}

function AdminAuthorsPage() {
  const { profile, session, signOut } = useAuth()
  const userName = profile?.name ?? session?.user.email ?? 'Admin'
  const userEmail = session?.user.email ?? ''
  const queryClient = useQueryClient()

  const authorsQuery = useQuery({
    queryKey: ['admin', 'authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, status, phone')
        .eq('role', 'author')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as AuthorRow[]
    },
    staleTime: 30_000,
  })

  const updateStatus = useMutation({
    mutationFn: async (payload: { id: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status: payload.status })
        .eq('id', payload.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'authors'] })
    },
  })

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
              <p className="text-sm uppercase text-gray-500">Community</p>
              <h1 className="text-2xl font-semibold text-gray-900">Authors</h1>
            </div>
            <button className="px-4 py-2 rounded-full bg-black text-white text-sm">
              Invite author
            </button>
          </div>
          <div className="rounded-2xl border border-gray-200 p-4 bg-white">
            {authorsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading authors…</p>
            ) : authorsQuery.isError ? (
              <p className="text-sm text-rose-600">
                Failed to load authors. Check connection or permissions.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-3">Author</th>
                      <th className="py-2 pr-3">Phone</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {authorsQuery.data?.map((author) => (
                      <tr key={author.id}>
                        <td className="py-3 pr-3 font-medium text-gray-900">
                          {author.name}
                        </td>
                        <td className="py-3 pr-3 text-gray-600">
                          {author.phone ?? '—'}
                        </td>
                        <td className="py-3 pr-3">
                          <StatusBadge
                            label={author.status ?? 'pending'}
                            variant={
                              author.status === 'approved'
                                ? 'success'
                                : author.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                            }
                          />
                        </td>
                        <td className="py-3 pr-3 space-x-2">
                          <button
                            onClick={() =>
                              updateStatus.mutate({
                                id: author.id,
                                status: 'approved',
                              })
                            }
                            className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateStatus.mutate({
                                id: author.id,
                                status: 'rejected',
                              })
                            }
                            className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold"
                          >
                            Reject
                          </button>
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
