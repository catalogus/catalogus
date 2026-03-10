export const normalizeStatus = (payload = {}) => {
  const raw =
    payload.status ??
    payload.paymentStatus ??
    payload.resultCode ??
    payload.result_code ??
    payload.input_ResultCode

  if (raw === undefined || raw === null) return 'unknown'
  if (typeof raw === 'number') return raw === 0 ? 'paid' : 'failed'

  const value = String(raw).toLowerCase()
  if (value === '0') return 'paid'
  if (['0', 'success', 'paid', 'complete', 'completed'].includes(value)) return 'paid'
  if (['failed', 'cancelled', 'canceled', 'error'].includes(value)) return 'failed'
  return 'pending'
}

export const normalizeMsisdn = (value) => {
  if (!value) return ''
  let digits = String(value).replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1)
  if (digits.length === 9 && digits.startsWith('8')) return `258${digits}`
  return digits
}

export const normalizeReference = (value) => {
  if (!value) return ''
  return String(value).replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, 20)
}

export const verifyGatewayRequest = ({ req, secret, verifySignature }) => {
  const rawBody = JSON.stringify(req.body ?? {})
  return verifySignature({
    secret,
    timestamp: req.header('x-gateway-timestamp'),
    signature: req.header('x-gateway-signature'),
    body: rawBody,
  })
}
