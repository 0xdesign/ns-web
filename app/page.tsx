import { getMembers } from '@/lib/supabase'
import { HomeClient } from '@/components/HomeClient'

export default async function Home() {
  const membersData = await getMembers()

  return <HomeClient membersData={membersData} />
}
