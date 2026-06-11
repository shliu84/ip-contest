import type { AppEnv } from '../_lib/env'
import { requireApplicant } from '../_lib/authz'
import { handleApi, json, readJson } from '../_lib/http'
import {
  loadApplicantProfile,
  parseApplicantProfile,
  upsertApplicantProfile,
} from '../_lib/profile'

const NO_STORE_HEADERS = {
  'cache-control': 'no-store',
}

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const profile = await loadApplicantProfile(context.env.DB, user.id)

    return json({ profile }, {
      headers: NO_STORE_HEADERS,
    })
  })
}

export const onRequestPatch: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await requireApplicant(context.env.DB, context.request)
    const body = await readJson<unknown>(context.request)
    const profile = parseApplicantProfile(body, 'full')
    const savedProfile = await upsertApplicantProfile(context.env.DB, user.id, profile)

    return json({ profile: savedProfile }, {
      headers: NO_STORE_HEADERS,
    })
  })
}
