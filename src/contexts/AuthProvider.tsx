import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

type Profile = {
  id: string
  role: 'admin' | 'author' | 'customer'
  status: 'unclaimed' | 'pending' | 'approved' | 'rejected' | null
  name: string
  email: string | null
  photo_url: string | null
  photo_path: string | null
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProfile = async (nextUser: User | null) => {
      if (!nextUser?.id) {
        if (mounted) setProfile(null)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, status, name, email, photo_url, photo_path')
        .eq('id', nextUser.id)
        .maybeSingle()

      if (error) {
        if (mounted) setProfile(null)
        return
      }

      if (mounted) setProfile((data ?? null) as Profile | null)
    }

    const init = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      await fetchProfile(initialSession?.user ?? null)
      if (mounted) setLoading(false)
    }

    void init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      const nextUser = nextSession?.user ?? null
      setUser(nextUser)
      void fetchProfile(nextUser)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
