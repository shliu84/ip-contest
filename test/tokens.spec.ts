import { describe, expect, it } from 'vitest'
import { createToken, hashToken } from '../functions/_lib/tokens'

describe('tokens', () => {
  it('creates a 32-byte URL-safe raw token', () => {
    const token = createToken()

    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/)
  })

  it('hashes the same token consistently', async () => {
    const token = createToken()

    expect(await hashToken(token)).toBe(await hashToken(token))
    expect(await hashToken(`${token}x`)).not.toBe(await hashToken(token))
  })
})
