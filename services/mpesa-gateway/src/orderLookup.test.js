import { describe, expect, it, vi } from 'vitest'

vi.mock('./supabase.js', () => ({
  supabase: {},
}))

import { buildOrderNumberVariants, extractOrderLookup, isUuid } from './orderLookup.js'

describe('orderLookup', () => {
  it('detects valid uuids and ignores invalid values', () => {
    expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isUuid('ORD-123')).toBe(false)
    expect(isUuid(null)).toBe(false)
  })

  it('prefers uuid order ids over string references', () => {
    expect(
      extractOrderLookup({
        orderNumber: 'ORD-22',
        orderId: '123e4567-e89b-12d3-a456-426614174000',
      }),
    ).toEqual({ orderId: '123e4567-e89b-12d3-a456-426614174000' })
  })

  it('falls back to order numbers and expands ORD variants', () => {
    expect(extractOrderLookup({ reference: 'ord22' })).toEqual({ orderNumber: 'ord22' })
    expect(buildOrderNumberVariants('ord22')).toEqual(['ORD22', 'ORD-22'])
    expect(buildOrderNumberVariants('ORD-22')).toEqual(['ORD-22'])
  })
})
