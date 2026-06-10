import type { AppEnv } from '../../../../_lib/env'
import { requireApplicant } from '../../../../_lib/authz'
import { ApiRequestError, handleApi, json } from '../../../../_lib/http'
import { assertDraft, loadSubmission } from '../../../../_lib/submissions'

type SubmissionFileStorageRow = {
  id: string
  r2_key: string
}

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestDelete: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const submissionId = paramFromContext(context, 'id', 'submissions')
    const fileId = paramFromContext(context, 'fileId', 'files')
    const submission = await loadSubmission(context.env.DB, submissionId, user.id)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }
    assertDraft(submission.status)

    const file = await context.env.DB.prepare(
      `SELECT id, r2_key
       FROM submission_files
       WHERE id = ? AND submission_id = ?`,
    )
      .bind(fileId, submissionId)
      .first<SubmissionFileStorageRow>()
    if (!file) {
      throw new ApiRequestError('not_found', 'File not found', 404)
    }

    await context.env.SUBMISSION_BUCKET.delete(file.r2_key)
    await context.env.DB.prepare(
      `DELETE FROM submission_files
       WHERE id = ? AND submission_id = ?`,
    )
      .bind(fileId, submissionId)
      .run()

    return json({ ok: true }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

function paramFromContext(
  context: Parameters<PagesFunction<AppEnv>>[0],
  paramName: string,
  fallbackAnchor: string,
) {
  const param = context.params[paramName]
  if (typeof param === 'string' && param.length > 0) {
    return param
  }
  if (Array.isArray(param) && typeof param[0] === 'string' && param[0].length > 0) {
    return param[0]
  }

  const segments = new URL(context.request.url).pathname.split('/').filter(Boolean)
  const anchorIndex = segments.indexOf(fallbackAnchor)
  const fallback = anchorIndex >= 0 ? segments[anchorIndex + 1] : undefined
  if (fallback) {
    return decodeURIComponent(fallback)
  }

  throw new ApiRequestError('not_found', 'Resource not found', 404)
}
