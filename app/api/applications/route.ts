/**
 * Applications API endpoint
 *
 * Handles application submissions with validation and database storage.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createApplication, getApplicationByDiscordId } from '@/lib/db'
import { validateApplicationForm } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    // Get Discord user from cookie
    const cookieStore = await cookies()
    const discordUserCookie = cookieStore.get('discord_user')

    if (!discordUserCookie) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with Discord first.' },
        { status: 401 }
      )
    }

    const discordUser = JSON.parse(discordUserCookie.value)

    // Check if user already has an application
    const existingApplication = await getApplicationByDiscordId(discordUser.id)

    if (existingApplication) {
      return NextResponse.json(
        {
          error: 'You have already submitted an application.',
          status: existingApplication.status,
        },
        { status: 400 }
      )
    }

    // Parse request body
    const body = await request.json()

    // Validate form data
    const validation = validateApplicationForm(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const formData = validation.data!

    // Create application in database
    const application = await createApplication({
      discord_user_id: discordUser.id,
      discord_username: discordUser.username,
      discord_discriminator: discordUser.discriminator,
      discord_avatar: discordUser.avatar,
      email: formData.email,
      why_join: formData.why_join,
      what_building: formData.what_building,
      experience_level: formData.experience_level,
      social_links: JSON.stringify(formData.social_links),
      project_links: JSON.stringify(formData.project_links),
    })

    // Clear Discord user cookie
    cookieStore.delete('discord_user')

    return NextResponse.json(
      {
        success: true,
        application: {
          id: application.id,
          status: application.status,
          created_at: application.created_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      {
        error: 'Failed to submit application. Please try again.',
      },
      { status: 500 }
    )
  }
}
