/**
 * Approve application API endpoint
 *
 * Generates payment token and sends approval email
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getCurrentDiscordUser } from '@/lib/admin-auth'
import { getApplication, updateApplicationStatus } from '@/lib/db'
import { generatePaymentToken, hasValidPaymentToken } from '@/lib/payment-tokens'
import { sendApprovalEmail } from '@/lib/resend'

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
      // Ignore body parse errors (likely no body sent)
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

    // Check if payment token already exists
    const hasToken = await hasValidPaymentToken(id)

    if (hasToken) {
      return NextResponse.json(
        { error: 'Payment token already generated for this application' },
        { status: 400 }
      )
    }

    // Generate payment token
    const token = await generatePaymentToken(id)

    // Get admin user for audit trail
    const adminUser = await getCurrentDiscordUser()
    const adminId = adminUser?.id || 'unknown'

    // Update application status
    await updateApplicationStatus(id, 'approved', adminId)

    // Generate payment URL
    const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/pay/${token}`

    // Send approval email
    if (sendEmail) {
      try {
        await sendApprovalEmail({
          to: application.email,
          username: application.discord_username,
          paymentUrl,
        })
        console.log('Approval email sent successfully to:', application.email)
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError)
        // Don't fail the whole approval if email fails
        // Admin can manually send the payment link if needed
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: sendEmail
          ? 'Application approved and email sent'
          : 'Application approved (email skipped)',
        paymentUrl,
        email: application.email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Approve application error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to approve application' },
      { status: 500 }
    )
  }
}
