'use client'

import Link from 'next/link'
import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberDockProps {
  memberCount: number
  topMembers: MemberStatus[]
  isBottomSheetOpen: boolean
  onFacepileClick: () => void
}

export function MemberDock({ memberCount, topMembers, isBottomSheetOpen, onFacepileClick }: MemberDockProps) {
  return (
    <>
      {/* SVG Filter Definition for glass distortion effect */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="glass-distortion">
            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <div
      className={`
        md:hidden
        fixed left-1/2 -translate-x-1/2 z-[70]
        transition-all duration-300 ease-out
        rounded-full
        ${isBottomSheetOpen ? 'bottom-[-200px] opacity-0' : 'bottom-6 opacity-100'}
      `}
    >
      {/* Dock Container with 4-layer glass effect */}
      <div className="group relative rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Layer 1: Blur + Distortion */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            backdropFilter: 'blur(3px)',
            filter: 'url(#glass-distortion)',
            background: 'rgba(0,0,0,0.001)',
            zIndex: 0
          }}
        />

        {/* Layer 2: Shine/Highlight */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
          style={{
            boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
            zIndex: 1
          }}
        />

        {/* Layer 3: Brightness Overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
          style={{
            background: 'rgba(255, 255, 255, 1)',
            zIndex: 2
          }}
        />

        {/* Layer 4: Edge Glow Border */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-300 border border-white/12"
          style={{
            zIndex: 3
          }}
        />

        {/* Content */}
        <div className="relative flex items-center gap-4 px-4 py-3 rounded-full" style={{ zIndex: 20 }}>
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
                  <img
                    src={getAvatarUrl(member.user_id, member.avatar_url)}
                    alt={member.display_name || member.username}
                    className="w-full h-full object-cover"
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
        </div>
      </div>
    </div>
    </>
  )
}
