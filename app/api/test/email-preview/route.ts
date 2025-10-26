import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get('type') || 'approval'
  const username = searchParams.get('username') || 'Alex'
  const paymentUrl = searchParams.get('paymentUrl') || 'https://rasp.club/pay/demo-token-123'

  let html = ''

  switch (type) {
    case 'approval':
      html = getApprovalEmailHTML(username, paymentUrl)
      break
    case 'rejection':
      html = getRejectionEmailHTML(username)
      break
    case 'waitlist':
      html = getWaitlistEmailHTML(username)
      break
    default:
      return NextResponse.json({ error: 'Invalid type. Use: approval, rejection, or waitlist' }, { status: 400 })
  }

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}

function getApprovalEmailHTML(username: string, paymentUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap');
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #ededed; background: #0a0a0a; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 60px 20px;">
    <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 40px; margin-bottom: 40px;">
      <h1 style="font-family: 'Instrument Serif', Georgia, serif; color: #ffffff; margin: 0; font-size: 34px; font-weight: 400; line-height: 1.2; letter-spacing: -0.01em;">You're in</h1>
    </div>

    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">${username},</p>

    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">Complete payment to unlock Discord. Link expires in 7 days.</p>

    <div style="margin: 48px 0;">
      <a href="${paymentUrl}" style="display: inline-block; background: #ffffff; color: #0a0a0a; padding: 16px 32px; text-decoration: none; border-radius: 9999px; font-weight: 500; font-size: 16px;">Complete payment</a>
    </div>

    <p style="font-size: 16px; margin: 80px 0 0 0; color: #ededed;">— Rasp</p>
  </div>
</body>
</html>`
}

function getRejectionEmailHTML(username: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap');
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #ededed; background: #0a0a0a; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 60px 20px;">
    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">${username},</p>

    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">We've decided not to move forward with your application. You're welcome to reapply with updated work.</p>

    <p style="font-size: 16px; margin: 80px 0 0 0; color: #ededed;">— Rasp</p>
  </div>
</body>
</html>`
}

function getWaitlistEmailHTML(username: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap');
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #ededed; background: #0a0a0a; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 60px 20px;">
    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">${username},</p>

    <p style="font-size: 16px; margin: 0 0 20px 0; color: #ededed; line-height: 1.6;">You're on the waitlist. We'll notify you if a spot opens. Keep building in the meantime.</p>

    <p style="font-size: 16px; margin: 80px 0 0 0; color: #ededed;">— Rasp</p>
  </div>
</body>
</html>`
}
