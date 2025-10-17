import { getMembers } from '@/lib/supabase'
import { FormClient } from './FormClient'

export default async function ApplicationFormPage() {
  const membersData = await getMembers()

  return <FormClient membersData={membersData} />
}
