import { NextRequest, NextResponse } from 'next/server'
import { stripe, verifyWebhookSignature } from '@/lib/stripe'
import {
  isWebhookProcessed,
  markWebhookProcessed,
  upsertCustomer,
  upsertSubscription,
  getApplicationByDiscordId,
  getCustomerByStripeId,
} from '@/lib/db'
import { assignRoleWithRetry, removeRole } from '@/lib/bot-api'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const sig = request.headers.get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET

    if (!sig || !secret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 400 })
    }

    const payload = await request.text()
    const event = verifyWebhookSignature(payload, sig, secret)

    // Idempotency check
    const alreadyProcessed = await isWebhookProcessed(event.id)
    if (alreadyProcessed) {
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any // Stripe.Checkout.Session
        const customerId: string | null = session.customer || null
        const subscriptionId: string | null = session.subscription || null

        if (!customerId || !subscriptionId) break

        // Retrieve customer to get metadata (discord_user_id)
        const customer = await stripe.customers.retrieve(customerId)
        const email = (customer as any).email as string | null
        const discordUserId = (customer as any).metadata?.discord_user_id as string | undefined

        if (!discordUserId) break

        // Upsert customer and get database customer record
        const dbCustomer = await upsertCustomer({
          discord_user_id: discordUserId,
          stripe_customer_id: customerId,
          email: email || 'unknown@example.com',
        })

        // Retrieve subscription for details + metadata
        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        await upsertSubscription({
          customer_id: dbCustomer.id, // Use database customer ID, not Stripe customer ID
          stripe_subscription_id: sub.id,
          status: (sub.status as any) || 'active',
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: !!sub.cancel_at_period_end,
          canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
        })

        // Role assignment guard: only for approved application
        const app = await getApplicationByDiscordId(discordUserId)
        if (app && app.status === 'approved') {
          const roleId = process.env.MEMBER_ROLE_ID
          if (roleId) {
            try {
              await assignRoleWithRetry(discordUserId, roleId, app.id)
              console.log(`✅ Assigned role to ${discordUserId} on checkout completion`)
            } catch (e) {
              console.error(`⚠️  Failed to assign role to ${discordUserId}:`, e instanceof Error ? e.message : e)
              console.error('   → User may need to join the Discord server first')
            }
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        // Reinforce role for active/past_due members
        const invoice = event.data.object as any
        const customerId = invoice.customer as string
        if (!customerId) break
        const customer = await stripe.customers.retrieve(customerId)
        const discordUserId = (customer as any).metadata?.discord_user_id as string | undefined
        if (!discordUserId) break

        const app = await getApplicationByDiscordId(discordUserId)
        if (app && app.status === 'approved') {
          const roleId = process.env.MEMBER_ROLE_ID
          if (roleId) {
            try {
              await assignRoleWithRetry(discordUserId, roleId, app.id)
              console.log(`✅ Assigned role to ${discordUserId} on payment success`)
            } catch (e) {
              console.error(`⚠️  Failed to assign role to ${discordUserId}:`, e instanceof Error ? e.message : e)
              console.error('   → User may need to join the Discord server first')
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const stripeCustomerId = subscription.customer as string
        const status = subscription.status as string
        const cancelAtPeriodEnd = !!subscription.cancel_at_period_end
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)

        // Get database customer by Stripe customer ID
        const dbCustomer = await getCustomerByStripeId(stripeCustomerId)
        if (!dbCustomer) {
          console.error('Customer not found for subscription update:', stripeCustomerId)
          break
        }

        await upsertSubscription({
          customer_id: dbCustomer.id, // Use database customer ID
          stripe_subscription_id: subscription.id,
          status: (status as any),
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : new Date().toISOString(), // Fallback to now if missing
          current_period_end: currentPeriodEnd.toISOString(),
          cancel_at_period_end: cancelAtPeriodEnd,
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

        // Keep role while active or past_due, or until period end if canceled
        const now = new Date()
        const shouldHaveRole =
          status === 'active' ||
          status === 'past_due' ||
          (status === 'canceled' && currentPeriodEnd > now)

        try {
          if (shouldHaveRole) {
            await assignRoleWithRetry(discordUserId, roleId, app.id)
            console.log(`✅ Assigned role to ${discordUserId} on subscription update`)
          } else {
            await removeRole(discordUserId, roleId)
            console.log(`✅ Removed role from ${discordUserId} on subscription update`)
          }
        } catch (e) {
          console.error(`⚠️  Failed to sync role for ${discordUserId}:`, e instanceof Error ? e.message : e)
          console.error('   → User may need to join the Discord server first')
        }
        break
      }

      case 'customer.subscription.deleted': {
        // Remove role when subscription fully ends
        const subscription = event.data.object as any
        const customerId = subscription.customer as string
        const customer = await stripe.customers.retrieve(customerId)
        const discordUserId = (customer as any).metadata?.discord_user_id as string | undefined
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

