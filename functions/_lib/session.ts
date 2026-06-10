import { SESSION_COOKIE, SESSION_SECONDS } from './auth-constants'
import { createToken, hashToken } from './tokens'

export type SessionUser = {
  id: string
  email: string
  role: 'applicant' | 'committee' | 'judge' | 'super_admin'
  emailVerifiedAt: string | null
}

const LAST_SEEN_THROTTLE_MS = 15 * 60 * 1000

type SessionRow = {
  session_id: string
  expires_at: string
  last_seen_at: string
  id: string
  email: string
  role: SessionUser['role']
  email_verified_at: string | null
}

export async function createSession(
  db: D1Database,
  userId: string,
  appBaseUrl: string,
): Promise<{ cookie: string, token: string }> {
  const token = createToken()
  const tokenHash = await hashToken(token)
  const now = Date.now()
  const nowIso = new Date(now).toISOString()
  const expiresAt = new Date(now + SESSION_SECONDS * 1000).toISOString()

  await db.prepare(
    `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(crypto.randomUUID(), userId, tokenHash, expiresAt, nowIso, nowIso)
    .run()

  return {
    cookie: sessionCookie(token, SESSION_SECONDS, appBaseUrl),
    token,
  }
}

export async function getSessionUser(
  db: D1Database,
  request: Request,
): Promise<SessionUser | null> {
  const token = getSessionToken(request)
  if (!token) {
    return null
  }

  const tokenHash = await hashToken(token)
  const row = await db.prepare(
    `SELECT
       s.id AS session_id,
       s.expires_at,
       s.last_seen_at,
       u.id,
       u.email,
       u.role,
       u.email_verified_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ?`,
  )
    .bind(tokenHash)
    .first<SessionRow>()

  if (!row) {
    return null
  }

  const now = Date.now()
  if (new Date(row.expires_at).getTime() <= now) {
    await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
    return null
  }

  if (now - new Date(row.last_seen_at).getTime() > LAST_SEEN_THROTTLE_MS) {
    await db.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?')
      .bind(new Date(now).toISOString(), row.session_id)
      .run()
  }

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    emailVerifiedAt: row.email_verified_at,
  }
}

export async function deleteSession(db: D1Database, request: Request): Promise<void> {
  const token = getSessionToken(request)
  if (!token) {
    return
  }

  await db.prepare('DELETE FROM sessions WHERE token_hash = ?')
    .bind(await hashToken(token))
    .run()
}

export function clearSessionCookie(appBaseUrl: string) {
  return sessionCookie('', 0, appBaseUrl)
}

function getSessionToken(request: Request) {
  const cookie = request.headers.get('cookie')
  if (!cookie) {
    return null
  }

  for (const part of cookie.split(';')) {
    const [name, ...valueParts] = part.trim().split('=')
    if (name === SESSION_COOKIE) {
      return valueParts.join('=')
    }
  }

  return null
}

function sessionCookie(value: string, maxAge: number, appBaseUrl: string) {
  const attributes = [
    `${SESSION_COOKIE}=${value}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAge}`,
  ]

  if (new URL(appBaseUrl).protocol === 'https:') {
    attributes.push('Secure')
  }

  return attributes.join('; ')
}
