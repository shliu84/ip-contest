# Applicant Profile Prefill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build account-level applicant profiles, prefill new draft submissions from those profiles, and align submission file requirements with current guidelines.

**Architecture:** Add `user_profiles` as the account-level source of reusable applicant information while keeping `submission_profiles` as per-submission snapshots. Expose profile read/write through applicant-only APIs, copy profile values when creating drafts, and keep draft file upload semantics unchanged. Frontend changes extend registration, dashboard profile editing, and submission file groups using existing Vue/API patterns.

**Tech Stack:** Vue 3, TypeScript, Cloudflare Pages Functions, D1 migrations, R2, Vitest with Cloudflare Workers pool.

---

## File Structure Map

- Create: `migrations/0002_user_profiles.sql`
  Adds the account-level profile table.
- Modify: `schema.sql`
  Keeps the reference schema aligned with migrations.
- Create: `functions/_lib/profile.ts`
  Defines profile option constants, parsing, mapping, and D1 helpers.
- Create: `functions/api/profile.ts`
  Adds `GET /api/profile` and `PATCH /api/profile`.
- Modify: `functions/api/auth/register.ts`
  Accepts minimal applicant profile fields and creates `user_profiles`.
- Modify: `functions/api/submissions/index.ts`
  Copies account profile data into new `submission_profiles`.
- Modify: `functions/_lib/submissions.ts`
  Validates required files by division before payment.
- Modify: `src/types/api.ts`
  Adds profile request/response types and expanded registration type.
- Modify: `src/services/api.ts`
  Adds profile API client methods.
- Modify: `src/i18n/translations.ts`
  Adds labels for profile fields, selects, and terms link placeholder.
- Modify: `src/views/auth/RegisterPage.vue`
  Adds minimal profile fields to registration.
- Modify: `src/views/applicant/DashboardPage.vue`
  Adds applicant profile editor.
- Modify: `src/views/applicant/SubmissionEditorPage.vue`
  Makes file groups division-aware and adds terms placeholder link/panel.
- Test: `test/profile.spec.ts`
  Covers profile endpoints.
- Test: `test/register-verify.spec.ts`
  Covers registration profile row creation.
- Test: `test/submissions.spec.ts`
  Covers profile prefill and division-specific file validation.

## Shared Types And Values

Use these shared values consistently in backend and frontend.

```ts
export const COUNTRY_REGION_OPTIONS = [
  'JP',
  'CN',
  'TW',
  'HK',
  'KR',
  'SG',
  'TH',
  'ID',
  'MY',
  'PH',
  'VN',
  'OTHER',
] as const

export const PHONE_COUNTRY_CODE_OPTIONS = [
  '+81',
  '+86',
  '+886',
  '+852',
  '+82',
  '+65',
  '+66',
  '+62',
  '+60',
  '+63',
  '+84',
  'OTHER',
] as const

export const PREFECTURE_OPTIONS = [
  'outside_japan',
  'hokkaido',
  'aomori',
  'iwate',
  'miyagi',
  'akita',
  'yamagata',
  'fukushima',
  'ibaraki',
  'tochigi',
  'gunma',
  'saitama',
  'chiba',
  'tokyo',
  'kanagawa',
  'niigata',
  'toyama',
  'ishikawa',
  'fukui',
  'yamanashi',
  'nagano',
  'gifu',
  'shizuoka',
  'aichi',
  'mie',
  'shiga',
  'kyoto',
  'osaka',
  'hyogo',
  'nara',
  'wakayama',
  'tottori',
  'shimane',
  'okayama',
  'hiroshima',
  'yamaguchi',
  'tokushima',
  'kagawa',
  'ehime',
  'kochi',
  'fukuoka',
  'saga',
  'nagasaki',
  'kumamoto',
  'oita',
  'miyazaki',
  'kagoshima',
  'okinawa',
] as const

export const OCCUPATION_OPTIONS = [
  'student',
  'company_employee',
  'self_employed',
  'creator',
  'company_representative',
  'other',
] as const

export const CERTIFICATE_LANGUAGE_OPTIONS = ['ja', 'en', 'zh'] as const
```

### Task 1: Add User Profile Schema

**Files:**
- Create: `migrations/0002_user_profiles.sql`
- Modify: `schema.sql`

- [ ] **Step 1: Create the migration**

Add `migrations/0002_user_profiles.sql`:

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  last_name TEXT NOT NULL DEFAULT '',
  first_name TEXT NOT NULL DEFAULT '',
  last_name_kana TEXT NOT NULL DEFAULT '',
  first_name_kana TEXT NOT NULL DEFAULT '',
  pen_name TEXT NOT NULL DEFAULT '',
  country_region TEXT NOT NULL DEFAULT '',
  phone_country_code TEXT NOT NULL DEFAULT '',
  phone_number TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  prefecture TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  address_line1 TEXT NOT NULL DEFAULT '',
  address_line2 TEXT NOT NULL DEFAULT '',
  occupation TEXT NOT NULL DEFAULT '',
  school TEXT NOT NULL DEFAULT '',
  wechat_id TEXT NOT NULL DEFAULT '',
  certificate_language TEXT NOT NULL DEFAULT 'ja' CHECK (certificate_language IN ('ja', 'en', 'zh')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_country_region ON user_profiles(country_region);
```

- [ ] **Step 2: Update the reference schema**

Add the same `user_profiles` table to `schema.sql` immediately after the `sessions` table. Add the index near other indexes:

```sql
CREATE INDEX IF NOT EXISTS idx_user_profiles_country_region ON user_profiles(country_region);
```

- [ ] **Step 3: Run schema tests**

Run:

```bash
npm test -- test/migrations.spec.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add migrations/0002_user_profiles.sql schema.sql
git commit -m "Add applicant profile schema"
```

### Task 2: Add Backend Profile Helpers And API

**Files:**
- Create: `functions/_lib/profile.ts`
- Create: `functions/api/profile.ts`
- Create: `test/profile.spec.ts`

- [ ] **Step 1: Write failing profile API tests**

Create `test/profile.spec.ts`:

```ts
import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestGet, onRequestPatch } from '../functions/api/profile'
import { hashPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { pagesContext } from './helpers/pages-context'

type UserRole = 'applicant' | 'committee' | 'judge' | 'super_admin'

async function insertUser(role: UserRole = 'applicant') {
  const user = {
    id: crypto.randomUUID(),
    email: `${crypto.randomUUID()}@example.com`,
    password: 'correct horse battery staple',
    role,
  }
  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.id, user.email, await hashPassword(user.password), user.role, '2026-06-10T00:00:00.000Z')
    .run()
  return user
}

