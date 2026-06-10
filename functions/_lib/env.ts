export type AppEnv = {
  DB: D1Database
  SUBMISSION_BUCKET: R2Bucket
  SESSION_SECRET: string
  STRIPE_SECRET_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  RESEND_API_KEY: string
  RESEND_FROM_EMAIL: string
  APP_BASE_URL: string
}
