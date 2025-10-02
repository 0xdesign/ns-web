/**
 * Bot API client
 *
 * Provides functions to interact with the Discord bot API for role management.
 */

import { logger } from './logger'

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:8000'
const BOT_API_KEY = process.env.BOT_API_KEY

if (!BOT_API_KEY) {
  logger.warn('BOT_API_KEY not configured', { service: 'bot-api' })
}

interface RoleResponse {
  success: boolean
  user_id: string
  role_id: string
  action: string
  timestamp: string
}

interface ApiError {
  error: string
  detail?: string
  timestamp: string
}

/**
 * Assign Discord role to user
 */
export async function assignRole(
  discordUserId: string,
  roleId: string,
  applicationId: string,
  reason: string = 'Subscription active'
): Promise<RoleResponse> {
  const response = await fetch(`${BOT_API_URL}/api/assign-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': BOT_API_KEY!,
    },
    body: JSON.stringify({
      discord_user_id: discordUserId,
      role_id: roleId,
      application_id: applicationId,
      reason,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.error || 'Failed to assign role')
  }

  return response.json()
}

/**
 * Remove Discord role from user
 */
export async function removeRole(
  discordUserId: string,
  roleId: string,
  reason: string = 'Subscription ended'
): Promise<RoleResponse> {
  const response = await fetch(`${BOT_API_URL}/api/remove-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': BOT_API_KEY!,
    },
    body: JSON.stringify({
      discord_user_id: discordUserId,
      role_id: roleId,
      reason,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.error || 'Failed to remove role')
  }

  return response.json()
}

/**
 * Sync Discord role based on subscription status
 */
export async function syncRole(
  discordUserId: string,
  roleId: string,
  shouldHaveRole: boolean,
  reason: string = 'Daily sync'
): Promise<RoleResponse> {
  const response = await fetch(`${BOT_API_URL}/api/sync-role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': BOT_API_KEY!,
    },
    body: JSON.stringify({
      discord_user_id: discordUserId,
      role_id: roleId,
      should_have_role: shouldHaveRole,
      reason,
    }),
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw new Error(error.error || 'Failed to sync role')
  }

  return response.json()
}

// API response from bot (matches src/api.py MemberStatusResponse)
export interface MemberStatusAPI {
  user_id: string
  username: string
  display_name: string | null
  joined_at: string | null
  activity_status: 'NEW' | 'ACTIVE' | 'ENGAGED_LURKER' | 'IDLE' | 'LURKER' | 'GHOST'
  messages_7d: number
  messages_30d: number
  current_projects: string[]
  conversation_topics: string[]
  status_summary: string | null
  last_message_at: string | null
}

// Transformed interface for UI
export interface MemberStatus {
  user_id: string
  username: string
  display_name: string
  avatar_url: string | null
  joined_at: string | null
  status: 'NEW' | 'ACTIVE' | 'ENGAGED_LURKER' | 'IDLE' | 'LURKER' | 'GHOST'
  message_count: number
  last_message_at: string | null
  summary: string | null
  projects: string[]
  topics: string[]
}

export interface MembersResponse {
  members: MemberStatus[]
  total: number
}

/**
 * Transform API response to UI format
 */
function transformMemberAPI(apiMember: MemberStatusAPI): MemberStatus {
  // Generate Discord avatar URL from user ID
  const avatarUrl = `https://cdn.discordapp.com/embed/avatars/${
    BigInt(apiMember.user_id) % 6n
  }.png`

  return {
    user_id: apiMember.user_id,
    username: apiMember.username,
    display_name: apiMember.display_name || apiMember.username,
    avatar_url: avatarUrl,
    joined_at: apiMember.joined_at,
    status: apiMember.activity_status,
    message_count: apiMember.messages_7d + apiMember.messages_30d,
    last_message_at: apiMember.last_message_at,
    summary: apiMember.status_summary,
    projects: apiMember.current_projects,
    topics: apiMember.conversation_topics,
  }
}

/**
 * Get all members from bot API
 */
export async function getMembers(): Promise<MembersResponse> {
  // Return empty data if BOT_API_URL is not configured
  if (!BOT_API_URL) {
    logger.warn('Bot API URL not configured', { service: 'bot-api' })
    return {
      members: [],
      total: 0,
    }
  }

  try {
    logger.apiRequest('GET', `${BOT_API_URL}/api/members`)

    const response = await fetch(`${BOT_API_URL}/api/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Use cache but revalidate after 5 minutes
      next: { revalidate: 300 },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000),
    })

    logger.apiResponse('GET', `${BOT_API_URL}/api/members`, response.status)

    if (!response.ok) {
      logger.error('Bot API returned error', undefined, {
        status: response.status,
        url: `${BOT_API_URL}/api/members`,
      })
      return {
        members: [],
        total: 0,
      }
    }

    const apiMembers: MemberStatusAPI[] = await response.json()
    const members = apiMembers.map(transformMemberAPI)

    logger.info('Successfully fetched members from bot API', { count: members.length })

    return {
      members,
      total: members.length,
    }
  } catch (error) {
    // Log error but don't fail the page
    logger.error('Bot API fetch failed', error as Error, {
      service: 'bot-api',
      operation: 'getMembers',
    })

    // Return empty response if bot API is not available
    return {
      members: [],
      total: 0,
    }
  }
}

/**
 * Get single member by Discord user ID
 */
export async function getMember(
  discordUserId: string
): Promise<MemberStatus | null> {
  try {
    const response = await fetch(
      `${BOT_API_URL}/api/members/${discordUserId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return null
    }

    const apiMember: MemberStatusAPI = await response.json()
    return transformMemberAPI(apiMember)
  } catch (error) {
    console.error(`Failed to fetch member ${discordUserId}:`, error)
    return null
  }
}

/**
 * Get status badge color and label
 */
export function getStatusBadge(status: MemberStatus['status']): {
  color: string
  label: string
  description: string
} {
  switch (status) {
    case 'NEW':
      return {
        color:
          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        label: 'New',
        description: 'Joined less than 14 days ago',
      }
    case 'ACTIVE':
      return {
        color:
          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        label: 'Active',
        description: 'Posted in the last 7 days',
      }
    case 'ENGAGED_LURKER':
      return {
        color:
          'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        label: 'Engaged',
        description: 'Active reactions, occasional posts',
      }
    case 'IDLE':
      return {
        color:
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        label: 'Idle',
        description: 'Posted recently but not in the last week',
      }
    case 'LURKER':
      return {
        color:
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        label: 'Lurker',
        description: 'No posts for 30+ days',
      }
    case 'GHOST':
      return {
        color:
          'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        label: 'Ghost',
        description: 'Joined 30+ days ago, never posted',
      }
    default:
      return {
        color:
          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        label: status,
        description: 'Unknown status',
      }
  }
}

/**
 * Check bot API health
 */
export async function checkHealth(): Promise<{
  status: string
  bot_ready: boolean
  timestamp: string
}> {
  const response = await fetch(`${BOT_API_URL}/health`)

  if (!response.ok) {
    throw new Error('Bot API is not healthy')
  }

  return response.json()
}

/**
 * Assign role with exponential backoff retry
 */
export async function assignRoleWithRetry(
  discordUserId: string,
  roleId: string,
  applicationId: string,
  maxRetries: number = 3
): Promise<RoleResponse> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await assignRole(discordUserId, roleId, applicationId)
    } catch (error) {
      lastError = error as Error

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Failed to assign role after retries')
}
