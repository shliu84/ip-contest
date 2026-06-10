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

Run the Cloudflare Pages local workflow after building:

```bash
npm run build
npx wrangler pages dev dist
```

Use this when you need Pages Functions, D1 bindings, or R2 bindings locally.

Build and typecheck the app:

```bash
npm run build
```

The build checks the Vue app, typechecks Cloudflare Functions with `tsconfig.functions.json`, and then creates the Vite production build.

Run the Workers/D1 test suite:

```bash
npm test
npm run test:typecheck
```

On Windows, the Cloudflare Vitest pool currently fails when the real project path contains non-ASCII characters. If that happens, copy the project to an ASCII-only temporary path and run `npm ci && npm test` there.

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
- `RESEND_FROM_EMAIL`
- `APP_BASE_URL`

## D1 Schema

Use D1 migrations for local and remote databases. Apply migrations locally first:

```bash
npx wrangler d1 migrations apply asia-ip-contest-2026 --local
```

After confirming local migrations and tests, apply the same migrations to the remote Cloudflare D1 database:

```bash
npx wrangler d1 migrations apply asia-ip-contest-2026 --remote
```

The remote command mutates the Cloudflare-bound database configured in `wrangler.toml`. Confirm the target account, project, and database before running it.

`schema.sql` is kept as a complete reference schema for fresh installs and review. Prefer the `migrations/` directory for operational changes.

## Production Configuration

Before deploying production, confirm:

- `wrangler.toml` points to the production D1 database and R2 bucket.
- Cloudflare Pages has the same D1 and R2 bindings as `wrangler.toml`.
- Cloudflare Pages environment variables contain production values for `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `APP_BASE_URL`.
- Stripe webhook delivery is configured for the deployed `/api/stripe/webhook` endpoint.
- Resend is configured with the verified sending domain for production email.

Stripe remains part of the submission/payment phase. The authentication phase does not call Stripe.
