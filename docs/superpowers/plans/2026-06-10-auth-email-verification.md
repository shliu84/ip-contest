# Authentication And Email Verification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add secure email/password accounts, Resend email verification, HttpOnly D1-backed sessions, logout, current-user lookup, and password reset to the Cloudflare Pages application.

**Architecture:** Pages Functions own all authentication state and security decisions. Passwords use PBKDF2-SHA256 through Web Crypto, raw verification/reset/session tokens are sent only to clients while SHA-256 hashes are stored in D1, and sessions use an HttpOnly SameSite cookie backed by a `sessions` table. Vue pages call typed JSON APIs and route guards use `/api/me`.

**Tech Stack:** Cloudflare Pages Functions, D1, Web Crypto, Resend HTTP API, Vue 3, Vue Router, TypeScript, Vitest 4, `@cloudflare/vitest-pool-workers`.

---

## Security Decisions

- Normalize email addresses with `trim().toLowerCase()`.
- Password length: 10-128 Unicode code points.
- Password hashing: PBKDF2-HMAC-SHA256, 310,000 iterations, 16-byte random salt, 32-byte derived key.
- Verification token lifetime: 24 hours.
- Password-reset token lifetime: 1 hour.
- Session lifetime: 7 days.
- Cookie name: `aipc_session`.
- Cookie attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800`; add `Secure` when `APP_BASE_URL` starts with `https://`.
- Login is rejected until the email address is verified.
- Forgot-password always returns the same success response, whether or not the email exists.
- A successful password reset invalidates all existing sessions for that user.
- Authentication errors must not expose password hashes, stored token hashes, or whether an account exists through forgot-password.

## File Structure

### Database And Configuration

- Create: `migrations/0000_initial.sql`
- Create: `migrations/0001_auth_sessions.sql`
- Modify: `schema.sql`
- Modify: `functions/_lib/env.ts`
- Modify: `.dev.vars.example`
- Modify: `README.md`

### Test Foundation

- Create: `vitest.config.ts`
- Create: `test/tsconfig.json`
- Create: `test/env.d.ts`
- Create: `test/apply-migrations.ts`
- Create: `test/helpers/pages-context.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

### Backend Authentication

- Create: `functions/_lib/auth-constants.ts`
- Create: `functions/_lib/encoding.ts`
- Create: `functions/_lib/password.ts`
- Create: `functions/_lib/tokens.ts`
- Create: `functions/_lib/session.ts`
- Create: `functions/_lib/email.ts`
- Create: `functions/_lib/validation.ts`
- Modify: `functions/_lib/http.ts`
- Create: `functions/api/auth/register.ts`
- Create: `functions/api/auth/verify-email.ts`
- Create: `functions/api/auth/login.ts`
- Create: `functions/api/auth/logout.ts`
- Create: `functions/api/auth/forgot-password.ts`
- Create: `functions/api/auth/reset-password.ts`
- Create: `functions/api/me.ts`

### Backend Tests

- Create: `test/password.spec.ts`
- Create: `test/tokens.spec.ts`
- Create: `test/session.spec.ts`
- Create: `test/register-verify.spec.ts`
- Create: `test/login-logout-me.spec.ts`
- Create: `test/password-reset.spec.ts`

### Frontend

- Modify: `src/App.vue`
- Modify: `src/i18n/translations.ts`
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`
- Modify: `src/stores/session.ts`
- Modify: `src/router/index.ts`
- Modify: `src/views/auth/RegisterPage.vue`
- Modify: `src/views/auth/LoginPage.vue`
- Modify: `src/views/auth/VerifyEmailPage.vue`
- Modify: `src/views/auth/ForgotPasswordPage.vue`
- Modify: `src/views/auth/ResetPasswordPage.vue`
- Modify: `src/views/applicant/DashboardPage.vue`
- Create: `src/styles/auth.css`
- Modify: `src/style.css`

---

### Task 1: Add Auth Migrations And Workers Test Runtime

**Files:**
- Create: `migrations/0000_initial.sql`
- Create: `migrations/0001_auth_sessions.sql`
- Modify: `schema.sql`
- Create: `vitest.config.ts`
- Create: `test/tsconfig.json`
- Create: `test/env.d.ts`
- Create: `test/apply-migrations.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Copy the current initial schema into `migrations/0000_initial.sql`**

Copy the current contents of `schema.sql` without the new `sessions` table. Keep every `CREATE TABLE` and `CREATE INDEX` idempotent.

- [ ] **Step 2: Create `migrations/0001_auth_sessions.sql`**

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
```

