import { env } from 'cloudflare:workers'
import type { AppEnv } from '../../functions/_lib/env'

export function pagesContext(request: Request): Parameters<PagesFunction<AppEnv>>[0] {
  type Context = Parameters<PagesFunction<AppEnv>>[0]

  return {
    request: request as Context['request'],
    env: env as unknown as Context['env'],
    params: {},
    data: {},
    functionPath: new URL(request.url).pathname,
    waitUntil(_promise: Promise<unknown>) {},
    passThroughOnException() {},
    async next() {
      return new Response('Not found', { status: 404 })
    },
  }
}
