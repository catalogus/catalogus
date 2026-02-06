# M-Pesa Callback Gateway on EC2 (Using Subdomain + Caddy)

This guide sets up `mpesa.catalogus.co.mz` to point to an EC2 instance and exposes the M‑Pesa callback on HTTPS port `12000` using Caddy.

## 1) DNS: Create the Subdomain
1. In your DNS manager (cPanel zone editor or other DNS provider), add an **A record**:
   - Name: `mpesa`
   - Type: `A`
   - Value: `<EC2_PUBLIC_IP>`
   - TTL: default
2. Keep all existing **A/MX** records for the root domain untouched so email and the WordPress site keep working.

## 2) Launch EC2
1. Launch an **EC2 t3.micro** (Ubuntu 22.04 recommended).
2. Assign a public IPv4 address.
3. Security Group inbound rules:
   - `22/tcp` from your IP (SSH)
   - `12000/tcp` from `0.0.0.0/0` (M‑Pesa callback)
   - `80/tcp` from `0.0.0.0/0` (Let’s Encrypt HTTP‑01)
   - Optional: `443/tcp` from `0.0.0.0/0` if you want standard TLS for other endpoints

## 3) Install Dependencies
SSH into EC2 and install Node.js and Caddy.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

# Node.js (example for Node 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 4) Deploy the M‑Pesa Gateway App
1. Copy your gateway app to EC2, e.g. `/srv/mpesa-gateway`.
2. Create an `.env` file with M‑Pesa and Supabase secrets (server‑only).
3. Start the gateway on `localhost:8080` (or any internal port).

Example systemd service:

```ini
# /etc/systemd/system/mpesa-gateway.service
[Unit]
Description=M-Pesa Gateway
After=network.target

[Service]
WorkingDirectory=/srv/mpesa-gateway
EnvironmentFile=/srv/mpesa-gateway/.env
ExecStart=/usr/bin/node /srv/mpesa-gateway/dist/index.js
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

## 5) Configure Caddy for HTTPS on Port 12000
Create `/etc/caddy/Caddyfile`:

```caddyfile
mpesa.catalogus.co.mz:12000 {
  reverse_proxy 127.0.0.1:8080
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

Caddy will request a TLS cert automatically. If you cannot open port `80`, you must use DNS‑01 validation instead.

## 6) Register Callback URL in M‑Pesa Portal
Use:

```
https://mpesa.catalogus.co.mz:12000/mpesa/callback
```

## 7) Connect Vercel → EC2
From your Vercel server functions:
- Call `https://mpesa.catalogus.co.mz:12000/mpesa/initiate`
- Add an HMAC signature or shared secret header.
- The EC2 gateway validates the signature before processing.

## 8) Verify End‑to‑End
1. Initiate a test payment from the storefront.
2. Confirm EC2 receives the callback.
3. Verify the order in Supabase is marked `paid`.
4. Ensure stock updates correctly.

## Optional: DNS‑01 TLS (No Port 80 Needed)
If you cannot open port `80`, configure Caddy to use DNS‑01 (requires API access to your DNS provider). This keeps only port `12000` open.

## Summary
- Your root domain stays on cPanel for email + WordPress.
- The subdomain `mpesa.catalogus.co.mz` points to EC2.
- Caddy terminates TLS on port `12000` and proxies to your gateway.
- M‑Pesa callbacks hit EC2 directly and update Supabase.