- [ ] **Step 3: Add the same `sessions` table and indexes to `schema.sql`**

Place the table after password-reset tokens so fresh installations receive the complete schema.

- [ ] **Step 4: Install the official Cloudflare Vitest integration**

Run:

```bash
npm install -D vitest@^4.1.0 @cloudflare/vitest-pool-workers wrangler
```

Expected: dependencies install and `package-lock.json` changes.

- [ ] **Step 5: Add test scripts to `package.json`**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

Keep the existing `dev`, `build`, and `preview` scripts.

- [ ] **Step 6: Create `vitest.config.ts`**

```ts
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import { readD1Migrations } from '@cloudflare/vitest-pool-workers/config'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      miniflare: {
        compatibilityDate: '2026-06-10',
        d1Databases: ['DB'],
        r2Buckets: ['SUBMISSION_BUCKET'],
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations(path.join(rootDir, 'migrations')),
          SESSION_SECRET: 'test-session-secret',
          RESEND_API_KEY: 're_test',
          RESEND_FROM_EMAIL: 'contest@example.com',
          APP_BASE_URL: 'https://contest.example.com',
          STRIPE_SECRET_KEY: 'sk_test_unused',
          STRIPE_WEBHOOK_SECRET: 'whsec_unused',
        },
      },
    })),
  ],
  test: {
    setupFiles: ['./test/apply-migrations.ts'],
    passWithNoTests: true,
  },
})
```

- [ ] **Step 7: Create test types and migration setup**

`test/env.d.ts`:

```ts
import type { D1Migration } from '@cloudflare/vitest-pool-workers'
import type { AppEnv } from '../functions/_lib/env'

declare global {
  namespace Cloudflare {
    interface Env extends AppEnv {
      TEST_MIGRATIONS: D1Migration[]
    }
  }
}

export {}
```

`test/tsconfig.json`:

```json
{
  "extends": "../tsconfig.functions.json",
  "compilerOptions": {
    "types": [
      "@cloudflare/vitest-pool-workers/types",
      "vitest/globals"
    ]
  },
  "include": [
    "./**/*.ts",
    "../functions/**/*.ts"
  ]
}
```

`test/apply-migrations.ts`:

```ts
import { env } from 'cloudflare:workers'
import { applyD1Migrations } from 'cloudflare:test'
import { beforeAll, beforeEach } from 'vitest'

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
})

beforeEach(async () => {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions'),
    env.DB.prepare('DELETE FROM password_reset_tokens'),
    env.DB.prepare('DELETE FROM email_verification_tokens'),
    env.DB.prepare('DELETE FROM users'),
  ])
})
```

- [ ] **Step 8: Create `test/helpers/pages-context.ts`**

```ts
import { env } from 'cloudflare:workers'
import type { AppEnv } from '../../functions/_lib/env'

export function pagesContext(request: Request): Parameters<PagesFunction<AppEnv>>[0] {
  return {
    request,
    env,
    params: {},
    data: {},
    functionPath: new URL(request.url).pathname,
    waitUntil(_promise: Promise<unknown>) {},
    passThroughOnException() {},
    async next() {
      return new Response('Not found', { status: 404 })
    },
  }
}
```

Endpoint tests import their exported Pages Function handler and call it with `pagesContext(request)`.

- [ ] **Step 9: Verify tests and build**

Run:

```bash
npm test
npm run build
```

Expected: test runner starts successfully with zero test files or a no-tests success configuration; build passes.

- [ ] **Step 10: Commit**

```bash
git add migrations schema.sql vitest.config.ts test package.json package-lock.json
git commit -m "test: add auth database and Workers test foundation"
```

---

### Task 2: Implement Password, Token, Validation, And Error Primitives

**Files:**
- Create: `functions/_lib/auth-constants.ts`
- Create: `functions/_lib/encoding.ts`
- Create: `functions/_lib/password.ts`
- Create: `functions/_lib/tokens.ts`
- Create: `functions/_lib/validation.ts`
- Modify: `functions/_lib/http.ts`
- Test: `test/password.spec.ts`
- Test: `test/tokens.spec.ts`

