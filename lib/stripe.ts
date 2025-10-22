/**
 * Stripe utilities
 *
 * Provides Stripe client and helper functions for subscription management.
 */

import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not configured')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
})

/**
 * Create Stripe customer
 */
export async function createCustomer(
  email: string,
  discordUserId: string,
  discordUsername: string
): Promise<Stripe.Customer> {
  return await stripe.customers.create({
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
  return await stripe.checkout.sessions.create({
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
  return await stripe.subscriptions.retrieve(subscriptionId)
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })
}

/**
 * Reactivate subscription
 */
export async function reactivateSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.update(subscriptionId, {
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
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
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
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

/**
 * Get customer portal configuration
 */
export async function getPortalConfiguration(): Promise<Stripe.BillingPortal.Configuration> {
  // Get or create default portal configuration
  const configurations = await stripe.billingPortal.configurations.list({ limit: 1 })

  if (configurations.data.length > 0) {
    return configurations.data[0]
  }

  // Create default configuration
  return await stripe.billingPortal.configurations.create({
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
