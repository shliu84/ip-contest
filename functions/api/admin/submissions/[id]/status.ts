import type { AppEnv } from '../../../../_lib/env'
import { requireCommittee } from '../../../../_lib/authz'
import {
  assertAdminStatusTransition,
  loadAdminSubmission,
  parseAdminStatusBody,
  updateAdminSubmissionStatus,
} from '../../../../_lib/admin-submissions'
import { ApiRequestError, handleApi, json, readJson } from '../../../../_lib/http'
import { submissionIdFromContext } from '../[id]'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestPatch: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)
    const submissionId = submissionIdFromContext(context)
    const body = parseAdminStatusBody(await readJson<unknown>(context.request))
    const submission = await loadAdminSubmission(context.env.DB, submissionId)
    if (!submission) {
      throw new ApiRequestError('not_found', 'Submission not found', 404)
    }

    assertAdminStatusTransition(submission.status, body.status)
    const updatedSubmission = await updateAdminSubmissionStatus(
      context.env.DB,
      submissionId,
      submission.status,
      body.status,
    )
    if (!updatedSubmission) {
      throw new ApiRequestError('server_error', 'Updated submission could not be loaded', 500)
    }

    return json({ submission: updatedSubmission }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