- [ ] **Step 1: Write password and token tests**

`test/password.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '../functions/_lib/password'

describe('password hashing', () => {
  it('verifies the original password and rejects another password', async () => {
    const encoded = await hashPassword('correct horse battery staple')
    expect(encoded.startsWith('pbkdf2_sha256$310000$')).toBe(true)
    expect(await verifyPassword('correct horse battery staple', encoded)).toBe(true)
    expect(await verifyPassword('wrong password', encoded)).toBe(false)
  })

  it('uses a new salt for each hash', async () => {
    const first = await hashPassword('same password')
    const second = await hashPassword('same password')
    expect(first).not.toBe(second)
  })
})
```

`test/tokens.spec.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createToken, hashToken } from '../functions/_lib/tokens'

describe('tokens', () => {
  it('creates URL-safe raw tokens and stable hashes', async () => {
    const token = createToken()
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/)
    expect(await hashToken(token)).toBe(await hashToken(token))
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- test/password.spec.ts test/tokens.spec.ts
```

Expected: FAIL because the helper modules do not exist.

- [ ] **Step 3: Add constants and encoding**

`functions/_lib/auth-constants.ts`:

```ts
export const PASSWORD_ITERATIONS = 310_000
export const VERIFICATION_TOKEN_SECONDS = 24 * 60 * 60
export const RESET_TOKEN_SECONDS = 60 * 60
export const SESSION_SECONDS = 7 * 24 * 60 * 60
export const SESSION_COOKIE = 'aipc_session'
```

`functions/_lib/encoding.ts` must export `bytesToBase64Url(bytes)` and `base64UrlToBytes(value)` using `btoa`/`atob`, replacing `+`/`/` and removing/restoring padding.

- [ ] **Step 4: Implement password hashing**

`functions/_lib/password.ts` must:

- Generate 16 random salt bytes.
- Derive 32 bytes with Web Crypto PBKDF2 SHA-256 and 310,000 iterations.
- Store `pbkdf2_sha256$310000$<salt>$<hash>`.
- Parse the encoded format safely.
- Compare derived and stored bytes with a constant-time XOR loop.
- Return `false` for malformed encoded hashes.

- [ ] **Step 5: Implement token helpers and validation**

`functions/_lib/tokens.ts`:

```ts
import { bytesToBase64Url } from './encoding'

export function createToken() {
  return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)))
}

export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token))
  return bytesToBase64Url(new Uint8Array(digest))
}
```

`functions/_lib/validation.ts` must export:

```ts
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase()
}

export function validateEmail(value: string) {
  return value.length <= 254 && EMAIL_PATTERN.test(value)
}

export function validatePassword(value: string) {
  const length = Array.from(value).length
  return length >= 10 && length <= 128
}
```

- [ ] **Step 6: Add a shared API handler**

Extend `functions/_lib/http.ts` with:

```ts
export function handleApi(handler: () => Promise<Response>) {
  return handler().catch((error: unknown) => {
    if (error instanceof ApiRequestError) {
      return apiError(error.code, error.message, error.status)
    }
    console.error(error)
    return apiError('server_error', 'Internal server error', 500)
  })
}
```

Add `conflict`, `email_not_verified`, and `email_delivery_failed` to `ApiErrorCode`.

- [ ] **Step 7: Run tests and build**

```bash
npm test -- test/password.spec.ts test/tokens.spec.ts
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add functions/_lib test/password.spec.ts test/tokens.spec.ts
git commit -m "feat: add authentication crypto primitives"
```

---

### Task 3: Implement D1-Backed Sessions

**Files:**
- Create: `functions/_lib/session.ts`
- Create: `functions/api/me.ts`
- Test: `test/session.spec.ts`

- [ ] **Step 1: Write session tests**

Tests must prove:

- Creating a session inserts only the token hash into D1.
- The returned cookie contains `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=604800`, and `Secure` for HTTPS.
- A valid cookie loads the current user.
- Missing, unknown, and expired cookies return `null`.
- Deleting a session makes the cookie invalid.

- [ ] **Step 2: Run test and verify failure**

```bash
npm test -- test/session.spec.ts
```

Expected: FAIL because session helpers do not exist.

- [ ] **Step 3: Implement `functions/_lib/session.ts`**

