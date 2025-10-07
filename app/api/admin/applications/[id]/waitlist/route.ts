/**
 * Waitlist application API endpoint
 *
 * Updates application status to waitlisted and optionally sends a notification email
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getCurrentDiscordUser } from '@/lib/admin-auth'
import { getApplication, updateApplicationStatus } from '@/lib/db'
import { sendWaitlistEmail } from '@/lib/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    await requireAdmin()

    const { id } = await params

    // Get application
    const application = await getApplication(id)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: `Application is already ${application.status}` },
        { status: 400 }
      )
    }

    // Get admin user for audit trail
    const adminUser = await getCurrentDiscordUser()
    const adminId = adminUser?.id || 'unknown'

    // Update application status
    await updateApplicationStatus(id, 'waitlisted', adminId)

    // Send waitlist email (best-effort)
    try {
      await sendWaitlistEmail({
        to: application.email,
        username: application.discord_username,
      })
      console.log('Waitlist email sent successfully to:', application.email)
    } catch (emailError) {
      console.error('Failed to send waitlist email:', emailError)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Application waitlisted and email sent',
        email: application.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Waitlist application error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to waitlist application' },
      { status: 500 }
    )
  }
}

