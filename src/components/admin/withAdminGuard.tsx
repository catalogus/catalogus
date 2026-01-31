import type { ComponentType } from 'react'
import { AdminGuard } from './AdminGuard'

export function withAdminGuard<P>(Component: ComponentType<P>) {
  return function AdminGuarded(props: P) {
    return (
      <AdminGuard>
        <Component {...props} />
      </AdminGuard>
    )
  }
}
