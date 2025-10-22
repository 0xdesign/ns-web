/**
 * Payment token utilities
 *
 * Generate and validate secure one-time payment tokens
 */

import { supabase } from './supabase'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const TOKEN_LENGTH = 32 // 32 bytes = 64 hex characters
const TOKEN_EXPIRY_DAYS = 7
const BCRYPT_ROUNDS = 10

/**
 * Generate a secure payment token for an application
 * Returns the plain token (to send to user) and stores hashed version
 */
export async function generatePaymentToken(
  applicationId: string
): Promise<string> {
  // Generate cryptographically secure random token
  const token = crypto.randomBytes(TOKEN_LENGTH).toString('hex')

  // Hash token for storage
  const tokenHash = await bcrypt.hash(token, BCRYPT_ROUNDS)

  // Calculate expiry date
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS)

  // Store in database
  const { error } = await supabase.from('payment_tokens').insert({
    application_id: applicationId,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error('Failed to store payment token:', error)
    throw new Error('Failed to generate payment token')
  }

  return token
}

/**
 * Validate a payment token and return application data if valid
 * Marks token as used upon successful validation
 */
export async function validatePaymentToken(token: string): Promise<{
  id: string
  application_id: string
  expires_at: string
  used_at: string | null
} | null> {
  // Get all non-used, non-expired tokens
  const { data: tokens, error } = await supabase
    .from('payment_tokens')
    .select('*')
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())

  if (error || !tokens || tokens.length === 0) {
    return null
  }

  // Check each token hash (can't query by hash since it's bcrypt)
  for (const tokenData of tokens) {
    const isValid = await bcrypt.compare(token, tokenData.token_hash)

    if (isValid) {
      return tokenData
    }
  }

  return null
}

/**
 * Mark a payment token as used
 */
export async function markTokenAsUsed(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)

  if (error) {
    console.error('Failed to mark token as used:', error)
    throw new Error('Failed to mark token as used')
  }
}

/**
 * Check if an application already has a valid payment token
 */
export async function hasValidPaymentToken(
  applicationId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('payment_tokens')
    .select('id')
    .eq('application_id', applicationId)
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()

  return !error && data !== null
}
