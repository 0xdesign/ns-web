import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getCurrentDiscordUser } from '@/lib/admin-auth'
import { getApplication, resetApplicationToPending } from '@/lib/db'
import { revokeActivePaymentTokens } from '@/lib/payment-tokens'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()

    let revokeTokens = true
    try {
      const form = await request.formData()
      const formValue = form.get('revokeTokens')
      if (typeof formValue === 'string') {
        revokeTokens = !['false', '0', 'off'].includes(formValue.toLowerCase())
      }
    } catch {
      // Ignore body parse errors
    }

    const { id } = await params
    const application = await getApplication(id)

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.status === 'pending') {
      return NextResponse.json(
        { error: 'Application is already pending' },
        { status: 400 }
      )
    }

    if (application.status === 'approved' && revokeTokens) {
      try {
        await revokeActivePaymentTokens(application.id)
      } catch (error) {
        console.error('Failed to revoke payment tokens during reopen', error)
        return NextResponse.json(
          { error: 'Failed to revoke payment token. Try again or disable revocation.' },
          { status: 500 }
        )
      }
    }

    await resetApplicationToPending(id)

    const adminUser = await getCurrentDiscordUser()
    const reopenedBy = adminUser?.username ?? adminUser?.id ?? 'unknown admin'

    return NextResponse.json(
      {
        success: true,
        message: `Application moved back to pending by ${reopenedBy}.`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reopen application error:', error)

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json(
      { error: 'Failed to move application back to pending' },
      { status: 500 }
    )
  }
}
