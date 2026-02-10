import sanitizeHtml from 'sanitize-html'

const allowedTags = Array.from(
  new Set([
    ...sanitizeHtml.defaults.allowedTags,
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'span',
    'div',
    'figure',
    'figcaption',
    'pre',
    'code',
  ]),
)

const allowedAttributes: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'name', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
  '*': ['style'],
}

const allowedSchemes = ['http', 'https', 'mailto', 'tel']

const allowedStyles: sanitizeHtml.IOptions['allowedStyles'] = {
  '*': {
    'text-align': [/^left$/, /^right$/, /^center$/, /^justify$/],
  },
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags,
  allowedAttributes,
  allowedSchemes,
  allowedStyles,
  enforceHtmlBoundary: true,
  transformTags: {
    a: (tagName, attribs) => {
      const next = { ...attribs }
      if (next.target === '_blank') {
        next.rel = next.rel ? `${next.rel} noopener noreferrer` : 'noopener noreferrer'
      }
      return { tagName, attribs: next }
    },
  },
}

export const sanitizeRichText = (value?: string | null) => {
  if (!value) return ''
  return sanitizeHtml(value, sanitizeOptions)
}
