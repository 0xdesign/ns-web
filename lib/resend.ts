/**
 * Resend email client
 *
 * Centralized email sending service using Resend
 */

import { Resend } from 'resend'

// Allow missing Resend config during development
// Email functions will throw errors if called without proper config
const RESEND_API_KEY = process.env.RESEND_API_KEY || 'dev-placeholder'
const FROM_EMAIL = process.env.FROM_EMAIL || 'dev@placeholder.com'

export const resend = new Resend(RESEND_API_KEY)

// Helper to check if Resend is properly configured
function isResendConfigured(): boolean {
  return (
    !!process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== 'dev-placeholder' &&
    !!process.env.FROM_EMAIL &&
    process.env.FROM_EMAIL !== 'dev@placeholder.com'
  )
}

/**
 * Send approval email with payment link
 */
export async function sendApprovalEmail({
  to,
  username,
  paymentUrl,
}: {
  to: string
  username: string
  paymentUrl: string
}) {
  if (!isResendConfigured()) {
    throw new Error(
      'Resend is not configured. Please set RESEND_API_KEY and FROM_EMAIL environment variables.'
    )
  }
  const subject = 'Your Rasp application — approved'

  const text = `${username},

You're in. Complete payment to unlock Discord.

${paymentUrl}

Link expires in 7 days.

— Rasp`

  const html = `<!DOCTYPE html>
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

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  })
}

/**
 * Send rejection email
 */
export async function sendRejectionEmail({
  to,
  username,
}: {
  to: string
  username: string
}) {
  if (!isResendConfigured()) {
    throw new Error(
      'Resend is not configured. Please set RESEND_API_KEY and FROM_EMAIL environment variables.'
    )
  }
  const subject = 'Your Rasp application'

  const text = `${username},

We've decided not to move forward with your application. You're welcome to reapply with updated work.

— Rasp`

  const html = `<!DOCTYPE html>
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

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  })
}

/**
 * Send waitlist email
 */
export async function sendWaitlistEmail({
  to,
  username,
}: {
  to: string
  username: string
}) {
  if (!isResendConfigured()) {
    throw new Error(
      'Resend is not configured. Please set RESEND_API_KEY and FROM_EMAIL environment variables.'
    )
  }

  const subject = 'Your Rasp application — waitlisted'

  const text = `${username},

You're on the waitlist. We'll notify you if a spot opens. Keep building in the meantime.

— Rasp`

  const html = `<!DOCTYPE html>
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

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    text,
    html,
  })
}

/**
 * Send admin notification for new application
 */
export async function sendNewApplicationNotification({
  username,
  email,
  whyJoin,
  whatBuilding,
  experienceLevel,
  socialLinks,
  projectLinks,
  adminUrl,
}: {
  username: string
  email: string
  whyJoin: string
  whatBuilding: string
  experienceLevel: string
  socialLinks: string[]
  projectLinks: string[]
  adminUrl: string
}) {
  if (!isResendConfigured()) {
    console.log('Resend not configured, skipping admin notification email')
    return null
  }

  const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'me@0xdesigner.com'
  const subject = `New application: ${username}`

  const linksSection = [...socialLinks, ...projectLinks].filter(Boolean).join('\n')

  const text = `New application from ${username} (${email})

Experience: ${experienceLevel}

Why join:
${whyJoin}

Building:
${whatBuilding}

Links:
${linksSection || 'None provided'}

Review: ${adminUrl}`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; color: #ededed; background: #0a0a0a; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
    <h2 style="color: #ffffff; margin: 0 0 8px 0; font-size: 20px; font-weight: 500;">${username}</h2>
    <p style="color: #888; margin: 0 0 24px 0; font-size: 14px;">${email} · ${experienceLevel}</p>

    <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 24px; margin-bottom: 24px;">
      <p style="color: #888; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Why join</p>
      <p style="color: #ededed; margin: 0; font-size: 15px; white-space: pre-wrap;">${whyJoin}</p>
    </div>

    <div style="margin-bottom: 24px;">
      <p style="color: #888; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Building</p>
      <p style="color: #ededed; margin: 0; font-size: 15px; white-space: pre-wrap;">${whatBuilding}</p>
    </div>

    ${
      linksSection
        ? `<div style="margin-bottom: 32px;">
      <p style="color: #888; margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Links</p>
      ${[...socialLinks, ...projectLinks]
        .filter(Boolean)
        .map((link) => `<a href="${link}" style="color: #3b82f6; display: block; font-size: 14px; margin-bottom: 4px;">${link}</a>`)
        .join('')}
    </div>`
        : ''
    }

    <a href="${adminUrl}" style="display: inline-block; background: #ffffff; color: #0a0a0a; padding: 12px 24px; text-decoration: none; border-radius: 9999px; font-weight: 500; font-size: 14px;">Review application</a>
  </div>
</body>
</html>`

  return resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject,
    text,
    html,
  })
}
