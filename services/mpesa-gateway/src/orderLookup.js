import { supabase } from './supabase.js'

export const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

export const extractOrderLookup = (payload = {}) => {
  const candidates = [
    payload.orderId,
    payload.order_id,
    payload.orderNumber,
    payload.order_number,
    payload.reference,
    payload.thirdPartyReference,
    payload.input_ThirdPartyReference,
    payload.input_OriginalConversationID,
    payload.transactionReference,
    payload.transactionId,
    payload.transaction_id,
    payload.input_TransactionID,
  ].filter(Boolean)

  const orderId = candidates.find((value) => isUuid(value))
  if (orderId) return { orderId }

  const orderNumber = candidates.find((value) => typeof value === 'string')
  if (orderNumber) return { orderNumber }

  return {}
}

export const buildOrderNumberVariants = (value) => {
  if (!value) return []
  const normalized = String(value).trim().toUpperCase()
  const variants = new Set([normalized])

  if (normalized.startsWith('ORD') && !normalized.startsWith('ORD-')) {
    variants.add(`ORD-${normalized.slice(3)}`)
  }

  return Array.from(variants)
}

export const resolveOrderId = async (payload) => {
  const { orderId, orderNumber } = extractOrderLookup(payload)
  if (orderId) return orderId

  if (orderNumber) {
    const variants = buildOrderNumberVariants(orderNumber)
    for (const variant of variants) {
      const { data } = await supabase.from('orders').select('id').eq('order_number', variant).maybeSingle()
      if (data?.id) return data.id
    }

    const { data: refData } = await supabase
      .from('orders')
      .select('id')
      .eq('mpesa_reference', orderNumber)
      .maybeSingle()
    if (refData?.id) return refData.id
  }

  if (payload.transactionId || payload.transaction_id) {
    const transactionId = payload.transactionId ?? payload.transaction_id
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('mpesa_transaction_id', transactionId)
      .maybeSingle()
    if (data?.id) return data.id
  }

  if (payload.reference) {
    const { data } = await supabase.from('orders').select('id').eq('mpesa_reference', payload.reference).maybeSingle()
    if (data?.id) return data.id
  }

  return null
}
