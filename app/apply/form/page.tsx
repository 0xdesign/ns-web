import { cookies } from 'next/headers'
import { getMembers } from '@/lib/supabase'
import { getDiscordAuthUrl } from '@/lib/discord'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { FormClient } from './FormClient'

export default async function ApplicationFormPage() {
  const membersData = await getMembers()
  const cookieStore = cookies()
  const discordCookie = cookieStore.get('discord_user')
  const discordUser = parseDiscordUserCookie(discordCookie?.value)
  const discordAuthUrl = getDiscordAuthUrl('/apply/form')

  return (
    <FormClient
      membersData={membersData}
      discordUser={discordUser}
      discordAuthUrl={discordAuthUrl}
    />
  )
}
