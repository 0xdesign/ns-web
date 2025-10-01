/**
 * Admin authentication utilities
 *
 * Verifies admin access based on Discord user ID whitelist
 */

import { cookies } from 'next/headers'

/**
 * Check if the current user is an admin
 * Reads Discord user from cookie and compares against ADMIN_DISCORD_ID
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const discordUserCookie = cookieStore.get('discord_user')

    if (!discordUserCookie) {
      return false
    }

    const discordUser = JSON.parse(discordUserCookie.value)
    const adminId = process.env.ADMIN_DISCORD_ID

    return discordUser.id === adminId
  } catch (error) {
    console.error('Admin auth error:', error)
    return false
  }
}

/**
 * Get the current Discord user from cookie
 */
export async function getCurrentDiscordUser() {
  try {
    const cookieStore = await cookies()
    const discordUserCookie = cookieStore.get('discord_user')

    if (!discordUserCookie) {
      return null
    }

    return JSON.parse(discordUserCookie.value)
  } catch (error) {
    console.error('Get Discord user error:', error)
    return null
  }
}

/**
 * Require admin access - throws if not admin
 * Use this in API routes
 */
export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('Unauthorized: Admin access required')
  }
}