Export:

```ts
export type SessionUser = {
  id: string
  email: string
  role: 'applicant' | 'committee' | 'judge' | 'super_admin'
  emailVerifiedAt: string | null
}

export async function createSession(db: D1Database, userId: string, appBaseUrl: string): Promise<{
  cookie: string
  token: string
}>

export async function getSessionUser(db: D1Database, request: Request): Promise<SessionUser | null>
export async function deleteSession(db: D1Database, request: Request): Promise<void>
export function clearSessionCookie(appBaseUrl: string): string
```

Implementation requirements:

- Store a SHA-256 hash of the raw token.
- Join `sessions` to `users` when loading.
- Reject expired sessions and delete them.
- Parse cookies without external packages.
- Update `last_seen_at` only when the previous value is more than 15 minutes old.

- [ ] **Step 4: Implement `/api/me`**

`GET /api/me` returns:

```json
{ "user": null }
```

or:

```json
{
  "user": {
    "id": "...",
    "email": "...",
    "role": "applicant",
    "emailVerifiedAt": "..."
  }
}
```

Use `handleApi`.

- [ ] **Step 5: Run tests and build**

```bash
npm test -- test/session.spec.ts
npm run build
```

- [ ] **Step 6: Commit**

```bash
git add functions/_lib/session.ts functions/api/me.ts test/session.spec.ts
git commit -m "feat: add D1-backed authentication sessions"
```

---

### Task 4: Implement Registration And Email Verification

**Files:**
- Modify: `functions/_lib/env.ts`
- Modify: `.dev.vars.example`
- Create: `functions/_lib/email.ts`
- Create: `functions/api/auth/register.ts`
- Create: `functions/api/auth/verify-email.ts`
- Test: `test/register-verify.spec.ts`

- [ ] **Step 1: Add email configuration**

Add `RESEND_FROM_EMAIL: string` to `AppEnv` and:

```dotenv
RESEND_FROM_EMAIL="ASIA IP CONTEST <contest@example.com>"
```

to `.dev.vars.example`.

- [ ] **Step 2: Write registration and verification tests**

Tests must cover:

- Valid registration creates an applicant with a password hash.
- Registration stores a hashed verification token, not the raw token.
- Duplicate email returns 409.
- Invalid email and password shorter than 10 return 400.
- Verification marks `email_verified_at` and `used_at`.
- Expired, used, or unknown tokens return 400.
- Resend HTTP is mocked and receives the verification URL.
- A failed Resend request returns 502 and removes the just-created user and token so registration can be retried.

- [ ] **Step 3: Implement Resend helper**

`functions/_lib/email.ts` must POST to `https://api.resend.com/emails`:

```ts
export async function sendEmail(
  env: AppEnv,
  input: { to: string; subject: string; html: string },
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  })
  if (!response.ok) throw new Error(`Resend failed with ${response.status}`)
}
```

- [ ] **Step 4: Implement registration**

`POST /api/auth/register` body:

```ts
type RegisterBody = {
  email: string
  password: string
}
```

Behavior:

- Validate JSON, email shape, and password length.
- Normalize email.
- Return 409 for duplicate email.
- Insert user and verification token with a D1 batch.
- Build `${APP_BASE_URL}/verify-email?token=${encodeURIComponent(rawToken)}`.
- Send the email after successful inserts.
- If email delivery fails, delete the just-created token and user in a D1 batch, then throw `ApiRequestError('email_delivery_failed', 'Unable to send verification email', 502)`.
- Return 201 with `{ ok: true }`.

- [ ] **Step 5: Implement verification**

`GET /api/auth/verify-email?token=...`:

- Hash the token.
- Find unused, unexpired token.
- Batch-update `users.email_verified_at`, `users.updated_at`, and token `used_at`.
- Return `{ ok: true }`.

- [ ] **Step 6: Run tests and build**

```bash
npm test -- test/register-verify.spec.ts
npm run build
```

- [ ] **Step 7: Commit**

```bash
git add functions .dev.vars.example test/register-verify.spec.ts
git commit -m "feat: add registration and email verification"
```

---

### Task 5: Implement Login, Logout, And Current Session

**Files:**
- Create: `functions/api/auth/login.ts`
- Create: `functions/api/auth/logout.ts`
- Test: `test/login-logout-me.spec.ts`

