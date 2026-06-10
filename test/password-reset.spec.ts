import { env } from 'cloudflare:workers'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { onRequestPost as forgotPassword } from '../functions/api/auth/forgot-password'
import { onRequestPost as login } from '../functions/api/auth/login'
import { onRequestPost as resetPassword } from '../functions/api/auth/reset-password'
import { hashPassword, verifyPassword } from '../functions/_lib/password'
import { createSession } from '../functions/_lib/session'
import { hashToken } from '../functions/_lib/tokens'
import { pagesContext } from './helpers/pages-context'

type UserRow = {
  id: string
  email: string
  password_hash: string
  email_verified_at: string | null
  updated_at: string
}

type ResetTokenRow = {
  id: string
  user_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function stubResend(status = 200) {
  const fetchMock = vi.fn(async () => new Response('{}', { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function spyConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {})
}

async function insertUser(overrides: {
  email?: string
  password?: string
  emailVerifiedAt?: string | null
} = {}) {
  const user = {
    id: crypto.randomUUID(),
    email: overrides.email ?? 'reset-user@example.com',
    password: overrides.password ?? 'correct horse battery staple',
    emailVerifiedAt: 'emailVerifiedAt' in overrides
      ? overrides.emailVerifiedAt
      : '2026-06-10T04:00:00.000Z',
  }
  const passwordHash = await hashPassword(user.password)

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, 'applicant', ?)`,
  )
    .bind(user.id, user.email, passwordHash, user.emailVerifiedAt)
    .run()

  return user
}

async function firstUser(email: string) {
  return await env.DB.prepare(
    `SELECT id, email, password_hash, email_verified_at, updated_at
     FROM users
     WHERE email = ?`,
  )
    .bind(email)
    .first<UserRow>()
}

async function resetTokensForUser(userId: string) {
  const result = await env.DB.prepare(
    `SELECT id, user_id, token_hash, expires_at, used_at
     FROM password_reset_tokens
     WHERE user_id = ?
     ORDER BY created_at ASC`,
  )
    .bind(userId)
    .all<ResetTokenRow>()
  return result.results
}

async function firstResetTokenByHash(rawToken: string) {
  return await env.DB.prepare(
    `SELECT id, user_id, token_hash, expires_at, used_at
     FROM password_reset_tokens
     WHERE token_hash = ?`,
  )
    .bind(await hashToken(rawToken))
    .first<ResetTokenRow>()
}

async function passwordResetTokenCount() {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM password_reset_tokens',
  )
    .first<{ count: number }>()
  return row?.count ?? 0
}

async function sessionCountForUser(userId: string) {
  const row = await env.DB.prepare(
    'SELECT COUNT(*) AS count FROM sessions WHERE user_id = ?',
  )
    .bind(userId)
    .first<{ count: number }>()
  return row?.count ?? 0
}

async function postForgotPassword(body: unknown) {
  return await forgotPassword(pagesContext(new Request(
    'https://contest.example.com/api/auth/forgot-password',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
  )))
}

async function postResetPassword(body: unknown) {
  return await resetPassword(pagesContext(new Request(
    'https://contest.example.com/api/auth/reset-password',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
  )))
}

async function postLogin(body: unknown) {
  return await login(pagesContext(new Request(
    'https://contest.example.com/api/auth/login',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    },
  )))
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

function tokenFromResetHtml(html: string) {
  const match = html.match(/\/reset-password\?token=([^"' <]+)/)
  expect(match).not.toBeNull()
  return decodeURIComponent(match![1])
}

async function requestResetToken(email = 'reset-user@example.com') {
  const fetchMock = stubResend()
  const response = await postForgotPassword({ email })
  expect(response.status).toBe(200)
  return {
    rawToken: tokenFromResetHtml(resendPayload(fetchMock).body.html),
    fetchMock,
  }
}

describe('/api/auth/forgot-password', () => {
  it('returns ok for existing and unknown emails without leaking account existence', async () => {
    stubResend()
    await insertUser({ email: 'known-reset@example.com' })

    const existing = await postForgotPassword({
      email: '  Known-Reset@Example.COM ',
    })
    const unknown = await postForgotPassword({
      email: 'unknown-reset@example.com',
    })

    expect(existing.status).toBe(200)
    expect(unknown.status).toBe(200)
    await expect(existing.json()).resolves.toEqual({ ok: true })
    await expect(unknown.json()).resolves.toEqual({ ok: true })
  })

  it('sends a Resend reset URL to verified users and stores only the token hash', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'))
    const user = await insertUser({ email: 'mail-reset@example.com' })
    const fetchMock = stubResend()

    const response = await postForgotPassword({
      email: ' Mail-Reset@Example.COM ',
    })

    expect(response.status).toBe(200)
    const payload = resendPayload(fetchMock)
    expect(payload.url).toBe('https://api.resend.com/emails')
    expect(payload.init.method).toBe('POST')
    expect(new Headers(payload.init.headers).get('authorization')).toBe('Bearer re_test')
    expect(payload.body.from).toBe('contest@example.com')
    expect(payload.body.to).toEqual(['mail-reset@example.com'])
    expect(payload.body.subject).toContain('Reset')
    expect(payload.body.html).toContain('https://contest.example.com/reset-password?token=')

    const rawToken = tokenFromResetHtml(payload.body.html)
    const tokens = await resetTokensForUser(user.id)
    expect(tokens).toHaveLength(1)
    expect(tokens[0].expires_at).toBe('2026-06-10T01:00:00.000Z')
    expect(tokens[0].used_at).toBeNull()
    expect(tokens[0].token_hash).toBe(await hashToken(rawToken))
    expect(tokens[0].token_hash).not.toBe(rawToken)
  })

  it('does not create a token or send email for unverified users', async () => {
    const fetchMock = stubResend()
    const user = await insertUser({
      email: 'unverified-reset@example.com',
      emailVerifiedAt: null,
    })

    const response = await postForgotPassword({
      email: 'unverified-reset@example.com',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(await resetTokensForUser(user.id)).toHaveLength(0)
  })

  it('logs Resend delivery failures but still returns ok and keeps the reset token', async () => {
    const consoleError = spyConsoleError()
    const user = await insertUser({ email: 'delivery-fail@example.com' })
    stubResend(500)

    const response = await postForgotPassword({
      email: 'delivery-fail@example.com',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(consoleError).toHaveBeenCalled()
    expect(await resetTokensForUser(user.id)).toHaveLength(1)
  })

  it('rejects malformed JSON, non-object bodies, non-string email, and invalid email', async () => {
    stubResend()

    const malformed = await postForgotPassword('{')
    const arrayBody = await postForgotPassword([])
    const nonStringEmail = await postForgotPassword({ email: 1 })
    const invalidEmail = await postForgotPassword({ email: 'not-an-email' })

    expect(malformed.status).toBe(400)
    expect(arrayBody.status).toBe(400)
    expect(nonStringEmail.status).toBe(400)
    expect(invalidEmail.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('/api/auth/reset-password', () => {
  it('changes the password, marks the token used, deletes sessions, and switches login credentials', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T00:10:00.000Z'))
    const user = await insertUser({
      email: 'reset-flow@example.com',
      password: 'old password is valid',
    })
    await createSession(env.DB, user.id, 'https://contest.example.com')
    await createSession(env.DB, user.id, 'https://contest.example.com')
    const { rawToken } = await requestResetToken('reset-flow@example.com')
    expect(await sessionCountForUser(user.id)).toBe(2)

    vi.setSystemTime(new Date('2026-06-10T00:20:00.000Z'))
    const response = await postResetPassword({
      token: rawToken,
      password: 'new password is valid',
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })

    const updatedUser = await firstUser('reset-flow@example.com')
    expect(updatedUser?.updated_at).toBe('2026-06-10T00:20:00.000Z')
    expect(await verifyPassword(
      'new password is valid',
      updatedUser?.password_hash ?? '',
    )).toBe(true)
    expect(await verifyPassword(
      'old password is valid',
      updatedUser?.password_hash ?? '',
    )).toBe(false)

    const token = await firstResetTokenByHash(rawToken)
    expect(token?.used_at).toBe('2026-06-10T00:20:00.000Z')
    expect(await sessionCountForUser(user.id)).toBe(0)

    const oldLogin = await postLogin({
      email: 'reset-flow@example.com',
      password: 'old password is valid',
    })
    const newLogin = await postLogin({
      email: 'reset-flow@example.com',
      password: 'new password is valid',
    })
    expect(oldLogin.status).toBe(401)
    expect(newLogin.status).toBe(200)
  })

  it('allows only one concurrent reset request to use a token', async () => {
    await insertUser({
      email: 'single-use-reset@example.com',
      password: 'old password is valid',
    })
    const { rawToken } = await requestResetToken('single-use-reset@example.com')

    const responses = await Promise.all([
      postResetPassword({ token: rawToken, password: 'new password one' }),
      postResetPassword({ token: rawToken, password: 'new password two' }),
    ])

    expect(responses.map((response) => response.status).sort()).toEqual([200, 400])
  })

  it('does not let a failed same-millisecond reset overwrite the successful password', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-10T00:30:00.000Z'))
    await insertUser({
      email: 'same-ms-reset@example.com',
      password: 'old password is valid',
    })
    const { rawToken } = await requestResetToken('same-ms-reset@example.com')

    const attempts = [
      { password: 'winner password one' },
      { password: 'winner password two' },
    ]
    const responses = await Promise.all(attempts.map(async (attempt) => ({
      password: attempt.password,
      response: await postResetPassword({
        token: rawToken,
        password: attempt.password,
      }),
    })))

    const successful = responses.filter(({ response }) => response.status === 200)
    const failed = responses.filter(({ response }) => response.status === 400)
    expect(successful).toHaveLength(1)
    expect(failed).toHaveLength(1)

    const updatedUser = await firstUser('same-ms-reset@example.com')
    expect(await verifyPassword(
      successful[0].password,
      updatedUser?.password_hash ?? '',
    )).toBe(true)
    expect(await verifyPassword(
      failed[0].password,
      updatedUser?.password_hash ?? '',
    )).toBe(false)
  })

  it('returns the same invalid token response for expired, used, and unknown tokens', async () => {
    await insertUser({ email: 'invalid-token-reset@example.com' })
    const { rawToken: expiredToken } = await requestResetToken(
      'invalid-token-reset@example.com',
    )
    await env.DB.prepare(
      `UPDATE password_reset_tokens
       SET expires_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-09T00:00:00.000Z', await hashToken(expiredToken))
      .run()

    const { rawToken: usedToken } = await requestResetToken(
      'invalid-token-reset@example.com',
    )
    await env.DB.prepare(
      `UPDATE password_reset_tokens
       SET used_at = ?
       WHERE token_hash = ?`,
    )
      .bind('2026-06-10T00:00:00.000Z', await hashToken(usedToken))
      .run()

    const invalidBody = {
      error: {
        code: 'bad_request',
        message: 'Invalid reset token',
      },
    }

    const expired = await postResetPassword({
      token: expiredToken,
      password: 'new password is valid',
    })
    const used = await postResetPassword({
      token: usedToken,
      password: 'new password is valid',
    })
    const unknown = await postResetPassword({
      token: 'unknown-token',
      password: 'new password is valid',
    })

    expect(expired.status).toBe(400)
    expect(used.status).toBe(400)
    expect(unknown.status).toBe(400)
    await expect(expired.json()).resolves.toEqual(invalidBody)
    await expect(used.json()).resolves.toEqual(invalidBody)
    await expect(unknown.json()).resolves.toEqual(invalidBody)
  })

  it('rejects invalid bodies and passwords outside the 10 to 128 code point range', async () => {
    const malformed = await postResetPassword('{')
    const arrayBody = await postResetPassword([])
    const nonStringFields = await postResetPassword({ token: 1, password: true })
    const shortPassword = await postResetPassword({
      token: 'anything',
      password: 'too-short',
    })
    const overlongPassword = await postResetPassword({
      token: 'anything',
      password: 'x'.repeat(129),
    })

    expect(malformed.status).toBe(400)
    expect(arrayBody.status).toBe(400)
    expect(nonStringFields.status).toBe(400)
    expect(shortPassword.status).toBe(400)
    expect(overlongPassword.status).toBe(400)
  })

  it('does not create tokens while rejecting unknown reset requests', async () => {
    stubResend()

    const response = await postForgotPassword({
      email: 'nobody-reset@example.com',
    })

    expect(response.status).toBe(200)
    expect(await passwordResetTokenCount()).toBe(0)
  })
})
