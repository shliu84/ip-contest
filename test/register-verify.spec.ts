import { env } from 'cloudflare:workers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequestPost } from '../functions/api/auth/register'
import {
  onRequestGet as verifyEmailGet,
  onRequestPost as verifyEmailPost,
} from '../functions/api/auth/verify-email'
import { verifyPassword } from '../functions/_lib/password'
import { hashToken } from '../functions/_lib/tokens'
import { pagesContext } from './helpers/pages-context'

type UserRow = {
  id: string
  email: string
  password_hash: string
  role: string
  email_verified_at: string | null
  updated_at: string
}

type VerificationTokenRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
}

type UserProfileRow = {
  user_id: string
  last_name: string
  first_name: string
  country_region: string
  phone_country_code: string
  phone_number: string
  certificate_language: string
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function stubResend(status = 200) {
  const fetchMock = vi.fn(async () => new Response('{}', { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

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

async function register(body: unknown) {
  return await onRequestPost(pagesContext(new Request(
    'https://contest.example.com/api/auth/register',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  )))
}

async function registerWithBaseUrl(body: unknown, appBaseUrl: string) {
  const context = pagesContext(new Request(
    'https://contest.example.com/api/auth/register',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  ))
  context.env = { ...context.env, APP_BASE_URL: appBaseUrl }
  return await onRequestPost(context)
}

async function verifyEmail(token: string) {
  return await verifyEmailPost(pagesContext(new Request(
    'https://contest.example.com/api/auth/verify-email',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    },
  )))
}

async function verifyEmailGetRequest(token: string) {
  return await verifyEmailGet(pagesContext(new Request(
    `https://contest.example.com/api/auth/verify-email?token=${encodeURIComponent(token)}`,
  )))
}

async function firstUser(email: string) {
  return await env.DB.prepare(
    `SELECT id, email, password_hash, role, email_verified_at, updated_at
     FROM users
     WHERE email = ?`,
  )
    .bind(email)
    .first<UserRow>()
}

async function firstUserProfile(userId: string) {
  return await env.DB.prepare(
    `SELECT user_id, last_name, first_name, country_region, phone_country_code, phone_number
         , certificate_language
     FROM user_profiles
     WHERE user_id = ?`,
  )
    .bind(userId)
    .first<UserProfileRow>()
}

async function firstUserProfileByEmail(email: string) {
  return await env.DB.prepare(
    `SELECT user_profiles.user_id, last_name, first_name, country_region, phone_country_code, phone_number, certificate_language
     FROM user_profiles
     INNER JOIN users ON users.id = user_profiles.user_id
     WHERE users.email = ?`,
  )
    .bind(email)
    .first<UserProfileRow>()
}

async function firstVerificationToken(userId: string) {
  return await env.DB.prepare(
    `SELECT id, user_id, token_hash, expires_at, used_at
     FROM email_verification_tokens
     WHERE user_id = ?`,
  )
    .bind(userId)
    .first<VerificationTokenRow>()
}

function resendPayload(fetchMock: ReturnType<typeof stubResend>, index = 0) {
  const [url, init] = fetchMock.mock.calls[index] as unknown as [string, RequestInit]
  return {
    url,
    init,
    body: JSON.parse(String(init.body)) as {
      from: string
      to: string[]
      subject: string
      html: string
    },
  }
}

function tokenFromHtml(html: string) {
  const match = html.match(/\/verify-email\?token=([^"' <]+)/)
  expect(match).not.toBeNull()
  return decodeURIComponent(match![1])
}

function hrefFromHtml(html: string) {
  const match = html.match(/href="([^"]+)"/)
  expect(match).not.toBeNull()
  return match![1]
}

async function registerAndToken(email = 'verify@example.com') {
  const fetchMock = stubResend()
  const response = await register({
    ...registrationBody(email),
  })
  expect(response.status).toBe(201)
  return {
    rawToken: tokenFromHtml(resendPayload(fetchMock).body.html),
    fetchMock,
  }
}

describe('/api/auth/register', () => {
  it('creates an applicant with a password hash and stores only a hashed verification token', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'))
    stubResend()

    const response = await register(registrationBody('  New.Applicant@Example.COM '))

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ ok: true })

    const user = await firstUser('new.applicant@example.com')
    expect(user?.role).toBe('applicant')
    expect(user?.email_verified_at).toBeNull()
    expect(user?.password_hash).toMatch(/^pbkdf2_sha256\$/)
    expect(user?.password_hash).not.toBe('correct horse battery staple')
    expect(await verifyPassword(
      'correct horse battery staple',
      user?.password_hash ?? '',
    )).toBe(true)
    const profile = await firstUserProfile(user!.id)
    expect(profile).toMatchObject({
      user_id: user!.id,
      last_name: '山田',
      first_name: '明',
      country_region: 'JP',
      phone_country_code: '+81',
      phone_number: '9012345678',
      certificate_language: 'ja',
    })

    const token = await firstVerificationToken(user!.id)
    expect(token?.expires_at).toBe('2026-06-11T00:00:00.000Z')
    expect(token?.used_at).toBeNull()
    expect(token?.token_hash).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(token?.token_hash).not.toContain('correct')
  })

  it('sends a Resend email with the verification URL and raw token while persisting only the hash', async () => {
    const fetchMock = stubResend()

    const response = await register(registrationBody('mail-target@example.com'))

    expect(response.status).toBe(201)
    const payload = resendPayload(fetchMock)
    expect(payload.url).toBe('https://api.resend.com/emails')
    expect(payload.init.method).toBe('POST')
    expect(new Headers(payload.init.headers).get('authorization')).toBe('Bearer re_test')
    expect(new Headers(payload.init.headers).get('content-type')).toBe('application/json')
    expect(payload.body.from).toBe('contest@example.com')
    expect(payload.body.to).toEqual(['mail-target@example.com'])
    expect(payload.body.subject).toContain('Verify')

    const rawToken = tokenFromHtml(payload.body.html)
    expect(payload.body.html).toContain('https://contest.example.com/verify-email?token=')

    const user = await firstUser('mail-target@example.com')
    const token = await firstVerificationToken(user!.id)
    expect(token?.token_hash).toBe(await hashToken(rawToken))
    expect(token?.token_hash).not.toBe(rawToken)
  })

  it('rejects JSON null, arrays, and non-object registration bodies', async () => {
    stubResend()

    const nullBody = await register(null)
    const arrayBody = await register([])
    const stringBody = await register('not an object')

    expect(nullBody.status).toBe(400)
    expect(arrayBody.status).toBe(400)
    expect(stringBody.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('rejects duplicate email registrations with conflict', async () => {
    stubResend()
    expect((await register(registrationBody('duplicate@example.com'))).status).toBe(201)

    const response = await register(registrationBody(' Duplicate@Example.COM '))

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'conflict',
        message: 'Email already registered',
      },
    })
  })

  it('maps a duplicate email unique constraint race to conflict', async () => {
    stubResend()
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, role)
       VALUES (?, ?, ?, 'applicant')`,
    )
      .bind(crypto.randomUUID(), 'race@example.com', 'password-hash')
      .run()

    const context = pagesContext(new Request(
      'https://contest.example.com/api/auth/register',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(registrationBody('race@example.com')),
      },
    ))
    const realDb = context.env.DB
    const db = Object.create(realDb) as D1Database
    db.prepare = ((query: string) => {
      if (query.includes('SELECT id FROM users WHERE email = ?')) {
        return {
          bind() {
            return {
              async first() {
                return null
              },
            }
          },
        } as unknown as D1PreparedStatement
      }
      return realDb.prepare(query)
    }) as D1Database['prepare']
    context.env.DB = db

    const response = await onRequestPost(context)

    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'conflict',
        message: 'Email already registered',
      },
    })
  })

  it('builds and escapes the verification URL from a configured base URL', async () => {
    const fetchMock = stubResend()

    const response = await registerWithBaseUrl(
      registrationBody('url-safe@example.com'),
      'https://contest.example.com/app/?next=" onclick="alert(1)',
    )

    expect(response.status).toBe(201)
    const html = resendPayload(fetchMock).body.html
    const href = hrefFromHtml(html)
    expect(href).toMatch(/^https:\/\/contest\.example\.com\/verify-email\?token=/)
    expect(html).not.toContain('onclick')
    expect(html).not.toContain('alert(1)')

    const defaultResponse = await register(registrationBody('default-url@example.com'))
    expect(defaultResponse.status).toBe(201)
    expect(resendPayload(fetchMock, 1).body.html).toContain(
      'https://contest.example.com/verify-email?token=',
    )
  })

  it('rejects invalid email and short password bodies', async () => {
    stubResend()

    const invalidEmail = await register({
      email: 'not-an-email',
      password: 'correct horse battery staple',
    })
    const shortPassword = await register({
      email: 'short-password@example.com',
      password: 'too-short',
    })

    expect(invalidEmail.status).toBe(400)
    expect(shortPassword.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns 502 and removes the just-created user and token when email delivery fails', async () => {
    stubResend(500)

    const response = await register(registrationBody('rollback@example.com'))

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'email_delivery_failed',
        message: 'Unable to send verification email',
      },
    })
    expect(await firstUser('rollback@example.com')).toBeNull()
    expect(await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM email_verification_tokens',
    ).first<{ count: number }>()).toEqual({ count: 0 })
    expect(await firstUserProfileByEmail('rollback@example.com')).toBeNull()
  })

  it('rejects registrations without required applicant profile fields', async () => {
    stubResend()

    const response = await register({
      email: 'missing-profile@example.com',
      password: 'correct horse battery staple',
    })

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('/api/auth/verify-email', () => {
  it('marks the user email and verification token as used for a valid token', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T01:00:00.000Z'))
    const { rawToken } = await registerAndToken()

    const response = await verifyEmail(rawToken)

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({ ok: true })

    const user = await firstUser('verify@example.com')
    const token = await firstVerificationToken(user!.id)
    expect(user?.email_verified_at).toBe('2026-06-10T01:00:00.000Z')
    expect(user?.updated_at).toBe('2026-06-10T01:00:00.000Z')
    expect(token?.used_at).toBe('2026-06-10T01:00:00.000Z')
  })

  it('does not verify email or use a token on GET requests', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T01:30:00.000Z'))
    const { rawToken } = await registerAndToken('get-safe@example.com')

    const response = await verifyEmailGetRequest(rawToken)

    expect(response.status).not.toBe(200)
    expect(response.status).toBe(405)

    const user = await firstUser('get-safe@example.com')
    const token = await firstVerificationToken(user!.id)
    expect(user?.email_verified_at).toBeNull()
    expect(token?.used_at).toBeNull()
  })

  it('rejects expired, used, unknown, and missing tokens on POST', async () => {
    const { rawToken: expiredToken } = await registerAndToken('expired@example.com')
    const expiredHash = await hashToken(expiredToken)
    await env.DB.prepare(
      `UPDATE email_verification_tokens
       SET expires_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-09T00:00:00.000Z', expiredHash)
      .run()

    const { rawToken: usedToken } = await registerAndToken('used@example.com')
    const usedHash = await hashToken(usedToken)
    await env.DB.prepare(
      `UPDATE email_verification_tokens
       SET used_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-10T00:00:00.000Z', usedHash)
      .run()

    const expired = await verifyEmail(expiredToken)
    const used = await verifyEmail(usedToken)
    const unknown = await verifyEmail('unknown-token')
    const missing = await verifyEmailPost(pagesContext(new Request(
      'https://contest.example.com/api/auth/verify-email',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      },
    )))

    expect(expired.status).toBe(400)
    expect(used.status).toBe(400)
    expect(unknown.status).toBe(400)
    expect(missing.status).toBe(400)
  })

  it('allows only one concurrent verification request to use a token', async () => {
    const { rawToken } = await registerAndToken('single-use@example.com')

    const responses = await Promise.all([
      verifyEmail(rawToken),
      verifyEmail(rawToken),
    ])
    const statuses = responses.map((response) => response.status).sort()

    expect(statuses).toEqual([200, 400])
  })
})
