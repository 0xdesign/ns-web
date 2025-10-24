import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import {
  getStripeClient,
  isStripeConfigured,
  verifyWebhookSignature,
} from '@/lib/stripe'
import {
  isWebhookProcessed,
  markWebhookProcessed,
  upsertCustomer,
  upsertSubscription,
  getApplicationByDiscordId,
  getCustomerByStripeId,
} from '@/lib/db'
import { assignRoleWithRetry, removeRole } from '@/lib/bot-api'
import type { Subscription as DbSubscription } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type StripeCustomer = Stripe.Customer | Stripe.DeletedCustomer

type SubscriptionWithPeriodFields = Stripe.Subscription & {
  current_period_start: number | null
  current_period_end: number | null
}

const isStripeCustomer = (customer: StripeCustomer): customer is Stripe.Customer =>
  !('deleted' in customer)

const extractCustomerId = (
  customer: string | Stripe.Customer | Stripe.DeletedCustomer | null
): string | null => {
  if (!customer) return null
  if (typeof customer === 'string') return customer
  return customer.id
}

const getDiscordUserIdFromCustomer = (customer: StripeCustomer): string | undefined => {
  if (!isStripeCustomer(customer)) return undefined
  return customer.metadata?.discord_user_id
}

const normalizeSubscriptionStatus = (
  status: Stripe.Subscription.Status
): DbSubscription['status'] => {
  switch (status) {
    case 'active':
    case 'past_due':
    case 'canceled':
    case 'unpaid':
    case 'incomplete':
      return status
    case 'trialing':
      return 'active'
    case 'incomplete_expired':
      return 'incomplete'
    case 'paused':
      return 'canceled'
    default:
      return 'incomplete'
  }
}

const maskIdentifier = (value: string, visible = 4) => {
  if (value.length <= visible) return value
  const maskedPortion = '*'.repeat(Math.max(0, value.length - visible))
  return `${maskedPortion}${value.slice(-visible)}`
}

