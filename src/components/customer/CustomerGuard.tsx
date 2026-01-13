import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'

type CustomerGuardProps = {
  children: React.ReactNode
}

export function CustomerGuard({ children }: CustomerGuardProps) {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session || profile?.role !== 'customer') {
      navigate({
        to: '/auth/sign-in',
        search: { redirect: '/account/profile' },
        replace: true,
      })
    }
  }, [session, profile?.role, loading, navigate])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session || profile?.role !== 'customer') {
    return null
  }

  return <>{children}</>
}
