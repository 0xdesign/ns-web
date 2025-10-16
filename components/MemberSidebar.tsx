'use client'

import { useState, useEffect } from 'react'
import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberSidebarProps {
  members: MemberStatus[]
  isOpen: boolean
  onClose: () => void
}

export function MemberSidebar({ members, isOpen, onClose }: MemberSidebarProps) {
  // Prevent scroll when bottom sheet is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      {/* Mobile: Bottom Sheet with Backdrop */}
      <div className="md:hidden">
        {/* Backdrop */}
        <div
          className={`
            fixed inset-0 bg-black/60 backdrop-blur-md z-45
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={onClose}
        />

        {/* Bottom Sheet */}
        <aside
          data-member-sidebar
          className={`
            fixed bottom-0 left-0 right-0
            h-[75vh] max-h-[600px]
            rounded-t-[28px]
            z-50
            transition-transform duration-400 ease-out
            ${isOpen ? 'translate-y-0' : 'translate-y-full'}
          `}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Glass Container */}
          <div className="relative h-full rounded-t-[28px] overflow-hidden">
            {/* Layer 1: Blur + Distortion */}
            <div
              className="absolute inset-0 rounded-t-[28px] pointer-events-none"
              style={{
                backdropFilter: 'blur(4px)',
                filter: 'url(#glass-distortion)',
                background: 'rgba(0,0,0,0.001)',
                zIndex: 0
              }}
            />

            {/* Layer 2: Shine/Highlight */}
            <div
              className="absolute inset-0 rounded-t-[28px] pointer-events-none"
              style={{
                boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                zIndex: 1
              }}
            />

            {/* Layer 3: Edge Glow Border */}
            <div
              className="absolute inset-0 rounded-t-[28px] pointer-events-none border-t border-x border-white/12"
              style={{
                zIndex: 3
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col" style={{ zIndex: 20 }}>
              {/* Drag Handle */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 rounded-full bg-white/40" />
              </div>

              {/* Close Button */}
              <div className="flex justify-end px-6 pb-3">
                <button
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white/80 transition hover:bg-white/25 hover:text-white"
                  style={{ boxShadow: '0 8px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)' }}
                  aria-label="Close members"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Member List - Scrollable */}
              <div
                className="flex-1 overflow-y-auto px-4 space-y-3 pb-6"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {members.slice(0, 50).map((member) => (
                  <div
                    key={member.user_id}
                    className="group relative rounded-xl overflow-hidden"
                  >
                    {/* Layer 1: Blur + Distortion */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none"
                      style={{
                        backdropFilter: 'blur(2px)',
                        filter: 'url(#glass-distortion)',
                        zIndex: 0
                      }}
                    />

                    {/* Layer 2: Shine/Highlight */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                      style={{
                        boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                        zIndex: 1
                      }}
                    />

                    {/* Layer 3: Brightness Overlay - Subtle white wash on hover */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                      style={{
                        background: 'rgba(255, 255, 255, 1)',
                        zIndex: 2
                      }}
                    />

                    {/* Layer 4: Edge Glow Border */}
                    <div
                      className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                      style={{
                        zIndex: 3
                      }}
                    />

                    {/* Content */}
                    <div className="relative flex items-center gap-3 px-3.5 py-2.5" style={{ zIndex: 20 }}>
                      <div className="relative flex-shrink-0">
                        <div className="h-11 w-11 overflow-hidden rounded-full border border-white/30 bg-white/10">
                          <img
                            src={getAvatarUrl(member.user_id, member.avatar_url)}
                            alt={member.display_name || member.username}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        {member.activity_status === 'ACTIVE' && (
                          <div className="absolute -bottom-1 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)] ring-2 ring-black/70" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white/90">{member.display_name || member.username}</p>
                        <p className="line-clamp-2 text-xs text-white/55 leading-relaxed">
                          {member.status_summary || 'No recent activity'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Desktop: Right Sidebar (unchanged) */}
      <aside
        data-member-sidebar-desktop
        className="hidden md:block fixed inset-y-0 right-0 w-[300px] z-50 rounded-[28px]"
      >
        <div className="relative h-full px-2">
          <div
            className="h-full overflow-y-auto pr-2 member-list-scroll"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="mt-8 space-y-3 pb-12">
              {members.slice(0, 50).map((member) => (
                <div
                  key={member.user_id}
                  className="group relative rounded-xl overflow-hidden"
                >
                  {/* Layer 1: Blur + Distortion */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{
                      backdropFilter: 'blur(2px)',
                      filter: 'url(#glass-distortion)',
                      zIndex: 0
                    }}
                  />

                  {/* Layer 2: Shine/Highlight */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300"
                    style={{
                      boxShadow: 'inset 1px 1px 1px 0 rgba(255, 255, 255, 0.3)',
                      zIndex: 1
                    }}
                  />

                  {/* Layer 3: Brightness Overlay - Subtle white wash on hover */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 opacity-0 group-hover:opacity-[0.03]"
                    style={{
                      background: 'rgba(255, 255, 255, 1)',
                      zIndex: 2
                    }}
                  />

                  {/* Layer 4: Edge Glow Border */}
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none transition-all duration-300 border border-transparent group-hover:border-white/12"
                    style={{
                      zIndex: 3
                    }}
                  />

                  {/* Content */}
                  <div className="relative flex items-center gap-3 px-3.5 py-2.5" style={{ zIndex: 20 }}>
                    <div className="relative flex-shrink-0">
                      <div className="h-11 w-11 overflow-hidden rounded-full border border-white/30 bg-white/10">
                        <img
                          src={getAvatarUrl(member.user_id, member.avatar_url)}
                          alt={member.display_name || member.username}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {member.activity_status === 'ACTIVE' && (
                        <div className="absolute -bottom-1 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.45)] ring-2 ring-black/70" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white/90">{member.display_name || member.username}</p>
                      <p className="line-clamp-2 text-xs text-white/55 leading-relaxed">
                        {member.status_summary || 'No recent activity'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
