'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createApplication, getApplicationByDiscordId } from '@/lib/db'
import { validateApplicationForm } from '@/lib/validations'

export type ApplyFormState = {
  errors?: Record<string, string[]>
  submitError?: string
}

export async function submitApplication(prevState: ApplyFormState | undefined, formData: FormData): Promise<ApplyFormState | void> {
  // Ensure authenticated via Discord
  const cookieStore = await cookies()
  const discordUserCookie = cookieStore.get('discord_user')
  if (!discordUserCookie) {
    return { submitError: 'Not authenticated. Please sign in with Discord first.' }
  }

  const discordUser = JSON.parse(discordUserCookie.value)

  // Collect form values
  const email = (formData.get('email') || '').toString()
  const why_join = (formData.get('why_join') || '').toString()
  const what_building = (formData.get('what_building') || '').toString()
  const socialLinksRaw = formData.getAll('social_links').map(v => v.toString()).filter(v => v.trim() !== '')

  // Validate
  const validation = validateApplicationForm({
    email,
    why_join,
    what_building,
    social_links: socialLinksRaw,
  })

  if (!validation.success) {
    return { errors: validation.errors }
  }

  // Check if user already applied
  const existing = await getApplicationByDiscordId(discordUser.id)
  if (existing) {
    return {
      submitError: 'You have already submitted an application.',
      errors: undefined,
    }
  }

  // Create application
  try {
    await createApplication({
      discord_user_id: discordUser.id,
      discord_username: discordUser.username,
      discord_discriminator: discordUser.discriminator,
      discord_avatar: discordUser.avatar,
      email,
      why_join,
      what_building,
      social_links: JSON.stringify(socialLinksRaw),
    })

    // Clear the temporary cookie
    cookieStore.delete('discord_user')

    // Redirect to success page
    redirect('/apply/success')
  } catch (e) {
    return { submitError: 'Failed to submit application. Please try again.' }
  }
}

