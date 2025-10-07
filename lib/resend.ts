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
  const subject = '🎉 Your Creative Technologists Application Has Been Approved!'

  const text = `Hi ${username},

Great news! Your application to join Creative Technologists has been approved.

To complete your membership, please complete your payment using the secure link below:

${paymentUrl}

This payment link will expire in 7 days.

Once your payment is confirmed, you'll receive an email with instructions to join our Discord community.

Looking forward to having you in the community!

Best regards,
The Creative Technologists Team`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">🎉 You're Approved!</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${username},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Great news! Your application to join <strong>Creative Technologists</strong> has been approved.</p>

    <p style="font-size: 16px; margin-bottom: 30px;">To complete your membership, please complete your payment using the secure link below:</p>

    <div style="text-align: center; margin: 40px 0;">
      <a href="${paymentUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Complete Payment</a>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;"><strong>Note:</strong> This payment link will expire in 7 days.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Once your payment is confirmed, you'll receive an email with instructions to join our Discord community.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Looking forward to having you in the community!</p>

    <p style="font-size: 16px; margin-top: 40px;">Best regards,<br><strong>The Creative Technologists Team</strong></p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 14px;">
    <p>This is an automated message. Please do not reply to this email.</p>
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
  const subject = 'Update on Your Creative Technologists Application'

  const text = `Hi ${username},

Thank you for your interest in joining Creative Technologists.

After careful review, we've decided not to move forward with your application at this time. We receive many applications and have to make difficult decisions about who to accept.

We appreciate your interest and encourage you to continue building and learning. You're welcome to apply again in the future.

Best regards,
The Creative Technologists Team`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Creative Technologists</h1>
  </div>

  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${username},</p>

    <p style="font-size: 16px; margin-bottom: 20px;">Thank you for your interest in joining <strong>Creative Technologists</strong>.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">After careful review, we've decided not to move forward with your application at this time. We receive many applications and have to make difficult decisions about who to accept.</p>

    <p style="font-size: 16px; margin-bottom: 20px;">We appreciate your interest and encourage you to continue building and learning. You're welcome to apply again in the future.</p>

    <p style="font-size: 16px; margin-top: 40px;">Best regards,<br><strong>The Creative Technologists Team</strong></p>
  </div>

  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 14px;">
    <p>This is an automated message. Please do not reply to this email.</p>
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

  const subject = 'Update on Your Creative Technologists Application'

  const text = `Hi ${username},

Thank you for applying to Creative Technologists. We've reviewed your application and placed it on our waitlist.

We review the waitlist regularly and will notify you if a spot opens up. In the meantime, keep building — reapplying with updates can help your chances.

Best,
The Creative Technologists Team`

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style=\"background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;\">
    <h1 style=\"color: white; margin: 0; font-size: 28px;\">Application Update</h1>
  </div>

  <div style=\"background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;\">
    <p style=\"font-size: 16px; margin-bottom: 20px;\">Hi ${username},</p>
    <p style=\"font-size: 16px; margin-bottom: 20px;\">Thanks for applying to <strong>Creative Technologists</strong>. We've reviewed your application and placed it on our waitlist.</p>
    <p style=\"font-size: 16px; margin-bottom: 20px;\">We review the waitlist regularly and will notify you if a spot opens up. In the meantime, keep building — reapplying with updates can help your chances.</p>
    <p style=\"font-size: 16px; margin-top: 40px;\">Best regards,<br><strong>The Creative Technologists Team</strong></p>
  </div>

  <div style=\"text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 14px;\">
    <p>This is an automated message. Please do not reply to this email.</p>
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
