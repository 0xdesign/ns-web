'use client'

import { useCallback } from 'react'
import {
  buildExpiredMemberReminderIcs,
  downloadIcsFile,
  formatDateTime,
} from '@/lib/admin-dashboard'

interface ExpiredMemberCardProps {
  discordId: string
  periodEnd: string
  status: string
}

export function ExpiredMemberCard({ discordId, periodEnd, status }: ExpiredMemberCardProps) {
  const handleCopy = useCallback(() => {
    if (!navigator?.clipboard) {
      alert('Clipboard access not available in this browser.')
      return
    }

    navigator.clipboard
      .writeText(discordId)
      .then(() => {
        alert(`Discord ID ${discordId} copied to clipboard.`)
      })
      .catch(() => {
        alert('Unable to copy Discord ID automatically.')
      })
  }, [discordId])

  const handleReminder = useCallback(() => {
    const ics = buildExpiredMemberReminderIcs(discordId, periodEnd)
    const filename = `follow-up-${discordId}.ics`
    downloadIcsFile(filename, ics)
  }, [discordId, periodEnd])

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-white">Discord ID · {discordId}</p>
      <p className="text-xs text-white/60">Period ended {formatDateTime(periodEnd)}</p>
      <p className="text-xs text-white/50">Stripe status · {status}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/35 hover:text-white"
        >
          Copy ID
        </button>
        <button
          type="button"
          onClick={handleReminder}
          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/35 hover:text-white"
        >
          Reminder
        </button>
      </div>
    </div>
  )
}
