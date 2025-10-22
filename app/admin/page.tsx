import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { AdminTools } from '@/components/admin/AdminTools'
import { PendingApplicationsSection } from '@/components/admin/PendingApplicationsSection'
import { FollowupActions } from '@/components/admin/FollowupActions'
import { ExpiredMemberCard } from '@/components/admin/ExpiredMemberCard'
import { isAdmin } from '@/lib/admin-auth'
import {
  getPendingApplications,
  getApplicationsByStatus,
  getAllSubscriptions,
} from '@/lib/db'
import { getMembers } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { formatDateTime, getInitials } from '@/lib/admin-dashboard'

const STATUS_BADGE_STYLES: Record<'pending' | 'approved' | 'waitlisted' | 'rejected', string> = {
  pending: 'border-amber-400/30 bg-amber-500/15 text-amber-100',
  approved: 'border-emerald-400/25 bg-emerald-500/15 text-emerald-100',
  waitlisted: 'border-blue-400/25 bg-blue-500/15 text-blue-100',
  rejected: 'border-rose-400/30 bg-rose-500/15 text-rose-100',
}

// Force dynamic rendering (uses cookies for auth)
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Check admin access
  const admin = await isAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  // Fetch applications by status and current members
  const [pending, approved, rejected, waitlisted, membersResp, subs] = await Promise.all([
    getPendingApplications(),
    getApplicationsByStatus('approved'),
    getApplicationsByStatus('rejected'),
    getApplicationsByStatus('waitlisted'),
    getMembers(),
    getAllSubscriptions(),
  ])
  const applications = pending
  const currentMembers = membersResp.members
  const totalMembersCount = membersResp.total ?? currentMembers.length
  const now = new Date()
  const expiredMembers = subs.filter(
    (s) => s.status === 'canceled' && new Date(s.current_period_end) <= now
  )
  const processedCount = approved.length + rejected.length + waitlisted.length
  const acceptanceRate =
    processedCount > 0 ? Math.round((approved.length / processedCount) * 100) : null
  const pendingSummary =
    applications.length === 0
      ? 'All pending applications have been reviewed. Check back soon for new submissions.'
      : `Start with the ${applications.length === 1 ? 'one application' : `${applications.length} applications`} waiting on a decision.`
  const expiredSummary =
    expiredMembers.length === 0
      ? 'All active memberships are current.'
      : `Follow up with ${expiredMembers.length === 1 ? 'one member' : `${expiredMembers.length} members`} whose billing period ended.`

  const overviewStats = [
    {
      label: 'Pending reviews',
      value: applications.length,
      helper: applications.length ? 'Ready for a decision' : 'All clear',
    },
    {
      label: 'Active members',
      value: totalMembersCount,
      helper: 'Synced from Supabase',
    },
    {
      label: 'Expired memberships',
      value: expiredMembers.length,
      helper: 'Ended billing cycles',
    },
    {
      label: 'Acceptance rate',
      value: acceptanceRate !== null ? `${acceptanceRate}%` : '—',
      helper: processedCount ? `${processedCount} reviewed` : 'Awaiting decisions',
    },
  ] as const

  const quickSections = [
    { href: '#pending', label: 'Pending reviews', helper: 'Queue to triage' },
    { href: '#approved', label: 'Approved', helper: 'People who got the green light' },
    { href: '#waitlisted', label: 'Waitlist', helper: 'Check-in periodically' },
    { href: '#rejected', label: 'Rejected', helper: 'Closed out applications' },
    { href: '#expired', label: 'Expired members', helper: 'Subscriptions to follow up' },
    { href: '#members', label: 'Current members', helper: 'Top 30 from Supabase' },
  ] as const

  const decisionSections = [
    {
      id: 'approved',
      title: 'Approved',
      description: 'Members ready to onboard or already active.',
      status: 'approved' as const,
      items: approved,
      emptyLabel: 'No approved applications yet.',
    },
    {
      id: 'waitlisted',
      title: 'Waitlisted',
      description: 'Keep an eye on these applicants for follow-up.',
      status: 'waitlisted' as const,
      items: waitlisted,
      emptyLabel: 'No waitlisted applications.',
    },
    {
      id: 'rejected',
      title: 'Rejected',
      description: 'Closed applications retained for historical context.',
      status: 'rejected' as const,
      items: rejected,
      emptyLabel: 'No rejected applications.',
    },
  ] as const

  const decisionHistory = [...approved, ...waitlisted, ...rejected]
    .filter((app) => app.reviewed_at !== null)
    .sort(
      (a, b) =>
        new Date(b.reviewed_at ?? b.updated_at).getTime() -
        new Date(a.reviewed_at ?? a.updated_at).getTime()
    )

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),_transparent_55%)]" />
      <div className="absolute inset-0 bg-black/70" />
      <div className="relative z-10">
        <header className="border-b border-white/10 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/40">Creative Technologists</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Admin control center</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/60">
                Review applications, monitor churn, and keep the membership pipeline healthy.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            >
              <span aria-hidden="true">←</span>
              Back to site
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl space-y-16 px-6 py-12 sm:py-14 md:py-16">
          <section aria-labelledby="overview">
            <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
              <GlassCard className="rounded-3xl border border-white/10 bg-white/5" contentClassName="p-8 sm:p-10">
                <div className="flex flex-col gap-6">
                  <div>
                    <h2 id="overview" className="text-xl font-semibold text-white">
                      Overview
                    </h2>
                    <p className="mt-2 text-sm text-white/65">
                      Data refreshed on {formatDateTime(now)}.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs uppercase tracking-wide text-white/50">Where to start</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/75">
                        {pendingSummary}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                      <p className="text-xs uppercase tracking-wide text-white/50">Billing insight</p>
                      <p className="mt-3 text-sm leading-relaxed text-white/75">
                        {expiredSummary}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-wider text-white/40">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                      Stripe sync · {subs.length} subscriptions
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                      Supabase · {totalMembersCount} members
                    </span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="rounded-3xl border border-white/10 bg-white/5" contentClassName="p-6 sm:p-7">
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/50">
                    Quick nav
                  </h3>
                  <ul className="space-y-2.5">
                    {quickSections.map((section) => (
                      <li key={section.href}>
                        <a
                          href={section.href}
                          className="group flex flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30 hover:bg-white/10"
                        >
                          <span className="text-sm font-medium text-white group-hover:text-white">
                            {section.label}
                          </span>
                          <span className="text-xs text-white/55">
                            {section.helper}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {overviewStats.map((stat) => (
                <GlassCard
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5"
                  contentClassName="p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-white/55">{stat.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-xs text-white/55">{stat.helper}</p>
                </GlassCard>
              ))}
            </div>

            <div className="mt-8">
              <AdminTools />
            </div>
          </section>

          <PendingApplicationsSection applications={applications} />

          {decisionSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6 scroll-mt-36">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
                  <p className="mt-1 text-sm text-white/60">{section.description}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium',
                    STATUS_BADGE_STYLES[section.status]
                  )}
                >
                  {section.items.length} total
                </span>
              </div>
              {section.items.length === 0 ? (
                <GlassCard
                  className="rounded-2xl border border-white/10 bg-white/5"
                  contentClassName="px-8 py-10 text-center"
                >
                  <p className="text-base font-medium text-white">{section.emptyLabel}</p>
                  <p className="mt-2 text-sm text-white/60">We&apos;ll keep the history here once activity picks up.</p>
                </GlassCard>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {section.items.map((app) => (
                    <GlassCard
                      key={app.id}
                      className="rounded-2xl border border-white/10 bg-white/5"
                      contentClassName="p-5"
                    >
                      <div className="flex items-start gap-3">
                        {app.discord_avatar ? (
                          <Image
                            src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                            alt={app.discord_username}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-full border border-white/10 object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-xs font-semibold uppercase text-white/70">
                            {getInitials(app.discord_username)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white">{app.discord_username}</p>
                          <p className="text-xs text-white/60 break-all">{app.email}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                                STATUS_BADGE_STYLES[section.status]
                              )}
                            >
                              {section.title}
                            </span>
                            <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/65">
                              Reviewed {formatDateTime(app.reviewed_at ?? app.updated_at)}
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-white/70 whitespace-pre-line">
                            {app.why_join || 'No additional context provided.'}
                          </p>
                        </div>
                      </div>
                      <FollowupActions
                        applicationId={app.id}
                        applicantName={app.discord_username}
                        status={section.status}
                      />
                    </GlassCard>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section id="audit-log" className="space-y-6 scroll-mt-36">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Audit log</h2>
                <p className="mt-1 text-sm text-white/60">
                  Most recent decisions with reviewer attribution and timestamps.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/70">
                {decisionHistory.length} total entries
              </span>
            </div>
            {decisionHistory.length === 0 ? (
              <GlassCard
                className="rounded-2xl border border-white/10 bg-white/5"
                contentClassName="px-8 py-10 text-center"
              >
                <p className="text-base font-medium text-white">No decisions yet</p>
                <p className="mt-2 text-sm text-white/60">
                  Approvals, waitlists, and rejections will appear here for traceability.
                </p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {decisionHistory.slice(0, 12).map((app) => (
                  <GlassCard
                    key={`audit-${app.id}-${app.reviewed_at ?? app.updated_at}`}
                    className="rounded-2xl border border-white/10 bg-white/5"
                    contentClassName="p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                          STATUS_BADGE_STYLES[app.status as 'approved' | 'waitlisted' | 'rejected']
                        )}
                      >
                        {app.status}
                      </span>
                      <span className="text-xs text-white/55">
                        {formatDateTime(app.reviewed_at ?? app.updated_at)}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-white">{app.discord_username}</p>
                      <p className="text-xs text-white/55 break-all">{app.email}</p>
                      <p className="text-xs text-white/45">
                        Reviewed by {app.reviewed_by ?? 'unknown admin'}
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-white/60 line-clamp-3">
                      {app.why_join || 'No primary motivation captured.'}
                    </p>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>

          <section id="expired" className="space-y-6 scroll-mt-36">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Expired members</h2>
                <p className="mt-1 text-sm text-white/60">
                  Subscription periods that ended and were not renewed.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/15 px-4 py-1.5 text-sm font-medium text-amber-100">
                {expiredMembers.length} total
              </span>
            </div>
            {expiredMembers.length === 0 ? (
              <GlassCard
                className="rounded-2xl border border-white/10 bg-white/5"
                contentClassName="px-8 py-10 text-center"
              >
                <p className="text-base font-medium text-white">No expired members</p>
                <p className="mt-2 text-sm text-white/60">Everyone with access is up to date on billing.</p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {expiredMembers.slice(0, 30).map((subscription) => (
                  <GlassCard
                    key={subscription.id}
                    className="rounded-2xl border border-white/10 bg-white/5"
                    contentClassName="p-5"
                  >
                    <ExpiredMemberCard
                      discordId={subscription.customer.discord_user_id}
                      periodEnd={subscription.current_period_end}
                      status={subscription.status}
                    />
                  </GlassCard>
                ))}
              </div>
            )}
          </section>

          <section id="members" className="space-y-6 scroll-mt-36 pb-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-white">Current members</h2>
                <p className="mt-1 text-sm text-white/60">
                  Top 30 members by recent activity from Supabase.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-100">
                {currentMembers.length} showing
              </span>
            </div>
            {currentMembers.length === 0 ? (
              <GlassCard
                className="rounded-2xl border border-white/10 bg-white/5"
                contentClassName="px-8 py-10 text-center"
              >
                <p className="text-base font-medium text-white">No members found</p>
                <p className="mt-2 text-sm text-white/60">Try refreshing Supabase sync to pull the latest roster.</p>
              </GlassCard>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {currentMembers.slice(0, 30).map((member) => (
                  <GlassCard
                    key={member.user_id}
                    className="rounded-2xl border border-white/10 bg-white/5"
                    contentClassName="p-5"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                        src={
                          member.avatar_url ||
                          `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(member.user_id) % 6n)}.png`
                        }
                        alt={member.display_name || member.username}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full border border-white/10 object-cover"
                        sizes="48px"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {member.display_name || member.username}
                        </p>
                        <p className="truncate text-xs text-white/60">
                          {member.activity_status.replace(/_/g, ' ').toLowerCase()}
                        </p>
                      </div>
                    </div>
                    {member.status_summary && (
                      <p className="mt-3 text-xs text-white/65">{member.status_summary}</p>
                    )}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {member.current_projects.slice(0, 2).map((project, index) => (
                        <span
                          key={`${member.user_id}-project-${index}`}
                          className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white/55"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
