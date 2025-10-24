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
  showAuthActions?: boolean
  loginLabel?: string
  dashboardHref?: string
  dashboardLabel?: string
  logoutUrl?: string
  authUrls?: {
    disconnect?: string
    switchAccount?: string
  }
  onConnectDiscord?: () => void
}

export function Navigation({
  memberCount,
  discordUser,
  discordAuthUrl,
  showMemberCount = false,
  showAuthActions = true,
  loginLabel = 'Connect Discord',
  dashboardHref,
  dashboardLabel = 'Dashboard',
  logoutUrl,
  authUrls,
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
              <div className="flex items-center gap-2 sm:gap-3">
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
                {showAuthActions && dashboardHref && (
                  <Link
                    href={dashboardHref}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white sm:px-4 sm:text-sm"
                  >
                    {dashboardLabel}
                  </Link>
                )}
                {showAuthActions && logoutUrl && (
                  <a
                    href={logoutUrl}
                    className="text-xs font-medium text-white/70 transition-colors hover:text-white sm:text-sm"
                  >
                    Log out
                  </a>
                )}
                {showAuthActions &&
                  discordAuthUrl &&
                  (authUrls?.switchAccount || authUrls?.disconnect) && (
                  <div className="flex items-center gap-1 sm:gap-2 text-[11px] font-medium text-white/70 sm:text-xs">
                    {authUrls?.switchAccount && (
                      <a
                        href={authUrls.switchAccount}
                        className="rounded-full border border-white/15 bg-white/5 px-2 py-1 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Switch
                      </a>
                    )}
                    {authUrls?.disconnect && (
                      <a
                        href={authUrls.disconnect}
                        className="rounded-full border border-white/15 bg-white/5 px-2 py-1 transition-colors hover:border-white/30 hover:text-white"
                      >
                        Disconnect
                      </a>
                    )}
                  </div>
                )}
              </div>
            ) : (
              showAuthActions &&
              discordAuthUrl && (
                <a
                  href={discordAuthUrl}
                  onClick={onConnectDiscord}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-white/35 hover:text-white sm:px-4 sm:text-sm"
                >
                  {loginLabel}
                </a>
              )
            )}
          </div>
        </div>
      </nav>
    </>
  )
}
