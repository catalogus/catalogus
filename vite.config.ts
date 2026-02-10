import { defineConfig, type PluginOption } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const plugins: PluginOption[] = [
    isDev ? devtools() : null,
    nitro(),
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ]

  return {
    plugins: plugins.filter(Boolean) as PluginOption[],
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
          manualChunks(id) {
            // Let Vite handle chunking automatically, but provide hints
            if (id.includes('node_modules')) {
              // Split vendor code by package
              if (id.includes('@tanstack')) {
                return 'tanstack'
              }
              if (id.includes('@radix-ui')) {
                return 'radix'
              }
              if (id.includes('@supabase')) {
                return 'supabase'
              }
            }
            // Let Vite automatically handle application code chunking
          },
        },
      },
    },
  }
})
