import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('..')
}

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('discord_user')

  const redirectParam = request.nextUrl.searchParams.get('redirect')

  let redirectUrl = new URL('/', request.url)

  if (redirectParam) {
    try {
      if (isSafeRelativePath(redirectParam)) {
        redirectUrl = new URL(redirectParam, request.url)
      } else {
        const candidate = new URL(redirectParam, request.url)
        if (candidate.origin === request.nextUrl.origin) {
          redirectUrl = candidate
        }
      }
    } catch {
      // ignore malformed URLs and fall back to default
    }
  }

  return NextResponse.redirect(redirectUrl)
}
