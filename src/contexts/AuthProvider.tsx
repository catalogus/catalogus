import { createContext, useContext, useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { UserRole } from '../types/admin'

type Profile = {
  id: string
  role: UserRole
  status?: string | null
  name?: string | null
  phone?: string | null
}

type AuthContextValue = {
  supabase: typeof supabase
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: Error | null }>
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error?: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const ensureProfile = async (userId: string, name?: string) => {
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (existing) return null

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name: name ?? 'Catalogus User',
      role: 'customer',
    })

    return error ? new Error(error.message) : null
  }

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, status, name, phone')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return (data as Profile) ?? null
  }

  const sessionQuery = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session ?? null
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    networkMode: 'always',
  })

  const profileQuery = useQuery({
    queryKey: ['profile', sessionQuery.data?.user?.id],
    queryFn: () => fetchProfile(sessionQuery.data!.user!.id),
    enabled: !!sessionQuery.data?.user?.id,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    networkMode: 'always',
  })

  const loading =
    sessionQuery.status === 'pending' ||
    (!!sessionQuery.data && profileQuery.isFetching)

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        queryClient.setQueryData(['auth', 'session'], nextSession)
        if (nextSession?.user?.id) {
          await queryClient.invalidateQueries({
            queryKey: ['profile', nextSession.user.id],
          })
        } else {
          queryClient.removeQueries({ queryKey: ['profile'] })
        }
      },
    )

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [queryClient])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && data.session?.user?.id) {
      const profileError = await ensureProfile(
        data.session.user.id,
        (data.session.user.user_metadata as { name?: string } | null)?.name ??
          email,
      )
      if (profileError) return { error: profileError }
      queryClient.setQueryData(['auth', 'session'], data.session)
      await queryClient.invalidateQueries({
        queryKey: ['profile', data.session.user.id],
      })
    }
    return { error }
  }

  const signUp = async (email: string, password: string, name?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    // If session exists (no email confirmation required), upsert profile as customer
    if (!error && data.session?.user?.id) {
      const profileError = await ensureProfile(
        data.session.user.id,
        name ?? email,
      )
      if (profileError) return { error: profileError }
      queryClient.setQueryData(['auth', 'session'], data.session)
      await queryClient.invalidateQueries({
        queryKey: ['profile', data.session.user.id],
      })
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    queryClient.setQueryData(['auth', 'session'], null)
    queryClient.removeQueries({ queryKey: ['profile'] })
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      session: sessionQuery.data ?? null,
      profile: profileQuery.data ?? null,
      loading,
      signIn,
      signUp,
      signOut,
    }),
    [sessionQuery.data, profileQuery.data, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
