'use client'

import { useState, useEffect } from 'react'
import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberSidebarProps {
  members: MemberStatus[]
}

export function MemberSidebar({ members }: MemberSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Close drawer when clicking outside on mobile
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-member-sidebar]') && !target.closest('[data-member-pill]')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  // Prevent scroll when drawer is open on mobile
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
      {/* Mobile: Drawer overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating sidebar pane */}
      <aside
        data-member-sidebar
        className={`
          fixed inset-y-0 right-0 w-[300px]
          z-50 rounded-[28px]
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0 md:translate-x-0 md:opacity-100'}
        `}
      >
        {/* Content */}
        <div className="relative h-full px-2">
          <div
            className="h-full overflow-y-auto pr-2 member-list-scroll"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex justify-end px-3.5 pt-6 pb-3">
              <button
                onClick={() => setIsOpen(false)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white/80 transition hover:bg-white/25 hover:text-white"
                style={{ boxShadow: '0 8px 18px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.4)' }}
                aria-label="Close members sidebar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

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

      {/* Affordance indicator (mobile) */}
      <div className="md:hidden fixed top-10 right-3 h-16 w-1 rounded-full bg-gradient-to-b from-white/40 via-white/20 to-transparent pointer-events-none z-30" />

      {/* Hidden toggle function (exposed for nav button) */}
      <button
        data-member-sidebar-toggle
        onClick={() => setIsOpen(!isOpen)}
        className="hidden"
        aria-label="Toggle members sidebar"
      />
    </>
  )
}

// Hook for toggling sidebar from navigation
export function useMemberSidebarToggle() {
  return () => {
    const toggle = document.querySelector('[data-member-sidebar-toggle]') as HTMLButtonElement
    toggle?.click()
  }
}
