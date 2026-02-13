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
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isAbortError(error) || isAuthError(error)) return false
        return failureCount < 1
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
  queryCache: new QueryCache({
    onError: async (error, query) => {
      if (!isAuthError(error) || authRecoveryInFlight) return
      authRecoveryInFlight = true

      try {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          throw refreshError
        }
        // Refresh successful, retry the query
        await queryClient.invalidateQueries({ queryKey: query.queryKey })
      } catch (err) {
        console.warn('Auth error recovery failed; signing out', {
          originalError: error,
          refreshError: err,
        })
        await supabase.auth.signOut()
        queryClient.setQueryData(['auth', 'session'], null)
        queryClient.removeQueries({ queryKey: ['profile'] })
      } finally {
        authRecoveryInFlight = false
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: async (error, _variables, _context, mutation) => {
      if (!isAuthError(error) || authRecoveryInFlight) return
      authRecoveryInFlight = true

      try {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          throw refreshError
        }
        // Refresh successful - mutations are harder to retry automatically,
        // but at least we saved the session for the next attempt.
      } catch (err) {
        console.warn('Auth error in mutation; recovery failed', {
          originalError: error,
          refreshError: err,
          mutationKey: mutation.options.mutationKey,
        })
        await supabase.auth.signOut()
        queryClient.setQueryData(['auth', 'session'], null)
        queryClient.removeQueries({ queryKey: ['profile'] })
      } finally {
        authRecoveryInFlight = false
      }
    },
  }),
})
