import { createClient } from '@supabase/supabase-js'

// Support both Vite (VITE_ prefix) and Nitro/runtime (no prefix) environments
// In browser: use import.meta.env
// In server (SSR): use process.env
const getEnvVar = (name: string) => {
  if (typeof import.meta.env[name] !== 'undefined') {
    return import.meta.env[name]
  }
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name]
  }
  return undefined
}

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL')

const supabaseAnonKey =
  getEnvVar('VITE_SUPABASE_ANON_KEY') ||
  getEnvVar('SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
    {
      supabaseUrl: supabaseUrl ? 'present' : 'missing',
      supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
      isServer: typeof window === 'undefined'
    }
  )
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
