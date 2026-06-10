import { json } from '../_lib/http'
import type { AppEnv } from '../_lib/env'

export const onRequestGet: PagesFunction<AppEnv> = async () => {
  return json({
    ok: true,
    service: 'ip-contest-2026',
  })
}
