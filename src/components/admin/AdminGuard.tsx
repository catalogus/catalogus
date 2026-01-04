import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'

type AdminGuardProps = {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session || profile?.role !== 'admin') {
      navigate({
        to: '/auth/sign-in',
        search: { redirect: '/admin/dashboard' },
        replace: true,
      })
    }
  }, [session, profile?.role, loading, navigate])

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Checking your session…</div>
    )
  }

  if (!session || profile?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
