export const isAbortError = (error: unknown) => {
  if (!error) return false
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (error instanceof Error && error.name === 'AbortError') return true
  return false
}

export const isAuthError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false

  const err = error as {
    status?: number
    code?: string
    message?: string
    name?: string
    details?: string
    hint?: string
  }

  if (err.status === 401 || err.status === 403) return true

  const code = (err.code ?? '').toUpperCase()
  if (code === 'PGRST301' || code === 'PGRST302' || code === '401' || code === '403') {
    return true
  }

  const text = `${err.message ?? ''} ${err.details ?? ''} ${err.hint ?? ''}`.toLowerCase()
  return (
    text.includes('jwt') ||
    text.includes('token') ||
    text.includes('expired') ||
    text.includes('unauthorized') ||
    text.includes('forbidden') ||
    text.includes('not authenticated') ||
    text.includes('invalid refresh token')
  )
}
