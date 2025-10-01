/**
 * Discord OAuth utilities
 *
 * Provides functions for Discord OAuth flow and user data fetching.
 */

const DISCORD_API_BASE = 'https://discord.com/api/v10'

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
}

/**
 * Get Discord OAuth URL
 */
export function getDiscordAuthUrl(state?: string): string {
  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !redirectUri) {
    throw new Error('Discord OAuth not configured')
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'identify', // Note: Not requesting email scope per plan
  })

  if (state) {
    params.append('state', state)
  }

  return `https://discord.com/oauth2/authorize?${params.toString()}`
}

/**
 * Exchange OAuth code for access token
 */
export async function exchangeCode(code: string): Promise<{
  access_token: string
  token_type: string
  expires_in: number
  refresh_token: string
  scope: string
}> {
  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Discord OAuth not configured')
  }

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

/**
 * Get Discord user from access token
 */
export async function getDiscordUser(accessToken: string): Promise<DiscordUser> {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user')
  }

  return response.json()
}

/**
 * Get user's guild member info
 */
export async function getGuildMember(
  userId: string,
  guildId: string
): Promise<{
  user: DiscordUser
  roles: string[]
  joined_at: string
} | null> {
  const botToken = process.env.DISCORD_BOT_TOKEN

  if (!botToken) {
    throw new Error('Discord bot token not configured')
  }

  const response = await fetch(
    `${DISCORD_API_BASE}/guilds/${guildId}/members/${userId}`,
    {
      headers: {
        Authorization: `Bot ${botToken}`,
      },
    }
  )

  if (response.status === 404) {
    return null // User not in guild
  }

  if (!response.ok) {
    throw new Error('Failed to fetch guild member')
  }

  return response.json()
}

/**
 * Format Discord avatar URL
 */
export function getAvatarUrl(
  userId: string,
  avatarHash: string | null,
  size: number = 128
): string {
  if (!avatarHash) {
    // Default avatar
    const defaultAvatar = (BigInt(userId) >> 22n) % 6n
    return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`
  }

  const extension = avatarHash.startsWith('a_') ? 'gif' : 'png'
  return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${extension}?size=${size}`
}
