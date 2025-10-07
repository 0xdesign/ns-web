import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriptions, getApplicationByDiscordId } from '@/lib/db'
import { assignRoleWithRetry, removeRole } from '@/lib/bot-api'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Optional: protect with a simple bearer token
    const expected = process.env.CRON_SECRET
    if (expected) {
      const provided = request.headers.get('authorization') || ''
      if (!provided.endsWith(expected)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const roleId = process.env.MEMBER_ROLE_ID
    if (!roleId) {
      return NextResponse.json({ error: 'Missing MEMBER_ROLE_ID' }, { status: 400 })
    }

    const now = new Date()
    const subs = await getAllSubscriptions()

    for (const s of subs) {
      try {
        // Use discord_user_id from local customer data (no Stripe round-trip)
        const discordUserId = s.customer.discord_user_id
        if (!discordUserId) continue

        // Only act on approved applications
        const app = await getApplicationByDiscordId(discordUserId)
        if (!app || app.status !== 'approved') continue

        const currentEnd = new Date(s.current_period_end)
        const shouldHaveRole =
          s.status === 'active' ||
          s.status === 'past_due' ||
          (s.status === 'canceled' && currentEnd > now)

        if (shouldHaveRole) {
          await assignRoleWithRetry(discordUserId, roleId, app.id)
        } else {
          await removeRole(discordUserId, roleId)
        }
      } catch (e) {
        console.error('Cron sync error for subscription:', s.id, e)
      }
    }

    return NextResponse.json({ ok: true, processed: subs.length })
  } catch (error) {
    console.error('Cron sync error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}

