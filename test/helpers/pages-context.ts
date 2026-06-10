import { createPagesEventContext } from 'cloudflare:test'
import type { AppEnv } from '../../functions/_lib/env'

export function pagesContext(request: Request): Parameters<PagesFunction<AppEnv>>[0] {
  return createPagesEventContext<PagesFunction<AppEnv>>({
    request: request as Parameters<PagesFunction<AppEnv>>[0]['request'],
    functionPath: new URL(request.url).pathname,
    params: {},
    data: {},
    next() {
      return new Response('Not found', { status: 404 })
    },
  })
}
