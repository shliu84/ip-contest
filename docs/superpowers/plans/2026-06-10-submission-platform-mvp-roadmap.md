# Submission Platform MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the ASIA IP CONTEST in TOKYO 2026 MVP as a Cloudflare Pages full-stack submission platform with public homepage, authentication, draft submissions, Stripe sandbox payment, R2 uploads, and admin export.

**Architecture:** Keep the existing Vue/Vite app and add Vue Router for public, applicant, and admin routes. Add Cloudflare Pages Functions under `functions/api`, D1 schema/migrations for structured data, R2 for files and export ZIPs, Stripe for payment, and Resend for email. Implement the MVP as a sequence of small vertical plans so each stage remains deployable and reviewable.

**Tech Stack:** Vue 3, Vite, TypeScript, vue-router, Cloudflare Pages Functions, D1, R2, Stripe Checkout/Webhooks, Resend, npm scripts.

---

## Scope Split

The approved spec covers several independent subsystems. Implement it as six execution plans, in this order:

1. **Cloudflare foundation and routing shell**
   Create Cloudflare bindings/config documentation, D1 schema, shared API helpers, frontend routing, and page shells.
2. **Authentication and email verification**
   Implement register, login, logout, session cookies, email verification tokens, and Resend integration.
3. **Draft submissions and R2 uploads**
   Implement applicant dashboard, submission form, D1 persistence, R2 upload flow, and ownership checks.
4. **Stripe sandbox payment**
   Implement server-side pricing, Checkout Session creation, webhook verification, payment state changes, and success/cancel pages.
5. **Admin submission management**
   Implement admin list/detail views, role checks, status updates, and single-file signed downloads.
6. **Full ZIP export and launch documentation**
   Implement CSV + attachment ZIP generation to R2, export job tracking, README setup docs, and final verification.

Each execution plan should be saved as its own file under `docs/superpowers/plans/` before coding that stage.

---

## File Structure Map

### Existing Files To Preserve

- `src/App.vue`: currently assembles the public homepage. Convert it into a router shell while preserving current sections through a `HomePage` view.
- `src/components/*.vue`: keep existing section components and reuse them in `HomePage`.
- `src/i18n/translations.ts`: keep as the source for public homepage copy in the first stage.
- `src/styles/*.css`: keep global styles and extend with route/admin/form styles only where needed.
- `package.json`: add dependencies and scripts incrementally.

### New Frontend Files

- `src/router/index.ts`: route definitions and auth/role navigation guards.
- `src/views/HomePage.vue`: current homepage assembly.
- `src/views/auth/RegisterPage.vue`: registration form.
- `src/views/auth/LoginPage.vue`: login form.
- `src/views/auth/VerifyEmailPage.vue`: email verification result.
- `src/views/auth/ForgotPasswordPage.vue`: password reset request.
- `src/views/auth/ResetPasswordPage.vue`: password reset form.
- `src/views/applicant/DashboardPage.vue`: applicant submission list.
- `src/views/applicant/SubmissionEditorPage.vue`: draft editor.
- `src/views/applicant/PaymentPage.vue`: payment confirmation and Checkout start.
- `src/views/applicant/PaymentSuccessPage.vue`: post-payment success.
- `src/views/applicant/PaymentCancelPage.vue`: cancelled payment.
- `src/views/admin/AdminHomePage.vue`: admin landing page.
- `src/views/admin/AdminSubmissionsPage.vue`: admin submission table.
- `src/views/admin/AdminSubmissionDetailPage.vue`: admin detail page.
- `src/views/admin/AdminExportsPage.vue`: export jobs page.
- `src/views/admin/AdminUsersPage.vue`: role management shell.
- `src/services/api.ts`: typed API client wrapper around `fetch`.
- `src/stores/session.ts`: small Vue composable for current user state.
- `src/types/api.ts`: shared frontend API response types.

### New Cloudflare Backend Files

