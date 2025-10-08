'use client'

import { MemberStatus, getAvatarUrl } from '@/lib/supabase'
import GradualBlur from '@/components/ui/gradual-blur'

interface NavigationProps {
  memberCount: number
  topMembers: MemberStatus[]
}

export function Navigation({ memberCount, topMembers }: NavigationProps) {
  const handleMemberPillClick = () => {
    const toggle = document.querySelector('[data-member-sidebar-toggle]') as HTMLButtonElement
    toggle?.click()
  }

  return (
    <>
      {/* Use GradualBlur as the nav bar (page-level fixed overlay) */}
      <GradualBlur
        target="page"
        position="top"
        height="160px"
        divCount={14}
        strength={2.6}
        curve="bezier"
        exponential
        zIndex={-70} // effective z-index: 30 (config + 100); above main (z-10), below nav (z-40)
        style={{
          background:
            'linear-gradient(to bottom, rgba(12,12,12,0.06) 0%, rgba(12,12,12,0.035) 55%, rgba(12,12,12,0.01) 92%, rgba(12,12,12,0) 100%)'
        }}
      />

      {/* Nav content above blur; no background fill */}
      <nav className="fixed top-0 left-0 right-0 z-40 h-[69px]">
        <div className="flex items-center justify-between h-full px-6">
          {/* Logo */}
          <h1 className="text-sm font-extrabold text-white/74 tracking-tight [text-shadow:2px_4px_8px_rgba(0,0,0,0.08)]">
            NO/SHOP
          </h1>

          {/* Member pill */}
          <button
            data-member-pill
            onClick={handleMemberPillClick}
            className="
              group
              md:hidden
              backdrop-blur-[3px] bg-white/10 hover:bg-white/20
              border border-white rounded-[48px]
              px-2 py-2 pr-4
              flex items-center gap-3
              transition-all duration-200
              hover:scale-105
            "
          >
            {/* Avatar stack */}
            <div className="flex items-center pr-1.5">
              {topMembers.slice(0, 3).map((member, i) => (
                <div
                  key={member.user_id}
                  className="w-6 h-6 rounded-full border border-white overflow-hidden -mr-1.5 relative bg-neutral-800"
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

            {/* Count */}
            <span className="text-sm font-medium text-white tracking-tight">
              {memberCount}
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
