'use client'

import { useState, useEffect } from 'react'
import { MemberStatus } from '@/lib/supabase'
import { MemberCard } from '@/components/MemberCard'

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
          role="button"
          aria-label="Close member sidebar"
          tabIndex={isOpen ? 0 : -1}
          className={`
            fixed inset-0 bg-black/60 backdrop-blur-md z-45
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={onClose}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
              e.preventDefault()
              onClose()
            }
          }}
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
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
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
              {/* Interactive Drag Handle - Tap to Close */}
              <button
                onClick={onClose}
                className="flex justify-center pt-5 pb-4 w-full transition-opacity duration-200 hover:opacity-70 active:opacity-50"
                aria-label="Close member list"
              >
                <div className="w-12 h-1 rounded-full bg-white/40" />
              </button>

              {/* Member List - Scrollable */}
              <div
                className="flex-1 overflow-y-auto px-4 space-y-3 pb-6"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {members.slice(0, 50).map((member) => (
                  <MemberCard key={member.user_id} member={member} />
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
            <div className="mt-20 space-y-3 pb-12">
              {members.slice(0, 50).map((member) => (
                <MemberCard key={member.user_id} member={member} />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
