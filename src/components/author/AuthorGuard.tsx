import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from '../../contexts/AuthProvider'

type AuthorGuardProps = {
  children: React.ReactNode
}

export function AuthorGuard({ children }: AuthorGuardProps) {
  const { session, profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!session || profile?.role !== 'author') {
      navigate({
        to: '/author/sign-in',
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

  if (!session || profile?.role !== 'author') {
    return null
  }

  return <>{children}</>
}
