'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { getCustomerByDiscordId } from '@/lib/db'
import { createPortalSession } from '@/lib/stripe'
import Stripe from 'stripe'

type BillingPortalResult = {
  error?: string
}

export async function openBillingPortal(): Promise<BillingPortalResult | void> {
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')

  if (!discordUserCookie) {
    return { error: 'Please log in to manage billing.' }
  }

  const discordUser = parseDiscordUserCookie(discordUserCookie.value)
  if (!discordUser) {
    cookieStore.delete('discord_user')
    return { error: 'Session expired. Please log in again.' }
  }

  const customer = await getCustomerByDiscordId(discordUser.id)
  if (!customer) {
    return { error: 'No billing profile found yet.' }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined)

  if (!baseUrl) {
    return { error: 'App URL not configured. Please contact support.' }
  }

  try {
    const portalSession = await createPortalSession(
      customer.stripe_customer_id,
      `${baseUrl}/dashboard`
    )
    redirect(portalSession.url)
  } catch (error) {
    const { logger } = await import('@/lib/logger')
    logger.error('Failed to create Stripe portal session', error as Error, {
      operation: 'openBillingPortal',
      customerId: customer.stripe_customer_id,
    })

    // Parse Stripe errors for user-friendly messages
    // Customer portal not activated in Stripe Dashboard
    if (error instanceof Stripe.errors.StripeInvalidRequestError &&
        (error.message?.includes('No configuration provided') || error.message?.includes('portal'))) {
      return {
        error: 'Billing portal is not activated. Please contact support.'
      }
    }

    // Customer not found
    if (error instanceof Stripe.errors.StripeInvalidRequestError &&
        error.message?.includes('customer')) {
      return {
        error: 'Billing profile not found. Please contact support.'
      }
    }

    // Generic Stripe API error with code
    if (error instanceof Stripe.errors.StripeError && error.code) {
      return {
        error: `Unable to open billing portal (${error.code}). Please try again or contact support.`
      }
    }

    // Generic fallback
    return { error: 'Unable to open billing portal. Please try again later.' }
  }
}
