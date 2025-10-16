'use client'

import Link from 'next/link'
import { MemberStatus } from '@/lib/supabase'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'

interface NavigationProps {
  memberCount: number
  topMembers: MemberStatus[]
}

export function Navigation({ memberCount, topMembers }: NavigationProps) {
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

          {/* Desktop member count */}
          <span className="hidden md:block text-sm font-medium tracking-tight text-white/80">
            Members — {memberCount}
          </span>
        </div>
      </nav>
    </>
  )
}
