'use client'

import Image from 'next/image'

import { MemberStatus, getAvatarUrl } from '@/lib/supabase'
import { GlassCard } from '@/components/ui/glass-card'

interface MemberCardProps {
  member: MemberStatus
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <GlassCard className="rounded-xl" contentClassName="flex items-center gap-3 px-3.5 py-2.5">
      <div className="relative flex-shrink-0">
        <div className="h-11 w-11 overflow-hidden rounded-full border border-white/30 bg-white/10">
          <Image
            src={getAvatarUrl(member.user_id, member.avatar_url)}
            alt={member.display_name || member.username}
            width={44}
            height={44}
            className="h-full w-full object-cover"
            sizes="44px"
            unoptimized
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
    </GlassCard>
  )
}
