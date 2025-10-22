'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import type { DiscordSessionUser } from '@/lib/current-user'

interface NavigationProps {
  memberCount: number
  discordUser?: DiscordSessionUser | null
  discordAuthUrl?: string
  showMemberCount?: boolean
  onConnectDiscord?: () => void
}

export function Navigation({
  memberCount,
  discordUser,
  discordAuthUrl,
  showMemberCount = false,
  onConnectDiscord,
}: NavigationProps) {
  const profileLink = discordUser ? `https://discord.com/users/${discordUser.id}` : undefined
  const avatarUrl =
    discordUser?.avatar && discordUser.id
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=64`
      : null
  const displayName = discordUser
    ? `${discordUser.username}${
        discordUser.discriminator && discordUser.discriminator !== '0'
          ? `#${discordUser.discriminator}`
          : ''
      }`
    : null

  return (
    <>
      {/* Progressive blur at top for nav bar */}
      <ProgressiveBlur
        position="top"
        backgroundColor="#09090b"
        height="100px"
        blurAmount="4px"
        zIndex={60}
        fixed
      />

      <ProgressiveBlur
        position="bottom"
        backgroundColor="#09090b"
        height="100px"
        blurAmount="4px"
        zIndex={60}
        fixed
      />

      {/* Nav content above blur; no background fill */}
      <nav className="fixed top-0 left-0 right-0 z-80 h-[69px]">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <Link href="/" className="text-sm font-extrabold text-white/74 tracking-tight [text-shadow:2px_4px_8px_rgba(0,0,0,0.08)] hover:text-white/90 transition-colors cursor-pointer">
            NO/SHOP
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {showMemberCount && (
              <span className="hidden md:block text-sm font-medium tracking-tight text-white/80">
                Members — {memberCount}
              </span>
            )}
            {discordUser ? (
              <a
                href={profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:border-white/35 hover:text-white sm:text-sm"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName ?? 'Discord user'}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold uppercase">
                    {discordUser.username.slice(0, 1)}
                  </span>
                )}
                <span>{displayName}</span>
              </a>
            ) : (
              discordAuthUrl && (
                <a
                  href={discordAuthUrl}
                  onClick={onConnectDiscord}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white sm:px-4 sm:text-sm"
                >
                  Connect Discord
                </a>
              )
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
