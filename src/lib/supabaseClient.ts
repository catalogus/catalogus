import { createClient } from '@supabase/supabase-js'

// Environment variables for Vite SSR:
// - Client-side: VITE_* variables are replaced at build time by Vite
// - Server-side: Can access both import.meta.env and process.env at runtime
const isServer = typeof window === 'undefined'

// For client-side (browser), these are statically replaced by Vite at build time
const supabaseUrl = isServer
  ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)
  : import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = isServer
  ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)
  : import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables', {
    supabaseUrl: supabaseUrl ? 'present' : 'missing',
    supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
    isServer,
  })
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)
