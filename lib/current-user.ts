import type { DiscordUser } from '@/lib/discord'
import { verifyCookieValue } from '@/lib/signed-cookies'

export type DiscordSessionUser = Pick<DiscordUser, 'id' | 'username' | 'discriminator' | 'avatar'>

export function parseDiscordUserCookie(
  rawValue: string | undefined | null
): DiscordSessionUser | null {
  if (!rawValue) {
    return null
  }

  const verified = verifyCookieValue(rawValue)
  if (!verified) {
    return null
  }

  try {
    const parsed = JSON.parse(verified) as Partial<DiscordSessionUser>
    if (
      !parsed ||
      typeof parsed.id !== 'string' ||
      typeof parsed.username !== 'string' ||
      typeof parsed.discriminator !== 'string'
    ) {
      return null
    }

    return {
      id: parsed.id,
      username: parsed.username,
      discriminator: parsed.discriminator,
      avatar: typeof parsed.avatar === 'string' ? parsed.avatar : null,
    }
  } catch {
    return null
  }
}
