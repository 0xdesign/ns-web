'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { DecisionActions } from '@/components/admin/DecisionActions'
import {
  EXPERIENCE_LEVEL_LABELS,
  type ExperienceLevel,
} from '@/lib/experience-levels'
import type { Application } from '@/lib/db'
import {
  buildApplicationReminderIcs,
  downloadIcsFile,
  formatDateTime,
  getInitials,
  parseUrlList,
} from '@/lib/admin-dashboard'

interface PendingApplicationsSectionProps {
  applications: Application[]
}

type SortMode = 'latest' | 'oldest'

export function PendingApplicationsSection({ applications }: PendingApplicationsSectionProps) {
  const [query, setQuery] = useState('')
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | 'all'>('all')
  const [sortMode, setSortMode] = useState<SortMode>('latest')

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesQuery = (app: Application) => {
      if (!normalizedQuery) return true
      const haystack = [
        app.discord_username,
        app.email,
        app.why_join,
        app.what_building,
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    }

    const matchesExperience =
      experienceFilter === 'all'
        ? () => true
        : (app: Application) => app.experience_level === experienceFilter

    const subset = applications.filter(
      (app) => matchesQuery(app) && matchesExperience(app)
    )

    const sorted = subset.sort((a, b) => {
      const aTime = new Date(a.created_at).getTime()
      const bTime = new Date(b.created_at).getTime()
      return sortMode === 'latest' ? bTime - aTime : aTime - bTime
    })

    return sorted
  }, [applications, experienceFilter, query, sortMode])

  return (
    <section id="pending" className="space-y-6 scroll-mt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">Pending reviews</h2>
          <p className="mt-1 text-sm text-white/60">
            Decide on these to keep the pipeline moving quickly.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-sm font-medium text-amber-100">
          {filteredApplications.length} showing
        </span>
      </div>

      <GlassCard
        className="rounded-2xl border border-white/10 bg-white/5"
        contentClassName="p-5 sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs uppercase tracking-wide text-white/50">
              Search
            </label>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, email, or response"
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/50">
              Experience
            </label>
            <select
              value={experienceFilter}
              onChange={(event) => setExperienceFilter(event.target.value as ExperienceLevel | 'all')}
              className="mt-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            >
              <option value="all">All</option>
              {(Object.keys(EXPERIENCE_LEVEL_LABELS) as ExperienceLevel[]).map((level) => (
                <option key={level} value={level}>
                  {EXPERIENCE_LEVEL_LABELS[level]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-white/50">
              Sort
            </label>
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className="mt-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white focus:border-white/40 focus:outline-none"
            >
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>
      </GlassCard>

      {filteredApplications.length === 0 ? (
        <GlassCard
          className="rounded-2xl border border-white/10 bg-white/5"
          contentClassName="px-8 py-12 text-center"
        >
          <p className="text-base font-medium text-white">No matching applications</p>
          <p className="mt-2 text-sm text-white/60">
            Adjust your filters or check back soon for new submissions.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((app) => {
            const socialLinks = parseUrlList(app.social_links)
            const projectLinks = parseUrlList(app.project_links)

            return (
              <GlassCard
                key={app.id}
                className="rounded-3xl border border-white/10 bg-white/5"
                contentClassName="p-6 sm:p-8"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-4">
                        {app.discord_avatar ? (
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                            alt={app.discord_username}
                            width={64}
                            height={64}
                            className="h-16 w-16 rounded-full border border-white/10 object-cover"
                            sizes="64px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold uppercase text-white/70">
                            {getInitials(app.discord_username)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-white">{app.discord_username}</h3>
                          <p className="text-sm text-white/60 break-all">{app.email}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65">
                              Experience ·{' '}
                              {EXPERIENCE_LEVEL_LABELS[app.experience_level as ExperienceLevel] ??
                                app.experience_level}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65">
                              Applied {formatDateTime(app.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(app.discord_user_id).catch(() => {
                              alert('Unable to copy Discord ID automatically.')
                            })
                          }}
                          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/35 hover:text-white"
                        >
                          Copy Discord ID
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const ics = buildApplicationReminderIcs(app)
                            const filename = `review-${app.discord_username || app.id}.ics`
                            downloadIcsFile(filename, ics)
                          }}
                          className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/35 hover:text-white"
                        >
                          Add reminder
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                          Why do they want to join?
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/75 whitespace-pre-line">
                          {app.why_join || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                          What are they building?
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-white/75 whitespace-pre-line">
                          {app.what_building || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Social links</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {socialLinks.length ? (
                            socialLinks.map((url) => (
                              <a
                                key={url.toString()}
                                href={url.toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                              >
                                {url.hostname || url.href}
                              </a>
                            ))
                          ) : (
                            <span className="text-sm text-white/45">None provided</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                          Past project links
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {projectLinks.length ? (
                            projectLinks.map((url) => (
                              <a
                                key={url.toString()}
                                href={url.toString()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:border-white/30 hover:text-white"
                              >
                                {url.hostname || url.href}
                              </a>
                            ))
                          ) : (
                            <span className="text-sm text-white/45">None provided</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-60">
                    <DecisionActions
                      applicationId={app.id}
                      applicantName={app.discord_username}
                    />
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </section>
  )
}
