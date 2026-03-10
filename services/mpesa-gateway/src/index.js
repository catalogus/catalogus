import express from 'express'
import { config } from './config.js'
import { handleCallback, handleInitiate, handleReverse, handleStatus } from './handlers.js'
import { verifySignature } from './signature.js'

const app = express()
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/mpesa/initiate', handleInitiate({ verifySignature }))
app.post('/mpesa/callback', handleCallback)
app.post('/mpesa/status', handleStatus({ verifySignature }))
app.post('/mpesa/reverse', handleReverse({ verifySignature }))

app.listen(config.port, () => {
  console.log(`M-Pesa gateway listening on :${config.port}`)
})
