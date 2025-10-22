import { NextRequest, NextResponse } from 'next/server'
import { getAllSubscriptions, getApplicationByDiscordId } from '@/lib/db'
import { assignRoleWithRetry, removeRole } from '@/lib/bot-api'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Optional: protect with a simple bearer token
    const expected = process.env.CRON_SECRET
    if (expected) {
      const provided = request.headers.get('authorization') || ''
      if (!provided.endsWith(expected)) {
        logger.warn('Cron unauthorized request', {
          source: 'cron-sync-roles',
          provided: provided ? `${provided.slice(0, 6)}…` : 'none',
        })
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const roleId = process.env.MEMBER_ROLE_ID
    if (!roleId) {
      logger.error('Cron missing MEMBER_ROLE_ID', undefined, {
        source: 'cron-sync-roles',
      })
      return NextResponse.json({ error: 'Missing MEMBER_ROLE_ID' }, { status: 400 })
    }

    const now = new Date()
    const subs = await getAllSubscriptions()

    let assigned = 0
    let removed = 0
    let skipped = 0

    for (const s of subs) {
      try {
        // Use discord_user_id from local customer data (no Stripe round-trip)
        const discordUserId = s.customer.discord_user_id
        if (!discordUserId) {
          skipped += 1
          logger.warn('Cron subscription missing discord id', {
            source: 'cron-sync-roles',
            subscriptionId: s.id,
          })
          continue
        }

        // Only act on approved applications
        const app = await getApplicationByDiscordId(discordUserId)
        if (!app || app.status !== 'approved') {
          skipped += 1
          logger.debug('Cron skipping non-approved application', {
            source: 'cron-sync-roles',
            subscriptionId: s.id,
            status: app?.status,
          })
          continue
        }

        const currentEnd = new Date(s.current_period_end)
        const shouldHaveRole =
          s.status === 'active' ||
          s.status === 'past_due' ||
          (s.status === 'canceled' && currentEnd > now)

        if (shouldHaveRole) {
          await assignRoleWithRetry(discordUserId, roleId, app.id)
          assigned += 1
          logger.info('Cron ensured role assignment', {
            source: 'cron-sync-roles',
            discordUserId,
            subscriptionStatus: s.status,
          })
        } else {
          await removeRole(discordUserId, roleId)
          removed += 1
          logger.info('Cron removed role', {
            source: 'cron-sync-roles',
            discordUserId,
            subscriptionStatus: s.status,
          })
        }
      } catch (e) {
        skipped += 1
        logger.error(
          'Cron sync error for subscription',
          e instanceof Error ? e : new Error('Unknown error'),
          {
            source: 'cron-sync-roles',
            subscriptionId: s.id,
          }
        )
      }
    }

    logger.info('Cron sync summary', {
      source: 'cron-sync-roles',
      processed: subs.length,
      assigned,
      removed,
      skipped,
    })

    return NextResponse.json({ ok: true, processed: subs.length, assigned, removed, skipped })
  } catch (error) {
    logger.error(
      'Cron sync fatal error',
      error instanceof Error ? error : new Error('Unknown error'),
      {
        source: 'cron-sync-roles',
      }
    )
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
