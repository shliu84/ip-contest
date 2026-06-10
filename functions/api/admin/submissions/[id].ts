import type { AppEnv } from '../../../_lib/env'
import { requireCommittee } from '../../../_lib/authz'
import { loadAdminSubmission } from '../../../_lib/admin-submissions'
import { ApiRequestError, handleApi, json } from '../../../_lib/http'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)
    const submission = await loadAdminSubmission(context.env.DB, submissionIdFromContext(context))
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }

    return json({ submission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

export function submissionIdFromContext(context: Parameters<PagesFunction<AppEnv>>[0]) {
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
