import type { ComponentType } from 'react'
import { ClientOnly } from '../ClientOnly'
import { AdminGuard } from './AdminGuard'

export function withAdminGuard<P>(Component: ComponentType<P>) {
  return function AdminGuarded(props: P) {
    return (
      <ClientOnly
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <AdminGuard>
          <Component {...props} />
        </AdminGuard>
      </ClientOnly>
    )
  }
}
