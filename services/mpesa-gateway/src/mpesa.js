import crypto from 'node:crypto'

const chunk64 = (value) => value.match(/.{1,64}/g)?.join('\n') ?? value

export function buildBearerToken({ apiKey, publicKey }) {
  const pem = `-----BEGIN PUBLIC KEY-----\n${chunk64(publicKey)}\n-----END PUBLIC KEY-----\n`
  const encrypted = crypto.publicEncrypt(
    {
      key: pem,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(apiKey, 'utf8'),
  )
  return encrypted.toString('base64')
}

export async function mpesaRequest({
  baseUrl,
  endpoint,
  method = 'POST',
  apiKey,
  publicKey,
  payload,
  timeoutMs = 15000,
  origin,
}) {
  const bearer = buildBearerToken({ apiKey, publicKey })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const verb = method.toUpperCase()
    const url = new URL(endpoint, baseUrl)

    if (verb === 'GET' && payload) {
      const params = new URLSearchParams()
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        params.append(key, String(value))
      })
      url.search = params.toString()
    }

    const response = await fetch(url, {
      method: verb,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearer}`,
        ...(origin ? { Origin: origin } : {}),
      },
      body: verb === 'GET' ? undefined : payload ? JSON.stringify(payload) : undefined,
      signal: controller.signal,
    })

    const raw = await response.text()
    let data = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = raw
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    }
  } finally {
    clearTimeout(timer)
  }
}
