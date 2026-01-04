import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/')({
  loader: () => redirect({ to: '/admin/dashboard' }),
})
