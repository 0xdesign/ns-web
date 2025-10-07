import { redirect } from 'next/navigation'
import { getApplication } from '@/lib/db'
import { validatePaymentToken, markTokenAsUsed } from '@/lib/payment-tokens'

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
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid or expired payment link
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Please request a new payment link from the admin team.
          </p>
        </div>
      </main>
    )
  }

  // Get application details
  const application = await getApplication(tokenRow.application_id)
  if (!application) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Application not found
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Contact support if this issue persists.
          </p>
        </div>
      </main>
    )
  }

  if (application.status !== 'approved') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Application not approved
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Only approved applicants can continue to payment.
          </p>
        </div>
      </main>
    )
  }

  // Lazy import Stripe helpers to avoid env checks at module init
  const { createCustomer, createSubscriptionCheckout } = await import('@/lib/stripe')
  const { getCustomerByDiscordId, upsertCustomer } = await import('@/lib/db')

  // Ensure Stripe env
  const priceId = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  if (!priceId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Payment unavailable
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Stripe is not configured. Please try again later.
          </p>
        </div>
      </main>
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

  // Create Checkout session for subscription
  const session = await createSubscriptionCheckout({
    customerId: stripeCustomerId!,
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
