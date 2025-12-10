'use server'

import { cookies } from 'next/headers'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { getDraftByDiscordId, upsertDraft, deleteDraft } from '@/lib/db'
import type { ApplicationDraftData } from '@/lib/db'

export type SaveDraftResult = {
  success: boolean
  error?: string
}

/**
 * Save draft to database
 * Called from client via debounced auto-save
 */
export async function saveDraft(
  formData: ApplicationDraftData
): Promise<SaveDraftResult> {
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')

  if (!discordUserCookie) {
    // Not authenticated - silently fail (client will use sessionStorage fallback)
    return { success: false, error: 'not_authenticated' }
  }

  const discordUser = parseDiscordUserCookie(discordUserCookie.value)
  if (!discordUser) {
    return { success: false, error: 'invalid_session' }
  }

  try {
    await upsertDraft(discordUser.id, formData)
    return { success: true }
  } catch (error) {
    console.error('Failed to save draft:', error)
    return { success: false, error: 'save_failed' }
  }
}

/**
 * Load draft from database
 * Called during form initialization
 */
export async function loadDraft(): Promise<ApplicationDraftData | null> {
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')

  if (!discordUserCookie) {
    return null
  }

  const discordUser = parseDiscordUserCookie(discordUserCookie.value)
  if (!discordUser) {
    return null
  }

  try {
    const draft = await getDraftByDiscordId(discordUser.id)
    return draft?.form_data ?? null
  } catch (error) {
    console.error('Failed to load draft:', error)
    return null
  }
}

/**
 * Clear draft after successful submission
 */
export async function clearDraft(): Promise<void> {
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')

  if (!discordUserCookie) return

  const discordUser = parseDiscordUserCookie(discordUserCookie.value)
  if (!discordUser) return

  try {
    await deleteDraft(discordUser.id)
  } catch (error) {
    // Non-critical - log and continue
    console.error('Failed to clear draft:', error)
  }
}
