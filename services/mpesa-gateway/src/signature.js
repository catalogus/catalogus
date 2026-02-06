import crypto from 'node:crypto'

export function verifySignature({
  secret,
  timestamp,
  signature,
  body,
  toleranceMs = 5 * 60 * 1000,
}) {
  if (!secret || !timestamp || !signature) {
    return { ok: false, reason: 'Missing signature headers' }
  }

  const signedAt = Date.parse(timestamp)
  if (Number.isNaN(signedAt)) {
    return { ok: false, reason: 'Invalid timestamp' }
  }

  const now = Date.now()
  if (Math.abs(now - signedAt) > toleranceMs) {
    return { ok: false, reason: 'Timestamp outside allowed window' }
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  const ok = crypto.timingSafeEqual(
    Buffer.from(expected, 'utf8'),
    Buffer.from(signature, 'utf8'),
  )

  return ok ? { ok: true } : { ok: false, reason: 'Signature mismatch' }
}
