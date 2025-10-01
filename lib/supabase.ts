/**
 * Supabase client for direct database access
 *
 * Replaces bot-api.ts for member data fetching
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Member status from database (matches Supabase schema)
export interface MemberStatus {
  user_id: string
  username: string
  display_name: string | null
  joined_at: string | null
  activity_status: 'NEW' | 'ACTIVE' | 'ENGAGED_LURKER' | 'IDLE' | 'LURKER' | 'GHOST'
  messages_7d: number
  messages_30d: number
  reactions_7d: number
  reactions_30d: number
  current_projects: string[]
  conversation_topics: string[]
  status_summary: string | null
  last_message_at: string | null
  updated_at: string
  created_at: string
}

export interface MembersResponse {
  members: MemberStatus[]
  total: number
}

/**
 * Get all members from Supabase (excluding GHOST members)
 */
export async function getMembers(): Promise<MembersResponse> {
  try {
    const { data, error } = await supabase
      .from('member_status')
      .select('*')
      .neq('activity_status', 'GHOST')
      .order('messages_7d', { ascending: false })

    if (error) {
      console.error('Supabase query error:', error)
      return { members: [], total: 0 }
    }

    return {
      members: data || [],
      total: (data || []).length,
    }
  } catch (error) {
    console.error('Error fetching members from Supabase:', error)
    return { members: [], total: 0 }
  }
}

/**
 * Get a specific member by user ID
 */
export async function getMember(userId: string): Promise<MemberStatus | null> {
  try {
    const { data, error } = await supabase
      .from('member_status')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Supabase query error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Error fetching member ${userId}:`, error)
    return null
  }
}

/**
 * Subscribe to real-time member updates
 */
export function subscribeToMembers(
  callback: (members: MemberStatus[]) => void
) {
  return supabase
    .channel('member_status_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'member_status',
      },
      () => {
        // When any change occurs, refetch all members
        getMembers().then((response) => callback(response.members))
      }
    )
    .subscribe()
}

/**
 * Get status badge styling
 */
export function getStatusBadge(status: MemberStatus['activity_status']): {
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
 * Generate Discord avatar URL from user ID
 */
export function getAvatarUrl(userId: string): string {
  // Use default Discord avatar based on user ID
  const avatarIndex = Number(BigInt(userId) % 6n)
  return `https://cdn.discordapp.com/embed/avatars/${avatarIndex}.png`
}
