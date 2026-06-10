import type { AppEnv } from '../../_lib/env'
import { RESET_TOKEN_SECONDS } from '../../_lib/auth-constants'
import { sendEmail } from '../../_lib/email'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { createToken, hashToken } from '../../_lib/tokens'
import { normalizeEmail, validateEmail } from '../../_lib/validation'

type ForgotPasswordBody = {
  email?: unknown
}

type ResetUserRow = {
  id: string
  email: string
  email_verified_at: string | null
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const body = await readJson<ForgotPasswordBody>(context.request)
    if (!isRecord(body) || Array.isArray(body)) {
      throw new ApiRequestError('bad_request', 'Invalid password reset body', 400)
    }
    if (typeof body.email !== 'string') {
      throw new ApiRequestError('bad_request', 'Invalid password reset body', 400)
    }

    const email = normalizeEmail(body.email)
    if (!validateEmail(email)) {
      throw new ApiRequestError('bad_request', 'Invalid email', 400)
    }

    const user = await context.env.DB.prepare(
      `SELECT id, email, email_verified_at
       FROM users
       WHERE email = ?`,
    )
      .bind(email)
      .first<ResetUserRow>()

    if (!user || user.email_verified_at === null) {
      return json({ ok: true })
    }

    const rawToken = createToken()
    const tokenHash = await hashToken(rawToken)
    const now = Date.now()
    const nowIso = new Date(now).toISOString()
    const expiresAt = new Date(now + RESET_TOKEN_SECONDS * 1000).toISOString()

    await context.env.DB.prepare(
      `INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(crypto.randomUUID(), user.id, tokenHash, expiresAt, nowIso)
      .run()

    const resetUrl = resetUrlFor(context.env.APP_BASE_URL, rawToken)

    try {
      await sendEmail(context.env, {
        to: user.email,
        subject: 'Reset your ASIA IP CONTEST password',
        html: [
          '<p>Use this link to reset your ASIA IP CONTEST password.</p>',
          `<p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>`,
        ].join(''),
      })
    } catch (error) {
      console.error('Unable to send password reset email', error)
    }

    return json({ ok: true })
  })
}

function resetUrlFor(appBaseUrl: string, rawToken: string) {
  const url = new URL('/reset-password', appBaseUrl)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('APP_BASE_URL must use http or https')
  }
  url.searchParams.set('token', rawToken)
  return url.toString()
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return character
    }
  })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
