import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getApplication } from '@/lib/db'
import {
  generatePaymentToken,
  revokeActivePaymentTokens,
} from '@/lib/payment-tokens'
import {
  sendApprovalEmail,
  sendRejectionEmail,
  sendWaitlistEmail,
} from '@/lib/resend'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    const { id } = await params
    const application = await getApplication(id)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status === 'pending') {
      return NextResponse.json(
        { error: 'Pending applications do not have status emails yet' },
        { status: 400 }
      )
    }

    if (application.status === 'approved') {
      await revokeActivePaymentTokens(application.id)
      const newToken = await generatePaymentToken(application.id)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      if (!baseUrl) {
        return NextResponse.json(
          { error: 'Configuration error', detail: 'NEXT_PUBLIC_APP_URL is not set' },
          { status: 500 }
        )
      }
      const paymentUrl = `${baseUrl.replace(/\/$/, '')}/pay/${newToken}`

      await sendApprovalEmail({
        to: application.email,
        username: application.discord_username,
        paymentUrl,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Approval email resent with a fresh payment link.',
          paymentUrl,
        },
        { status: 200 }
      )
    }

    if (application.status === 'waitlisted') {
      await sendWaitlistEmail({
        to: application.email,
        username: application.discord_username,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Waitlist email resent.',
        },
        { status: 200 }
      )
    }

    if (application.status === 'rejected') {
      await sendRejectionEmail({
        to: application.email,
        username: application.discord_username,
      })

      return NextResponse.json(
        {
          success: true,
          message: 'Rejection email resent.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: `Unsupported status: ${application.status}` },
      { status: 400 }
    )
  } catch (error) {
    console.error('Resend status email error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Forbidden', detail: 'Admin access required' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to resend status email' },
      { status: 500 }
    )
  }
}
