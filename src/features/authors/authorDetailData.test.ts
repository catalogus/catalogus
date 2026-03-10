import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/publicProfiles', () => ({
  fetchPublicProfileById: vi.fn(),
}))

vi.mock('@/lib/supabasePublic', () => ({
  publicSupabase: {
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/file' } })),
      })),
    },
  },
}))

import { buildEmbedUrl, formatDate, isUuid } from './authorDetailData'

describe('authorDetailData', () => {
  it('builds youtube embed urls from short and watch links', () => {
    expect(buildEmbedUrl('https://youtu.be/abc123')).toBe('https://www.youtube.com/embed/abc123')
    expect(buildEmbedUrl('https://www.youtube.com/watch?v=abc123')).toBe('https://www.youtube.com/embed/abc123')
  })

  it('extracts iframe sources and converts vimeo urls', () => {
    expect(buildEmbedUrl('<iframe src="https://player.vimeo.com/video/12345"></iframe>')).toBe(
      'https://player.vimeo.com/video/12345',
    )
    expect(buildEmbedUrl('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345')
  })

  it('returns null for invalid embed input', () => {
    expect(buildEmbedUrl('<div>bad</div>')).toBe(null)
    expect(buildEmbedUrl('not-a-url')).toBe(null)
  })

  it('formats dates and validates uuids', () => {
    expect(formatDate('2024-03-02', 'en-US')).toContain('2024')
    expect(formatDate('bad-date', 'en-US')).toBe(null)
    expect(isUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(isUuid('not-a-uuid')).toBe(false)
  })
})
