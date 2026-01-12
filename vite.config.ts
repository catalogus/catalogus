import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
  server: {
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split admin routes into separate chunk
          admin: [
            './src/routes/admin/dashboard',
            './src/routes/admin/orders',
            './src/routes/admin/books',
            './src/routes/admin/authors',
            './src/routes/admin/posts',
            './src/routes/admin/users',
            './src/routes/admin/hero-slides',
            './src/routes/admin/author-claims',
            './src/components/admin/layout',
          ],
          // Split heavy UI libraries
          'ui-components': [
            './src/components/ui/sheet',
            './src/components/ui/dialog',
            './src/components/ui/dropdown-menu',
            './src/components/ui/button',
          ],
        },
      },
    },
  },
})

export default config
