import type { AppEnv } from './env'

type EmailMessage = {
  to: string
  subject: string
  html: string
}

export async function sendEmail(env: AppEnv, message: EmailMessage) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL,
      to: [message.to],
      subject: message.subject,
      html: message.html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Resend failed with ${response.status}`)
  }
}
