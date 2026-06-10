import type { AppEnv } from '../../../_lib/env'
import { requireApplicant } from '../../../_lib/authz'
import { ApiRequestError, handleApi, json } from '../../../_lib/http'
import {
  assertDraft,
  assertReadyForPayment,
  changedRows,
  loadSubmission,
} from '../../../_lib/submissions'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)
    assertReadyForPayment(submission)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'payment_pending',
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'draft'`,
    )
      .bind(nowIso, submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError('invalid_submission', 'Only draft submissions can be changed', 409)
    }

    const updatedSubmission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function submissionIdFromContext(context: Parameters<PagesFunction<AppEnv>>[0]) {
  const idParam = context.params.id
  if (typeof idParam === 'string' && idParam.length > 0) {
    return idParam
  }
  if (Array.isArray(idParam) && typeof idParam[0] === 'string' && idParam[0].length > 0) {
    return idParam[0]
  }

  const segments = new URL(context.request.url).pathname.split('/').filter(Boolean)
  const submissionsIndex = segments.indexOf('submissions')
  const fallbackId = submissionsIndex >= 0 ? segments[submissionsIndex + 1] : undefined
  if (fallbackId) {
    return decodeURIComponent(fallbackId)
  }

  throw new ApiRequestError('not_found', 'Submission not found', 404)
}
