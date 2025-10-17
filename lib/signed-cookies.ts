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

  const hmac = createHmac('sha256', secret)
  hmac.update(value)
  const signature = hmac.digest('hex')

  // Return value.signature format
  return `${value}.${signature}`
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
    const lastDotIndex = signedValue.lastIndexOf('.')
    if (lastDotIndex === -1) {
      // No signature found - invalid format
      return null
    }

    const value = signedValue.slice(0, lastDotIndex)
    const signature = signedValue.slice(lastDotIndex + 1)

    // Recompute signature
    const hmac = createHmac('sha256', secret)
    hmac.update(value)
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
