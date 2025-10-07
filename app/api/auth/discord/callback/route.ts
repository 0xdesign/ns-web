/**
 * Discord OAuth callback route
 *
 * Handles the OAuth callback from Discord and redirects to application form.
 */

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode, getDiscordUser } from '@/lib/discord'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Check for OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/apply?error=${encodeURIComponent(error)}`, request.url)
    )
  }

  // Validate code exists
  if (!code) {
    return NextResponse.redirect(
      new URL('/apply?error=missing_code', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenData = await exchangeCode(code)

    // Get user data from Discord
    const user = await getDiscordUser(tokenData.access_token)

    // Store user data in cookie (encrypted session would be better in production)
    const cookieStore = await cookies()
    const userData = {
      id: user.id,
      username: user.username,
      discriminator: user.discriminator,
      avatar: user.avatar,
    }

    cookieStore.set('discord_user', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
      path: '/',
    })

    // Redirect to intended destination (from state param) or default to application form
    // Validate state is a safe relative path to prevent open redirect attacks
    let redirectPath = '/apply/form'
    if (state) {
      // Only accept relative paths starting with "/" (no protocol, no leading "//", no path traversal)
      if (state.startsWith('/') && !state.startsWith('//') && !state.includes('..')) {
        redirectPath = state
      } else {
        console.warn(`⚠️  Invalid redirect path in state parameter: ${state}`)
      }
    }
    return NextResponse.redirect(new URL(redirectPath, request.url))
  } catch (error) {
    console.error('Discord OAuth error:', error)
    return NextResponse.redirect(
      new URL(
        `/apply?error=${encodeURIComponent('oauth_failed')}`,
        request.url
      )
    )
  }
}
