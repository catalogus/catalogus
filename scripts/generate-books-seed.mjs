import fs from 'fs'
import path from 'path'

const inputPath = path.resolve(process.cwd(), 'public/boooks/books.json')
const outputPath = path.resolve(process.cwd(), 'supabase/seed_books.sql')

const raw = fs.readFileSync(inputPath, 'utf8')
const data = JSON.parse(raw)
const books = Array.isArray(data.books) ? data.books : []

const slugify = (title) =>
  title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const usedSlugs = new Set()
const uniqueSlug = (base) => {
  let slug = base
  let counter = 2
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter}`
    counter += 1
  }
  usedSlugs.add(slug)
  return slug
}

const escapeSql = (value) => String(value).replace(/'/g, "''")

const authorOrder = new Map()
const records = books.map((book) => {
  const title = book.title?.trim() ?? ''
  const baseSlug = slugify(title)
  const slug = uniqueSlug(baseSlug)
  const note = (book.note ?? '').toLowerCase()
  const isAvailable = note.includes('dispon')
  const stock = isAvailable ? 500 : 0
  const price = Number.isFinite(book.price_mzn) ? book.price_mzn : 0
  const authors = String(book.author ?? '')
    .split(' & ')
    .map((name) => name.trim())
    .filter(Boolean)

  for (const name of authors) {
    if (!authorOrder.has(name)) authorOrder.set(name, true)
  }

  return {
    title,
    slug,
    price,
    stock,
    authors,
  }
})

const authors = [...authorOrder.keys()]

const lines = []
lines.push('-- Generated from public/boooks/books.json')
lines.push('begin;')
lines.push('')

if (authors.length > 0) {
  lines.push('with new_authors(name) as (')
  lines.push(
    '  values\n' +
      authors
        .map((name) => `    ('${escapeSql(name)}')`)
        .join(',\n'),
  )
  lines.push(')')
  lines.push('insert into public.authors (name)')
  lines.push('select name')
  lines.push('from new_authors')
  lines.push('where not exists (')
  lines.push('  select 1 from public.authors a where a.name = new_authors.name')
  lines.push(');')
  lines.push('')
}

if (records.length > 0) {
  lines.push(
    'insert into public.books (title, slug, price_mzn, stock, language, is_active)',
  )
  lines.push('values')
  lines.push(
    records
      .map((book) => {
        const title = escapeSql(book.title)
        const slug = escapeSql(book.slug)
        return `  ('${title}', '${slug}', ${book.price}, ${book.stock}, 'pt', true)`
      })
      .join(',\n'),
  )
  lines.push('on conflict (slug) do update')
  lines.push('set title = excluded.title,')
  lines.push('    price_mzn = excluded.price_mzn,')
  lines.push('    stock = excluded.stock,')
  lines.push('    language = excluded.language,')
  lines.push('    is_active = excluded.is_active;')
  lines.push('')
}

for (const book of records) {
  for (const author of book.authors) {
    lines.push('insert into public.authors_books (author_id, book_id)')
    lines.push('select a.id, b.id')
    lines.push('from public.authors a')
    lines.push('join public.books b on b.slug = \'%s\''
      .replace('%s', escapeSql(book.slug)))
    lines.push('where a.name = \'%s\''
      .replace('%s', escapeSql(author)))
    lines.push('on conflict do nothing;')
    lines.push('')
  }
}

lines.push('commit;')
lines.push('')

fs.writeFileSync(outputPath, lines.join('\n'))
console.log(`Wrote ${outputPath}`)
