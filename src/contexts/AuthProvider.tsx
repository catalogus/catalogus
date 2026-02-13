import { createContext, useContext, useEffect, useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import type { UserRole } from '../types/admin'
import type { SocialLinks, PublishedWork, GalleryImage } from '../types/author'

type Profile = {
  id: string
  role: UserRole
  status?: string | null
  name?: string | null
  email?: string | null
  phone?: string | null
  bio?: string | null
  photo_url?: string | null
  photo_path?: string | null
  social_links?: SocialLinks | null
  birth_date?: string | null
  residence_city?: string | null
  province?: string | null
  published_works?: PublishedWork[] | null
  author_gallery?: GalleryImage[] | null
  featured_video?: string | null
  author_type?: string | null
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
  signUpAuthor: (
    email: string,
    password: string,
    name: string,
    phone: string,
    bio?: string,
    photoFile?: File | null,
  ) => Promise<{ error?: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const ensureProfile = async (userId: string, name?: string, email?: string) => {
    const normalizedEmail = email?.toLowerCase().trim()
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle()

    if (existingError) return new Error(existingError.message)

    if (existing) {
      if (!existing.email && normalizedEmail) {
        const { error } = await supabase
          .from('profiles')
          .update({ email: normalizedEmail })
          .eq('id', userId)
        return error ? new Error(error.message) : null
      }
      return null
    }

    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name: name ?? 'Catalogus User',
      role: 'customer',
      email: normalizedEmail ?? null,
    })

    return error ? new Error(error.message) : null
  }

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role, status, name, email, phone, bio, photo_url, photo_path, social_links, birth_date, residence_city, province, published_works, author_gallery, featured_video, author_type')
      .eq('id', userId)
      .maybeSingle()

    if (error) throw error
    return (data as Profile) ?? null
  }

  const sessionQuery = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Session fetch error:', error)
          throw error
        }
        return data.session ?? null
      } catch (err) {
        console.error('Session query failed:', err)
        throw err
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  const profileQuery = useQuery({
    queryKey: ['profile', sessionQuery.data?.user?.id],
    queryFn: async () => {
      try {
        return await fetchProfile(sessionQuery.data!.user!.id)
      } catch (err) {
        console.error('Profile fetch error:', err)
        return null
      }
    },
    enabled: !!sessionQuery.data?.user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const loading =
    sessionQuery.status === 'pending' ||
    (!!sessionQuery.data?.user?.id && profileQuery.status === 'pending')

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

  // Invalidate active queries when the tab becomes visible again so data is fresh.
  // Token refresh itself is handled automatically by Supabase (autoRefreshToken: true).
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries({ refetchType: 'active' })
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [queryClient])

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (!error && data.session?.user?.id) {
      const profileError = await ensureProfile(
        data.session.user.id,
        (data.session.user.user_metadata as { name?: string } | null)?.name ??
          email,
        email,
      )
      if (profileError) return { error: profileError }
      queryClient.setQueryData(['auth', 'session'], data.session)
      await queryClient.invalidateQueries({
        queryKey: ['profile', data.session.user.id],
      })
    }
    return { error }
  }, [queryClient])

  const signUp = useCallback(async (email: string, password: string, name?: string) => {
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
        email,
      )
      if (profileError) return { error: profileError }
      queryClient.setQueryData(['auth', 'session'], data.session)
      await queryClient.invalidateQueries({
        queryKey: ['profile', data.session.user.id],
      })
    }

    return { error }
  }, [queryClient])

  const signUpAuthor = useCallback(async (
    email: string,
    password: string,
    name: string,
    phone: string,
    bio?: string,
    photoFile?: File | null,
  ) => {
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone, bio },
        },
      })

      if (error) return { error }

      if (data.user) {
        // Upload photo if provided
        let photo_path = null
        let photo_url = null
        if (photoFile) {
          // Path should NOT include bucket name - bucket is specified in .from()
          const path = `${data.user.id}/${Date.now()}-${photoFile.name}`
          const { error: uploadError } = await supabase.storage
            .from('author-photos')
            .upload(path, photoFile, { upsert: true })

          if (!uploadError) {
            photo_path = path
            const { data: urlData } = supabase.storage
              .from('author-photos')
              .getPublicUrl(path)
            photo_url = urlData.publicUrl
          }
        }

        // Create/update profile with role='author', status='pending'
        // Check if profile was auto-created
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', data.user.id)
          .single()

        let profileError
        if (existingProfile) {
          // Profile exists, update with author role
          const { error } = await supabase
            .from('profiles')
            .update({
              name,
              email: email.toLowerCase().trim(),
              phone,
              bio: bio || null,
              photo_url,
              photo_path,
              role: 'author',
              status: 'pending',
              social_links: {},
            })
            .eq('id', data.user.id)
          profileError = error
        } else {
          // Profile doesn't exist, create it
          const { error } = await supabase.from('profiles').insert({
            id: data.user.id,
            name,
            email: email.toLowerCase().trim(),
            phone,
            bio: bio || null,
            photo_url,
            photo_path,
            role: 'author',
            status: 'pending',
            social_links: {},
          })
          profileError = error
        }

        if (profileError) return { error: new Error(profileError.message) }

        // Update query cache if session exists
        if (data.session) {
          queryClient.setQueryData(['auth', 'session'], data.session)
          await queryClient.invalidateQueries({
            queryKey: ['profile', data.user.id],
          })
        }
      }

      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }, [queryClient])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    queryClient.setQueryData(['auth', 'session'], null)
    queryClient.removeQueries({ queryKey: ['profile'] })
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      supabase,
      session: sessionQuery.data ?? null,
      profile: profileQuery.data ?? null,
      loading,
      signIn,
      signUp,
      signUpAuthor,
      signOut,
    }),
    [sessionQuery.data, profileQuery.data, loading, signIn, signUp, signUpAuthor, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
