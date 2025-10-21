/**
 * Database utilities for Supabase
 *
 * Provides Supabase client and helper functions for database operations.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Database schema types
 */

export interface Application {
  id: string
  discord_user_id: string
  discord_username: string
  discord_discriminator: string | null
  discord_avatar: string | null
  email: string
  why_join: string
  what_building: string
  experience_level: string
  social_links: string // JSON array
  project_links: string // JSON array
  status: 'pending' | 'approved' | 'rejected' | 'waitlisted'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  discord_user_id: string
  stripe_customer_id: string
  email: string
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface PaymentMethod {
  id: string
  customer_id: string
  stripe_payment_method_id: string
  type: string
  last4: string
  exp_month: number
  exp_year: number
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  customer_id: string
  subscription_id: string | null
  stripe_invoice_id: string
  amount_paid: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectible'
  invoice_pdf: string | null
  created_at: string
}

export interface RoleSyncEvent {
  id: string
  discord_user_id: string
  role_id: string
  action: 'assign' | 'remove'
  success: boolean
  error_message: string | null
  created_at: string
}

export interface PaymentToken {
  id: string
  application_id: string
  token_hash: string
  expires_at: string
  used_at: string | null
  created_at: string
}

export interface WebhookEvent {
  id: string // Webhook event ID from provider
  source: 'stripe' | 'coinbase'
  event_type: string
  processed_at: string
}

export interface Admin {
  id: string
  discord_user_id: string
  created_at: string
}

/**
 * Helper functions
 */

/**
 * Get application by ID
 */
export async function getApplication(id: string): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Get application by Discord user ID
 */
export async function getApplicationByDiscordId(
  discordUserId: string
): Promise<Application | null> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('discord_user_id', discordUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }

  return data
}

/**
 * Create application
 */
export async function createApplication(data: {
  discord_user_id: string
  discord_username: string
  discord_discriminator: string | null
  discord_avatar: string | null
  email: string
  why_join: string
  what_building: string
  experience_level: string
  social_links: string
  project_links: string
}): Promise<Application> {
  const { data: application, error } = await supabase
    .from('applications')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return application
}

export async function updateApplicationDetails(data: {
  id: string
  email: string
  why_join: string
  what_building: string
  experience_level: string
  social_links: string
  project_links: string
}): Promise<Application> {
  const { data: application, error } = await supabase
    .from('applications')
    .update({
      email: data.email,
      why_join: data.why_join,
      what_building: data.what_building,
      experience_level: data.experience_level,
      social_links: data.social_links,
      project_links: data.project_links,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select()
    .single()

  if (error) throw error
  return application
}

/**
 * Update application status
 */
export async function updateApplicationStatus(
  id: string,
  status: 'approved' | 'rejected' | 'waitlisted',
  reviewedBy: string
): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .update({
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get applications by status
 */
export async function getApplicationsByStatus(
  status: Application['status']
): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get all pending applications
 */
export async function getPendingApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

/**
 * Get customer by Discord user ID
 */
export async function getCustomerByDiscordId(
  discordUserId: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('discord_user_id', discordUserId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Get customer by Stripe customer ID
 */
export async function getCustomerByStripeId(
  stripeCustomerId: string
): Promise<Customer | null> {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('stripe_customer_id', stripeCustomerId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Create or update customer
 */
export async function upsertCustomer(data: {
  discord_user_id: string
  stripe_customer_id: string
  email: string
}): Promise<Customer> {
  const { data: customer, error } = await supabase
    .from('customers')
    .upsert([{ ...data, updated_at: new Date().toISOString() }], {
      onConflict: 'discord_user_id',
    })
    .select()
    .single()

  if (error) throw error
  return customer
}

/**
 * Get active subscription for customer
 */
export async function getActiveSubscription(
  customerId: string
): Promise<Subscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('customer_id', customerId)
    .in('status', ['active', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Create or update subscription
 */
export async function upsertSubscription(data: {
  customer_id: string
  stripe_subscription_id: string
  status: Subscription['status']
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
}): Promise<Subscription> {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .upsert(
      [{ ...data, updated_at: new Date().toISOString() }],
      { onConflict: 'stripe_subscription_id' }
    )
    .select()
    .single()

  if (error) throw error
  return subscription
}

/**
 * Check if webhook event has been processed
 */
export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('webhook_events')
    .select('id')
    .eq('id', eventId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return false
    throw error
  }

  return !!data
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookProcessed(
  eventId: string,
  source: 'stripe' | 'coinbase',
  eventType: string
): Promise<void> {
  const { error } = await supabase
    .from('webhook_events')
    .insert([{ id: eventId, source, event_type: eventType }])
    .select()

  // Ignore duplicate key errors
  if (error && error.code !== '23505') {
    throw error
  }
}

/**
 * Create payment token
 */
export async function createPaymentToken(
  applicationId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<PaymentToken> {
  const { data, error} = await supabase
    .from('payment_tokens')
    .insert([
      {
        application_id: applicationId,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Get and validate payment token
 */
export async function validatePaymentToken(
  tokenHash: string
): Promise<PaymentToken | null> {
  const { data, error } = await supabase
    .from('payment_tokens')
    .select('*')
    .eq('token_hash', tokenHash)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  return data
}

/**
 * Mark payment token as used
 */
export async function markTokenUsed(tokenId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', tokenId)

  if (error) throw error
}

/**
 * Log role sync event
 */
export async function logRoleSyncEvent(data: {
  discord_user_id: string
  role_id: string
  action: 'assign' | 'remove'
  success: boolean
  error_message: string | null
}): Promise<void> {
  const { error } = await supabase.from('role_sync_events').insert([data])

  if (error) throw error
}

/**
 * Check if user is admin
 */
export async function isAdmin(discordUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admins')
    .select('id')
    .eq('discord_user_id', discordUserId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return false
    throw error
  }

  return !!data
}

/**
 * Get all subscriptions (for daily sync job)
 */
export async function getAllSubscriptions(): Promise<
  (Subscription & { customer: Customer })[]
> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*, customer:customers(*)')
    .in('status', ['active', 'past_due', 'canceled'])

  if (error) throw error
  return data as any
}
