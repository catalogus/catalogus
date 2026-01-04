import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../../components/admin/layout'
import { AdminGuard } from '../../components/admin/AdminGuard'
import { useAuth } from '../../contexts/AuthProvider'

export const Route = createFileRoute('/admin/content/posts')({
  component: AdminPostsPage,
})

function AdminPostsPage() {
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase text-gray-500">Content</p>
              <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
            </div>
            <button className="px-4 py-2 rounded-full bg-black text-white text-sm">
              New post
            </button>
          </div>
          <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-gray-500 text-sm">
            Blog/news list and editor will live here.
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  )
}
