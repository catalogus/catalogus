import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/csp-report')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json()
          console.warn('CSP report received', body)
        } catch (error) {
          console.warn('CSP report parse failed', error)
        }
        return new Response(null, { status: 204 })
      },
    },
  },
})
