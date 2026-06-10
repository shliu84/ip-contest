import type { AppEnv } from '../_lib/env'
import { handleApi, json } from '../_lib/http'
import { getSessionUser } from '../_lib/session'

export const onRequestGet: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    const user = await getSessionUser(context.env.DB, context.request)

    return json({ user })
  })
}
