import { cookies } from 'next/headers'
import { getMembers } from '@/lib/supabase'
import { getDiscordAuthUrl } from '@/lib/discord'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { getApplicationByDiscordId } from '@/lib/db'
import { FormClient } from './FormClient'

export default async function ApplicationFormPage() {
  const membersData = await getMembers()
  const cookieStore = await cookies()
  const discordCookie = cookieStore.get('discord_user')
  const discordUser = parseDiscordUserCookie(discordCookie?.value)
  const existingApplication = discordUser
    ? await getApplicationByDiscordId(discordUser.id)
    : null
  const discordAuthUrl = getDiscordAuthUrl('/apply/form')
  const navigationAuthUrls = {
    disconnect: `/api/auth/discord/logout?redirect=${encodeURIComponent('/apply/form')}`,
    switchAccount: `/api/auth/discord/switch?state=${encodeURIComponent('/apply/form')}`,
  }

  return (
    <FormClient
      membersData={membersData}
      discordUser={discordUser}
      discordAuthUrl={discordAuthUrl}
      existingApplication={existingApplication}
      navigationAuthUrls={navigationAuthUrls}
    />
  )
}