- [ ] **Step 1: Write endpoint tests**

Tests must prove:

- Correct verified credentials create a session and `Set-Cookie`.
- Wrong credentials return 401 with the same message for unknown email and wrong password.
- Unverified users return 403 with code `email_not_verified`.
- Logout deletes the current session and clears the cookie.
- `/api/me` returns the logged-in user and returns `null` after logout.

- [ ] **Step 2: Implement login**

`POST /api/auth/login`:

- Normalize email.
- Load user by email.
- If the account lookup fails, call `await hashPassword(password)` before returning the same 401 response used for a wrong password, reducing timing differences without maintaining a dummy credential.
- Reject unverified accounts.
- Create session.
- Return user JSON and `Set-Cookie`.

- [ ] **Step 3: Implement logout**

`POST /api/auth/logout`:

- Delete current session if present.
- Always return `{ ok: true }`.
- Always set the expired session cookie.

- [ ] **Step 4: Run tests and build**

```bash
npm test -- test/login-logout-me.spec.ts
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add functions/api/auth test/login-logout-me.spec.ts
git commit -m "feat: add login logout and current-user APIs"
```

---

### Task 6: Implement Forgot And Reset Password

**Files:**
- Create: `functions/api/auth/forgot-password.ts`
- Create: `functions/api/auth/reset-password.ts`
- Test: `test/password-reset.spec.ts`

- [ ] **Step 1: Write password-reset tests**

Tests must prove:

- Forgot-password returns `{ ok: true }` for existing and unknown email.
- Existing verified account receives a Resend reset URL.
- Resend failures are logged but the endpoint still returns the generic success response.
- Only the token hash is stored.
- Valid reset token changes the password, marks the token used, and deletes all sessions.
- Expired, used, and unknown tokens return 400.
- New password shorter than 10 returns 400.
- Old password stops working and new password works.

- [ ] **Step 2: Implement forgot-password**

`POST /api/auth/forgot-password`:

- Normalize email.
- If a verified user exists, create a one-hour token and send `${APP_BASE_URL}/reset-password?token=...`.
- Return `{ ok: true }` regardless of account existence.
- Do not create reset tokens for unverified accounts.
- Catch and log email-delivery failures so the response does not reveal account existence.

- [ ] **Step 3: Implement reset-password**

`POST /api/auth/reset-password` body:

```ts
type ResetBody = {
  token: string
  password: string
}
```

Use a D1 batch to:

- Update `users.password_hash` and `updated_at`.
- Mark reset token used.
- Delete all sessions for the user.

- [ ] **Step 4: Run tests and build**

```bash
npm test -- test/password-reset.spec.ts
npm run build
```

- [ ] **Step 5: Commit**

```bash
git add functions/api/auth test/password-reset.spec.ts
git commit -m "feat: add password reset flow"
```

---

### Task 7: Implement Authentication Pages And Route Guards

