import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getDiscordAuthUrl } from '@/lib/discord'

function isSafeState(state: string | null): string | null {
  if (!state) return null
  return state.startsWith('/') && !state.startsWith('//') && !state.includes('..')
    ? state
    : null
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('discord_user')

  const safeState = isSafeState(request.nextUrl.searchParams.get('state'))

  const redirectUrl = getDiscordAuthUrl(safeState ?? '/apply/form')

  return NextResponse.redirect(redirectUrl)
}
