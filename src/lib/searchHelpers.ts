export const normalizeSearchTerm = (value?: string | null) => {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

export const sanitizeSearchToken = (value: string) => {
  return value.replace(/[,%()"'`.:;!?\[\]{}]/g, '').trim()
}

export const buildSearchKeywords = (term: string) => {
  const stopwords = new Set(['e', 'ou', 'and', 'or'])
  return normalizeSearchTerm(term)
    .split(' ')
    .map(sanitizeSearchToken)
    .filter((token) => token.length >= 2 && !stopwords.has(token.toLocaleLowerCase()))
}

export const buildSearchOrFilter = (fields: string[], term: string) => {
  const sanitizedTerm = term.replace(/[,%()]/g, ' ').trim()
  return fields.map((field) => `${field}.ilike.%${sanitizedTerm}%`).join(',')
}

export const buildTokenSearchOrFilter = (field: string, term: string) => {
  const tokens = buildSearchKeywords(term)

  if (tokens.length === 0) return null
  return tokens.map((token) => `${field}.ilike.%${token}%`).join(',')
}
