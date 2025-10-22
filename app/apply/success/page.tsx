import { cookies } from 'next/headers'
import { getMembers } from '@/lib/supabase'
import { getDiscordAuthUrl } from '@/lib/discord'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { SuccessClient } from './SuccessClient'

export default async function ApplicationSuccessPage() {
  const membersData = await getMembers()
  const cookieStore = await cookies()
  const discordCookie = cookieStore.get('discord_user')
  const discordUser = parseDiscordUserCookie(discordCookie?.value)
  const discordAuthUrl = getDiscordAuthUrl('/apply/success')
  const navigationAuthUrls = {
    disconnect: `/api/auth/discord/logout?redirect=${encodeURIComponent('/apply/success')}`,
    switchAccount: `/api/auth/discord/switch?state=${encodeURIComponent('/apply/success')}`,
  }

  return (
    <SuccessClient
      membersData={membersData}
      discordUser={discordUser}
      discordAuthUrl={discordAuthUrl}
      navigationAuthUrls={navigationAuthUrls}
    />
  )
}
