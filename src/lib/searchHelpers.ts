export const normalizeSearchTerm = (value?: string | null) => {
  return (value ?? '').trim().replace(/\s+/g, ' ')
}

export const buildSearchOrFilter = (fields: string[], term: string) => {
  const sanitizedTerm = term.replace(/[,%()]/g, ' ').trim()
  return fields.map((field) => `${field}.ilike.%${sanitizedTerm}%`).join(',')
}

export const buildTokenSearchOrFilter = (field: string, term: string) => {
  const tokens = normalizeSearchTerm(term)
    .split(' ')
    .map((token) => token.replace(/[,%()]/g, '').trim())
    .filter((token) => token.length > 0)

  if (tokens.length === 0) return null
  return tokens.map((token) => `${field}.ilike.%${token}%`).join(',')
}
