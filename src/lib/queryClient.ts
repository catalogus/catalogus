import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isAbortError, isAuthError } from './queryErrors'
import { supabase } from './supabaseClient'

let authRecoveryInFlight = false

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error) => {
        if (isAbortError(error) || isAuthError(error)) return false
        return failureCount < 2
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      networkMode: 'online',
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isAbortError(error) || isAuthError(error)) return false
        return failureCount < 1
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!isAuthError(error) || authRecoveryInFlight) return
      authRecoveryInFlight = true
      console.warn('Auth error in query; resetting auth session', {
        queryKey: query.queryKey,
      })
      void supabase.auth.signOut().finally(() => {
        queryClient.setQueryData(['auth', 'session'], null)
        queryClient.removeQueries({ queryKey: ['profile'] })
        authRecoveryInFlight = false
      })
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!isAuthError(error) || authRecoveryInFlight) return
      authRecoveryInFlight = true
      console.warn('Auth error in mutation; resetting auth session', {
        mutationKey: mutation.options.mutationKey,
      })
      void supabase.auth.signOut().finally(() => {
        queryClient.setQueryData(['auth', 'session'], null)
        queryClient.removeQueries({ queryKey: ['profile'] })
        authRecoveryInFlight = false
      })
    },
  }),
})