export async function POST(request: NextRequest) {
  try {
    if (!isStripeConfigured()) {
      console.error('Received Stripe webhook but STRIPE_SECRET_KEY is not configured.')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }

    const sig = request.headers.get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
    }

    const payload = await request.text()
    const event = verifyWebhookSignature(payload, sig, secret)
    const stripe = getStripeClient()

    // Idempotency check
    const alreadyProcessed = await isWebhookProcessed(event.id)
    if (alreadyProcessed) {
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = extractCustomerId(session.customer)
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id ?? null

        if (!customerId || !subscriptionId) break

        const customer = await stripe.customers.retrieve(customerId)
        let discordUserId = getDiscordUserIdFromCustomer(customer)
        let email = isStripeCustomer(customer) && customer.email ? customer.email : null

        if (!discordUserId) {
          const existingCustomer = await getCustomerByStripeId(customerId)
          if (existingCustomer?.discord_user_id) {
            discordUserId = existingCustomer.discord_user_id
            email = email ?? existingCustomer.email ?? null
            console.warn(
              `ℹ️  Stripe customer ${maskIdentifier(customerId)} missing metadata.discord_user_id; fell back to Supabase record`
            )
          } else {
            console.error(
              `❌  Unable to resolve Discord user for Stripe customer ${maskIdentifier(customerId)}`
            )
            throw new Error('STRIPE_CUSTOMER_MISSING_DISCORD_ID')
          }
        }

        const dbCustomer = await upsertCustomer({
          discord_user_id: discordUserId,
          stripe_customer_id: customerId,
          email: email ?? 'unknown@example.com',
        })

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as unknown as SubscriptionWithPeriodFields
        const normalizedStatus = normalizeSubscriptionStatus(subscription.status)
        const currentPeriodStartIso = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : new Date().toISOString()
        const currentPeriodEndIso = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : new Date().toISOString()

        await upsertSubscription({
          customer_id: dbCustomer.id,
          stripe_subscription_id: subscription.id,
          status: normalizedStatus,
          current_period_start: currentPeriodStartIso,
          current_period_end: currentPeriodEndIso,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })

        const paymentTokenId = session.metadata?.payment_token_id
        if (paymentTokenId) {
          const maskedToken = maskIdentifier(paymentTokenId)
          try {
            const { markTokenAsUsed } = await import('@/lib/payment-tokens')
            await markTokenAsUsed(paymentTokenId)
            console.log(`✅ Invalidated payment token ${maskedToken} after successful payment`)
          } catch (e) {
            console.error(
              `⚠️  Failed to invalidate payment token ${maskedToken}:`,
              e instanceof Error ? e.message : e
            )
          }
        }

        const app = await getApplicationByDiscordId(discordUserId)
        if (app && app.status === 'approved') {
          const roleId = process.env.MEMBER_ROLE_ID
          if (roleId) {
            try {
              await assignRoleWithRetry(discordUserId, roleId, app.id)
              console.log(`✅ Assigned role to ${discordUserId} on checkout completion`)
            } catch (e) {
              console.error(
                `⚠️  Failed to assign role to ${discordUserId}:`,
                e instanceof Error ? e.message : e
              )
              console.error('   → User may need to join the Discord server first')
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = extractCustomerId(invoice.customer)
        if (!customerId) break

        const customer = await stripe.customers.retrieve(customerId)
        const discordUserId = getDiscordUserIdFromCustomer(customer)
        if (!discordUserId) break

        const app = await getApplicationByDiscordId(discordUserId)
        if (app && app.status === 'approved') {
          const roleId = process.env.MEMBER_ROLE_ID
          if (roleId) {
            try {
              await assignRoleWithRetry(discordUserId, roleId, app.id)
              console.log(`✅ Assigned role to ${discordUserId} on payment success`)
            } catch (e) {
              console.error(
                `⚠️  Failed to assign role to ${discordUserId}:`,
                e instanceof Error ? e.message : e
              )
              console.error('   → User may need to join the Discord server first')
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as SubscriptionWithPeriodFields
        const stripeCustomerId = extractCustomerId(subscription.customer)
        if (!stripeCustomerId) break

        const normalizedStatus = normalizeSubscriptionStatus(subscription.status)
        const currentPeriodEndDate = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000)
          : new Date()
        const currentPeriodStartIso = subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : new Date().toISOString()

        const dbCustomer = await getCustomerByStripeId(stripeCustomerId)
        if (!dbCustomer) {
          console.error('Customer not found for subscription update:', stripeCustomerId)
          break
        }

        await upsertSubscription({
          customer_id: dbCustomer.id,
          stripe_subscription_id: subscription.id,
          status: normalizedStatus,
          current_period_start: currentPeriodStartIso,
          current_period_end: currentPeriodEndDate.toISOString(),
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          canceled_at: subscription.canceled_at
            ? new Date(subscription.canceled_at * 1000).toISOString()
            : null,
        })

        const discordUserId = dbCustomer.discord_user_id
        if (!discordUserId) break

        const app = await getApplicationByDiscordId(discordUserId)
        if (!app || app.status !== 'approved') break

        const roleId = process.env.MEMBER_ROLE_ID
        if (!roleId) break

        const now = new Date()
        const shouldHaveRole =
          normalizedStatus === 'active' ||
          normalizedStatus === 'past_due' ||
          (normalizedStatus === 'canceled' && currentPeriodEndDate > now)

        try {
          if (shouldHaveRole) {
            await assignRoleWithRetry(discordUserId, roleId, app.id)
            console.log(`✅ Assigned role to ${discordUserId} on subscription update`)
          } else {
            await removeRole(discordUserId, roleId)
            console.log(`✅ Removed role from ${discordUserId} on subscription update`)
          }
        } catch (e) {
          console.error(
            `⚠️  Failed to sync role for ${discordUserId}:`,
            e instanceof Error ? e.message : e
          )
          console.error('   → User may need to join the Discord server first')
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = extractCustomerId(subscription.customer)
        if (!customerId) break

        const customer = await stripe.customers.retrieve(customerId)
        const discordUserId = getDiscordUserIdFromCustomer(customer)
        if (!discordUserId) break

        const roleId = process.env.MEMBER_ROLE_ID
        if (!roleId) break
        try {
          await removeRole(discordUserId, roleId)
        } catch (e) {
          console.error('Failed to remove role on subscription deleted:', e)
        }
        break
      }

      default:
        // Ignore other events
        break
    }

    await markWebhookProcessed(event.id, 'stripe', event.type)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 400 })
  }
}
