import { defineNitroConfig } from 'nitro/config'

export default defineNitroConfig({
  preset: 'vercel',
  runtimeConfig: {
    // Server-side environment variables
    supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    public: {
      // Client-side environment variables (will be exposed to the browser)
      supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    },
  },
})
