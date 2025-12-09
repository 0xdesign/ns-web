"use client"

import { BlurIn } from '@/components/ui/blur-in'
import { GlassCard } from '@/components/ui/glass-card'
import { parseMarkdownLinks } from '@/lib/markdown'
import type { DailyDigest } from '@/lib/supabase'

interface DailyDigestCardProps {
  digest: DailyDigest | null
}

export function DailyDigestCard({ digest }: DailyDigestCardProps) {
  if (!digest) return null

  // Format the digest date (force UTC to prevent timezone shifts)
  const digestDate = new Date(digest.digest_date + 'T00:00:00Z')
  const formattedDate = digestDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <GlassCard blurAmount="3px" className="rounded-xl p-6 md:p-8" contentClassName="space-y-6">
      <BlurIn delay={210} duration={800} amount={10}>
        {/* Header */}
        <div className="space-y-2">
          <h3 className="heading text-white">
            Daily Digest
          </h3>
          <p className="text-sm text-white/60">{formattedDate}</p>
        </div>

        {/* Activity Summary */}
        {(digest.activity_summary_short || digest.activity_summary) && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white/80">Today&rsquo;s Activity</h4>
            <p className="body text-white/90 whitespace-pre-wrap">
              {parseMarkdownLinks(digest.activity_summary_short || digest.activity_summary || '')}
            </p>
          </div>
        )}

        {/* Top Messages */}
        {digest.top_messages && digest.top_messages.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white/80">Top Messages</h4>
            <div className="space-y-3">
              {digest.top_messages.slice(0, 3).map((message, index) => (
                <div key={message.message_id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-white/60">
                    <span className="font-mono">{index + 1}.</span>
                    <span className="font-semibold">@{message.author_name}</span>
                    <span>in #{message.channel_name}</span>
                    <span className="ml-auto">{message.reaction_count} reactions</span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">
                    &ldquo;{message.content}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </BlurIn>
    </GlassCard>
  )
}
