import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined)
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined)

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables for public client', {
    supabaseUrl: supabaseUrl ? 'present' : 'missing',
    supabaseAnonKey: supabaseAnonKey ? 'present' : 'missing',
  })
}

export const publicSupabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)
