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

Install dependencies:

```bash
npm install
```

Run the Vite frontend dev server:

```bash
npm run dev
```

This starts the frontend only. Pages Functions, D1, and R2 need the Cloudflare local workflow after `wrangler.toml` and `.dev.vars` are configured.

Build and typecheck the app:

```bash
npm run build
```

The build checks the Vue app, typechecks Cloudflare Functions with `tsconfig.functions.json`, and then creates the Vite production build.

Preview the production build locally:

```bash
npm run preview
```

## Cloudflare Setup

Copy the example config files, then fill in your D1, R2, Stripe, Resend, and session values.

```powershell
Copy-Item wrangler.toml.example wrangler.toml
Copy-Item .dev.vars.example .dev.vars
```

In `wrangler.toml`, replace:

- `database_id` with the Cloudflare D1 database ID.
- `bucket_name` if the deployed R2 bucket uses a different name.

In `.dev.vars`, replace:

- `SESSION_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `APP_BASE_URL`

## D1 Schema

Apply the schema to the local D1 database first:

```bash
npx wrangler d1 execute asia-ip-contest-2026 --local --file schema.sql
```

After confirming the local schema, apply it to the remote Cloudflare D1 database:

```bash
npx wrangler d1 execute asia-ip-contest-2026 --file schema.sql
```

The remote command mutates the Cloudflare-bound database configured in `wrangler.toml`.

## Production Configuration

Before deploying production, confirm:

- `wrangler.toml` points to the production D1 database and R2 bucket.
- Cloudflare Pages has the same D1 and R2 bindings as `wrangler.toml`.
- Cloudflare Pages environment variables contain production values for `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, and `APP_BASE_URL`.
- Stripe webhook delivery is configured for the deployed `/api/stripe/webhook` endpoint.
- Resend is configured with the verified sending domain for production email.
