'use server'

import { redirect } from 'next/navigation'
import { cookies, type UnsafeUnwrappedCookies } from 'next/headers'
import { createApplication, getApplicationByDiscordId } from '@/lib/db'
import { validateApplicationForm } from '@/lib/validations'

export type ApplyFormState = {
  errors?: Record<string, string[]>
  submitError?: string
}

export async function submitApplication(prevState: ApplyFormState | undefined, formData: FormData): Promise<ApplyFormState | void> {
  // Ensure authenticated via Discord
  const cookieStore = cookies() as unknown as UnsafeUnwrappedCookies
  const discordUserCookie = cookieStore.get('discord_user')
  if (!discordUserCookie) {
    return { submitError: 'Not authenticated. Please sign in with Discord first.' }
  }

  // Parse Discord user data with error handling
  let discordUser
  try {
    discordUser = JSON.parse(discordUserCookie.value)
  } catch {
    // Invalid cookie data - clean up and ask user to sign in again
    cookieStore.delete('discord_user')
    return { submitError: 'Invalid authentication data. Please sign in again.' }
  }

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

    // Clear the temporary cookie to prevent state reuse after successful submission
    // This removes the Discord OAuth data, ensuring users can't accidentally submit
    // duplicate applications by refreshing or navigating back to the form
    cookieStore.delete('discord_user')

    // Redirect to success page
    redirect('/apply/success')
  } catch (e) {
    // Handle duplicate application (race condition caught by DB unique constraint)
    if (e instanceof Error && e.message === 'DUPLICATE_APPLICATION') {
      return {
        submitError: 'You have already submitted an application.',
        errors: undefined,
      }
    }
    return { submitError: 'Failed to submit application. Please try again.' }
  }
}
