/**
 * Applications API endpoint
 *
 * Handles application submissions with validation and database storage.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createApplication, getApplicationByDiscordId, updateApplicationDetails } from '@/lib/db'
import { validateApplicationForm } from '@/lib/validations'

function getAuthenticatedDiscordUser() {
  const cookieStore = cookies()
  const discordUserCookie = cookieStore.get('discord_user')

  if (!discordUserCookie) {
    return null
  }

  try {
    return JSON.parse(discordUserCookie.value)
  } catch {
    cookieStore.delete('discord_user')
    return null
  }
}

export async function GET() {
  const discordUser = await getAuthenticatedDiscordUser()

  if (!discordUser) {
    return NextResponse.json(
      { error: 'Not authenticated. Please sign in with Discord first.' },
      { status: 401 }
    )
  }

  const existingApplication = await getApplicationByDiscordId(discordUser.id)

  if (!existingApplication) {
    return NextResponse.json({ exists: false }, { status: 200 })
  }

  return NextResponse.json({
    exists: true,
    application: {
      id: existingApplication.id,
      status: existingApplication.status,
      created_at: existingApplication.created_at,
      updated_at: existingApplication.updated_at,
      email: existingApplication.email,
      why_join: existingApplication.why_join,
      what_building: existingApplication.what_building,
      experience_level: existingApplication.experience_level,
      social_links: JSON.parse(existingApplication.social_links ?? '[]'),
      project_links: JSON.parse(existingApplication.project_links ?? '[]'),
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const discordUser = await getAuthenticatedDiscordUser()

    if (!discordUser) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with Discord first.' },
        { status: 401 }
      )
    }

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
      experience_level: formData.experience_level ?? 'unknown',
      social_links: JSON.stringify(formData.social_links),
      project_links: JSON.stringify(formData.project_links ?? []),
    })

    // Clear Discord user cookie
    cookies().delete('discord_user')

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

export async function PATCH(request: NextRequest) {
  try {
    const discordUser = await getAuthenticatedDiscordUser()

    if (!discordUser) {
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in with Discord first.' },
        { status: 401 }
      )
    }

    const existingApplication = await getApplicationByDiscordId(discordUser.id)

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'No existing application found.', requires_new: true },
        { status: 404 }
      )
    }

    const body = await request.json()
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

    const updatedApplication = await updateApplicationDetails({
      id: existingApplication.id,
      email: formData.email,
      why_join: formData.why_join,
      what_building: formData.what_building,
      experience_level: formData.experience_level ?? existingApplication.experience_level,
      social_links: JSON.stringify(formData.social_links),
      project_links: JSON.stringify(formData.project_links ?? []),
    })

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        created_at: updatedApplication.created_at,
        updated_at: updatedApplication.updated_at,
        email: updatedApplication.email,
        why_join: updatedApplication.why_join,
        what_building: updatedApplication.what_building,
        experience_level: updatedApplication.experience_level,
        social_links: JSON.parse(updatedApplication.social_links ?? '[]'),
        project_links: JSON.parse(updatedApplication.project_links ?? '[]'),
      },
    })
  } catch (error) {
    console.error('Application update error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update application. Please try again.',
      },
      { status: 500 }
    )
  }
}