async function sessionCookie(userId: string) {
  const session = await createSession(env.DB, userId, 'https://contest.example.com')
  return session.cookie
}

async function getProfile(cookie?: string) {
  return await onRequestGet(pagesContext(new Request('https://contest.example.com/api/profile', {
    headers: cookie ? { cookie } : {},
  })))
}

async function patchProfile(cookie: string | undefined, body: unknown) {
  return await onRequestPatch(pagesContext(new Request('https://contest.example.com/api/profile', {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  })))
}

function validProfile() {
  return {
    lastName: '山田',
    firstName: '明',
    lastNameKana: 'ヤマダ',
    firstNameKana: 'アキ',
    penName: 'Aki',
    countryRegion: 'JP',
    phoneCountryCode: '+81',
    phoneNumber: '9012345678',
    postalCode: '106-0032',
    prefecture: 'tokyo',
    city: '港区',
    addressLine1: '六本木1-1-1',
    addressLine2: '101',
    occupation: 'student',
    school: 'Tokyo Art School',
    wechatId: '',
    certificateLanguage: 'ja',
  }
}

describe('/api/profile', () => {
  it('requires an applicant session', async () => {
    expect((await getProfile()).status).toBe(401)

    const committee = await insertUser('committee')
    const committeeCookie = await sessionCookie(committee.id)
    expect((await getProfile(committeeCookie)).status).toBe(403)
  })

  it('returns an empty default profile for legacy applicants', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    const response = await getProfile(cookie)

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      profile: {
        lastName: '',
        firstName: '',
        lastNameKana: '',
        firstNameKana: '',
        penName: '',
        countryRegion: '',
        phoneCountryCode: '',
        phoneNumber: '',
        postalCode: '',
        prefecture: '',
        city: '',
        addressLine1: '',
        addressLine2: '',
        occupation: '',
        school: '',
        wechatId: '',
        certificateLanguage: 'ja',
      },
    })
  })

  it('updates and returns the applicant profile', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)

    const response = await patchProfile(cookie, validProfile())

    expect(response.status).toBe(200)
    const body = await response.json() as { profile: ReturnType<typeof validProfile> }
    expect(body.profile).toEqual(validProfile())

    const row = await env.DB.prepare(
      `SELECT last_name, phone_country_code, updated_at
       FROM user_profiles
       WHERE user_id = ?`,
    )
      .bind(user.id)
      .first<{ last_name: string; phone_country_code: string; updated_at: string }>()
    expect(row?.last_name).toBe('山田')
    expect(row?.phone_country_code).toBe('+81')
    expect(row?.updated_at).toMatch(/^20/)
  })

  it('requires school when occupation is student', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const profile = { ...validProfile(), school: '' }

    const response = await patchProfile(cookie, profile)

    expect(response.status).toBe(400)
  })

  it('rejects unsupported select values', async () => {
    const user = await insertUser()
    const cookie = await sessionCookie(user.id)
    const profile = { ...validProfile(), countryRegion: 'MARS' }

    const response = await patchProfile(cookie, profile)

    expect(response.status).toBe(400)
  })
})
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test -- test/profile.spec.ts
```

Expected: FAIL because `functions/api/profile.ts` does not exist.

- [ ] **Step 3: Implement `functions/_lib/profile.ts`**

Create `functions/_lib/profile.ts`:

```ts
import { ApiRequestError } from './http'

export const COUNTRY_REGION_OPTIONS = ['JP', 'CN', 'TW', 'HK', 'KR', 'SG', 'TH', 'ID', 'MY', 'PH', 'VN', 'OTHER'] as const
export const PHONE_COUNTRY_CODE_OPTIONS = ['+81', '+86', '+886', '+852', '+82', '+65', '+66', '+62', '+60', '+63', '+84', 'OTHER'] as const
export const PREFECTURE_OPTIONS = [
  'outside_japan', 'hokkaido', 'aomori', 'iwate', 'miyagi', 'akita', 'yamagata', 'fukushima',
  'ibaraki', 'tochigi', 'gunma', 'saitama', 'chiba', 'tokyo', 'kanagawa', 'niigata', 'toyama',
  'ishikawa', 'fukui', 'yamanashi', 'nagano', 'gifu', 'shizuoka', 'aichi', 'mie', 'shiga',
  'kyoto', 'osaka', 'hyogo', 'nara', 'wakayama', 'tottori', 'shimane', 'okayama', 'hiroshima',
  'yamaguchi', 'tokushima', 'kagawa', 'ehime', 'kochi', 'fukuoka', 'saga', 'nagasaki',
  'kumamoto', 'oita', 'miyazaki', 'kagoshima', 'okinawa',
] as const
export const OCCUPATION_OPTIONS = ['student', 'company_employee', 'self_employed', 'creator', 'company_representative', 'other'] as const
export const CERTIFICATE_LANGUAGE_OPTIONS = ['ja', 'en', 'zh'] as const

export type ApplicantProfile = {
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  penName: string
  countryRegion: string
  phoneCountryCode: string
  phoneNumber: string
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2: string
  occupation: string
  school: string
  wechatId: string
  certificateLanguage: 'ja' | 'en' | 'zh'
}

type ProfileRow = {
  last_name: string
  first_name: string
  last_name_kana: string
  first_name_kana: string
  pen_name: string
  country_region: string
  phone_country_code: string
  phone_number: string
  postal_code: string
  prefecture: string
  city: string
  address_line1: string
  address_line2: string
  occupation: string
  school: string
  wechat_id: string
  certificate_language: string
}

export function emptyApplicantProfile(): ApplicantProfile {
  return {
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    penName: '',
    countryRegion: '',
    phoneCountryCode: '',
    phoneNumber: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    occupation: '',
    school: '',
    wechatId: '',
    certificateLanguage: 'ja',
  }
}

export function mapProfile(row: ProfileRow | null): ApplicantProfile {
  if (!row) {
    return emptyApplicantProfile()
  }
  return {
    lastName: row.last_name,
    firstName: row.first_name,
    lastNameKana: row.last_name_kana,
    firstNameKana: row.first_name_kana,
    penName: row.pen_name,
    countryRegion: row.country_region,
    phoneCountryCode: row.phone_country_code,
    phoneNumber: row.phone_number,
    postalCode: row.postal_code,
    prefecture: row.prefecture,
    city: row.city,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    occupation: row.occupation,
    school: row.school,
    wechatId: row.wechat_id,
    certificateLanguage: row.certificate_language === 'en' || row.certificate_language === 'zh' ? row.certificate_language : 'ja',
  }
}

