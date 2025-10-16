'use client'

import { MemberStatus, getAvatarUrl } from '@/lib/supabase'

interface MemberCardProps {
  member: MemberStatus
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <div className="group relative rounded-xl overflow-hidden">
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
  )
}
