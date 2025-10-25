/**
 * Stripe utilities
 *
 * Provides Stripe client and helper functions for subscription management.
 */

import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? null

let stripeClient: Stripe | null = null

if (stripeSecretKey) {
  stripeClient = new Stripe(stripeSecretKey, {
    apiVersion: '2025-09-30.clover',
    typescript: true,
    maxNetworkRetries: 2,
  })
} else if (process.env.NODE_ENV !== 'production') {
  console.warn(
    'Stripe secret key missing; billing features are disabled until STRIPE_SECRET_KEY is set.'
  )
}

function requireStripe(): Stripe {
  if (!stripeClient) {
    throw new Error(
      'Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing features.'
    )
  }
  return stripeClient
}

export function isStripeConfigured(): boolean {
  return stripeClient !== null
}

export function getStripeClient(): Stripe {
  return requireStripe()
}

/**
 * Create Stripe customer
 */
export async function createCustomer(
  email: string,
  discordUserId: string,
  discordUsername: string
): Promise<Stripe.Customer> {
  const client = requireStripe()
  return await client.customers.create({
    email,
    metadata: {
      discord_user_id: discordUserId,
      discord_username: discordUsername,
    },
  })
}

/**
 * Create subscription checkout session
 */
export async function createSubscriptionCheckout(params: {
  customerId: string
  priceId: string
  applicationId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<Stripe.Checkout.Session> {
  const client = requireStripe()
  return await client.checkout.sessions.create({
    customer: params.customerId,
    mode: 'subscription',
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      application_id: params.applicationId,
      // Include any additional metadata passed from caller
      ...params.metadata,
    },
    subscription_data: {
      metadata: {
        application_id: params.applicationId,
      },
    },
  })
}

/**
 * Get subscription by ID
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const client = requireStripe()
  return await client.subscriptions.retrieve(subscriptionId)
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const client = requireStripe()
  return await client.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const client = requireStripe()
  return await client.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  })
}

/**
 * Create billing portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const client = requireStripe()
  let configuration: Stripe.BillingPortal.Configuration | null = null

  try {
    configuration = await getPortalConfiguration()
  } catch (error) {
    // If configuration lookup fails we continue without it; Stripe will surface a meaningful error.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to load Stripe billing portal configuration:', error)
    }
  }

  return await client.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    ...(configuration ? { configuration: configuration.id } : {}),
  })
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const client = requireStripe()
  return client.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Retrieve a Stripe customer with default payment method expanded
 */
export async function getCustomerWithDefaultPaymentMethod(
  customerId: string
): Promise<Stripe.Customer> {
  const client = requireStripe()
  return (await client.customers.retrieve(customerId, {
    expand: ['invoice_settings.default_payment_method'],
  })) as Stripe.Customer
}

/**
 * List recent invoices for a customer
 */
export async function listInvoicesForCustomer(params: {
  customerId: string
  limit?: number
}): Promise<Stripe.ApiList<Stripe.Invoice>> {
  const client = requireStripe()
  return await client.invoices.list({
    customer: params.customerId,
    limit: params.limit ?? 10,
  })
}

/**
 * Get customer portal configuration
 */
export async function getPortalConfiguration(): Promise<Stripe.BillingPortal.Configuration> {
  const client = requireStripe()
  // Get or create default portal configuration
  const configurations = await client.billingPortal.configurations.list({ limit: 1 })

  if (configurations.data.length > 0) {
    return configurations.data[0]
  }

  // Create default configuration
  return await client.billingPortal.configurations.create({
    business_profile: {
      headline: 'Manage your membership',
    },
    features: {
      payment_method_update: {
        enabled: true,
      },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
      },
      invoice_history: {
        enabled: true,
      },
    },
  })
}
