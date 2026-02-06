import express from 'express'
import { verifySignature } from './signature.js'
import { mpesaRequest } from './mpesa.js'
import { supabase } from './supabase.js'

const app = express()
app.use(express.json({ limit: '1mb' }))

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 8080,
  gatewaySecret: process.env.MPESA_GATEWAY_SECRET,
  mpesa: {
    baseUrl: process.env.MPESA_BASE_URL,
    statusBaseUrl: process.env.MPESA_STATUS_BASE_URL,
    reversalBaseUrl: process.env.MPESA_REVERSAL_BASE_URL,
    apiKey: process.env.MPESA_API_KEY,
    publicKey: process.env.MPESA_PUBLIC_KEY,
    initiateEndpoint: process.env.MPESA_INITIATE_ENDPOINT,
    statusEndpoint: process.env.MPESA_STATUS_ENDPOINT,
    reversalEndpoint: process.env.MPESA_REVERSAL_ENDPOINT,
    origin: process.env.MPESA_ORIGIN ?? 'developer.mpesa.vm.co.mz',
    timeoutMs: process.env.MPESA_TIMEOUT_MS
      ? Number(process.env.MPESA_TIMEOUT_MS)
      : 15000,
  },
}

const ensureConfig = () => {
  const missing = []
  if (!config.gatewaySecret) missing.push('MPESA_GATEWAY_SECRET')
  if (!config.mpesa.baseUrl) missing.push('MPESA_BASE_URL')
  if (!config.mpesa.apiKey) missing.push('MPESA_API_KEY')
  if (!config.mpesa.publicKey) missing.push('MPESA_PUBLIC_KEY')
  if (!config.mpesa.initiateEndpoint) missing.push('MPESA_INITIATE_ENDPOINT')
  if (!process.env.MPESA_SERVICE_PROVIDER_CODE)
    missing.push('MPESA_SERVICE_PROVIDER_CODE')
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }
}

const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)

