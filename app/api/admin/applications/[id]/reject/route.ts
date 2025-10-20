/**
 * Reject application API endpoint
 *
 * Updates application status to rejected and sends rejection email
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getCurrentDiscordUser } from '@/lib/admin-auth'
import { getApplication, updateApplicationStatus } from '@/lib/db'
import { sendRejectionEmail } from '@/lib/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    await requireAdmin()

    let sendEmail = true
    try {
      const form = await request.formData()
      const formValue = form.get('sendEmail')
      if (typeof formValue === 'string') {
        sendEmail = !['false', '0', 'off'].includes(formValue.toLowerCase())
      }
    } catch {
      // Ignore body parse errors
    }

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
    await updateApplicationStatus(id, 'rejected', adminId)

    // Send rejection email
    if (sendEmail) {
      try {
        await sendRejectionEmail({
          to: application.email,
          username: application.discord_username,
        })
        console.log('Rejection email sent', { applicationId: application.id })
      } catch (emailError) {
        console.error('Failed to send rejection email', {
          applicationId: application.id,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        })
        // Don't fail the whole rejection if email fails
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: sendEmail
          ? 'Application rejected and email sent'
          : 'Application rejected (email skipped)',
        email: application.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reject application error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to reject application' },
      { status: 500 }
    )
  }
}
