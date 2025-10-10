import { getMembers } from '@/lib/supabase'
import { SuccessClient } from './SuccessClient'

export default async function ApplicationSuccessPage() {
  const membersData = await getMembers()

  return <SuccessClient membersData={membersData} />
}
