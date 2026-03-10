import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/publicProfiles', () => ({
  fetchPublicProfileById: vi.fn(),
}))

vi.mock('@/lib/supabasePublic', () => ({
  publicSupabase: {},
}))

import { buildExcerpt, formatPostDate, getCategoryBadgeClass } from './newsPostData'

describe('newsPostData', () => {
  it('builds a clean excerpt from html content', () => {
    expect(buildExcerpt('<p>Hello <strong>world</strong></p>')).toBe('Hello world')
  })

  it('truncates long content to 220 characters plus ellipsis', () => {
    const text = `<p>${'a'.repeat(260)}</p>`
    expect(buildExcerpt(text)).toHaveLength(223)
    expect(buildExcerpt(text).endsWith('...')).toBe(true)
  })

  it('normalizes accented category names to badge classes', () => {
    expect(getCategoryBadgeClass('Lançamentos')).toBe('bg-[#ffc6ff] text-black')
    expect(getCategoryBadgeClass('Categoria desconhecida')).toBe('bg-[#c6f36d] text-black')
  })

  it('formats valid dates and rejects invalid ones', () => {
    expect(formatPostDate('2024-03-02T00:00:00Z', 'en-US')).toContain('2024')
    expect(formatPostDate('not-a-date', 'en-US')).toBe('')
  })
})