export async function loadApplicantProfile(db: D1Database, userId: string) {
  const row = await db.prepare(
    `SELECT last_name, first_name, last_name_kana, first_name_kana, pen_name,
            country_region, phone_country_code, phone_number, postal_code,
            prefecture, city, address_line1, address_line2, occupation,
            school, wechat_id, certificate_language
     FROM user_profiles
     WHERE user_id = ?`,
  )
    .bind(userId)
    .first<ProfileRow>()
  return mapProfile(row ?? null)
}

export function parseApplicantProfile(value: unknown, mode: 'registration' | 'full'): ApplicantProfile {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new ApiRequestError('bad_request', 'Invalid profile body', 400)
  }
  const record = value as Record<string, unknown>
  const profile = {
    lastName: stringField(record, 'lastName').trim(),
    firstName: stringField(record, 'firstName').trim(),
    lastNameKana: stringField(record, 'lastNameKana', '').trim(),
    firstNameKana: stringField(record, 'firstNameKana', '').trim(),
    penName: stringField(record, 'penName', '').trim(),
    countryRegion: stringField(record, 'countryRegion').trim(),
    phoneCountryCode: stringField(record, 'phoneCountryCode').trim(),
    phoneNumber: stringField(record, 'phoneNumber').trim(),
    postalCode: stringField(record, 'postalCode', '').trim(),
    prefecture: stringField(record, 'prefecture', '').trim(),
    city: stringField(record, 'city', '').trim(),
    addressLine1: stringField(record, 'addressLine1', '').trim(),
    addressLine2: stringField(record, 'addressLine2', '').trim(),
    occupation: stringField(record, 'occupation', '').trim(),
    school: stringField(record, 'school', '').trim(),
    wechatId: stringField(record, 'wechatId', '').trim(),
    certificateLanguage: parseCertificateLanguage(record.certificateLanguage ?? 'ja'),
  }
  validateApplicantProfile(profile, mode)
  return profile
}

export function validateApplicantProfile(profile: ApplicantProfile, mode: 'registration' | 'full') {
  if (!profile.lastName || !profile.firstName || !profile.countryRegion || !profile.phoneCountryCode || !profile.phoneNumber) {
    throw new ApiRequestError('bad_request', 'Required profile fields are missing', 400)
  }
  if (!COUNTRY_REGION_OPTIONS.includes(profile.countryRegion as typeof COUNTRY_REGION_OPTIONS[number])) {
    throw new ApiRequestError('bad_request', 'Invalid country or region', 400)
  }
  if (!PHONE_COUNTRY_CODE_OPTIONS.includes(profile.phoneCountryCode as typeof PHONE_COUNTRY_CODE_OPTIONS[number])) {
    throw new ApiRequestError('bad_request', 'Invalid phone country code', 400)
  }
  if (mode === 'full') {
    if (profile.prefecture && !PREFECTURE_OPTIONS.includes(profile.prefecture as typeof PREFECTURE_OPTIONS[number])) {
      throw new ApiRequestError('bad_request', 'Invalid prefecture', 400)
    }
    if (profile.occupation && !OCCUPATION_OPTIONS.includes(profile.occupation as typeof OCCUPATION_OPTIONS[number])) {
      throw new ApiRequestError('bad_request', 'Invalid occupation', 400)
    }
    if (profile.occupation === 'student' && !profile.school) {
      throw new ApiRequestError('bad_request', 'School is required for students', 400)
    }
  }
}

export async function upsertApplicantProfile(db: D1Database, userId: string, profile: ApplicantProfile) {
  const nowIso = new Date().toISOString()
  await db.prepare(
    `INSERT INTO user_profiles (
       user_id, last_name, first_name, last_name_kana, first_name_kana, pen_name,
       country_region, phone_country_code, phone_number, postal_code, prefecture,
       city, address_line1, address_line2, occupation, school, wechat_id,
       certificate_language, created_at, updated_at
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       last_name = excluded.last_name,
       first_name = excluded.first_name,
       last_name_kana = excluded.last_name_kana,
       first_name_kana = excluded.first_name_kana,
       pen_name = excluded.pen_name,
       country_region = excluded.country_region,
       phone_country_code = excluded.phone_country_code,
       phone_number = excluded.phone_number,
       postal_code = excluded.postal_code,
       prefecture = excluded.prefecture,
       city = excluded.city,
       address_line1 = excluded.address_line1,
       address_line2 = excluded.address_line2,
       occupation = excluded.occupation,
       school = excluded.school,
       wechat_id = excluded.wechat_id,
       certificate_language = excluded.certificate_language,
       updated_at = excluded.updated_at`,
  )
    .bind(
      userId, profile.lastName, profile.firstName, profile.lastNameKana, profile.firstNameKana,
      profile.penName, profile.countryRegion, profile.phoneCountryCode, profile.phoneNumber,
      profile.postalCode, profile.prefecture, profile.city, profile.addressLine1,
      profile.addressLine2, profile.occupation, profile.school, profile.wechatId,
      profile.certificateLanguage, nowIso, nowIso,
    )
    .run()
  return await loadApplicantProfile(db, userId)
}

export function profilePhone(profile: ApplicantProfile) {
  return [profile.phoneCountryCode, profile.phoneNumber].filter(Boolean).join(' ')
}

export function profileAddress(profile: ApplicantProfile) {
  return [profile.addressLine1, profile.addressLine2].filter(Boolean).join(' ')
}

function stringField(record: Record<string, unknown>, field: string, fallback?: string) {
  const value = record[field]
  if (value === undefined && fallback !== undefined) {
    return fallback
  }
  if (typeof value !== 'string') {
    throw new ApiRequestError('bad_request', 'Invalid profile body', 400)
  }
  return value
}

function parseCertificateLanguage(value: unknown): ApplicantProfile['certificateLanguage'] {
  if (value === 'ja' || value === 'en' || value === 'zh') {
    return value
  }
  throw new ApiRequestError('bad_request', 'Invalid certificate language', 400)
}
```

- [ ] **Step 4: Implement `functions/api/profile.ts`**

Create `functions/api/profile.ts`:

```ts
import type { AppEnv } from '../_lib/env'
import { requireApplicant } from '../_lib/authz'
import { handleApi, json, readJson } from '../_lib/http'
import {
  loadApplicantProfile,
  parseApplicantProfile,
  upsertApplicantProfile,
} from '../_lib/profile'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const profile = await loadApplicantProfile(context.env.DB, user.id)
    return json({ profile }, { headers: NO_STORE_HEADERS })
  })
}

