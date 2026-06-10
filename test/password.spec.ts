import { describe, expect, it } from 'vitest'
import { hashPassword, verifyPassword } from '../functions/_lib/password'

describe('password hashing', () => {
  it('verifies the original password and rejects another password', async () => {
    const encoded = await hashPassword('correct horse battery staple')

    expect(encoded).toMatch(/^pbkdf2_sha256\$310000\$[A-Za-z0-9_-]+\$[A-Za-z0-9_-]+$/)
    expect(await verifyPassword('correct horse battery staple', encoded)).toBe(true)
    expect(await verifyPassword('wrong password', encoded)).toBe(false)
  })

  it('uses a new salt for each hash', async () => {
    const first = await hashPassword('same password')
    const second = await hashPassword('same password')

    expect(first).not.toBe(second)
  })

  it.each([
    '',
    'pbkdf2_sha256',
    'pbkdf2_sha256$310000$salt',
    'pbkdf2_sha256$310001$c2FsdA$aGFzaA',
    'pbkdf2_sha1$310000$c2FsdA$aGFzaA',
    'pbkdf2_sha256$310000$***$aGFzaA',
    'pbkdf2_sha256$310000$c2FsdA$***',
  ])('returns false for malformed hash %j', async (encoded) => {
    expect(await verifyPassword('password', encoded)).toBe(false)
  })
})
