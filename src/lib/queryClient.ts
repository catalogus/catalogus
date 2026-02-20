import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { isAbortError, isAuthError } from './queryErrors'

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
      networkMode: 'always',
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isAbortError(error) || isAuthError(error)) return false
        return failureCount < 1
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'always',
    },
  },
  queryCache: new QueryCache(),
  mutationCache: new MutationCache(),
})
