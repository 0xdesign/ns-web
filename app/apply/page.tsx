import { cookies } from 'next/headers'
import { getMembers } from '@/lib/supabase'
import { getDiscordAuthUrl } from '@/lib/discord'
import { parseDiscordUserCookie } from '@/lib/current-user'
import { ApplyClient } from './ApplyClient'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const [membersData, params] = await Promise.all([
    getMembers(),
    searchParams
  ])

  const error = params.error
  const cookieStore = cookies()
  const discordCookie = cookieStore.get('discord_user')
  const discordUser = parseDiscordUserCookie(discordCookie?.value)
  const discordAuthUrl = getDiscordAuthUrl('/apply')

  return (
    <ApplyClient
      membersData={membersData}
      error={error}
      discordAuthUrl={discordAuthUrl}
      discordUser={discordUser}
    />
  )
}
