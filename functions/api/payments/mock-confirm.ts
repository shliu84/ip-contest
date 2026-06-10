import type { AppEnv } from '../../_lib/env'
import { requireApplicant } from '../../_lib/authz'
import { ApiRequestError, handleApi, json, readJson } from '../../_lib/http'
import {
  assertPaymentPending,
  assertRecord,
  changedRows,
  loadSubmission,
} from '../../_lib/submissions'

type MockConfirmBody = {
  submissionId: string
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = parseMockConfirmBody(await readJson<unknown>(context.request))
    const submission = await loadSubmission(context.env.DB, body.submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertPaymentPending(submission.status)

    const nowIso = new Date().toISOString()
    const result = await context.env.DB.prepare(
      `UPDATE submissions
       SET status = 'submitted',
           paid_at = ?,
           submitted_at = ?,
           updated_at = ?
       WHERE id = ? AND user_id = ? AND status = 'payment_pending'`,
    )
      .bind(nowIso, nowIso, nowIso, body.submissionId, user.id)
      .run()
    if (changedRows(result) === 0) {
      throw new ApiRequestError(
        'invalid_submission',
        'Only payment pending submissions can be confirmed',
        409,
      )
    }

    const updatedSubmission = await loadSubmission(context.env.DB, body.submissionId, user.id)
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function parseMockConfirmBody(value: unknown): MockConfirmBody {
  assertRecord(value)
  const submissionId = value.submissionId
  if (typeof submissionId !== 'string' || submissionId.trim().length === 0) {
    throw new ApiRequestError('bad_request', 'Invalid request body', 400)
  }

  return {
    submissionId,
  }
}
