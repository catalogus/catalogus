// Temporary debug helper - remove after fixing
export function debugSupabaseConfig() {
  const isServer = typeof window === 'undefined'

  const config = {
    isServer,
    hasWindow: typeof window !== 'undefined',
    importMetaEnvUrl: import.meta.env.VITE_SUPABASE_URL,
    importMetaEnvKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }

  if (!isServer) {
    // Only log in browser
    console.log('🔍 Supabase Config Debug:', {
      ...config,
      urlLength: config.importMetaEnvUrl?.length ?? 0,
      keyLength: config.importMetaEnvKey?.length ?? 0,
      urlStartsWith: config.importMetaEnvUrl?.substring(0, 20),
    })
  }

  return config
}
