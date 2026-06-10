import type { AppEnv } from '../../_lib/env'
import { ApiRequestError, handleApi, json } from '../../_lib/http'
import { hashToken } from '../../_lib/tokens'

type VerificationTokenRow = {
  id: string
  user_id: string
  expires_at: string
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const token = new URL(context.request.url).searchParams.get('token')
    if (!token) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const tokenHash = await hashToken(token)
    const row = await context.env.DB.prepare(
      `SELECT id, user_id, expires_at
       FROM email_verification_tokens
       WHERE token_hash = ?
         AND used_at IS NULL`,
    )
      .bind(tokenHash)
      .first<VerificationTokenRow>()

    if (!row || new Date(row.expires_at).getTime() <= Date.now()) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const nowIso = new Date().toISOString()
    await context.env.DB.batch([
      context.env.DB.prepare(
        `UPDATE users
         SET email_verified_at = ?, updated_at = ?
         WHERE id = ?`,
      ).bind(nowIso, nowIso, row.user_id),
      context.env.DB.prepare(
        `UPDATE email_verification_tokens
         SET used_at = ?
         WHERE id = ?`,
      ).bind(nowIso, row.id),
    ])

    return json({ ok: true })
  })
}
