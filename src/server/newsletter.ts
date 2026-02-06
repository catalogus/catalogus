import { createServerFn } from '@tanstack/react-start'
import { createHash, randomBytes } from 'node:crypto'
import { serverSupabase } from '../lib/supabaseServer'
import { isValidEmail } from '../lib/shopHelpers'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Catalogus <no-reply@catalogus.co.mz>'
const NEWSLETTER_THROTTLE_MS = 2 * 60 * 1000

const getSiteUrl = () => {
  const raw =
    process.env.SITE_URL ||
    process.env.VITE_SITE_URL ||
    process.env.VERCEL_URL ||
    ''
  if (!raw) {
    throw new Error('Missing SITE_URL environment variable')
  }
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  return `https://${raw}`
}

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

const generateToken = () => randomBytes(32).toString('hex')

const sendVerificationEmail = async (
  email: string,
  token: string,
  bookId?: string | null,
) => {
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY')
  }
  const siteUrl = getSiteUrl()
  const url = new URL('/newsletter/verify', siteUrl)
  url.searchParams.set('token', token)
  if (bookId) {
    url.searchParams.set('book', bookId)
  }

  const subject = 'Confirme a sua subscrição'
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Confirme a sua subscrição</h2>
      <p>Para concluir a subscrição e desbloquear os downloads digitais, confirme o seu email:</p>
      <p><a href="${url.toString()}" style="display:inline-block;padding:12px 18px;background:#c07238;color:#fff;text-decoration:none;border-radius:4px;">Confirmar email</a></p>
      <p>Este link expira em 24 horas.</p>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject,
      html,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Resend error: ${text}`)
  }
}

type RequestNewsletterInput = {
  email: string
  bookId?: string | null
}

export const requestNewsletterSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: RequestNewsletterInput) => {
    if (!data?.email) {
      throw new Error('Email is required')
    }
    return data
  })
  .handler(async ({ data }) => {
    const email = data.email.trim().toLowerCase()
    if (!isValidEmail(email)) {
      throw new Error('Invalid email')
    }

    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()

    const { data: existing } = await serverSupabase
      .from('newsletter_subscriptions')
      .select('id, status, updated_at')
      .eq('email', email)
      .maybeSingle()

    if (existing?.updated_at) {
      const lastUpdated = new Date(existing.updated_at).getTime()
      if (!Number.isNaN(lastUpdated) && Date.now() - lastUpdated < NEWSLETTER_THROTTLE_MS) {
        throw new Error('Please wait before requesting another verification email.')
      }
    }

    const status = existing?.status === 'verified' ? 'verified' : 'pending'

    const { error } = await serverSupabase.from('newsletter_subscriptions').upsert(
      {
        email,
        status,
        verification_token_hash: tokenHash,
        verification_expires_at: expiresAt,
        updated_at: now,
      },
      { onConflict: 'email' },
    )

    if (error) throw error

    await sendVerificationEmail(email, token, data.bookId ?? null)

    return {
      success: true,
      message: 'Verification email sent',
    }
  })

type VerifyNewsletterInput = {
  token: string
}

export const verifyNewsletterSubscription = createServerFn({ method: 'POST' })
  .inputValidator((data: VerifyNewsletterInput) => {
    if (!data?.token) {
      throw new Error('Missing token')
    }
    return data
  })
  .handler(async ({ data }) => {
    const tokenHash = hashToken(data.token)
    const now = new Date()

    const { data: subscription, error } = await serverSupabase
      .from('newsletter_subscriptions')
      .select('id, email, verification_expires_at')
      .eq('verification_token_hash', tokenHash)
      .maybeSingle()

    if (error) throw error
    if (!subscription) {
      throw new Error('Invalid or expired token')
    }

    if (
      subscription.verification_expires_at &&
      new Date(subscription.verification_expires_at) < now
    ) {
      throw new Error('Verification link expired')
    }

    const downloadToken = generateToken()
    const downloadTokenHash = hashToken(downloadToken)

    const { error: updateError } = await serverSupabase
      .from('newsletter_subscriptions')
      .update({
        status: 'verified',
        verified_at: now.toISOString(),
        verification_token_hash: null,
        verification_expires_at: null,
        download_token_hash: downloadTokenHash,
        updated_at: now.toISOString(),
      })
      .eq('id', subscription.id)

    if (updateError) throw updateError

    return {
      success: true,
      email: subscription.email,
      downloadToken,
    }
  })

type FreeDownloadInput = {
  bookId: string
  downloadToken: string
}

export const getFreeDigitalDownloadUrl = createServerFn({ method: 'POST' })
  .inputValidator((data: FreeDownloadInput) => {
    if (!data?.bookId || !data?.downloadToken) {
      throw new Error('Missing download data')
    }
    return data
  })
  .handler(async ({ data }) => {
    const tokenHash = hashToken(data.downloadToken)

    const { data: subscription, error } = await serverSupabase
      .from('newsletter_subscriptions')
      .select('id, status')
      .eq('download_token_hash', tokenHash)
      .maybeSingle()

    if (error) throw error
    if (!subscription || subscription.status !== 'verified') {
      throw new Error('Newsletter verification required')
    }

    const { data: book, error: bookError } = await serverSupabase
      .from('books')
      .select('id, is_digital, digital_access, digital_file_path')
      .eq('id', data.bookId)
      .eq('is_active', true)
      .maybeSingle()

    if (bookError) throw bookError
    if (!book || !book.digital_file_path) {
      throw new Error('Digital file not available')
    }
    if (!book.is_digital || book.digital_access !== 'free') {
      throw new Error('This book is not available for free download')
    }

    const { data: signed, error: signedError } = await serverSupabase.storage
      .from('digital-books')
      .createSignedUrl(book.digital_file_path, 60 * 60 * 3)

    if (signedError) throw signedError

    return { success: true, url: signed.signedUrl }
  })

type PaidDownloadInput = {
  orderId: string
  bookId: string
  accessToken: string
}

export const getPaidDigitalDownloadUrl = createServerFn({ method: 'POST' })
  .inputValidator((data: PaidDownloadInput) => {
    if (!data?.orderId || !data?.bookId || !data?.accessToken) {
      throw new Error('Missing download data')
    }
    return data
  })
  .handler(async ({ data }) => {
    const { data: userData, error: userError } =
      await serverSupabase.auth.getUser(data.accessToken)

    if (userError || !userData?.user) {
      throw new Error('Unauthorized')
    }

    const { data: order, error: orderError } = await serverSupabase
      .from('orders')
      .select('id, customer_id, status')
      .eq('id', data.orderId)
      .maybeSingle()

    if (orderError) throw orderError
    if (!order) throw new Error('Order not found')
    if (order.customer_id !== userData.user.id) {
      throw new Error('Forbidden')
    }
    if (order.status !== 'paid') {
      throw new Error('Payment not completed')
    }

    const { data: item, error: itemError } = await serverSupabase
      .from('order_items')
      .select('id')
      .eq('order_id', data.orderId)
      .eq('book_id', data.bookId)
      .maybeSingle()

    if (itemError) throw itemError
    if (!item) throw new Error('Book not found in order')

    const { data: book, error: bookError } = await serverSupabase
      .from('books')
      .select('id, is_digital, digital_access, digital_file_path')
      .eq('id', data.bookId)
      .eq('is_active', true)
      .maybeSingle()

    if (bookError) throw bookError
    if (!book || !book.digital_file_path) {
      throw new Error('Digital file not available')
    }
    if (!book.is_digital || book.digital_access !== 'paid') {
      throw new Error('This book is not available for paid download')
    }

    const { data: signed, error: signedError } = await serverSupabase.storage
      .from('digital-books')
      .createSignedUrl(book.digital_file_path, 60 * 60 * 3)

    if (signedError) throw signedError

    return { success: true, url: signed.signedUrl }
  })
