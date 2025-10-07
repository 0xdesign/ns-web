'use client'

import { useState, useEffect } from 'react'
import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberSidebarProps {
  members: MemberStatus[]
  totalCount: number
}

export function MemberSidebar({ members, totalCount }: MemberSidebarProps) {
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

      {/* Sidebar / Drawer */}
      <aside
        data-member-sidebar
        className={`
          fixed top-0 right-0 h-full w-[280px]
          bg-neutral-950 border-l border-white/30
          z-50 overflow-hidden
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
      >
        {/* Glassmorphism overlay */}
        <div className="absolute inset-0 backdrop-blur-sm bg-neutral-950/80" />

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-6 border-b border-white/10">
            <div className="text-white">
              <h3 className="text-sm font-medium text-white/70">Active members</h3>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
            {/* Close button (mobile only) */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              aria-label="Close members sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Members list (scrollable) */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {members.slice(0, 50).map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full border border-white overflow-hidden bg-neutral-800">
                    <img
                      src={getAvatarUrl(member.user_id, member.avatar_url)}
                      alt={member.display_name || member.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Active indicator */}
                  {member.activity_status === 'ACTIVE' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 ring-2 ring-neutral-950" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {member.display_name || member.username}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    @{member.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Affordance peek (mobile only) */}
      <div className="md:hidden fixed top-0 right-0 h-full w-2 bg-gradient-to-l from-white/10 to-transparent pointer-events-none z-30" />

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