- `functions/api/health.ts`: deployment smoke-test endpoint.
- `functions/api/me.ts`: current session endpoint.
- `functions/api/auth/register.ts`: registration endpoint.
- `functions/api/auth/verify-email.ts`: email verification endpoint.
- `functions/api/auth/login.ts`: login endpoint.
- `functions/api/auth/logout.ts`: logout endpoint.
- `functions/api/auth/forgot-password.ts`: password reset request endpoint.
- `functions/api/auth/reset-password.ts`: password reset endpoint.
- `functions/api/submissions/index.ts`: list/create submissions.
- `functions/api/submissions/[id].ts`: read/update one submission.
- `functions/api/submissions/[id]/submit.ts`: validate and mark payment pending.
- `functions/api/submissions/[id]/upload-url.ts`: R2 upload URL or controlled upload metadata endpoint.
- `functions/api/submissions/[id]/files/[fileId].ts`: delete draft file.
- `functions/api/payments/checkout.ts`: Stripe Checkout creation.
- `functions/api/stripe/webhook.ts`: Stripe webhook.
- `functions/api/admin/submissions/index.ts`: admin submission list.
- `functions/api/admin/submissions/[id].ts`: admin submission detail.
- `functions/api/admin/submissions/[id]/status.ts`: admin status update.
- `functions/api/admin/files/[fileId]/download.ts`: signed file download.
- `functions/api/admin/exports/index.ts`: create/list export jobs.
- `functions/api/admin/exports/[id].ts`: export job status.
- `functions/api/admin/exports/[id]/download.ts`: signed export download.
- `functions/_lib/http.ts`: JSON responses, request parsing, error helpers.
- `functions/_lib/env.ts`: typed Cloudflare bindings.
- `functions/_lib/session.ts`: session cookie creation, parsing, and user loading.
- `functions/_lib/authz.ts`: role/ownership guards.
- `functions/_lib/password.ts`: password hashing and verification.
- `functions/_lib/tokens.ts`: random token generation and hashing.
- `functions/_lib/email.ts`: Resend email helpers.
- `functions/_lib/stripe.ts`: Stripe helpers and pricing.
- `functions/_lib/r2.ts`: R2 key and signed URL helpers.
- `functions/_lib/submissions.ts`: submission validation and mapping helpers.
- `functions/_lib/export.ts`: CSV and ZIP export helpers.

### New Data/Config Files

- `schema.sql`: D1 schema for MVP tables.
- `wrangler.toml.example`: example Cloudflare bindings, not real secrets.
- `.dev.vars.example`: local secret names with dummy values.
- `README.md`: replace Vite template with project setup and deployment instructions.

---

## Plan 1: Cloudflare Foundation And Routing Shell

This first execution plan creates the foundation that all later plans depend on. It should not implement real auth, payment, uploads, or admin data yet.

**Files:**

- Create: `schema.sql`
- Create: `wrangler.toml.example`
- Create: `.dev.vars.example`
- Create: `functions/_lib/http.ts`
- Create: `functions/_lib/env.ts`
- Create: `functions/api/health.ts`
- Create: `src/router/index.ts`
- Create: `src/views/HomePage.vue`
- Create: `src/views/auth/RegisterPage.vue`
- Create: `src/views/auth/LoginPage.vue`
- Create: `src/views/auth/VerifyEmailPage.vue`
- Create: `src/views/auth/ForgotPasswordPage.vue`
- Create: `src/views/auth/ResetPasswordPage.vue`
- Create: `src/views/applicant/DashboardPage.vue`
- Create: `src/views/applicant/SubmissionEditorPage.vue`
- Create: `src/views/applicant/PaymentPage.vue`
- Create: `src/views/applicant/PaymentSuccessPage.vue`
- Create: `src/views/applicant/PaymentCancelPage.vue`
- Create: `src/views/admin/AdminHomePage.vue`
- Create: `src/views/admin/AdminSubmissionsPage.vue`
- Create: `src/views/admin/AdminSubmissionDetailPage.vue`
- Create: `src/views/admin/AdminExportsPage.vue`
- Create: `src/views/admin/AdminUsersPage.vue`
- Create: `src/services/api.ts`
- Create: `src/stores/session.ts`
- Create: `src/types/api.ts`
- Modify: `package.json`
- Modify: `src/main.ts`
- Modify: `src/App.vue`
- Modify: `README.md`

### Task 1: Add Cloudflare Data Schema

- [ ] **Step 1: Create `schema.sql` with the MVP tables**

