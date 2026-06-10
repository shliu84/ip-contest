import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'
import { onRequestPost as login } from '../functions/api/auth/login'
import { onRequestPost as logout } from '../functions/api/auth/logout'
import { onRequestGet as me } from '../functions/api/me'
import { hashPassword } from '../functions/_lib/password'
import { hashToken } from '../functions/_lib/tokens'
import { pagesContext } from './helpers/pages-context'

type UserRole = 'applicant' | 'committee' | 'judge' | 'super_admin'

type SessionRow = {
  token_hash: string
  user_id: string
}

async function insertUser(overrides: {
  email?: string
  password?: string
  role?: UserRole
  emailVerifiedAt?: string | null
} = {}) {
  const user = {
    id: crypto.randomUUID(),
    email: overrides.email ?? 'verified@example.com',
    password: overrides.password ?? 'correct horse battery staple',
    role: overrides.role ?? 'applicant',
    emailVerifiedAt: 'emailVerifiedAt' in overrides
      ? overrides.emailVerifiedAt
      : '2026-06-10T04:00:00.000Z',
  }
  const passwordHash = await hashPassword(user.password)

  await env.DB.prepare(
    `INSERT INTO users (id, email, password_hash, role, email_verified_at)
     VALUES (?, ?, ?, ?, ?)`,
  )
    .bind(user.id, user.email, passwordHash, user.role, user.emailVerifiedAt)
    .run()

  return user
}

async function postLogin(body: unknown) {
  return await login(pagesContext(new Request(
    'https://contest.example.com/api/auth/login',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    },
  )))
}

async function postLogout(cookie?: string) {
  return await logout(pagesContext(new Request(
    'https://contest.example.com/api/auth/logout',
    {
      method: 'POST',
      headers: cookie ? { cookie } : {},
    },
  )))
}

async function getMe(cookie?: string) {
  return await me(pagesContext(new Request(
    'https://contest.example.com/api/me',
    {
      headers: cookie ? { cookie } : {},
    },
  )))
}

function sessionTokenFrom(cookie: string) {
  const match = cookie.match(/(?:^|;\s*)aipc_session=([^;]+)/)
  expect(match).not.toBeNull()
  return match![1]
}

async function storedSessionForCookie(cookie: string) {
  const token = sessionTokenFrom(cookie)
  return await env.DB.prepare(
    `SELECT token_hash, user_id
     FROM sessions
     WHERE token_hash = ?`,
  )
    .bind(await hashToken(token))
    .first<SessionRow>()
}

async function sessionCount() {
  const row = await env.DB.prepare('SELECT COUNT(*) AS count FROM sessions')
    .first<{ count: number }>()
  return row?.count ?? 0
}

describe('/api/auth/login', () => {
  it('creates a session cookie and returns the verified user for correct credentials', async () => {
    const user = await insertUser({
      email: 'verified@example.com',
      role: 'judge',
      emailVerifiedAt: '2026-06-10T04:00:00.000Z',
    })

    const response = await postLogin({
      email: '  VERIFIED@Example.COM ',
      password: 'correct horse battery staple',
    })

    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    await expect(response.json()).resolves.toEqual({
      user: {
        id: user.id,
        email: 'verified@example.com',
        role: 'judge',
        emailVerifiedAt: '2026-06-10T04:00:00.000Z',
      },
    })

    const cookie = response.headers.get('set-cookie')
    expect(cookie).toContain('aipc_session=')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('SameSite=Lax')
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('Max-Age=604800')
    expect(cookie).toContain('Secure')

    await expect(storedSessionForCookie(cookie!)).resolves.toMatchObject({
      user_id: user.id,
    })
  })

  it('returns the same unauthorized response for unknown email and wrong password', async () => {
    await insertUser({
      email: 'known@example.com',
      password: 'correct horse battery staple',
    })

    const unknown = await postLogin({
      email: 'missing@example.com',
      password: 'correct horse battery staple',
    })
    const wrongPassword = await postLogin({
      email: 'known@example.com',
      password: 'wrong horse battery staple',
    })

    expect(unknown.status).toBe(401)
    expect(wrongPassword.status).toBe(401)
    expect(unknown.headers.get('set-cookie')).toBeNull()
    expect(wrongPassword.headers.get('set-cookie')).toBeNull()
    await expect(unknown.json()).resolves.toEqual({
      error: {
        code: 'unauthorized',
        message: 'Invalid email or password',
      },
    })
    await expect(wrongPassword.json()).resolves.toEqual({
      error: {
        code: 'unauthorized',
        message: 'Invalid email or password',
      },
    })
  })

  it('rejects an overlong password before creating a session', async () => {
    await insertUser({
      email: 'overlong@example.com',
      password: 'correct horse battery staple',
    })

    const response = await postLogin({
      email: 'overlong@example.com',
      password: 'x'.repeat(129),
    })

    expect(response.status).toBe(400)
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(await sessionCount()).toBe(0)
  })

  it('rejects an unverified user with email_not_verified without creating a session', async () => {
    await insertUser({
      email: 'unverified@example.com',
      emailVerifiedAt: null,
    })

    const response = await postLogin({
      email: 'unverified@example.com',
      password: 'correct horse battery staple',
    })

    expect(response.status).toBe(403)
    expect(response.headers.get('set-cookie')).toBeNull()
    expect(await sessionCount()).toBe(0)
    await expect(response.json()).resolves.toEqual({
      error: {
        code: 'email_not_verified',
        message: 'Email address is not verified',
      },
    })
  })

  it('rejects malformed JSON, null body, arrays, and non-string fields', async () => {
    const malformed = await postLogin('{')
    const nullBody = await postLogin(null)
    const arrayBody = await postLogin([])
    const nonStringFields = await postLogin({ email: 1, password: true })

    expect(malformed.status).toBe(400)
    expect(nullBody.status).toBe(400)
    expect(arrayBody.status).toBe(400)
    expect(nonStringFields.status).toBe(400)
  })
})

describe('/api/auth/logout', () => {
  it('deletes the current session, clears the cookie, and /api/me returns null after logout', async () => {
    const user = await insertUser({
      email: 'session-flow@example.com',
      role: 'committee',
      emailVerifiedAt: '2026-06-10T05:00:00.000Z',
    })
    const loginResponse = await postLogin({
      email: 'session-flow@example.com',
      password: 'correct horse battery staple',
    })
    const cookie = loginResponse.headers.get('set-cookie')
    expect(cookie).not.toBeNull()

    const beforeLogout = await getMe(cookie!)
    expect(beforeLogout.status).toBe(200)
    await expect(beforeLogout.json()).resolves.toEqual({
      user: {
        id: user.id,
        email: 'session-flow@example.com',
        role: 'committee',
        emailVerifiedAt: '2026-06-10T05:00:00.000Z',
      },
    })

    const logoutResponse = await postLogout(cookie!)

    expect(logoutResponse.status).toBe(200)
    await expect(logoutResponse.json()).resolves.toEqual({ ok: true })
    const clearCookie = logoutResponse.headers.get('set-cookie')
    expect(clearCookie).toContain('aipc_session=')
    expect(clearCookie).toContain('Max-Age=0')
    expect(clearCookie).toContain('HttpOnly')
    expect(await storedSessionForCookie(cookie!)).toBeNull()

    const afterLogout = await getMe(cookie!)
    expect(afterLogout.status).toBe(200)
    await expect(afterLogout.json()).resolves.toEqual({ user: null })
  })

  it('returns ok and clears the cookie even when no current session exists', async () => {
    const response = await postLogout()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ ok: true })
    expect(response.headers.get('set-cookie')).toContain('Max-Age=0')
  })
})
