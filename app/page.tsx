import { cookies } from 'next/headers'
import { getMembers, getLatestDigest } from '@/lib/supabase'
import type { MembersResponse } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { HomeClient } from '@/components/HomeClient'
import { getDiscordAuthUrl } from '@/lib/discord'
import { parseDiscordUserCookie } from '@/lib/current-user'

export default async function Home() {
  let membersData: MembersResponse = { members: [], total: 0 }
  let latestDigest = null

  try {
    membersData = await getMembers()
    latestDigest = await getLatestDigest()
  } catch (error) {
    logger.error('Error fetching data for home page', error as Error, {
      operation: 'Home',
    })
    // membersData already initialized with empty state
  }

  const cookieStore = cookies()
  const discordCookie = cookieStore.get('discord_user')
  const discordUser = parseDiscordUserCookie(discordCookie?.value)
  const discordAuthUrl = getDiscordAuthUrl('/')

  return (
    <HomeClient
      membersData={membersData}
      latestDigest={latestDigest}
      discordUser={discordUser}
      discordAuthUrl={discordAuthUrl}
    />
  )
}
