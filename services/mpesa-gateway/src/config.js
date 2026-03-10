export const config = {
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
    timeoutMs: process.env.MPESA_TIMEOUT_MS ? Number(process.env.MPESA_TIMEOUT_MS) : 15000,
  },
}

export const ensureConfig = () => {
  const missing = []
  if (!config.gatewaySecret) missing.push('MPESA_GATEWAY_SECRET')
  if (!config.mpesa.baseUrl) missing.push('MPESA_BASE_URL')
  if (!config.mpesa.apiKey) missing.push('MPESA_API_KEY')
  if (!config.mpesa.publicKey) missing.push('MPESA_PUBLIC_KEY')
  if (!config.mpesa.initiateEndpoint) missing.push('MPESA_INITIATE_ENDPOINT')
  if (!process.env.MPESA_SERVICE_PROVIDER_CODE) missing.push('MPESA_SERVICE_PROVIDER_CODE')
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }
}
