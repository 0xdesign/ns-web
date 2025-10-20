import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getAllApplications } from '@/lib/db'

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  return stringValue
}

export async function GET() {
  try {
    await requireAdmin()

    const applications = await getAllApplications()

    const headers = [
      'id',
      'discord_user_id',
      'discord_username',
      'email',
      'status',
      'reviewed_by',
      'reviewed_at',
      'created_at',
      'why_join',
      'what_building',
      'experience_level',
      'social_links',
      'project_links',
    ]

    const rows = applications.map((app) =>
      [
        app.id,
        app.discord_user_id,
        app.discord_username,
        app.email,
        app.status,
        app.reviewed_by,
        app.reviewed_at,
        app.created_at,
        app.why_join,
        app.what_building,
        app.experience_level,
        app.social_links,
        app.project_links,
      ].map(escapeCsv).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="applications.csv"',
      },
    })
  } catch (error) {
    console.error('Applications export error:', error)
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to export applications' }, { status: 500 })
  }
}
