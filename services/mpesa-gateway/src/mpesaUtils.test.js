import { describe, expect, it, vi } from 'vitest'
import {
  normalizeMsisdn,
  normalizeReference,
  normalizeStatus,
  verifyGatewayRequest,
} from './mpesaUtils.js'

describe('mpesaUtils', () => {
  it('normalizes payment statuses from mixed payload formats', () => {
    expect(normalizeStatus({ status: 'success' })).toBe('paid')
    expect(normalizeStatus({ resultCode: 0 })).toBe('paid')
    expect(normalizeStatus({ input_ResultCode: 'failed' })).toBe('failed')
    expect(normalizeStatus({ paymentStatus: 'pending_review' })).toBe('pending')
    expect(normalizeStatus({})).toBe('unknown')
  })

  it('normalizes msisdn and references for m-pesa payloads', () => {
    expect(normalizeMsisdn('+258 84 123 4567')).toBe('258841234567')
    expect(normalizeMsisdn('0841234567')).toBe('258841234567')
    expect(normalizeReference('ord-123/abc xyz')).toBe('ORD123ABCXYZ')
  })

  it('passes the expected signature payload to the verifier', () => {
    const verifySignature = vi.fn(() => ({ ok: true }))
    const req = {
      body: { amount: 42 },
      header: vi.fn((name) => (name === 'x-gateway-timestamp' ? 'ts' : 'sig')),
    }

    const result = verifyGatewayRequest({ req, secret: 'secret', verifySignature })

    expect(result).toEqual({ ok: true })
    expect(verifySignature).toHaveBeenCalledWith({
      secret: 'secret',
      timestamp: 'ts',
      signature: 'sig',
      body: JSON.stringify({ amount: 42 }),
    })
  })
})
