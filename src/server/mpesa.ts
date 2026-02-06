import { createServerFn } from '@tanstack/react-start'
import { createHmac } from 'node:crypto'
import { serverSupabase } from '../lib/supabaseServer'

export type MpesaInitiationResult = {
  success: boolean
  status: 'pending' | 'processing' | 'paid' | 'failed'
  message: string
  orderId?: string
}

type InitiateMpesaInput = {
  orderId: string
  accessToken: string
}

type CreateOrderInput = {
  accessToken: string
  customer: {
    name: string
    email: string
    phone: string
  }
  items: Array<{
    book_id: string
    quantity: number
    price: number
  }>
  total: number
}

type GatewayResponse = {
  success: boolean
  transactionId?: string
  reference?: string
  status?: 'pending' | 'processing' | 'paid' | 'failed'
  message?: string
}

const getGatewayConfig = () => {
  const baseUrl = process.env.MPESA_GATEWAY_URL
  const secret = process.env.MPESA_GATEWAY_SECRET

  if (!baseUrl || !secret) {
    throw new Error('Missing M-Pesa gateway environment variables')
  }

  return { baseUrl: baseUrl.replace(/\/$/, ''), secret }
}

const signPayload = (payload: unknown, secret: string) => {
  const timestamp = new Date().toISOString()
  const body = JSON.stringify(payload)
  const signature = createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex')

  return { timestamp, signature, body }
}

const callGateway = async (
  path: string,
  payload: Record<string, unknown>,
  baseUrl: string,
  secret: string,
) => {
  const { timestamp, signature, body } = signPayload(payload, secret)

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Gateway-Timestamp': timestamp,
      'X-Gateway-Signature': signature,
    },
    body,
  })

  let result: GatewayResponse | null = null
  try {
    result = (await response.json()) as GatewayResponse
  } catch {
    result = null
  }

  return { ok: response.ok, result }
}

