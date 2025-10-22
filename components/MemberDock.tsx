'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GlassCard } from '@/components/ui/glass-card'
import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberDockProps {
  memberCount: number
  topMembers: MemberStatus[]
  isBottomSheetOpen: boolean
  onFacepileClick: () => void
}

export function MemberDock({ memberCount, topMembers, isBottomSheetOpen, onFacepileClick }: MemberDockProps) {
  return (
    <div
      className={`
        md:hidden
        fixed left-1/2 -translate-x-1/2 z-[70]
        transition-all duration-300 ease-out
        ${isBottomSheetOpen ? 'bottom-[-200px] opacity-0' : 'bottom-6 opacity-100'}
      `}
    >
      {/* Dock Container with layered glass effect */}
      <GlassCard
        blurAmount="3px"
        className="rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        contentClassName="flex items-center gap-4 p-3"
      >
        {/* Facepile Section (clickable) */}
        <button
          onClick={onFacepileClick}
          className="group flex items-center gap-0.5 transition-transform duration-200 hover:scale-105"
          aria-label={`View ${memberCount} members`}
        >
          <div className="flex items-center -space-x-2">
            {topMembers.slice(0, 3).map((member, i) => (
              <div
                key={member.user_id}
                className="w-8 h-8 rounded-full border border-white/30 overflow-hidden relative bg-neutral-800 transition-transform duration-200 group-hover:scale-110"
                style={{ zIndex: 3 - i }}
              >
                <Image
                  src={getAvatarUrl(member.user_id, member.avatar_url)}
                  alt={member.display_name || member.username}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  sizes="32px"
                  unoptimized
                />
              </div>
            ))}
          </div>

          {/* Member count badge */}
          <div className="ml-3 flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-white/15 border border-white/30">
            <span className="text-xs font-semibold text-white tracking-tight">
              {memberCount}
            </span>
          </div>
        </button>

        {/* Divider */}
        <div className="h-12 w-px bg-white/20" />

        {/* Apply Button (iOS Style) */}
        <Link
          href="/apply"
          className="
            relative px-6 py-2.5
            rounded-full
            bg-white/15 hover:bg-white/25
            border border-white/30
            text-sm font-semibold text-white tracking-tight
            transition-all duration-200
            hover:scale-105
            active:scale-95
          "
          style={{ zIndex: 20 }}
        >
          Apply
        </Link>
      </GlassCard>
    </div>
  )
}