**Files:**
- Modify: `src/App.vue`
- Modify: `src/i18n/translations.ts`
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`
- Modify: `src/stores/session.ts`
- Modify: `src/router/index.ts`
- Modify: `src/views/auth/RegisterPage.vue`
- Modify: `src/views/auth/LoginPage.vue`
- Modify: `src/views/auth/VerifyEmailPage.vue`
- Modify: `src/views/auth/ForgotPasswordPage.vue`
- Modify: `src/views/auth/ResetPasswordPage.vue`
- Modify: `src/views/applicant/DashboardPage.vue`
- Create: `src/styles/auth.css`
- Modify: `src/style.css`

- [ ] **Step 1: Add typed API errors**

`src/services/api.ts` must export:

```ts
export class ApiClientError extends Error {
  code: string
  status: number
}
```

When a non-2xx JSON body matches `{ error: { code, message } }`, throw `ApiClientError`. Preserve fallback handling for text errors.

- [ ] **Step 2: Extend session store**

Add:

```ts
async function login(email: string, password: string): Promise<void>
async function logout(): Promise<void>
```

`login` calls `/api/auth/login`, updates `currentUser`, and `logout` calls `/api/auth/logout` then clears the user.

Add a module-level `hasLoadedSession = ref(false)`. `loadSession` sets it to `true` in `finally`, and the store exposes it as readonly so guards distinguish “not checked yet” from “checked and logged out.”

- [ ] **Step 3: Add route metadata and guard**

Routes:

- `register`, `login`, `forgot-password`: `meta: { guestOnly: true }`
- `dashboard`, submission, payment routes: `meta: { requiresAuth: true }`
- admin routes: `meta: { requiresAuth: true, roles: ['committee', 'super_admin'] }`
- auth and dashboard routes: `meta: { usesTranslations: true }`

Add one `router.beforeEach` that:

- Calls `loadSession()` only when `hasLoadedSession` is false.
- Redirects unauthenticated protected routes to `/login?redirect=<path>`.
- Redirects logged-in guest-only routes to `/dashboard`.
- Redirects disallowed roles to `/dashboard`.

- [ ] **Step 4: Implement auth forms**

Every form must:

- Use semantic `<label>` and input elements.
- Disable submit while pending.
- Show API errors in an `aria-live="polite"` element.
- Preserve email between retry attempts.

Page behavior:

- Register: email/password/confirm password; success shows “check your email”.
- Login: email/password; success redirects to query `redirect` or `/dashboard`.
- Verify Email: reads `token`, calls verification API once, shows success and login link.
- Forgot Password: email form; always shows generic success.
- Reset Password: reads `token`, password/confirm; success links to login.
- Dashboard: shows signed-in email, role, and logout button.

Add all visible authentication and dashboard copy to `src/i18n/translations.ts` in Japanese, Simplified Chinese, and English. Each affected page receives the existing `t` function as a typed prop. Update `src/App.vue` to pass `{ t }` when the route is home or has `meta.usesTranslations`.

- [ ] **Step 5: Add auth styles**

Create a restrained form layout with:

- `.auth-page`
- `.auth-panel`
- `.form-field`
- `.form-error`
- `.form-success`
- `.form-actions`

Keep card radius at 8px or less and reuse existing color variables.

- [ ] **Step 6: Run build**

```bash
npm run build
```

Expected: PASS with no Vue or TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src
git commit -m "feat: add authentication pages and route guards"
```

---

### Task 8: Complete Auth Documentation And Full Verification

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document auth environment and migrations**

Add:

- `RESEND_FROM_EMAIL`
- `npm test`
- `npx wrangler d1 migrations apply asia-ip-contest-2026 --local`
- Remote migration command with an explicit warning.
- Stripe remains unused in this phase.

- [ ] **Step 2: Run full verification**

```bash
npm test
npm run build
npx wrangler d1 migrations apply asia-ip-contest-2026 --local
git status --short
```

Expected:

- All auth tests pass.
- Production build passes.
- Local D1 migrations apply without error.
- Working tree contains only the intended README change before commit.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document authentication setup"
```

---

## Final Acceptance Checklist

- Registration stores only password hashes and hashed verification tokens.
- Verification tokens expire after 24 hours and are single-use.
- Login requires a verified email.
- Sessions use an HttpOnly cookie and hashed D1 token storage.
- Logout invalidates the session.
- `/api/me` returns the current user or `null`.
- Forgot-password does not reveal whether an account exists.
- Reset tokens expire after one hour and are single-use.
- Password reset revokes every session for the user.
- Authenticated and role-restricted routes are guarded in Vue Router.
- Registration, login, verification, forgot-password, reset-password, dashboard, and logout are usable from the frontend.
- `npm test` and `npm run build` pass.

## Self-Review

- Spec coverage: covers registration, email verification, login/logout, D1 sessions, `/api/me`, forgot/reset password, role foundations, Resend, frontend pages, guards, tests, and documentation.
- Placeholder scan: complete; no unresolved markers or vague implementation steps remain.
- Type consistency: `SessionUser`, `CurrentUser`, role names, cookie name, token lifetimes, endpoint paths, and response fields are consistent across backend, tests, and frontend.

## References

- Cloudflare recommends the Workers Vitest integration for Workers and Pages Functions and supports isolated local bindings: https://developers.cloudflare.com/workers/testing/vitest-integration/
- Current setup requires Vitest 4.1+ and `@cloudflare/vitest-pool-workers`: https://developers.cloudflare.com/workers/testing/vitest-integration/write-your-first-test/
- D1 migrations can be loaded into Vitest with `readD1Migrations`: https://developers.cloudflare.com/workers/testing/vitest-integration/configuration/
