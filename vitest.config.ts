import {
  cloudflareTest,
  readD1Migrations,
} from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      miniflare: {
        compatibilityDate: '2026-06-10',
        d1Databases: ['DB'],
        r2Buckets: ['SUBMISSION_BUCKET'],
        serviceBindings: {
          ASSETS: () => Promise.resolve(new Response('Not found', { status: 404 })),
        },
        bindings: {
          TEST_MIGRATIONS: await readD1Migrations('migrations'),
          SESSION_SECRET: 'test-session-secret',
          RESEND_API_KEY: 're_test',
          RESEND_FROM_EMAIL: 'contest@example.com',
          APP_BASE_URL: 'https://contest.example.com',
          STRIPE_SECRET_KEY: 'sk_test_unused',
          STRIPE_WEBHOOK_SECRET: 'whsec_unused',
        },
      },
    })),
  ],
  test: {
    setupFiles: ['./test/apply-migrations.ts'],
    passWithNoTests: true,
  },
})
