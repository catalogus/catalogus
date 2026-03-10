import { config, ensureConfig } from './config.js'
import { mpesaRequest } from './mpesa.js'
import { normalizeMsisdn, normalizeReference, normalizeStatus, verifyGatewayRequest } from './mpesaUtils.js'
import { resolveOrderId } from './orderLookup.js'
import { supabase } from './supabase.js'

const normalizeAmount = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

export const handleInitiate = ({ verifySignature }) => async (req, res) => {
  try {
    ensureConfig()

    const verification = verifyGatewayRequest({ req, secret: config.gatewaySecret, verifySignature })
    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    const payload = req.body ?? {}
    const transactionRef = normalizeReference(payload.orderNumber ?? payload.orderId)
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
      console.error('M-Pesa initiation failed', { status: mpesaResponse.status, payload: mpesaPayload, data: mpesaResponse.data })
      return res.status(502).json({ success: false, message: 'M-Pesa initiation failed', data: mpesaResponse.data })
    }

    const responseCode =
      mpesaResponse.data?.output_ResponseCode ??
      (typeof mpesaResponse.data?.output_ResponseCode === 'number'
        ? String(mpesaResponse.data.output_ResponseCode)
        : null)

    if (responseCode && responseCode !== 'INS-0') {
      console.error('M-Pesa initiation rejected', { code: responseCode, data: mpesaResponse.data })
      return res.status(400).json({
        success: false,
        message: 'M-Pesa rejected the request',
        code: responseCode,
        data: mpesaResponse.data,
      })
    }

    return res.json({
      success: true,
      status: 'processing',
      transactionId: mpesaResponse.data?.output_TransactionID ?? null,
      reference: mpesaResponse.data?.output_ThirdPartyReference ?? payload.orderNumber ?? payload.orderId ?? null,
      message: 'Payment request sent',
      data: mpesaResponse.data,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const handleCallback = async (req, res) => {
  try {
    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)
    const status = normalizeStatus(payload)
    const transactionId = payload.input_TransactionID ?? payload.transactionId ?? payload.transaction_id ?? null
    const reference = payload.input_ThirdPartyReference ?? payload.reference ?? payload.orderNumber ?? null
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
        await supabase.from('orders').update({ status: 'processing', mpesa_last_response: payload }).eq('id', orderId)
      }
    } else {
      console.error('Async callback: order not found', { reference, transactionId })
    }

    const originalConversationId =
      payload.input_OriginalConversationID ?? payload.input_ConversationID ?? payload.output_ConversationID ?? ''

    return res.json({
      output_OriginalConversationID: originalConversationId,
      output_ResponseDesc: orderId ? 'Successfully Accepted Result' : 'Order not found',
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
}

export const handleStatus = ({ verifySignature }) => async (req, res) => {
  try {
    ensureConfig()

    const verification = verifyGatewayRequest({ req, secret: config.gatewaySecret, verifySignature })
    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    if (!config.mpesa.statusEndpoint) {
      return res.status(400).json({ success: false, message: 'Status endpoint not configured' })
    }

    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)
    const order = orderId
      ? (await supabase.from('orders').select('id, order_number, mpesa_transaction_id, mpesa_reference, total').eq('id', orderId).maybeSingle()).data
      : null

    const thirdPartyReference = payload.thirdPartyReference ?? payload.orderNumber ?? order?.order_number ?? payload.reference ?? null
    const queryReference =
      payload.queryReference ??
      payload.input_OriginalConversationID ??
      payload.transactionId ??
      payload.transaction_id ??
      order?.mpesa_transaction_id ??
      thirdPartyReference ??
      null

    if (!thirdPartyReference || !queryReference) {
      return res.status(400).json({ success: false, message: 'Missing query reference or third party reference' })
    }

    const mpesaResponse = await mpesaRequest({
      baseUrl: config.mpesa.statusBaseUrl ?? config.mpesa.baseUrl,
      endpoint: config.mpesa.statusEndpoint,
      apiKey: config.mpesa.apiKey,
      publicKey: config.mpesa.publicKey,
      origin: config.mpesa.origin,
      payload: {
        input_ThirdPartyReference: thirdPartyReference,
        input_QueryReference: queryReference,
        input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
      },
      method: 'GET',
      timeoutMs: config.mpesa.timeoutMs,
    })

    if (!mpesaResponse.ok) {
      return res.status(502).json({ success: false, data: mpesaResponse.data })
    }

    const responseCode = mpesaResponse.data?.output_ResponseCode ?? null
    const responseStatus = mpesaResponse.data?.output_ResponseTransactionStatus ?? null

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

    return res.status(200).json({ success: true, data: mpesaResponse.data })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const handleReverse = ({ verifySignature }) => async (req, res) => {
  try {
    ensureConfig()

    const verification = verifyGatewayRequest({ req, secret: config.gatewaySecret, verifySignature })
    if (!verification.ok) {
      return res.status(401).json({ success: false, message: verification.reason })
    }

    if (!config.mpesa.reversalEndpoint) {
      return res.status(400).json({ success: false, message: 'Reversal endpoint not configured' })
    }

    const payload = req.body ?? {}
    const orderId = await resolveOrderId(payload)
    const order = orderId
      ? (await supabase.from('orders').select('id, order_number, mpesa_transaction_id, mpesa_reference, total').eq('id', orderId).maybeSingle()).data
      : null

    const transactionId = payload.transactionId ?? payload.transaction_id ?? order?.mpesa_transaction_id ?? null
    if (!transactionId) {
      return res.status(400).json({ success: false, message: 'Missing transaction ID' })
    }

    const thirdPartyReference = payload.thirdPartyReference ?? payload.orderNumber ?? order?.order_number ?? payload.reference ?? null

    const mpesaResponse = await mpesaRequest({
      baseUrl: config.mpesa.reversalBaseUrl ?? config.mpesa.baseUrl,
      endpoint: config.mpesa.reversalEndpoint,
      apiKey: config.mpesa.apiKey,
      publicKey: config.mpesa.publicKey,
      origin: config.mpesa.origin,
      payload: {
        input_TransactionID: transactionId,
        input_SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
        input_InitiatorIdentifier: process.env.MPESA_INITIATOR_IDENTIFIER,
        input_ThirdPartyReference: thirdPartyReference ?? transactionId,
        input_ServiceProviderCode: process.env.MPESA_SERVICE_PROVIDER_CODE,
        ...(payload.amount !== undefined && payload.amount !== null
          ? { input_ReversalAmount: String(payload.amount) }
          : {}),
      },
      method: 'PUT',
      timeoutMs: config.mpesa.timeoutMs,
    })

    if (!mpesaResponse.ok) {
      return res.status(502).json({ success: false, data: mpesaResponse.data })
    }

    if (orderId && mpesaResponse.data?.output_ResponseCode === 'INS-0') {
      await supabase.rpc('mark_order_failed', {
        p_order_id: orderId,
        p_transaction_id: transactionId,
        p_reference: thirdPartyReference,
        p_response: mpesaResponse.data,
      })
    }

    return res.status(200).json({ success: true, data: mpesaResponse.data })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}
