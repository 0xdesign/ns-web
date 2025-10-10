import { getMembers } from '@/lib/supabase'
import { getDiscordAuthUrl } from '@/lib/discord'
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
  const discordAuthUrl = getDiscordAuthUrl()

  return <ApplyClient membersData={membersData} error={error} discordAuthUrl={discordAuthUrl} />
}