Use this schema exactly as the starting point:

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'committee', 'judge', 'super_admin')),
  email_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  submission_no TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'payment_pending', 'submitted', 'screening', 'screened_in', 'screened_out', 'assigned', 'reviewed', 'withdrawn')),
  division TEXT NOT NULL CHECK (division IN ('2d', '3d', 'ai', 'corporate')),
  fee_amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'JPY',
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TEXT,
  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_profiles (
  submission_id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  pen_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  country_region TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  prefecture TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  wechat_id TEXT NOT NULL DEFAULT '',
  certificate_language TEXT NOT NULL DEFAULT 'ja',
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_works (
  submission_id TEXT PRIMARY KEY,
  character_name TEXT NOT NULL DEFAULT '',
  theme_and_setting TEXT NOT NULL DEFAULT '',
  exhibition_info TEXT NOT NULL DEFAULT '',
  payer_name TEXT NOT NULL DEFAULT '',
  usage_permission INTEGER NOT NULL DEFAULT 0,
  terms_accepted INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS submission_files (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot', 'unedited_original_ai')),
  r2_key TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS export_jobs (
  id TEXT PRIMARY KEY,
  requested_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  r2_key TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  FOREIGN KEY (requested_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS judge_assignments (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL,
  judge_user_id TEXT NOT NULL,
  assigned_by TEXT NOT NULL,
  assigned_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (judge_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  assignment_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  comments TEXT NOT NULL DEFAULT '',
  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (assignment_id) REFERENCES judge_assignments(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS review_scores (
  id TEXT PRIMARY KEY,
  review_id TEXT NOT NULL,
  criterion_key TEXT NOT NULL,
  score INTEGER NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_files_submission_id ON submission_files(submission_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_requested_by ON export_jobs(requested_by);
```

- [ ] **Step 2: Validate the schema locally**

Run:

```bash
npx wrangler d1 execute asia-ip-contest-local --local --file schema.sql
```

Expected: command succeeds after the local D1 database name is created or configured. If the D1 database does not exist yet, create it in Cloudflare and document the binding before rerunning.

- [ ] **Step 3: Commit the schema**

Run:

```bash
git add schema.sql
git commit -m "feat: add D1 schema for submission platform"
```

### Task 2: Add Cloudflare Example Configuration

- [ ] **Step 1: Create `wrangler.toml.example`**

```toml
name = "ip-contest-2026"
compatibility_date = "2026-06-10"
pages_build_output_dir = "dist"

[[d1_databases]]
binding = "DB"
database_name = "asia-ip-contest-2026"
database_id = "replace-with-cloudflare-d1-id"

[[r2_buckets]]
binding = "SUBMISSION_BUCKET"
bucket_name = "asia-ip-contest-2026-submissions"
```

- [ ] **Step 2: Create `.dev.vars.example`**

```dotenv
SESSION_SECRET=replace-with-a-long-random-secret
STRIPE_SECRET_KEY=sk_test_replace_me
STRIPE_WEBHOOK_SECRET=whsec_replace_me
RESEND_API_KEY=re_replace_me
APP_BASE_URL=http://localhost:5173
```

- [ ] **Step 3: Commit the examples**

Run:

```bash
git add wrangler.toml.example .dev.vars.example
git commit -m "docs: add Cloudflare environment examples"
```

### Task 3: Add Shared Function Helpers And Health Endpoint

- [ ] **Step 1: Create `functions/_lib/env.ts`**

```ts
export type AppEnv = {
  DB: D1Database
  SUBMISSION_BUCKET: R2Bucket
  SESSION_SECRET: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  RESEND_API_KEY: string
  APP_BASE_URL: string
}
```

- [ ] **Step 2: Create `functions/_lib/http.ts`**

```ts
export type ApiErrorCode = 'bad_request' | 'unauthorized' | 'forbidden' | 'not_found' | 'server_error'

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  })
}

export function apiError(code: ApiErrorCode, message: string, status = 400) {
  return json({ error: { code, message } }, { status })
}

export async function readJson<T>(request: Request): Promise<T> {
  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    throw new Error('Expected application/json')
  }
  return request.json() as Promise<T>
}
```

- [ ] **Step 3: Create `functions/api/health.ts`**

```ts
import { json } from '../_lib/http'
import type { AppEnv } from '../_lib/env'

export const onRequestGet: PagesFunction<AppEnv> = async () => {
  return json({
    ok: true,
    service: 'ip-contest-2026',
  })
}
```

- [ ] **Step 4: Run the build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build succeed.

- [ ] **Step 5: Commit the API foundation**

Run:

```bash
git add functions/_lib/env.ts functions/_lib/http.ts functions/api/health.ts
git commit -m "feat: add Cloudflare function foundation"
```

### Task 4: Add Vue Router And Page Shells

- [ ] **Step 1: Install `vue-router`**

Run:

```bash
npm install vue-router
```

Expected: `package.json` and `package-lock.json` update with `vue-router`.

- [ ] **Step 2: Create `src/views/HomePage.vue` from the current homepage assembly**

```vue
<template>
  <main>
    <HeroSection :t="t" />
    <AboutSection :t="t" />
    <NewsSection :t="t" />
    <TimelineSection :t="t" />
    <TracksSection :t="t" />
    <JudgesSection :t="t" />
    <PrizesSection :t="t" />
  </main>
</template>

<script setup lang="ts">
import AboutSection from '../components/AboutSection.vue'
import HeroSection from '../components/HeroSection.vue'
import JudgesSection from '../components/JudgesSection.vue'
import NewsSection from '../components/NewsSection.vue'
import PrizesSection from '../components/PrizesSection.vue'
import TimelineSection from '../components/TimelineSection.vue'
import TracksSection from '../components/TracksSection.vue'
import type { TranslationKey } from '../i18n/translations'

defineProps<{
  t: (key: TranslationKey) => string
}>()
</script>
```

- [ ] **Step 3: Create route shell views**

Use this content for each shell view, changing the title text to match the route.

```vue
<template>
  <main class="section-padding container">
    <div class="sec-title">
      <span>Account</span>
      <h2>Register</h2>
    </div>
  </main>
</template>
```

Create these files and titles:

- `src/views/auth/RegisterPage.vue`: `Register`
- `src/views/auth/LoginPage.vue`: `Login`
- `src/views/auth/VerifyEmailPage.vue`: `Verify Email`
- `src/views/auth/ForgotPasswordPage.vue`: `Forgot Password`
- `src/views/auth/ResetPasswordPage.vue`: `Reset Password`
- `src/views/applicant/DashboardPage.vue`: `Dashboard`
- `src/views/applicant/SubmissionEditorPage.vue`: `Submission`
- `src/views/applicant/PaymentPage.vue`: `Payment`
- `src/views/applicant/PaymentSuccessPage.vue`: `Payment Complete`
- `src/views/applicant/PaymentCancelPage.vue`: `Payment Cancelled`
- `src/views/admin/AdminHomePage.vue`: `Admin`
- `src/views/admin/AdminSubmissionsPage.vue`: `Admin Submissions`
- `src/views/admin/AdminSubmissionDetailPage.vue`: `Submission Detail`
- `src/views/admin/AdminExportsPage.vue`: `Exports`
- `src/views/admin/AdminUsersPage.vue`: `Users`

- [ ] **Step 4: Create `src/router/index.ts`**

```ts
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import RegisterPage from '../views/auth/RegisterPage.vue'
import LoginPage from '../views/auth/LoginPage.vue'
import VerifyEmailPage from '../views/auth/VerifyEmailPage.vue'
import ForgotPasswordPage from '../views/auth/ForgotPasswordPage.vue'
import ResetPasswordPage from '../views/auth/ResetPasswordPage.vue'
import DashboardPage from '../views/applicant/DashboardPage.vue'
import SubmissionEditorPage from '../views/applicant/SubmissionEditorPage.vue'
import PaymentPage from '../views/applicant/PaymentPage.vue'
import PaymentSuccessPage from '../views/applicant/PaymentSuccessPage.vue'
import PaymentCancelPage from '../views/applicant/PaymentCancelPage.vue'
import AdminHomePage from '../views/admin/AdminHomePage.vue'
import AdminSubmissionsPage from '../views/admin/AdminSubmissionsPage.vue'
import AdminSubmissionDetailPage from '../views/admin/AdminSubmissionDetailPage.vue'
import AdminExportsPage from '../views/admin/AdminExportsPage.vue'
import AdminUsersPage from '../views/admin/AdminUsersPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/verify-email', name: 'verify-email', component: VerifyEmailPage },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPasswordPage },
    { path: '/reset-password', name: 'reset-password', component: ResetPasswordPage },
    { path: '/dashboard', name: 'dashboard', component: DashboardPage },
    { path: '/submissions/new', name: 'submission-new', component: SubmissionEditorPage },
    { path: '/submissions/:id', name: 'submission-edit', component: SubmissionEditorPage },
    { path: '/submissions/:id/payment', name: 'submission-payment', component: PaymentPage },
    { path: '/payment/success', name: 'payment-success', component: PaymentSuccessPage },
    { path: '/payment/cancel', name: 'payment-cancel', component: PaymentCancelPage },
    { path: '/admin', name: 'admin', component: AdminHomePage },
    { path: '/admin/submissions', name: 'admin-submissions', component: AdminSubmissionsPage },
    { path: '/admin/submissions/:id', name: 'admin-submission-detail', component: AdminSubmissionDetailPage },
    { path: '/admin/exports', name: 'admin-exports', component: AdminExportsPage },
    { path: '/admin/users', name: 'admin-users', component: AdminUsersPage },
  ],
})
```

- [ ] **Step 5: Modify `src/main.ts`**

```ts
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './router'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 6: Modify `src/App.vue` into a router shell**

```vue
<template>
  <canvas ref="canvasRef" id="lineCanvas"></canvas>

  <SiteHeader
    :current-language="currentLanguage"
    :set-language="setLanguage"
    :t="t"
  />

  <RouterView v-slot="{ Component }">
    <component :is="Component" :t="t" />
  </RouterView>

  <SiteFooter :t="t" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import { useLanguage } from './composables/useLanguage'
import { useRibbonCanvas } from './composables/useRibbonCanvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const { currentLanguage, setLanguage, t } = useLanguage()

useRibbonCanvas(canvasRef)
</script>
```

- [ ] **Step 7: Run build**

Run:

```bash
npm run build
```

Expected: build succeeds and homepage still compiles through `HomePage`.

- [ ] **Step 8: Commit router shell**

Run:

```bash
git add package.json package-lock.json src/main.ts src/App.vue src/router src/views
git commit -m "feat: add route shells for submission platform"
```

### Task 5: Add Minimal API Client And Session Types

- [ ] **Step 1: Create `src/types/api.ts`**

```ts
export type UserRole = 'applicant' | 'committee' | 'judge' | 'super_admin'

export type CurrentUser = {
  id: string
  email: string
  role: UserRole
  emailVerifiedAt: string | null
}

export type MeResponse = {
  user: CurrentUser | null
}
```

- [ ] **Step 2: Create `src/services/api.ts`**

```ts
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with ${response.status}`)
  }

  return response.json() as Promise<T>
}
```

- [ ] **Step 3: Create `src/stores/session.ts`**

```ts
import { readonly, ref } from 'vue'
import { apiFetch } from '../services/api'
import type { CurrentUser, MeResponse } from '../types/api'