export const initiateMpesaPayment = createServerFn({ method: 'POST' })
  .inputValidator((data: InitiateMpesaInput) => {
    if (!data?.orderId || !data?.accessToken) {
      throw new Error('Missing required payment data')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { baseUrl, secret } = getGatewayConfig()

    const { data: userData, error: userError } =
      await serverSupabase.auth.getUser(data.accessToken)

    if (userError || !userData?.user) {
      throw new Error('Unauthorized')
    }

    const { data: order, error: orderError } = await serverSupabase
      .from('orders')
      .select('id, order_number, customer_id, customer_phone, total, status')
      .eq('id', data.orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.customer_id !== userData.user.id) {
      throw new Error('Forbidden')
    }

    if (order.status === 'paid') {
      return {
        success: true,
        status: 'paid',
        message: 'Payment already confirmed.',
        orderId: order.id,
      } satisfies MpesaInitiationResult
    }

    const payload = {
      orderId: order.id,
      orderNumber: order.order_number,
      amount: Number(order.total),
      phone: order.customer_phone,
    }

    const { ok, result } = await callGateway(
      '/mpesa/initiate',
      payload,
      baseUrl,
      secret,
    )

    if (!ok || !result?.success) {
      await serverSupabase
        .from('orders')
        .update({ status: 'failed', mpesa_last_response: result })
        .eq('id', order.id)

      return {
        success: false,
        status: 'failed',
        message: result?.message ?? 'Failed to initiate payment.',
        orderId: order.id,
      } satisfies MpesaInitiationResult
    }

    const { error: updateError } = await serverSupabase
      .from('orders')
      .update({
        status: result.status ?? 'processing',
        mpesa_transaction_id: result.transactionId ?? null,
        mpesa_reference: result.reference ?? null,
        mpesa_last_response: result,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('Failed to update order with M-Pesa initiation', updateError)
    }

    return {
      success: true,
      status: result.status ?? 'processing',
      message:
        result.message ??
        'Payment request sent. Please approve the request on your phone.',
      orderId: order.id,
    } satisfies MpesaInitiationResult
  })

export const createOrderAndInitiateMpesa = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateOrderInput) => {
    if (!data?.accessToken) {
      throw new Error('Missing access token')
    }
    if (!data?.customer?.name || !data?.customer?.email || !data?.customer?.phone) {
      throw new Error('Missing customer details')
    }
    if (!Array.isArray(data?.items) || data.items.length === 0) {
      throw new Error('Cart is empty')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { baseUrl, secret } = getGatewayConfig()

    const { data: userData, error: userError } =
      await serverSupabase.auth.getUser(data.accessToken)

    if (userError || !userData?.user) {
      throw new Error('Unauthorized')
    }

    const { data: result, error: orderError } = await serverSupabase.rpc(
      'create_order_atomic',
      {
        p_customer_id: userData.user.id,
        p_customer_name: data.customer.name.trim(),
        p_customer_email: data.customer.email.trim().toLowerCase(),
        p_customer_phone: data.customer.phone.trim(),
        p_total: data.total,
        p_items: data.items,
      },
    )

    if (orderError) {
      throw orderError
    }

    if (!result?.success) {
      throw new Error(result?.error || 'Failed to create order')
    }

    const orderId = result.order_id as string
    const orderNumber = result.order_number as string

    const payload = {
      orderId,
      orderNumber,
      amount: data.total,
      phone: data.customer.phone.trim(),
    }

    const { ok, result: gatewayResult } = await callGateway(
      '/mpesa/initiate',
      payload,
      baseUrl,
      secret,
    )

    if (!ok || !gatewayResult?.success) {
      await serverSupabase
        .from('orders')
        .update({ status: 'failed', mpesa_last_response: gatewayResult })
        .eq('id', orderId)

      return {
        success: false,
        status: 'failed',
        message: gatewayResult?.message ?? 'Failed to initiate payment.',
        orderId,
      } satisfies MpesaInitiationResult
    }

    const { error: updateError } = await serverSupabase
      .from('orders')
      .update({
        status: gatewayResult.status ?? 'processing',
        mpesa_transaction_id: gatewayResult.transactionId ?? null,
        mpesa_reference: gatewayResult.reference ?? null,
        mpesa_last_response: gatewayResult,
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Failed to update order with M-Pesa initiation', updateError)
    }

    return {
      success: true,
      status: gatewayResult.status ?? 'processing',
      message:
        gatewayResult.message ??
        'Payment request sent. Please approve the request on your phone.',
      orderId,
    } satisfies MpesaInitiationResult
  })

export type MpesaStatusResult = {
  success: boolean
  message: string
}

export const refreshMpesaStatus = createServerFn({ method: 'POST' })
  .inputValidator((data: InitiateMpesaInput) => {
    if (!data?.orderId || !data?.accessToken) {
      throw new Error('Missing required payment data')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { baseUrl, secret } = getGatewayConfig()

    const { data: userData, error: userError } =
      await serverSupabase.auth.getUser(data.accessToken)

    if (userError || !userData?.user) {
      throw new Error('Unauthorized')
    }

    const { data: order, error: orderError } = await serverSupabase
      .from('orders')
      .select('id, order_number, customer_id, mpesa_transaction_id')
      .eq('id', data.orderId)
      .single()

    if (orderError || !order) {
      throw new Error('Order not found')
    }

    if (order.customer_id !== userData.user.id) {
      throw new Error('Forbidden')
    }

    const payload = {
      orderId: order.id,
      orderNumber: order.order_number,
      transactionId: order.mpesa_transaction_id,
    }

    const { ok } = await callGateway('/mpesa/status', payload, baseUrl, secret)

    return {
      success: ok,
      message: ok
        ? 'Status updated.'
        : 'Unable to refresh payment status at the moment.',
    } satisfies MpesaStatusResult
  })