export const onRequestPatch: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = await readJson<unknown>(context.request)
    const profile = parseApplicantProfile(body, 'full')
    const savedProfile = await upsertApplicantProfile(context.env.DB, user.id, profile)
    return json({ profile: savedProfile }, { headers: NO_STORE_HEADERS })
  })
}
```

- [ ] **Step 5: Run the profile tests**

Run:

```bash
npm test -- test/profile.spec.ts
```

Expected: PASS.

- [ ] **Step 6: Run function typecheck**

Run:

```bash
npm run build
```

Expected: PASS. If it fails due to unused imports in `functions/_lib/profile.ts`, remove the imports TypeScript names.

- [ ] **Step 7: Commit**

```bash
git add functions/_lib/profile.ts functions/api/profile.ts test/profile.spec.ts
git commit -m "Add applicant profile API"
```

### Task 3: Extend Registration To Create Profiles

**Files:**
- Modify: `functions/api/auth/register.ts`
- Modify: `test/register-verify.spec.ts`

- [ ] **Step 1: Update registration tests to require profile fields**

In `test/register-verify.spec.ts`, add this helper near `registerAndToken`:

```ts
function registrationBody(email = 'new.applicant@example.com') {
  return {
    email,
    password: 'correct horse battery staple',
    lastName: '山田',
    firstName: '明',
    countryRegion: 'JP',
    phoneCountryCode: '+81',
    phoneNumber: '9012345678',
  }
}
```

Replace existing successful registration bodies with `registrationBody(...)`. For example:

```ts
const response = await register(registrationBody('  New.Applicant@Example.COM '))
```

Add this type:

```ts
type UserProfileRow = {
  user_id: string
  last_name: string
  first_name: string
  country_region: string
  phone_country_code: string
  phone_number: string
}
```

Add this helper:

```ts
async function firstUserProfile(userId: string) {
  return await env.DB.prepare(
    `SELECT user_id, last_name, first_name, country_region, phone_country_code, phone_number
     FROM user_profiles
     WHERE user_id = ?`,
  )
    .bind(userId)
    .first<UserProfileRow>()
}
```

In the first successful registration test, after loading `user`, assert:

```ts
const profile = await firstUserProfile(user!.id)
expect(profile).toMatchObject({
  user_id: user!.id,
  last_name: '山田',
  first_name: '明',
  country_region: 'JP',
  phone_country_code: '+81',
  phone_number: '9012345678',
})
```

Add a new test:

```ts
it('rejects registrations without required applicant profile fields', async () => {
  stubResend()

  const response = await register({
    email: 'missing-profile@example.com',
    password: 'correct horse battery staple',
  })

  expect(response.status).toBe(400)
  expect(fetch).not.toHaveBeenCalled()
})
```

- [ ] **Step 2: Run registration tests to verify failure**

Run:

```bash
npm test -- test/register-verify.spec.ts
```

Expected: FAIL because registration still ignores profile fields and tests expect profile rows.

- [ ] **Step 3: Update `functions/api/auth/register.ts`**

Import the profile helpers:

```ts
import {
  parseApplicantProfile,
} from '../../_lib/profile'
```

Change `RegisterBody`:

```ts
type RegisterBody = {
  email?: unknown
  password?: unknown
  lastName?: unknown
  firstName?: unknown
  countryRegion?: unknown
  phoneCountryCode?: unknown
  phoneNumber?: unknown
}
```

After password validation, parse the profile:

```ts
const profile = parseApplicantProfile(body, 'registration')
```

Add a `user_profiles` insert to the existing `DB.batch` between the `users` insert and token insert:

```ts
context.env.DB.prepare(
  `INSERT INTO user_profiles (
     user_id,
     last_name,
     first_name,
     country_region,
     phone_country_code,
     phone_number,
     certificate_language,
     created_at,
     updated_at
   )
   VALUES (?, ?, ?, ?, ?, ?, 'ja', ?, ?)`,
).bind(
  userId,
  profile.lastName,
  profile.firstName,
  profile.countryRegion,
  profile.phoneCountryCode,
  profile.phoneNumber,
  nowIso,
  nowIso,
),
```

- [ ] **Step 4: Run registration tests**

Run:

```bash
npm test -- test/register-verify.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/api/auth/register.ts test/register-verify.spec.ts
git commit -m "Collect applicant profile at registration"
```

### Task 4: Prefill Draft Submissions From Account Profile

**Files:**
- Modify: `functions/api/submissions/index.ts`
- Modify: `test/submissions.spec.ts`

- [ ] **Step 1: Add failing prefill tests**

In `test/submissions.spec.ts`, add this helper:

```ts
async function insertUserProfile(userId: string) {
  await env.DB.prepare(
    `INSERT INTO user_profiles (
       user_id, last_name, first_name, pen_name, country_region,
       phone_country_code, phone_number, postal_code, prefecture, city,
       address_line1, address_line2, occupation, school, wechat_id,
       certificate_language
     )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      userId,
      '山田',
      '明',
      'Aki',
      'JP',
      '+81',
      '9012345678',
      '106-0032',
      'tokyo',
      '港区',
      '六本木1-1-1',
      '101',
      'student',
      'Tokyo Art School',
      'wechat-aki',
      'ja',
    )
    .run()
}
```

Add this test in the `/api/submissions` describe block:

```ts
it('prefills new draft submission profiles from the applicant account profile', async () => {
  const user = await insertUser()
  await insertUserProfile(user.id)
  const cookie = await sessionCookie(user.id)

  const response = await createSubmission(cookie, { division: '2d' })

  expect(response.status).toBe(201)
  const body = await jsonBody<SubmissionResponseBody>(response)
  expect(body.submission.profile).toMatchObject({
    lastName: '山田',
    firstName: '明',
    penName: 'Aki',
    email: user.email,
    phone: '+81 9012345678',
    countryRegion: 'JP',
    city: '港区',
    postalCode: '106-0032',
    prefecture: 'tokyo',
    occupation: 'student',
    school: 'Tokyo Art School',
    address: '六本木1-1-1 101',
    wechatId: 'wechat-aki',
    certificateLanguage: 'ja',
  })
})

it('keeps existing draft profile snapshots when the account profile changes', async () => {
  const user = await insertUser()
  await insertUserProfile(user.id)
  const cookie = await sessionCookie(user.id)
  const createResponse = await createSubmission(cookie, { division: '2d' })
  const createBody = await jsonBody<SubmissionResponseBody>(createResponse)

  await env.DB.prepare(
    `UPDATE user_profiles SET last_name = '佐藤' WHERE user_id = ?`,
  )
    .bind(user.id)
    .run()

  const response = await getSubmission(createBody.submission.id, cookie)
  const body = await jsonBody<SubmissionResponseBody>(response)
  expect(body.submission.profile.lastName).toBe('山田')
})
```

- [ ] **Step 2: Run submission tests to verify failure**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: FAIL because draft creation only inserts email into `submission_profiles`.

- [ ] **Step 3: Update draft creation**

In `functions/api/submissions/index.ts`, import:

```ts
import {
  loadApplicantProfile,
  profileAddress,
  profilePhone,
} from '../../_lib/profile'
```

Before creating `submissionId`, load the profile:

```ts
const profile = await loadApplicantProfile(context.env.DB, user.id)
```

Replace the `INSERT INTO submission_profiles (submission_id, email)` statement with:

```ts
context.env.DB.prepare(
  `INSERT INTO submission_profiles (
     submission_id,
     last_name,
     first_name,
     pen_name,
     email,
     phone,
     country_region,
     city,
     postal_code,
     prefecture,
     occupation,
     school,
     address,
     wechat_id,
     certificate_language
   )
   SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
   WHERE EXISTS (
     SELECT 1
     FROM submissions
     WHERE id = ? AND user_id = ?
   )`,
).bind(
  submissionId,
  profile.lastName,
  profile.firstName,
  profile.penName,
  user.email,
  profilePhone(profile),
  profile.countryRegion,
  profile.city,
  profile.postalCode,
  profile.prefecture,
  profile.occupation,
  profile.school,
  profileAddress(profile),
  profile.wechatId,
  profile.certificateLanguage,
  submissionId,
  user.id,
),
```

- [ ] **Step 4: Run submission tests**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/api/submissions/index.ts test/submissions.spec.ts
git commit -m "Prefill drafts from applicant profiles"
```

### Task 5: Enforce Division-Specific File Requirements

**Files:**
- Modify: `functions/_lib/submissions.ts`
- Modify: `functions/api/submissions/[id]/submit.ts`
- Modify: `test/submissions.spec.ts`

- [ ] **Step 1: Add failing file requirement tests**

In `test/submissions.spec.ts`, replace `createCompleteDraft` with a version that uploads all required default files:

```ts
async function uploadFileOfType(submissionId: string, cookie: string, fileType: string, filename = `${fileType}.png`) {
  await uploadSubmissionFile(submissionId, cookie, {
    fileType,
    filename,
    contentType: 'image/png',
    dataBase64: btoa(`${fileType}-bytes`),
  })
}

async function createCompleteDraft(cookie: string, email: string, division = '2d') {
  const createResponse = await createSubmission(cookie, { division })
  const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
  await updateSubmission(createBody.submission.id, cookie, {
    ...completeSubmissionUpdate(email),
    division,
  })
  await uploadFileOfType(createBody.submission.id, cookie, 'online_a4_image')
  await uploadFileOfType(createBody.submission.id, cookie, 'physical_a2_image')
  await uploadFileOfType(createBody.submission.id, cookie, 'process_or_prompt_screenshot')
  return createBody.submission.id
}
```

Add tests:

```ts
it('requires all guideline files before moving a 2d draft to payment pending', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const createResponse = await createSubmission(cookie, { division: '2d' })
  const createBody = await jsonBody<SubmissionResponseBody>(createResponse)
  await updateSubmission(createBody.submission.id, cookie, completeSubmissionUpdate(user.email))
  await uploadFileOfType(createBody.submission.id, cookie, 'online_a4_image')

  const response = await submitSubmission(createBody.submission.id, cookie)

  expect(response.status).toBe(400)
})

it('accepts ai drafts with A4, A2, and prompt or process screenshot files', async () => {
  const user = await insertUser()
  const cookie = await sessionCookie(user.id)
  const submissionId = await createCompleteDraft(cookie, user.email, 'ai')

  const response = await submitSubmission(submissionId, cookie)

  expect(response.status).toBe(200)
  const body = await jsonBody<SubmissionResponseBody>(response)
  expect(body.submission.status).toBe('payment_pending')
})
```

- [ ] **Step 2: Run submission tests to verify failure**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: FAIL because current validation only requires at least one file.

- [ ] **Step 3: Update `functions/_lib/submissions.ts`**

Add:

```ts
export const REQUIRED_FILE_TYPES_BY_DIVISION: Record<SubmissionDivision, string[]> = {
  '2d': ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot'],
  '3d': ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot'],
  ai: ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot'],
  corporate: ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot'],
}

export function missingRequiredFileTypes(submission: SubmissionModel) {
  const uploadedTypes = new Set(submission.files.map((file) => file.fileType))
  return REQUIRED_FILE_TYPES_BY_DIVISION[submission.division].filter((fileType) => !uploadedTypes.has(fileType))
}
```

Update `assertReadyForPayment`:

```ts
export function assertReadyForPayment(submission: SubmissionModel) {
  if (
    !hasText(submission.profile.lastName)
    || !hasText(submission.profile.firstName)
    || !hasText(submission.profile.email)
    || !hasText(submission.profile.countryRegion)
    || !hasText(submission.profile.phone)
    || !hasText(submission.work.characterName)
    || !hasText(submission.work.themeAndSetting)
    || !hasText(submission.work.payerName)
    || !submission.work.usagePermission
    || !submission.work.termsAccepted
    || missingRequiredFileTypes(submission).length > 0
  ) {
    throw new ApiRequestError('bad_request', 'Submission is incomplete', 400)
  }
}
```

- [ ] **Step 4: Run submission tests**

Run:

```bash
npm test -- test/submissions.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add functions/_lib/submissions.ts test/submissions.spec.ts
git commit -m "Validate required submission files"
```

### Task 6: Add Frontend Types And API Methods

**Files:**
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`

- [ ] **Step 1: Update frontend API types**

In `src/types/api.ts`, add:

```ts
export type ApplicantProfile = {
  lastName: string
  firstName: string
  lastNameKana: string
  firstNameKana: string
  penName: string
  countryRegion: string
  phoneCountryCode: string
  phoneNumber: string
  postalCode: string
  prefecture: string
  city: string
  addressLine1: string
  addressLine2: string
  occupation: string
  school: string
  wechatId: string
  certificateLanguage: CertificateLanguage
}

export type ProfileResponse = {
  profile: ApplicantProfile
}
```

Change `RegisterRequest` to:

```ts
export type RegisterRequest = {
  email: string
  password: string
  lastName: string
  firstName: string
  countryRegion: string
  phoneCountryCode: string
  phoneNumber: string
}
```

- [ ] **Step 2: Add API client methods**

In `src/services/api.ts`, import `ApplicantProfile` and `ProfileResponse`, then add:

```ts
export function getProfile() {
  return apiFetch<ProfileResponse>('/api/profile')
}

export function updateProfile(body: ApplicantProfile) {
  return apiFetch<ProfileResponse>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
```

- [ ] **Step 3: Run typecheck**

Run:

```bash
npm run build
```

Expected: FAIL until frontend call sites are updated in later tasks. If this is being implemented task-by-task with commits, use `npm run test:typecheck` now and expect imported type errors only if names are mistyped.

- [ ] **Step 4: Commit after later frontend tasks**

Do not commit this task independently if `npm run build` fails because registration is not updated yet. Carry these changes into Task 7.

### Task 7: Update Registration UI

**Files:**
- Modify: `src/views/auth/RegisterPage.vue`
- Modify: `src/i18n/translations.ts`
- Modify: `src/types/api.ts`
- Modify: `src/services/api.ts`

- [ ] **Step 1: Add translation keys**

In `src/i18n/translations.ts`, add keys to the `TranslationKey` union:

```ts
| 'registerApplicantTitle'
| 'countryRegionLabel'
| 'phoneCountryCodeLabel'
| 'phoneNumberLabel'
| 'countryRegionJapan'
| 'countryRegionChina'
| 'countryRegionTaiwan'
| 'countryRegionHongKong'
| 'countryRegionKorea'
| 'countryRegionOther'
```

Add Japanese values:

```ts
registerApplicantTitle: '応募者情報',
countryRegionLabel: '国 / 地域',
phoneCountryCodeLabel: '国番号',
phoneNumberLabel: '電話番号',
countryRegionJapan: '日本',
countryRegionChina: '中国',
countryRegionTaiwan: '台湾',
countryRegionHongKong: '香港',
countryRegionKorea: '韓国',
countryRegionOther: 'その他',
```

Add Chinese and English equivalents in the existing `zh` and `en` blocks.

- [ ] **Step 2: Update `RegisterPage.vue` state**

Add refs:

```ts
const lastName = ref('')
const firstName = ref('')
const countryRegion = ref('JP')
const phoneCountryCode = ref('+81')
const phoneNumber = ref('')

const countryRegionOptions = [
  { value: 'JP', labelKey: 'countryRegionJapan' },
  { value: 'CN', labelKey: 'countryRegionChina' },
  { value: 'TW', labelKey: 'countryRegionTaiwan' },
  { value: 'HK', labelKey: 'countryRegionHongKong' },
  { value: 'KR', labelKey: 'countryRegionKorea' },
  { value: 'OTHER', labelKey: 'countryRegionOther' },
] as const

const phoneCountryCodeOptions = ['+81', '+86', '+886', '+852', '+82', 'OTHER'] as const
```

- [ ] **Step 3: Update `RegisterPage.vue` template**

Add this field group after confirm password:

```vue
<div class="dashboard-section-heading">
  <h3>{{ t('registerApplicantTitle') }}</h3>
</div>

<div class="form-grid">
  <div class="form-field">
    <label for="register-last-name">{{ t('profileLastNameLabel') }}</label>
    <input id="register-last-name" v-model="lastName" autocomplete="family-name" type="text" required :disabled="isPending">
  </div>

  <div class="form-field">
    <label for="register-first-name">{{ t('profileFirstNameLabel') }}</label>
    <input id="register-first-name" v-model="firstName" autocomplete="given-name" type="text" required :disabled="isPending">
  </div>

  <div class="form-field">
    <label for="register-country-region">{{ t('countryRegionLabel') }}</label>
    <select id="register-country-region" v-model="countryRegion" required :disabled="isPending">
      <option v-for="option in countryRegionOptions" :key="option.value" :value="option.value">
        {{ t(option.labelKey) }}
      </option>
    </select>
  </div>

  <div class="form-field">
    <label for="register-phone-country-code">{{ t('phoneCountryCodeLabel') }}</label>
    <select id="register-phone-country-code" v-model="phoneCountryCode" required :disabled="isPending">
      <option v-for="code in phoneCountryCodeOptions" :key="code" :value="code">{{ code }}</option>
    </select>
  </div>

  <div class="form-field">
    <label for="register-phone-number">{{ t('phoneNumberLabel') }}</label>
    <input id="register-phone-number" v-model="phoneNumber" autocomplete="tel-national" type="tel" required :disabled="isPending">
  </div>
</div>
```

- [ ] **Step 4: Update register call**

Change:

```ts
await register({
  email: email.value,
  password: password.value,
})
```

to:

```ts
await register({
  email: email.value,
  password: password.value,
  lastName: lastName.value,
  firstName: firstName.value,
  countryRegion: countryRegion.value,
  phoneCountryCode: phoneCountryCode.value,
  phoneNumber: phoneNumber.value,
})
```

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/api.ts src/services/api.ts src/i18n/translations.ts src/views/auth/RegisterPage.vue
git commit -m "Add applicant fields to registration"
```

### Task 8: Add Dashboard Profile Editor

**Files:**
- Modify: `src/views/applicant/DashboardPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add translations**

Add keys:

```ts
| 'profileSectionTitle'
| 'profileSectionLead'
| 'profileSave'
| 'profileSavePending'
| 'profileSaveSuccess'
| 'profileLoadError'
| 'profileSaveError'
| 'profileLastNameKanaLabel'
| 'profileFirstNameKanaLabel'
| 'profileAddressLine1Label'
| 'profileAddressLine2Label'
| 'occupationStudent'
| 'occupationCompanyEmployee'
| 'occupationSelfEmployed'
| 'occupationCreator'
| 'occupationCompanyRepresentative'
| 'occupationOther'
```

Add values for each language. Japanese examples:

```ts
profileSectionTitle: 'アカウント情報',
profileSectionLead: '新しい応募作品に自動入力される応募者情報を管理できます。',
profileSave: 'アカウント情報を保存',
profileSavePending: '保存中...',
profileSaveSuccess: 'アカウント情報を保存しました。',
profileLoadError: 'アカウント情報を読み込めませんでした。',
profileSaveError: 'アカウント情報を保存できませんでした。',
profileLastNameKanaLabel: '姓（カナ）',
profileFirstNameKanaLabel: '名（カナ）',
profileAddressLine1Label: '住所',
profileAddressLine2Label: '建物名・部屋番号',
occupationStudent: '学生',
occupationCompanyEmployee: '会社員',
occupationSelfEmployed: '自営業',
occupationCreator: 'クリエイター',
occupationCompanyRepresentative: '法人代表者',
occupationOther: 'その他',
```

- [ ] **Step 2: Add profile state to `DashboardPage.vue`**

Import:

```ts
import { getProfile, updateProfile } from '../../services/api'
import type { ApplicantProfile } from '../../types/api'
```

Add state:

```ts
const profile = ref<ApplicantProfile>(emptyProfile())
const isLoadingProfile = ref(false)
const isSavingProfile = ref(false)
const profileError = ref('')
const profileSuccess = ref('')

const prefectureOptions = [
  { value: '', label: '' },
  { value: 'outside_japan', label: 'Outside Japan' },
  { value: 'hokkaido', label: '北海道' },
  { value: 'aomori', label: '青森県' },
  { value: 'iwate', label: '岩手県' },
  { value: 'miyagi', label: '宮城県' },
  { value: 'akita', label: '秋田県' },
  { value: 'yamagata', label: '山形県' },
  { value: 'fukushima', label: '福島県' },
  { value: 'ibaraki', label: '茨城県' },
  { value: 'tochigi', label: '栃木県' },
  { value: 'gunma', label: '群馬県' },
  { value: 'saitama', label: '埼玉県' },
  { value: 'chiba', label: '千葉県' },
  { value: 'tokyo', label: '東京都' },
  { value: 'kanagawa', label: '神奈川県' },
  { value: 'niigata', label: '新潟県' },
  { value: 'toyama', label: '富山県' },
  { value: 'ishikawa', label: '石川県' },
  { value: 'fukui', label: '福井県' },
  { value: 'yamanashi', label: '山梨県' },
  { value: 'nagano', label: '長野県' },
  { value: 'gifu', label: '岐阜県' },
  { value: 'shizuoka', label: '静岡県' },
  { value: 'aichi', label: '愛知県' },
  { value: 'mie', label: '三重県' },
  { value: 'shiga', label: '滋賀県' },
  { value: 'kyoto', label: '京都府' },
  { value: 'osaka', label: '大阪府' },
  { value: 'hyogo', label: '兵庫県' },
  { value: 'nara', label: '奈良県' },
  { value: 'wakayama', label: '和歌山県' },
  { value: 'tottori', label: '鳥取県' },
  { value: 'shimane', label: '島根県' },
  { value: 'okayama', label: '岡山県' },
  { value: 'hiroshima', label: '広島県' },
  { value: 'yamaguchi', label: '山口県' },
  { value: 'tokushima', label: '徳島県' },
  { value: 'kagawa', label: '香川県' },
  { value: 'ehime', label: '愛媛県' },
  { value: 'kochi', label: '高知県' },
  { value: 'fukuoka', label: '福岡県' },
  { value: 'saga', label: '佐賀県' },
  { value: 'nagasaki', label: '長崎県' },
  { value: 'kumamoto', label: '熊本県' },
  { value: 'oita', label: '大分県' },
  { value: 'miyazaki', label: '宮崎県' },
  { value: 'kagoshima', label: '鹿児島県' },
  { value: 'okinawa', label: '沖縄県' },
] as const

function emptyProfile(): ApplicantProfile {
  return {
    lastName: '',
    firstName: '',
    lastNameKana: '',
    firstNameKana: '',
    penName: '',
    countryRegion: '',
    phoneCountryCode: '',
    phoneNumber: '',
    postalCode: '',
    prefecture: '',
    city: '',
    addressLine1: '',
    addressLine2: '',
    occupation: '',
    school: '',
    wechatId: '',
    certificateLanguage: 'ja',
  }
}
```

Update `onMounted`:

```ts
onMounted(() => {
  if (isApplicant.value) {
    void loadProfile()
    void loadSubmissions()
  }
})
```

Add methods:

```ts
async function loadProfile() {
  profileError.value = ''
  isLoadingProfile.value = true
  try {
    const response = await getProfile()
    profile.value = response.profile
  } catch (error) {
    profileError.value = translatedError(error, 'profileLoadError')
  } finally {
    isLoadingProfile.value = false
  }
}

async function saveProfile() {
  profileError.value = ''
  profileSuccess.value = ''
  isSavingProfile.value = true
  try {
    const response = await updateProfile(profile.value)
    profile.value = response.profile
    profileSuccess.value = props.t('profileSaveSuccess')
  } catch (error) {
    profileError.value = translatedError(error, 'profileSaveError')
  } finally {
    isSavingProfile.value = false
  }
}
```

- [ ] **Step 3: Add the profile editor template**

Add this section below the summary and above dashboard actions:

```vue
<section v-if="isApplicant" class="dashboard-submissions" :aria-label="t('profileSectionTitle')">
  <div class="dashboard-section-heading">
    <h3>{{ t('profileSectionTitle') }}</h3>
    <p>{{ t('profileSectionLead') }}</p>
  </div>

  <p v-if="isLoadingProfile" class="form-success" role="status" aria-live="polite">
    {{ t('submissionEditorLoading') }}
  </p>
  <p v-if="profileError" class="form-error" role="alert" aria-live="polite">{{ profileError }}</p>
  <p v-if="profileSuccess" class="form-success" role="status" aria-live="polite">{{ profileSuccess }}</p>

  <form v-if="!isLoadingProfile" class="auth-form" @submit.prevent="saveProfile">
    <div class="form-grid">
      <div class="form-field">
        <label for="profile-account-last-name">{{ t('profileLastNameLabel') }}</label>
        <input id="profile-account-last-name" v-model="profile.lastName" type="text" required :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-first-name">{{ t('profileFirstNameLabel') }}</label>
        <input id="profile-account-first-name" v-model="profile.firstName" type="text" required :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-last-name-kana">{{ t('profileLastNameKanaLabel') }}</label>
        <input id="profile-account-last-name-kana" v-model="profile.lastNameKana" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-first-name-kana">{{ t('profileFirstNameKanaLabel') }}</label>
        <input id="profile-account-first-name-kana" v-model="profile.firstNameKana" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-pen-name">{{ t('profilePenNameLabel') }}</label>
        <input id="profile-account-pen-name" v-model="profile.penName" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-country-region">{{ t('countryRegionLabel') }}</label>
        <select id="profile-account-country-region" v-model="profile.countryRegion" required :disabled="isSavingProfile">
          <option value="JP">{{ t('countryRegionJapan') }}</option>
          <option value="CN">{{ t('countryRegionChina') }}</option>
          <option value="TW">{{ t('countryRegionTaiwan') }}</option>
          <option value="HK">{{ t('countryRegionHongKong') }}</option>
          <option value="KR">{{ t('countryRegionKorea') }}</option>
          <option value="OTHER">{{ t('countryRegionOther') }}</option>
        </select>
      </div>
      <div class="form-field">
        <label for="profile-account-phone-code">{{ t('phoneCountryCodeLabel') }}</label>
        <select id="profile-account-phone-code" v-model="profile.phoneCountryCode" required :disabled="isSavingProfile">
          <option value="+81">Japan (+81)</option>
          <option value="+86">China (+86)</option>
          <option value="+886">Taiwan (+886)</option>
          <option value="+852">Hong Kong (+852)</option>
          <option value="+82">Korea (+82)</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      <div class="form-field">
        <label for="profile-account-phone-number">{{ t('phoneNumberLabel') }}</label>
        <input id="profile-account-phone-number" v-model="profile.phoneNumber" type="tel" required :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-postal-code">{{ t('profilePostalCodeLabel') }}</label>
        <input id="profile-account-postal-code" v-model="profile.postalCode" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-prefecture">{{ t('profilePrefectureLabel') }}</label>
        <select id="profile-account-prefecture" v-model="profile.prefecture" :disabled="isSavingProfile">
          <option v-for="option in prefectureOptions" :key="option.value || 'empty'" :value="option.value">
            {{ option.label || t('countryRegionOther') }}
          </option>
        </select>
      </div>
      <div class="form-field">
        <label for="profile-account-city">{{ t('profileCityLabel') }}</label>
        <input id="profile-account-city" v-model="profile.city" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-address-line1">{{ t('profileAddressLine1Label') }}</label>
        <input id="profile-account-address-line1" v-model="profile.addressLine1" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-address-line2">{{ t('profileAddressLine2Label') }}</label>
        <input id="profile-account-address-line2" v-model="profile.addressLine2" type="text" :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-occupation">{{ t('profileOccupationLabel') }}</label>
        <select id="profile-account-occupation" v-model="profile.occupation" :disabled="isSavingProfile">
          <option value="">{{ t('countryRegionOther') }}</option>
          <option value="student">{{ t('occupationStudent') }}</option>
          <option value="company_employee">{{ t('occupationCompanyEmployee') }}</option>
          <option value="self_employed">{{ t('occupationSelfEmployed') }}</option>
          <option value="creator">{{ t('occupationCreator') }}</option>
          <option value="company_representative">{{ t('occupationCompanyRepresentative') }}</option>
          <option value="other">{{ t('occupationOther') }}</option>
        </select>
      </div>
      <div v-if="profile.occupation === 'student'" class="form-field">
        <label for="profile-account-school">{{ t('profileSchoolLabel') }}</label>
        <input id="profile-account-school" v-model="profile.school" type="text" required :disabled="isSavingProfile">
      </div>
      <div class="form-field">
        <label for="profile-account-wechat">{{ t('profileWechatLabel') }}</label>
        <input id="profile-account-wechat" v-model="profile.wechatId" type="text" :disabled="isSavingProfile">
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary auth-submit" type="submit" :disabled="isSavingProfile">
        {{ isSavingProfile ? t('profileSavePending') : t('profileSave') }}
      </button>
    </div>
  </form>
</section>
```

If build fails because `other` is not accepted by backend prefecture options, remove the `<option value="other">` row and keep `outside_japan`.

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/applicant/DashboardPage.vue src/i18n/translations.ts
git commit -m "Add applicant profile editor"
```

### Task 9: Make Submission File Groups Division-Aware

**Files:**
- Modify: `src/views/applicant/SubmissionEditorPage.vue`
- Modify: `src/i18n/translations.ts`

- [ ] **Step 1: Add terms placeholder translations**

Add keys:

```ts
| 'submissionTermsDetails'
| 'submissionTermsPlaceholder'
```

Japanese values:

```ts
submissionTermsDetails: '応募規約を確認',
submissionTermsPlaceholder: '正式な応募規約は後日掲載します。応募前に内容をご確認ください。',
```

Add Chinese and English equivalents.

- [ ] **Step 2: Replace static `fileTypes`**

In `SubmissionEditorPage.vue`, replace:

```ts
const fileTypes: SubmissionFileType[] = [
  'online_a4_image',
  'physical_a2_image',
  'process_or_prompt_screenshot',
  'unedited_original_ai',
]
```

with:

```ts
const fileTypes = computed<SubmissionFileType[]>(() => {
  if (form.division === 'ai') {
    return ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot']
  }
  return ['online_a4_image', 'physical_a2_image', 'process_or_prompt_screenshot']
})
```

Keep `unedited_original_ai` in `emptyUploadErrors`, `groupedFiles`, and `fileTypeLabel` for existing data compatibility.

- [ ] **Step 3: Add terms details UI**

Below the terms checkbox, add:

```vue
<details class="submission-terms-details">
  <summary>{{ t('submissionTermsDetails') }}</summary>
  <p>{{ t('submissionTermsPlaceholder') }}</p>
</details>
```

- [ ] **Step 4: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/applicant/SubmissionEditorPage.vue src/i18n/translations.ts
git commit -m "Align submission file groups with guidelines"
```

### Task 10: Final Verification

**Files:**
- All changed files.

- [ ] **Step 1: Run test typecheck**

Run:

```bash
npm run test:typecheck
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run:

```bash
npm test
```

Expected: PASS with all test files passing.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 4: Inspect git status**

Run:

```bash
git status --short
```

Expected: clean working tree if every task has committed, or only intentional uncommitted changes if execution paused before a commit.

## Self-Review

- Spec coverage: The plan covers `user_profiles`, registration fields, dashboard editing, draft prefill, snapshot semantics, normalized selects, division-specific file requirements, and draft R2 upload semantics.
- Payment/admin/judging scope: The plan explicitly leaves real Stripe, admin downloads, and judging untouched.
- Type consistency: Backend uses `ApplicantProfile` with camelCase API fields and snake_case D1 columns. Frontend uses the same camelCase API type.
- Known implementation caution: Keep backend and frontend select values in sync; unsupported select values must never be sent to the API.
