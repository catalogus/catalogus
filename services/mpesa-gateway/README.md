# M-Pesa Gateway Service

This service runs on EC2 and handles M-Pesa API calls and callbacks. It is designed to be called from the Vercel app and to update Supabase using a service role key.

## Endpoints
- `GET /health`
- `POST /mpesa/initiate` (signed)
- `POST /mpesa/callback`
- `POST /mpesa/status` (signed)
- `POST /mpesa/reverse` (signed)

## Environment Variables
See `.env.example`.

Example (sandbox C2B from `C2B.md`):
- `MPESA_BASE_URL=https://api.sandbox.vm.co.mz:18352`
- `MPESA_INITIATE_ENDPOINT=/ipg/v1x/c2bPayment/singleStage/`
- `MPESA_ORIGIN=developer.mpesa.vm.co.mz`

Example (sandbox status + reversal):
- `MPESA_STATUS_BASE_URL=https://api.sandbox.vm.co.mz:18353`
- `MPESA_STATUS_ENDPOINT=/ipg/v1x/queryTransactionStatus/`
- `MPESA_REVERSAL_BASE_URL=https://api.sandbox.vm.co.mz:18354`
- `MPESA_REVERSAL_ENDPOINT=/ipg/v1x/reversal/`

## Run locally
```bash
cd services/mpesa-gateway
cp .env.example .env
npm install
npm run start
```

## Deploy on EC2
1. Copy this folder to `/srv/mpesa-gateway` on the EC2 instance.
2. Run `npm install`.
3. Create `/srv/mpesa-gateway/.env` from `.env.example`.
4. Use systemd to keep it running:

```ini
# /etc/systemd/system/mpesa-gateway.service
[Unit]
Description=M-Pesa Gateway
After=network.target

[Service]
WorkingDirectory=/srv/mpesa-gateway
EnvironmentFile=/srv/mpesa-gateway/.env
ExecStart=/usr/bin/node /srv/mpesa-gateway/src/index.js
Restart=always
User=ubuntu

[Install]
WantedBy=multi-user.target
```

Enable it:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mpesa-gateway
sudo systemctl status mpesa-gateway
```

## Caddy
```
mpesa.catalogus.co.mz:12000 {
  reverse_proxy 127.0.0.1:8080
}
```

## Notes
- Update the payload fields inside `src/index.js` for your exact M-Pesa API spec.
- This service uses a shared secret to validate Vercel -> gateway calls.
