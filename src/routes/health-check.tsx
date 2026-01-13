import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '../lib/supabaseClient'
import { useState } from 'react'

export const Route = createFileRoute('/health-check')({
  component: HealthCheck,
})

function HealthCheck() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const checkConnection = async () => {
    setStatus('checking')
    try {
      // Try to get session (should work even without authentication)
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('error')
        setResult({ error: error.message })
      } else {
        setStatus('success')
        setResult({
          success: true,
          hasSession: !!data.session,
          message: 'Supabase connection working!'
        })
      }
    } catch (err: any) {
      setStatus('error')
      setResult({ error: err.message || String(err) })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-4">Supabase Health Check</h1>

        <div className="mb-4">
          <h2 className="font-semibold mb-2">Environment Info:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify({
              hasWindow: typeof window !== 'undefined',
              url: import.meta.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
              keyLength: import.meta.env.VITE_SUPABASE_ANON_KEY?.length,
              isDev: import.meta.env.DEV,
              mode: import.meta.env.MODE,
            }, null, 2)}
          </pre>
        </div>

        <button
          onClick={checkConnection}
          disabled={status === 'checking'}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 mb-4"
        >
          {status === 'checking' ? 'Checking...' : 'Test Supabase Connection'}
        </button>

        {result && (
          <div className={`p-4 rounded ${status === 'error' ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
