import type { AppEnv } from '../../_lib/env'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import { hashPassword } from '../../_lib/password'
import { hashToken } from '../../_lib/tokens'
import { validatePassword } from '../../_lib/validation'

type ResetPasswordBody = {
  token?: unknown
  password?: unknown
}

type ResetTokenRow = {
  id: string
  user_id: string
}

const INVALID_RESET_TOKEN_MESSAGE = 'Invalid reset token'

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const body = await readJson<ResetPasswordBody>(context.request)
    if (!isRecord(body) || Array.isArray(body)) {
      throw new ApiRequestError('bad_request', 'Invalid password reset body', 400)
    }
    if (typeof body.token !== 'string' || typeof body.password !== 'string') {
      throw new ApiRequestError('bad_request', 'Invalid password reset body', 400)
    }
    if (!validatePassword(body.password)) {
      throw new ApiRequestError('bad_request', 'Invalid password', 400)
    }

    const tokenHash = await hashToken(body.token)
    const row = await context.env.DB.prepare(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = ?`,
    )
      .bind(tokenHash)
      .first<ResetTokenRow>()

    if (!row) {
      throw invalidResetToken()
    }

    const nowIso = new Date().toISOString()
    const passwordHash = await hashPassword(body.password)
    const [claimed, updatedUser] = await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE password_reset_tokens
         SET used_at = ?
         WHERE id = ?
           AND used_at IS NULL
           AND expires_at > ?`,
      ).bind(nowIso, row.id, nowIso),
      context.env.DB.prepare(
        `UPDATE users
         SET password_hash = ?, updated_at = ?
         WHERE id = ?
           AND EXISTS (
             SELECT 1
             FROM password_reset_tokens
             WHERE id = ?
               AND used_at = ?
           )`,
      ).bind(passwordHash, nowIso, row.user_id, row.id, nowIso),
      context.env.DB.prepare(
        `DELETE FROM sessions
         WHERE user_id = ?
           AND EXISTS (
             SELECT 1
             FROM password_reset_tokens
             WHERE id = ?
               AND used_at = ?
           )`,
      ).bind(row.user_id, row.id, nowIso),
    ])

    if (claimed.meta.changes !== 1) {
      throw invalidResetToken()
    }

    if (updatedUser.meta.changes !== 1) {
      throw new Error('Claimed reset token did not update a user')
    }

    return json({ ok: true })
  })
}

function invalidResetToken() {
  return new ApiRequestError(
    'bad_request',
    INVALID_RESET_TOKEN_MESSAGE,
    400,
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
