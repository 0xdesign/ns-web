import { getMembers, getLatestDigest } from '@/lib/supabase'
import { HomeClient } from '@/components/HomeClient'

export default async function Home() {
  let membersData = { members: [], error: null }
  let latestDigest = null

  try {
    membersData = await getMembers()
    latestDigest = await getLatestDigest()
  } catch (error) {
    console.error('Error fetching data:', error)
    // Return error state to client component for display
    membersData = {
      members: [],
      error: 'Failed to load members. Please try again later.'
    }
  }

  return <HomeClient membersData={membersData} latestDigest={latestDigest} />
}
