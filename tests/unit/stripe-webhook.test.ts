import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockVerifyWebhookSignature = vi.fn()
const mockIsWebhookProcessed = vi.fn()
const mockMarkWebhookProcessed = vi.fn()
const mockUpsertCustomer = vi.fn()
const mockUpsertSubscription = vi.fn()
const mockGetApplicationByDiscordId = vi.fn()
const mockGetCustomerByStripeId = vi.fn()
const mockAssignRoleWithRetry = vi.fn()
const mockRemoveRole = vi.fn()
const mockStripeCustomersRetrieve = vi.fn()
const mockStripeSubscriptionsRetrieve = vi.fn()

vi.mock('@/lib/stripe', () => ({
  stripe: {
    customers: {
      retrieve: mockStripeCustomersRetrieve,
    },
    subscriptions: {
      retrieve: mockStripeSubscriptionsRetrieve,
    },
  },
  verifyWebhookSignature: mockVerifyWebhookSignature,
}))

vi.mock('@/lib/db', () => ({
  isWebhookProcessed: mockIsWebhookProcessed,
  markWebhookProcessed: mockMarkWebhookProcessed,
  upsertCustomer: mockUpsertCustomer,
  upsertSubscription: mockUpsertSubscription,
  getApplicationByDiscordId: mockGetApplicationByDiscordId,
  getCustomerByStripeId: mockGetCustomerByStripeId,
}))

vi.mock('@/lib/bot-api', () => ({
  assignRoleWithRetry: mockAssignRoleWithRetry,
  removeRole: mockRemoveRole,
}))

function buildRequest(event: any) {
  mockVerifyWebhookSignature.mockReturnValue(event)
  const payload = JSON.stringify({ any: 'value' })
  return new NextRequest(
    new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test',
        'content-type': 'application/json',
      },
      body: payload,
    })
  )
}

describe('Stripe webhook handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.MEMBER_ROLE_ID = 'role123'
    mockIsWebhookProcessed.mockResolvedValue(false)
    mockMarkWebhookProcessed.mockResolvedValue(undefined)
    mockUpsertCustomer.mockResolvedValue({ id: 'db_customer_1', discord_user_id: 'discord123' })
    mockUpsertSubscription.mockResolvedValue(undefined)
    mockGetApplicationByDiscordId.mockResolvedValue({ id: 'app123', status: 'approved' })
    mockGetCustomerByStripeId.mockResolvedValue({ id: 'db_customer_1', discord_user_id: 'discord123' })
    mockAssignRoleWithRetry.mockResolvedValue(undefined)
    mockRemoveRole.mockResolvedValue(undefined)
    mockStripeCustomersRetrieve.mockResolvedValue({
      email: 'user@example.com',
      metadata: { discord_user_id: 'discord123' },
    })
    mockStripeSubscriptionsRetrieve.mockResolvedValue({
      id: 'sub_123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 86400,
      cancel_at_period_end: false,
      canceled_at: null,
    })
  })

  it('assigns role on checkout session completion', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const event = {
      id: 'evt_checkout',
      type: 'checkout.session.completed',
      data: {
        object: {
          customer: 'cus_123',
          subscription: 'sub_123',
        },
      },
    }

    const request = buildRequest(event)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockUpsertCustomer).toHaveBeenCalledWith({
      discord_user_id: 'discord123',
      stripe_customer_id: 'cus_123',
      email: 'user@example.com',
    })
    expect(mockAssignRoleWithRetry).toHaveBeenCalledWith('discord123', 'role123', 'app123')
    expect(mockMarkWebhookProcessed).toHaveBeenCalledWith('evt_checkout', 'stripe', 'checkout.session.completed')
  })

  it('assigns role on invoice payment success', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const event = {
      id: 'evt_invoice',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          customer: 'cus_123',
        },
      },
    }

    const request = buildRequest(event)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockAssignRoleWithRetry).toHaveBeenCalledWith('discord123', 'role123', 'app123')
    expect(mockRemoveRole).not.toHaveBeenCalled()
  })

  it('keeps role for past_due subscription update', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const event = {
      id: 'evt_past_due',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_456',
          customer: 'cus_123',
          status: 'past_due',
          cancel_at_period_end: false,
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 3600,
          canceled_at: null,
        },
      },
    }

    const request = buildRequest(event)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockAssignRoleWithRetry).toHaveBeenCalledWith('discord123', 'role123', 'app123')
    expect(mockRemoveRole).not.toHaveBeenCalled()
  })

  it('removes role when subscription fully ends', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const pastTime = Math.floor((Date.now() - 2 * 3600 * 1000) / 1000)
    const event = {
      id: 'evt_cancel_update',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_789',
          customer: 'cus_123',
          status: 'canceled',
          cancel_at_period_end: true,
          current_period_start: pastTime - 86400,
          current_period_end: pastTime,
          canceled_at: pastTime,
        },
      },
    }

    const request = buildRequest(event)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockRemoveRole).toHaveBeenCalledWith('discord123', 'role123')
  })

  it('removes role on subscription deleted event', async () => {
    const { POST } = await import('@/app/api/webhooks/stripe/route')

    const event = {
      id: 'evt_deleted',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'sub_del_1',
          customer: 'cus_123',
        },
      },
    }

    const request = buildRequest(event)
    const response = await POST(request)

    expect(response.status).toBe(200)
    expect(mockRemoveRole).toHaveBeenCalledWith('discord123', 'role123')
  })
})
