// Shared helper functions for shop/e-commerce components
// Used by: Shop listing, book detail, cart, checkout

/**
 * Format price in Mozambican Metical (MZN)
 * Example: 1500.50 => "1.500,50 MZN"
 */
export const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0,00 MZN'

  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Format compact price (without currency label)
 * Example: 1500.50 => "1.500,50"
 */
export const formatPriceCompact = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return '0,00'

  return new Intl.NumberFormat('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

/**
 * Validate email address
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Mozambican phone number
 * Accepts formats: +258 XX XXX XXXX, 258XXXXXXXXX, 8XXXXXXXX, etc.
 */
export const isValidMozambiquePhone = (phone: string): boolean => {
  // Remove all spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // Match patterns:
  // +258XXXXXXXXX (international with +)
  // 258XXXXXXXXX (international without +)
  // 8XXXXXXXX or 84XXXXXXX (local format)
  const phoneRegex = /^(\+?258)?[0-9]{9}$/

  return phoneRegex.test(cleaned)
}

/**
 * Format phone number for display
 * Example: "258841234567" => "+258 84 123 4567"
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-()]/g, '')

  // If starts with 258, add +
  if (cleaned.startsWith('258')) {
    const num = cleaned.slice(3)
    return `+258 ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`
  }

  // If starts with +258
  if (cleaned.startsWith('+258')) {
    const num = cleaned.slice(4)
    return `+258 ${num.slice(0, 2)} ${num.slice(2, 5)} ${num.slice(5)}`
  }

  // Local format (8X XXX XXXX)
  return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5)}`
}

/**
 * Check if book is in stock
 */
export const isInStock = (stock: number | null | undefined): boolean => {
  return (stock ?? 0) > 0
}

/**
 * Get stock status label
 */
export const getStockStatusLabel = (stock: number | null | undefined): string => {
  const stockValue = stock ?? 0

  if (stockValue === 0) return 'Esgotado'
  if (stockValue <= 5) return `Apenas ${stockValue} em stock`
  return 'Em stock'
}

/**
 * Get stock status color class
 */
export const getStockStatusColor = (stock: number | null | undefined): string => {
  const stockValue = stock ?? 0

  if (stockValue === 0) return 'text-red-600'
  if (stockValue <= 5) return 'text-orange-600'
  return 'text-green-600'
}

/**
 * Calculate max quantity allowed based on stock
 */
export const getMaxQuantity = (stock: number | null | undefined, limit = 10): number => {
  const stockValue = stock ?? 0
  return Math.min(stockValue, limit)
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string | null | undefined, maxLength: number): string => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

/**
 * Generate slug from title
 */
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
}

/**
 * Calculate cart total
 */
export const calculateCartTotal = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

/**
 * Format order number
 * Example: "ORD-20240115-ABC123"
 */
export const formatOrderNumber = (orderId: string, createdAt: string): string => {
  const date = new Date(createdAt)
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const shortId = orderId.slice(0, 6).toUpperCase()
  return `ORD-${dateStr}-${shortId}`
}

/**
 * Get order status badge color
 */
export const getOrderStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'paid':
    case 'processing':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
    case 'refunded':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get order status label in Portuguese
 */
export const getOrderStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending':
      return 'Pendente'
    case 'paid':
      return 'Pago'
    case 'processing':
      return 'Em processamento'
    case 'shipped':
      return 'Enviado'
    case 'delivered':
      return 'Entregue'
    case 'completed':
      return 'Concluído'
    case 'cancelled':
      return 'Cancelado'
    case 'refunded':
      return 'Reembolsado'
    default:
      return status
  }
}