const extractOrderLookup = (payload = {}) => {
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

const buildOrderNumberVariants = (value) => {
  if (!value) return []
  const normalized = String(value).trim().toUpperCase()
  const variants = new Set([normalized])

  if (normalized.startsWith('ORD') && !normalized.startsWith('ORD-')) {
    variants.add(`ORD-${normalized.slice(3)}`)
  }

  return Array.from(variants)
}

const resolveOrderId = async (payload) => {
  const { orderId, orderNumber } = extractOrderLookup(payload)

  if (orderId) return orderId

  if (orderNumber) {
    const variants = buildOrderNumberVariants(orderNumber)
    for (const variant of variants) {
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', variant)
        .maybeSingle()
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
    const { data } = await supabase
      .from('orders')
      .select('id')
      .eq('mpesa_reference', payload.reference)
      .maybeSingle()
    if (data?.id) return data.id
  }

  return null
}

const normalizeStatus = (payload = {}) => {
  const raw =
    payload.status ??
    payload.paymentStatus ??
    payload.resultCode ??
    payload.result_code ??
    payload.input_ResultCode

  if (raw === undefined || raw === null) return 'unknown'

  if (typeof raw === 'number') {
    return raw === 0 ? 'paid' : 'failed'
  }

  const value = String(raw).toLowerCase()
  if (value === '0') return 'paid'
  if (['0', 'success', 'paid', 'complete', 'completed'].includes(value)) {
    return 'paid'
  }
  if (['failed', 'cancelled', 'canceled', 'error'].includes(value)) {
    return 'failed'
  }

  return 'pending'
}

const normalizeMsisdn = (value) => {
  if (!value) return ''
  let digits = String(value).replace(/\D/g, '')
  if (digits.length === 10 && digits.startsWith('0')) {
    digits = digits.slice(1)
  }
  if (digits.length === 9 && digits.startsWith('8')) {
    return `258${digits}`
  }
  return digits
}

const normalizeReference = (value) => {
  if (!value) return ''
  return String(value)
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase()
    .slice(0, 20)
}

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/mpesa/initiate', async (req, res) => {
  try {
    ensureConfig()

    const rawBody = JSON.stringify(req.body ?? {})
    const verification = verifySignature({
      secret: config.gatewaySecret,
      timestamp: req.header('x-gateway-timestamp'),
      signature: req.header('x-gateway-signature'),
      body: rawBody,
    })

    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    const payload = req.body ?? {}

    const normalizeAmount = (value) => {
      if (value === null || value === undefined) return ''
      return String(value)
    }

    const transactionRef = normalizeReference(
      payload.orderNumber ?? payload.orderId,
    )

    const mpesaPayload = {
      input_TransactionReference: transactionRef,
      input_CustomerMSISDN: normalizeMsisdn(payload.phone),
      input_Amount: normalizeAmount(payload.amount),
      input_ThirdPartyReference: transactionRef,
      input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
    }

    const mpesaResponse = await mpesaRequest({
      baseUrl: config.mpesa.baseUrl,
      endpoint: config.mpesa.initiateEndpoint,
      apiKey: config.mpesa.apiKey,
      publicKey: config.mpesa.publicKey,
      origin: config.mpesa.origin,
      payload: mpesaPayload,
      timeoutMs: config.mpesa.timeoutMs,
    })

    if (!mpesaResponse.ok) {
      console.error('M-Pesa initiation failed', {
        status: mpesaResponse.status,
        payload: {
          input_TransactionReference: mpesaPayload.input_TransactionReference,
          input_CustomerMSISDN: mpesaPayload.input_CustomerMSISDN,
          input_Amount: mpesaPayload.input_Amount,
          input_ThirdPartyReference: mpesaPayload.input_ThirdPartyReference,
          input_ServiceProviderCode: mpesaPayload.input_ServiceProviderCode,
        },
        data: mpesaResponse.data,
      })
      return res.status(502).json({
        success: false,
        message: 'M-Pesa initiation failed',
        data: mpesaResponse.data,
      })
    }

    const responseCode =
      mpesaResponse.data?.output_ResponseCode ??
      (typeof mpesaResponse.data?.output_ResponseCode === 'number'
        ? String(mpesaResponse.data.output_ResponseCode)
        : null)

    if (responseCode && responseCode !== 'INS-0') {
      console.error('M-Pesa initiation rejected', {
        code: responseCode,
        data: mpesaResponse.data,
      })
      return res.status(400).json({
        success: false,
        message: 'M-Pesa rejected the request',
        code: responseCode,
        data: mpesaResponse.data,
      })
    }

    const transactionId =
      mpesaResponse.data?.output_TransactionID ??
      null

    const reference =
      mpesaResponse.data?.output_ThirdPartyReference ??
      payload.orderNumber ??
      payload.orderId ??
      null

    return res.json({
      success: true,
      status: 'processing',
      transactionId,
      reference,
      message: 'Payment request sent',
      data: mpesaResponse.data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

app.post('/mpesa/callback', async (req, res) => {
  try {
    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)

    const status = normalizeStatus(payload)
    const transactionId =
      payload.input_TransactionID ??
      payload.transactionId ??
      payload.transaction_id ??
      null
    const reference =
      payload.input_ThirdPartyReference ??
      payload.reference ??
      payload.orderNumber ??
      null
    const amount = payload.amount ?? payload.total ?? null

    if (orderId) {
      if (status === 'paid') {
        await supabase.rpc('mark_order_paid', {
          p_order_id: orderId,
          p_transaction_id: transactionId,
          p_reference: reference,
          p_amount: amount,
          p_response: payload,
        })
      } else if (status === 'failed') {
        await supabase.rpc('mark_order_failed', {
          p_order_id: orderId,
          p_transaction_id: transactionId,
          p_reference: reference,
          p_response: payload,
        })
      } else {
        await supabase
          .from('orders')
          .update({ status: 'processing', mpesa_last_response: payload })
          .eq('id', orderId)
      }
    } else {
      console.error('Async callback: order not found', {
        reference,
        transactionId,
      })
    }

    const originalConversationId =
      payload.input_OriginalConversationID ??
      payload.input_ConversationID ??
      payload.output_ConversationID ??
      ''

    return res.json({
      output_OriginalConversationID: originalConversationId,
      output_ResponseDesc: orderId
        ? 'Successfully Accepted Result'
        : 'Order not found',
      output_ResponseCode: orderId ? '0' : '1',
      output_ThirdPartyConversationID: reference ?? '',
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      output_OriginalConversationID: '',
      output_ResponseDesc: 'Internal Error',
      output_ResponseCode: '1',
      output_ThirdPartyConversationID: '',
    })
  }
})

app.post('/mpesa/status', async (req, res) => {
  try {
    ensureConfig()

    const rawBody = JSON.stringify(req.body ?? {})
    const verification = verifySignature({
      secret: config.gatewaySecret,
      timestamp: req.header('x-gateway-timestamp'),
      signature: req.header('x-gateway-signature'),
      body: rawBody,
    })

    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    if (!config.mpesa.statusEndpoint) {
      return res.status(400).json({ success: false, message: 'Status endpoint not configured' })
    }

    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)
    const order = orderId
      ? (
          await supabase
            .from('orders')
            .select('id, order_number, mpesa_transaction_id, mpesa_reference, total')
            .eq('id', orderId)
            .maybeSingle()
        ).data
      : null

    const thirdPartyReference =
      payload.thirdPartyReference ??
      payload.orderNumber ??
      order?.order_number ??
      payload.reference ??
      null

    const queryReference =
      payload.queryReference ??
      payload.input_OriginalConversationID ??
      payload.transactionId ??
      payload.transaction_id ??
      order?.mpesa_transaction_id ??
      thirdPartyReference ??
      null

    if (!thirdPartyReference || !queryReference) {
      return res.status(400).json({
        success: false,
        message: 'Missing query reference or third party reference',
      })
    }

    const mpesaPayload = {
      input_ThirdPartyReference: thirdPartyReference,
      input_QueryReference: queryReference,
      input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
    }

    const mpesaResponse = await mpesaRequest({
      baseUrl: config.mpesa.statusBaseUrl ?? config.mpesa.baseUrl,
      endpoint: config.mpesa.statusEndpoint,
      apiKey: config.mpesa.apiKey,
      publicKey: config.mpesa.publicKey,
      origin: config.mpesa.origin,
      payload: mpesaPayload,
      method: 'GET',
      timeoutMs: config.mpesa.timeoutMs,
    })

    if (!mpesaResponse.ok) {
      return res.status(502).json({
        success: false,
        data: mpesaResponse.data,
      })
    }

    const responseCode = mpesaResponse.data?.output_ResponseCode ?? null
    const responseStatus =
      mpesaResponse.data?.output_ResponseTransactionStatus ?? null

    if (orderId && responseCode === 'INS-0') {
      const normalized = responseStatus ? String(responseStatus).toLowerCase() : ''

      if (normalized === 'completed') {
        await supabase.rpc('mark_order_paid', {
          p_order_id: orderId,
          p_transaction_id: queryReference,
          p_reference: thirdPartyReference,
          p_amount: order?.total ?? null,
          p_response: mpesaResponse.data,
        })
      } else if (['cancelled', 'canceled', 'expired'].includes(normalized)) {
        await supabase.rpc('mark_order_failed', {
          p_order_id: orderId,
          p_transaction_id: queryReference,
          p_reference: thirdPartyReference,
          p_response: mpesaResponse.data,
        })
      }
    }

    return res.status(200).json({
      success: true,
      data: mpesaResponse.data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

app.post('/mpesa/reverse', async (req, res) => {
  try {
    ensureConfig()

    const rawBody = JSON.stringify(req.body ?? {})
    const verification = verifySignature({
      secret: config.gatewaySecret,
      timestamp: req.header('x-gateway-timestamp'),
      signature: req.header('x-gateway-signature'),
      body: rawBody,
    })

    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    if (!config.mpesa.reversalEndpoint) {
      return res.status(400).json({ success: false, message: 'Reversal endpoint not configured' })
    }

    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)
    const order = orderId
      ? (
          await supabase
            .from('orders')
            .select('id, order_number, mpesa_transaction_id, mpesa_reference, total')
            .eq('id', orderId)
            .maybeSingle()
        ).data
      : null

    const transactionId =
      payload.transactionId ??
      payload.transaction_id ??
      order?.mpesa_transaction_id ??
      null

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID',
      })
    }

    const thirdPartyReference =
      payload.thirdPartyReference ??
      payload.orderNumber ??
      order?.order_number ??
      payload.reference ??
      null

    const mpesaPayload = {
      input_TransactionID: transactionId,
      input_SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      input_InitiatorIdentifier: process.env.MPESA_INITIATOR_IDENTIFIER,
      input_ThirdPartyReference: thirdPartyReference ?? transactionId,
      input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
      ...(payload.amount !== undefined && payload.amount !== null
        ? { input_ReversalAmount: String(payload.amount) }
        : {}),
    }

    const mpesaResponse = await mpesaRequest({
      baseUrl: config.mpesa.reversalBaseUrl ?? config.mpesa.baseUrl,
      endpoint: config.mpesa.reversalEndpoint,
      apiKey: config.mpesa.apiKey,
      publicKey: config.mpesa.publicKey,
      origin: config.mpesa.origin,
      payload: mpesaPayload,
      method: 'PUT',
      timeoutMs: config.mpesa.timeoutMs,
    })

    if (!mpesaResponse.ok) {
      return res.status(502).json({
        success: false,
        data: mpesaResponse.data,
      })
    }

    const responseCode = mpesaResponse.data?.output_ResponseCode ?? null

    if (orderId && responseCode === 'INS-0') {
      await supabase.rpc('mark_order_failed', {
        p_order_id: orderId,
        p_transaction_id: transactionId,
        p_reference: thirdPartyReference,
        p_response: mpesaResponse.data,
      })
    }

    return res.status(200).json({
      success: true,
      data: mpesaResponse.data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
})

app.listen(config.port, () => {
  console.log(`M-Pesa gateway listening on :${config.port}`)
})
