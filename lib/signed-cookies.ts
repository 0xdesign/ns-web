/**
 * Signed cookie utilities using HMAC-SHA256
 *
 * Prevents cookie tampering by signing cookie values with NEXTAUTH_SECRET
 */

import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Sign a cookie value with HMAC-SHA256
 */
export function signCookieValue(value: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required for cookie signing')
  }

  const encodedValue = Buffer.from(value, 'utf8').toString('base64url')
  const hmac = createHmac('sha256', secret)
  hmac.update(encodedValue)
  const signature = hmac.digest('hex')

  // Return encodedValue.signature format to avoid delimiter collisions
  return `${encodedValue}.${signature}`
}

/**
 * Verify and extract a signed cookie value
 * Returns the original value if valid, null if tampered/invalid
 */
export function verifyCookieValue(signedValue: string): string | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET
    if (!secret) {
      console.error('NEXTAUTH_SECRET is required for cookie verification')
      return null
    }

    // Split into value and signature
    const separatorIndex = signedValue.lastIndexOf('.')
    if (separatorIndex === -1) {
      // No signature found - invalid format
      return null
    }

    const encodedValue = signedValue.slice(0, separatorIndex)
    const signature = signedValue.slice(separatorIndex + 1)

    let value: string
    try {
      value = Buffer.from(encodedValue, 'base64url').toString('utf8')
    } catch {
      return null
    }

    // Recompute signature
    const hmac = createHmac('sha256', secret)
    hmac.update(encodedValue)
    const expectedSignature = hmac.digest('hex')

    // Timing-safe comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return null
    }

    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      // Signature mismatch - cookie was tampered with
      return null
    }

    return value
  } catch (error) {
    console.error('Cookie verification error:', error)
    return null
  }
}
