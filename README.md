# ASIA IP CONTEST in TOKYO 2026

Cloudflare Pages + Vue + D1 + R2 submission platform for the fourth ASIA IP CONTEST in TOKYO.

## Stack

- Vue 3 + Vite + TypeScript
- Cloudflare Pages Functions
- Cloudflare D1
- Cloudflare R2
- Stripe Checkout and webhooks
- Resend email API

## Development

```bash
npm install
npm run dev
npm run build
```

## Cloudflare Setup

Copy the example config files, then fill in your D1, R2, Stripe, Resend, and session values.

```powershell
Copy-Item wrangler.toml.example wrangler.toml
Copy-Item .dev.vars.example .dev.vars
```

## D1 Schema

```bash
npx wrangler d1 execute asia-ip-contest-2026 --file schema.sql
npx wrangler d1 execute asia-ip-contest-2026 --local --file schema.sql
```
