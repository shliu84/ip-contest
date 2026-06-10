import type { AppEnv } from '../../../_lib/env'
import { requireCommittee } from '../../../_lib/authz'
import { handleApi, json } from '../../../_lib/http'
import { listAdminSubmissions, parseAdminSubmissionFilters } from '../../../_lib/admin-submissions'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    await requireCommittee(context.env.DB, context.request)
    const filters = parseAdminSubmissionFilters(new URL(context.request.url))
    const submissions = await listAdminSubmissions(context.env.DB, filters)

    return json({ submissions }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
