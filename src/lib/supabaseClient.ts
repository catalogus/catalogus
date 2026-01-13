import { createClient } from '@supabase/supabase-js'
import { debugSupabaseConfig } from './debug-supabase'

// Environment variables for Vite SSR:
// - Client-side: VITE_* variables are replaced at build time by Vite
// - Server-side: Can access both import.meta.env and process.env at runtime
const isServer = typeof window === 'undefined'

// Debug: Log config (only in browser)
debugSupabaseConfig()

// For client-side (browser), these are statically replaced by Vite at build time
const supabaseUrl = isServer
  ? (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL)
  : import.meta.env.VITE_SUPABASE_URL

const supabaseAnonKey = isServer
  ? (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY)
  : import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = 'Missing Supabase environment variables'
  const errorDetails = {
    supabaseUrl: supabaseUrl ? 'present' : 'missing',
    supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
    isServer,
    hint: isServer
      ? 'Set VITE_SUPABASE_URL/SUPABASE_URL and VITE_SUPABASE_ANON_KEY/SUPABASE_ANON_KEY in your environment'
      : 'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set during build time'
  }
  console.error(errorMsg, errorDetails)

  if (!isServer) {
    // Show visible error in browser
    alert(`⚠️ Configuration Error: ${errorMsg}\n\nCheck console for details.`)
  }
}

// Ensure we never use placeholder values - throw error instead
if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  throw new Error('Invalid Supabase URL configuration. Check your environment variables.')
}
if (!supabaseAnonKey || supabaseAnonKey.includes('placeholder')) {
  throw new Error('Invalid Supabase anon key configuration. Check your environment variables.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

// Log successful initialization (only in browser during development)
if (!isServer && import.meta.env.DEV) {
  console.log('✅ Supabase client initialized successfully')
}
