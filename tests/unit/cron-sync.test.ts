import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetAllSubscriptions = vi.fn()
const mockGetApplicationByDiscordId = vi.fn()
const mockAssignRoleWithRetry = vi.fn()
const mockRemoveRole = vi.fn()
const mockLoggerInfo = vi.fn()
const mockLoggerWarn = vi.fn()
const mockLoggerError = vi.fn()

vi.mock('@/lib/db', () => ({
  getAllSubscriptions: mockGetAllSubscriptions,
  getApplicationByDiscordId: mockGetApplicationByDiscordId,
}))

vi.mock('@/lib/bot-api', () => ({
  assignRoleWithRetry: mockAssignRoleWithRetry,
  removeRole: mockRemoveRole,
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mockLoggerInfo,
    warn: mockLoggerWarn,
    error: mockLoggerError,
    debug: vi.fn(),
  },
}))

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest(
    new Request('http://localhost/api/cron/sync-roles', {
      method: 'GET',
      headers,
    })
  )
}

describe('cron sync roles endpoint', () => {
beforeEach(() => {
  vi.resetAllMocks()
  vi.resetModules()
  process.env.MEMBER_ROLE_ID = 'role123'
  process.env.CRON_SECRET = 'secret-token'
  mockGetAllSubscriptions.mockResolvedValue([])
  mockGetApplicationByDiscordId.mockResolvedValue(null)
})

  it('rejects unauthorized requests when secret provided', async () => {
    const { GET } = await import('@/app/api/cron/sync-roles/route')
    const response = await GET(makeRequest({ authorization: 'Bearer wrong' }))
    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe('Unauthorized')
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      'Cron unauthorized request',
      expect.objectContaining({ source: 'cron-sync-roles' })
    )
  })

  it('returns error when role id missing', async () => {
    delete process.env.MEMBER_ROLE_ID
    const { GET } = await import('@/app/api/cron/sync-roles/route')
    const response = await GET(makeRequest({ authorization: 'Bearer secret-token' }))
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBe('Missing MEMBER_ROLE_ID')
    expect(mockLoggerError).toHaveBeenCalledWith(
      'Cron missing MEMBER_ROLE_ID',
      undefined,
      expect.objectContaining({ source: 'cron-sync-roles' })
    )
  })

  it('summarises assignments and removals', async () => {
    const now = new Date()
    mockGetAllSubscriptions.mockResolvedValue([
      {
        id: 'sub-assign',
        status: 'active',
        current_period_end: now.toISOString(),
        customer: { discord_user_id: 'user-assign' },
      },
      {
        id: 'sub-remove',
        status: 'canceled',
        current_period_end: new Date(now.getTime() - 1000).toISOString(),
        customer: { discord_user_id: 'user-remove' },
      },
      {
        id: 'sub-skip',
        status: 'active',
        current_period_end: now.toISOString(),
        customer: { discord_user_id: null },
      },
    ])

    mockGetApplicationByDiscordId.mockImplementation(async (discordId: string) => {
      if (discordId === 'user-assign') {
        return { id: 'app-assign', status: 'approved' }
      }
      if (discordId === 'user-remove') {
        return { id: 'app-remove', status: 'approved' }
      }
      return { id: 'app-other', status: 'pending' }
    })

    const { GET } = await import('@/app/api/cron/sync-roles/route')
    const response = await GET(makeRequest({ authorization: 'Bearer secret-token' }))
    expect(response.status).toBe(200)
    const body = await response.json()

    expect(body).toMatchObject({
      ok: true,
      processed: 3,
      assigned: 1,
      removed: 1,
    })

    expect(mockAssignRoleWithRetry).toHaveBeenCalledWith('user-assign', 'role123', 'app-assign')
    expect(mockRemoveRole).toHaveBeenCalledWith('user-remove', 'role123')
    expect(mockLoggerInfo).toHaveBeenCalledWith(
      'Cron sync summary',
      expect.objectContaining({
        processed: 3,
        assigned: 1,
        removed: 1,
        skipped: expect.any(Number),
      })
    )
  })
})
