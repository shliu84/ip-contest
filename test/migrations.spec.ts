import { env } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

describe('database migrations', () => {
  it('creates sessions and cascades user deletion', async () => {
    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO users (id, email, password_hash)
         VALUES (?, ?, ?)`,
      ).bind('user-cascade', 'cascade@example.com', 'password-hash'),
      env.DB.prepare(
        `INSERT INTO sessions (id, user_id, token_hash, expires_at)
         VALUES (?, ?, ?, ?)`,
      ).bind('session-cascade', 'user-cascade', 'token-hash', '2099-01-01T00:00:00Z'),
    ])

    const inserted = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE id = ?',
    )
      .bind('session-cascade')
      .first<{ user_id: string }>()

    expect(inserted?.user_id).toBe('user-cascade')

    await env.DB.prepare('DELETE FROM users WHERE id = ?').bind('user-cascade').run()

    const remaining = await env.DB.prepare(
      'SELECT COUNT(*) AS count FROM sessions WHERE id = ?',
    )
      .bind('session-cascade')
      .first<{ count: number }>()

    expect(remaining?.count).toBe(0)
  })
})

describe.sequential('database isolation', () => {
  it('can leave data for the next test setup to clear', async () => {
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_hash)
       VALUES (?, ?, ?)`,
    )
      .bind('user-isolation', 'isolation@example.com', 'password-hash')
      .run()

    const inserted = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first<{
      count: number
    }>()

    expect(inserted?.count).toBe(1)
  })

  it('starts with an empty database after beforeEach', async () => {
    const users = await env.DB.prepare('SELECT COUNT(*) AS count FROM users').first<{
      count: number
    }>()
    const sessions = await env.DB.prepare('SELECT COUNT(*) AS count FROM sessions').first<{
      count: number
    }>()

    expect(users?.count).toBe(0)
    expect(sessions?.count).toBe(0)
  })
})
