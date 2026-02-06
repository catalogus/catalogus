import { HeadContent, Scripts, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { I18nextProvider } from 'react-i18next'
import { Toaster } from 'sonner'

import { AuthProvider } from '../contexts/AuthProvider'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { CartProvider } from '../lib/useCart'
import { queryClient } from '../lib/queryClient'
import i18n from '../i18n'
import {
  SEO_DEFAULTS,
  buildOrganizationJsonLd,
  buildSeo,
  buildWebsiteJsonLd,
  shouldNoIndex,
} from '../lib/seo'

import appCss from '../styles.css?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: ({ location }) => {
    const pathname = location?.pathname ?? '/'
    const search = location?.search ?? ''
    const noindex = shouldNoIndex(pathname, search)
    const seo = buildSeo({
      title: SEO_DEFAULTS.title,
      description: SEO_DEFAULTS.description,
      image: SEO_DEFAULTS.image,
      noindex,
      canonical: null,
      jsonLd: [buildOrganizationJsonLd(), buildWebsiteJsonLd()],
    })

    return {
      meta: [
        { charSet: 'utf-8' },
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1',
        },
        {
          name: 'theme-color',
          content: '#c07238',
        },
        ...seo.meta,
      ],
      links: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
        },
        {
          rel: 'icon',
          href: '/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/logo192.png',
        },
        {
          rel: 'manifest',
          href: '/manifest.json',
        },
        {
          rel: 'stylesheet',
          href: appCss,
        },
      ],
      headScripts: seo.headScripts,
    }
  },

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {

  return (
    <html lang="pt">
      <head>
        <HeadContent />
      </head>
      <body>
        <ErrorBoundary>
          <I18nextProvider i18n={i18n}>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <CartProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                  <TanStackDevtools
                    config={{
                      position: 'bottom-left',
                    }}
                    plugins={[
                      {
                        name: 'Tanstack Router',
                        render: <TanStackRouterDevtoolsPanel />,
                      },
                    ]}
                  />
                </CartProvider>
              </AuthProvider>
            </QueryClientProvider>
          </I18nextProvider>
        </ErrorBoundary>
        <Scripts />
      </body>
    </html>
  )
}
