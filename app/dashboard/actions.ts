'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { getCustomerByDiscordId } from '@/lib/db'
import { createPortalSession } from '@/lib/stripe'

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
    console.error('Failed to create Stripe portal session:', error)
    return { error: 'Unable to open billing portal. Please try again later.' }
  }
}
