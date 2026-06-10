import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiRequestError,
  handleApi,
} from '../functions/_lib/http'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleApi', () => {
  it('turns ApiRequestError into a standard API error response', async () => {
    const response = await handleApi(async () => {
      throw new ApiRequestError('conflict', 'Email already registered', 409)
    })

    expect(response.status).toBe(409)
    expect(await response.json()).toEqual({
      error: {
        code: 'conflict',
        message: 'Email already registered',
      },
    })
  })

  it('logs unknown errors and returns a standard server error', async () => {
    const error = new Error('database unavailable')
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await handleApi(async () => {
      throw error
    })

    expect(consoleError).toHaveBeenCalledWith(error)
    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: {
        code: 'server_error',
        message: 'Internal server error',
      },
    })
  })
})
