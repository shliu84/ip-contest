import type { AppEnv } from '../../_lib/env'
import { handleApi, json } from '../../_lib/http'
import { clearSessionCookie, deleteSession } from '../../_lib/session'

export const onRequestPost: PagesFunction<AppEnv> = async (context) => {
  return handleApi(async () => {
    await deleteSession(context.env.DB, context.request)

    return json({ ok: true }, {
      headers: {
        'set-cookie': clearSessionCookie(context.env.APP_BASE_URL),
      },
    })
  })
}
