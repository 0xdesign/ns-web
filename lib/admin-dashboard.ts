import type { Application } from '@/lib/db'

export function parseUrlList(raw: string | null): URL[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((value) => {
        if (typeof value !== 'string') return null
        try {
          const url = new URL(value)
          return ['http:', 'https:'].includes(url.protocol) ? url : null
        } catch {
          return null
        }
      })
      .filter((url): url is URL => url !== null)
  } catch {
    return []
  }
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return 'Unknown date'
  return new Date(value).toLocaleString()
}

export function getInitials(label: string | null | undefined): string {
  if (!label) return '??'
  const trimmed = label.trim()
  if (!trimmed) return '??'
  const condensed = trimmed.replace(/[^A-Za-z0-9]/g, '')
  return condensed.slice(0, 2).toUpperCase() || '??'
}

function formatIcsDate(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, '0')
  const year = date.getUTCFullYear()
  const month = pad(date.getUTCMonth() + 1)
  const day = pad(date.getUTCDate())
  const hours = pad(date.getUTCHours())
  const minutes = pad(date.getUTCMinutes())
  const seconds = pad(date.getUTCSeconds())

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

export function buildApplicationReminderIcs(
  application: Application,
  offsetDays = 2
): string {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() + offsetDays)
  reminderDate.setHours(15, 0, 0, 0) // 3pm follow-up by default

  const start = formatIcsDate(reminderDate)
  const endDate = new Date(reminderDate.getTime() + 30 * 60 * 1000)
  const end = formatIcsDate(endDate)

  const summary = `Review application · ${application.discord_username}`
  const descriptionLines = [
    `Applicant: ${application.discord_username}`,
    `Email: ${application.email}`,
    `Why join: ${application.why_join}`,
    `What building: ${application.what_building}`,
  ]
    .map((line) => line.replace(/\r?\n/g, ' '))
    .join('\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Creative Technologists//Admin Dashboard//EN',
    'BEGIN:VEVENT',
    `UID:${application.id}@creative-technologists`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${descriptionLines}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function buildExpiredMemberReminderIcs(
  discordId: string,
  periodEnd: string
): string {
  const reminderDate = new Date(periodEnd)
  reminderDate.setDate(reminderDate.getDate() + 1)
  reminderDate.setHours(10, 0, 0, 0)

  const start = formatIcsDate(reminderDate)
  const end = formatIcsDate(new Date(reminderDate.getTime() + 30 * 60 * 1000))

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Creative Technologists//Admin Dashboard//EN',
    'BEGIN:VEVENT',
    `UID:expired-${discordId}-${periodEnd}@creative-technologists`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:Follow up with expired member · ${discordId}`,
    `DESCRIPTION:Reach out to Discord user ${discordId} about renewal options.`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcsFile(filename: string, ics: string) {
  if (typeof window === 'undefined') return
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
