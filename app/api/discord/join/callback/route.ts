import { NextRequest, NextResponse } from 'next/server'
import {
  exchangeCode,
  getDiscordUser,
  addUserToGuild,
  verifyJoinState,
} from '@/lib/discord'
import {
  getCustomerByDiscordId,
  getApplicationByDiscordId,
  getLatestSubscriptionForCustomer,
} from '@/lib/db'
import { assignRoleWithRetry } from '@/lib/bot-api'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    if (!state) {
      return NextResponse.redirect(new URL('/success?joined=0&error=missing_state', appUrl))
    }
    const parsed = verifyJoinState(state)
    if (!parsed) {
      return NextResponse.redirect(new URL('/success?joined=0&error=invalid_state', appUrl))
    }
    if (!code) {
      return NextResponse.redirect(new URL('/success?joined=0&error=missing_code', appUrl))
    }

    // Exchange code using the join redirect URI
    const token = await exchangeCode(code, process.env.DISCORD_JOIN_REDIRECT_URI)
    const user = await getDiscordUser(token.access_token)

    // Check application and current membership
    const app = await getApplicationByDiscordId(user.id)
    if (!app || app.status !== 'approved') {
      return NextResponse.redirect(new URL('/success?joined=0&error=not_approved', appUrl))
    }

    const customer = await getCustomerByDiscordId(user.id)
    if (!customer) {
      return NextResponse.redirect(new URL('/success?joined=0&error=no_customer', appUrl))
    }
    const sub = await getLatestSubscriptionForCustomer(customer.id) // Use database customer ID, not Stripe ID
    if (!sub) {
      return NextResponse.redirect(new URL('/success?joined=0&error=no_subscription', appUrl))
    }

    const now = new Date()
    const currentEnd = sub.current_period_end ? new Date(sub.current_period_end) : null
    const isCurrent =
      sub.status === 'active' ||
      sub.status === 'past_due' ||
      (sub.status === 'canceled' && currentEnd && currentEnd > now)

    if (!isCurrent) {
      return NextResponse.redirect(new URL('/success?joined=0&error=not_current', appUrl))
    }

    // Attempt to add to guild and set role in one shot
    const guildId = process.env.DISCORD_GUILD_ID!
    const roleId = process.env.MEMBER_ROLE_ID
    let ok = false
    try {
      ok = await addUserToGuild({
        guildId,
        userId: user.id,
        userAccessToken: token.access_token,
        roleId: roleId || undefined,
      })

      if (!ok) {
        console.warn(`⚠️  Failed to add user ${user.id} to guild ${guildId}`)
        console.warn('   → User may already be in guild, or bot lacks permissions')
        console.warn('   → Required bot permissions: Manage Server, Manage Roles')
      } else {
        console.log(`✅ Successfully added user ${user.id} to guild with role`)
      }
    } catch (e) {
      console.error(`❌ guilds.join API error for user ${user.id}:`, e)
      console.error('   → Check bot permissions and OAuth scopes')
    }

    // Ensure role assignment via bot as fallback
    if (roleId) {
      try {
        await assignRoleWithRetry(user.id, roleId, app.id)
      } catch (e) {
        console.error('assignRole fallback failed:', e)
      }
    }

    const joinedFlag = ok ? '1' : '0'
    return NextResponse.redirect(new URL(`/success?joined=${joinedFlag}`, appUrl))
  } catch (error) {
    console.error('Discord join callback error:', error)
    return NextResponse.redirect(new URL('/success?joined=0&error=callback_error', appUrl))
  }
}

