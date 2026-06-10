import type { AppEnv } from '../../_lib/env'
import { ApiRequestError, handleApi, json } from '../../_lib/http'
import { hashToken } from '../../_lib/tokens'

type VerificationTokenRow = {
  id: string
  user_id: string
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const token = new URL(context.request.url).searchParams.get('token')
    if (!token) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const tokenHash = await hashToken(token)
    const row = await context.env.DB.prepare(
      `SELECT id, user_id
       FROM email_verification_tokens
       WHERE token_hash = ?`,
    )
      .bind(tokenHash)
      .first<VerificationTokenRow>()

    if (!row) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    const nowIso = new Date().toISOString()
    const claimed = await context.env.DB.prepare(
      `UPDATE email_verification_tokens
       SET used_at = ?
       WHERE id = ?
         AND used_at IS NULL
         AND expires_at > ?`,
    )
      .bind(nowIso, row.id, nowIso)
      .run()

    if (claimed.meta.changes !== 1) {
      throw new ApiRequestError('bad_request', 'Invalid verification token', 400)
    }

    await context.env.DB.prepare(
      `UPDATE users
       SET email_verified_at = ?, updated_at = ?
       WHERE id = ?`,
    )
      .bind(nowIso, nowIso, row.user_id)
      .run()

    return json({ ok: true })
  })
}
