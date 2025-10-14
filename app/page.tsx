import { getMembers, getLatestDigest } from '@/lib/supabase'
import { HomeClient } from '@/components/HomeClient'

export default async function Home() {
  const membersData = await getMembers()
  const latestDigest = await getLatestDigest()

  return <HomeClient membersData={membersData} latestDigest={latestDigest} />
}