const currentUser = ref<CurrentUser | null>(null)
const isLoadingSession = ref(false)

export function useSession() {
  async function loadSession() {
    isLoadingSession.value = true
    try {
      const data = await apiFetch<MeResponse>('/api/me')
      currentUser.value = data.user
    } finally {
      isLoadingSession.value = false
    }
  }

  return {
    currentUser: readonly(currentUser),
    isLoadingSession: readonly(isLoadingSession),
    loadSession,
  }
}
```

- [ ] **Step 4: Commit client foundation**

Run:

```bash
git add src/types/api.ts src/services/api.ts src/stores/session.ts
git commit -m "feat: add frontend API client foundation"
```

### Task 6: Replace README Template With Project Setup

- [ ] **Step 1: Update `README.md`**

```md
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

Run the frontend:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Cloudflare Setup

Copy examples before local Cloudflare work:

```bash
copy wrangler.toml.example wrangler.toml
copy .dev.vars.example .dev.vars
```

Fill in D1, R2, Stripe, Resend, and session values.

Apply the D1 schema:

```bash
npx wrangler d1 execute asia-ip-contest-2026 --file schema.sql
```

For local D1:

```bash
npx wrangler d1 execute asia-ip-contest-2026 --local --file schema.sql
```
```

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: build succeeds.

- [ ] **Step 3: Commit README**

Run:

```bash
git add README.md
git commit -m "docs: document submission platform setup"
```

---

## Follow-Up Plan Requirements

Before implementing each later subsystem, write a dedicated plan file with this same structure:

- `docs/superpowers/plans/2026-06-10-auth-email-verification.md`
- `docs/superpowers/plans/2026-06-10-draft-submissions-r2-uploads.md`
- `docs/superpowers/plans/2026-06-10-stripe-payment-flow.md`
- `docs/superpowers/plans/2026-06-10-admin-submission-management.md`
- `docs/superpowers/plans/2026-06-10-export-and-launch-docs.md`

Each plan must include exact files, test commands, verification steps, and commits.

---

## Self-Review

- Spec coverage: this roadmap covers the full approved MVP by splitting it into six executable plans. Plan 1 covers foundation, routing, schema, config examples, and setup docs.
- Placeholder scan: no task relies on undecided behavior. Later subsystem plans are named and bounded before implementation.
- Type consistency: role names, submission statuses, divisions, table names, and route names match the approved design spec.
