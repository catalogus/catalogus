import { createFileRoute } from '@tanstack/react-router'
import { publicSupabase } from '../lib/supabasePublic'
import { getSiteUrl, normalizePath } from '../lib/seo'

type SitemapEntry = {
  loc: string
  lastmod?: string
}

const buildLoc = (path: string, siteUrl: string) => {
  const normalized = normalizePath(path)
  return normalized === '/' ? siteUrl : `${siteUrl}${normalized}`
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const toLastMod = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

const buildXml = (entries: SitemapEntry[]) => {
  const urls = entries
    .map((entry) => {
      const lastmodTag = entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>` : ''
      return `<url><loc>${escapeXml(entry.loc)}</loc>${lastmodTag}</url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = getSiteUrl()

        const staticPaths = [
          '/',
          '/loja',
          '/autores',
          '/noticias',
          '/sobre',
          '/contactos',
          '/projectos',
          '/producao',
          '/publicacoes',
        ]

        const [booksRes, authorsRes, postsRes, publicationsRes] = await Promise.all([
          publicSupabase
            .from('books')
            .select('slug, updated_at')
            .eq('is_active', true),
          publicSupabase.from('authors').select('id, wp_slug, updated_at'),
          publicSupabase
            .from('posts')
            .select('slug, updated_at, published_at')
            .eq('status', 'published')
            .eq('language', 'pt'),
          publicSupabase
            .from('publications')
            .select('slug, updated_at, publish_date')
            .eq('is_active', true),
        ])

        const entries: SitemapEntry[] = []

        staticPaths.forEach((path) => {
          entries.push({ loc: buildLoc(path, siteUrl) })
        })

        if (!booksRes.error) {
          booksRes.data?.forEach((book) => {
            if (!book.slug) return
            entries.push({
              loc: buildLoc(`/livro/${encodeURIComponent(book.slug)}`, siteUrl),
              lastmod: toLastMod(book.updated_at) ?? undefined,
            })
          })
        }

        if (!authorsRes.error) {
          authorsRes.data?.forEach((author) => {
            const slug = author.wp_slug ?? author.id
            if (!slug) return
            entries.push({
              loc: buildLoc(`/autor/${encodeURIComponent(slug)}`, siteUrl),
              lastmod: toLastMod(author.updated_at) ?? undefined,
            })
          })
        }

        if (!postsRes.error) {
          postsRes.data?.forEach((post) => {
            if (!post.slug) return
            entries.push({
              loc: buildLoc(`/noticias/${encodeURIComponent(post.slug)}`, siteUrl),
              lastmod:
                toLastMod(post.updated_at) ??
                toLastMod(post.published_at) ??
                undefined,
            })
          })
        }

        if (!publicationsRes.error) {
          publicationsRes.data?.forEach((publication) => {
            if (!publication.slug) return
            entries.push({
              loc: buildLoc(`/publicacoes/${encodeURIComponent(publication.slug)}`, siteUrl),
              lastmod:
                toLastMod(publication.updated_at) ??
                toLastMod(publication.publish_date) ??
                undefined,
            })
          })
        }

        const xml = buildXml(entries)
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
          },
        })
      },
    },
  },
})
