// Shared helper functions for news/posts components
// Used by: NewsSection, noticias/$slug, noticias/index

export const formatPostDate = (value: string | null, locale = 'pt-PT') => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export const stripHtml = (value?: string | null) => {
  if (!value) return ''
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

export const buildExcerpt = (value?: string | null) => {
  const text = stripHtml(value)
  if (!text) return ''
  if (text.length <= 220) return text
  return `${text.slice(0, 220).trim()}...`
}

export const normalizeCategoryKey = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const categoryDisplayLabels: Record<string, { pt: string; en: string }> = {
  noticias: { pt: 'Noticias', en: 'News' },
  eventos: { pt: 'Eventos', en: 'Events' },
  cultura: { pt: 'Cultura', en: 'Culture' },
  literatura: { pt: 'Literatura', en: 'Literature' },
  opiniao: { pt: 'Opinião', en: 'Opinion' },
  entrevistas: { pt: 'Entrevistas', en: 'Interviews' },
  lancamentos: { pt: 'Lançamentos', en: 'Releases' },
}

const categoryBadgeClasses: Record<string, string> = {
  noticias: 'bg-[#c6f36d] text-black',
  eventos: 'bg-[#ffd166] text-black',
  cultura: 'bg-[#5de2ff] text-black',
  literatura: 'bg-[#ff8fab] text-black',
  opiniao: 'bg-[#bdb2ff] text-black',
  entrevistas: 'bg-[#a6ff8f] text-black',
  lancamentos: 'bg-[#ffc6ff] text-black',
}

export const getCategoryBadgeClass = (value: string) => {
  const key = normalizeCategoryKey(value)
  return categoryBadgeClasses[key] ?? 'bg-[#c6f36d] text-black'
}

export const getCategoryDisplayLabel = ({
  name,
  nameEn,
  slug,
  slugEn,
  isEnglish,
}: {
  name?: string | null
  nameEn?: string | null
  slug?: string | null
  slugEn?: string | null
  isEnglish?: boolean
}) => {
  const fallback = isEnglish ? nameEn ?? name : name
  const keySource = isEnglish ? slugEn ?? slug ?? nameEn ?? name : slug ?? name
  if (!keySource) return fallback ?? null

  const display = categoryDisplayLabels[normalizeCategoryKey(keySource)]
  return isEnglish ? display?.en ?? fallback ?? null : display?.pt ?? fallback ?? null
}
