export const normalizeSearchTerm = (value?: string | null) => {
  return (value ?? '').trim()
}

export const buildSearchOrFilter = (fields: string[], term: string) => {
  return fields.map((field) => `${field}.ilike.%${term}%`).join(',')
}
