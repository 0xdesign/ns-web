import { redirect } from 'next/navigation'
import { getApplication } from '@/lib/db'
import { validatePaymentToken, markTokenAsUsed } from '@/lib/payment-tokens'
import { ErrorMessage } from '@/components/ErrorMessage'

export const dynamic = 'force-dynamic'

export default async function PayWithTokenPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  // Validate token
  const tokenRow = await validatePaymentToken(token)
  if (!tokenRow) {
    return (
      <ErrorMessage
        title="Invalid or expired payment link"
        message="Please request a new payment link from the admin team."
      />
    )
  }

  // Get application details
  const application = await getApplication(tokenRow.application_id)
  if (!application) {
    return (
      <ErrorMessage
        title="Application not found"
        message="Contact support if this issue persists."
      />
    )
  }

  if (application.status !== 'approved') {
    return (
      <ErrorMessage
        title="Application not approved"
        message="Only approved applicants can continue to payment."
      />
    )
  }

  // Lazy import Stripe helpers to avoid env checks at module init
  const { createCustomer, createSubscriptionCheckout } = await import('@/lib/stripe')
  const { getCustomerByDiscordId, upsertCustomer } = await import('@/lib/db')

  // Ensure Stripe env
  const priceId = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!priceId || !appUrl) {
    return (
      <ErrorMessage
        title="Payment unavailable"
        message="Payment system is not properly configured. Please try again later."
      />
    )
  }

  // Find or create Stripe customer for this Discord user
  const existingCustomer = await getCustomerByDiscordId(application.discord_user_id)
  let stripeCustomerId = existingCustomer?.stripe_customer_id
  if (!stripeCustomerId) {
    const customer = await createCustomer(
      application.email,
      application.discord_user_id,
      application.discord_username
    )
    await upsertCustomer({
      discord_user_id: application.discord_user_id,
      stripe_customer_id: customer.id,
      email: application.email,
    })
    stripeCustomerId = customer.id
  }

  // Ensure customer ID is set
  if (!stripeCustomerId) {
    return (
      <ErrorMessage
        title="Customer setup failed"
        message="Unable to set up your payment account. Please contact support."
      />
    )
  }

  // Create Checkout session for subscription
  const session = await createSubscriptionCheckout({
    customerId: stripeCustomerId,
    priceId,
    applicationId: application.id,
    successUrl: `${appUrl}/success?app=${encodeURIComponent(application.id)}`,
    cancelUrl: `${appUrl}/apply?canceled=1`,
  })

  // Mark token as used (prevents reuse)
  await markTokenAsUsed(tokenRow.id)

  // Redirect to Stripe Checkout
  redirect(session.url || `${appUrl}/apply`)
}
