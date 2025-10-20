import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import {
  getPendingApplications,
  getApplicationsByStatus,
  getAllSubscriptions,
} from '@/lib/db'
import {
  EXPERIENCE_LEVEL_LABELS,
  type ExperienceLevel,
} from '@/lib/experience-levels'
import { getMembers } from '@/lib/supabase'

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
  const now = new Date()
  const expiredMembers = subs.filter(
    (s) => s.status === 'canceled' && new Date(s.current_period_end) <= now
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold">Creative Technologists - Admin</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review applications and monitor current members
          </p>
        </div>

        {/* Pending Applications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Pending Applications
          </h2>
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-gray-400">
              No pending applications
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Discord Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {app.discord_avatar && (
                        <Image
                          src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                          alt={app.discord_username}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full"
                          sizes="48px"
                          unoptimized
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {app.discord_username}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.email}
                        </p>
                      </div>
                    </div>

                    {/* Application Details */}
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Why do you want to join?
                        </h4>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {app.why_join}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          What are you building?
                        </h4>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {app.what_building}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Experience with AI
                        </h4>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {EXPERIENCE_LEVEL_LABELS[(app.experience_level as ExperienceLevel)] ??
                            app.experience_level}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Social Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const rawLinks = JSON.parse(app.social_links ?? '[]')
                              if (!Array.isArray(rawLinks)) return null

                              const urls = rawLinks
                                .map((value: unknown) => {
                                  if (typeof value !== 'string') return null
                                  try {
                                    const url = new URL(value)
                                    return ['http:', 'https:'].includes(url.protocol) ? url : null
                                  } catch {
                                    return null
                                  }
                                })
                                .filter((url): url is URL => url !== null)

                              if (!urls.length) return null

                              return urls.map((url, i) => (
                                <a
                                  key={i}
                                  href={url.toString()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                                >
                                  {url.hostname || url.href}
                                </a>
                              ))
                            } catch {
                              return null
                            }
                          })()}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Past Project Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            try {
                              const rawLinks = JSON.parse(app.project_links ?? '[]')
                              if (!Array.isArray(rawLinks) || rawLinks.length === 0) {
                                return (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    None provided
                                  </span>
                                )
                              }

                              const urls = rawLinks
                                .map((value: unknown) => {
                                  if (typeof value !== 'string') return null
                                  try {
                                    const url = new URL(value)
                                    return ['http:', 'https:'].includes(url.protocol) ? url : null
                                  } catch {
                                    return null
                                  }
                                })
                                .filter((url): url is URL => url !== null)

                              if (!urls.length) {
                                return (
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    None provided
                                  </span>
                                )
                              }

                              return urls.map((url, i) => (
                                <a
                                  key={i}
                                  href={url.toString()}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                                >
                                  {url.hostname || url.href}
                                </a>
                              ))
                            } catch {
                              return (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  None provided
                                </span>
                              )
                            }
                          })()}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Applied: {new Date(app.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 ml-6">
                    <form action={`/api/admin/applications/${app.id}/approve`} method="POST">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        Approve
                      </button>
                    </form>
                    <form action={`/api/admin/applications/${app.id}/waitlist`} method="POST">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium"
                      >
                        Waitlist
                      </button>
                    </form>
                    <form action={`/api/admin/applications/${app.id}/reject`} method="POST">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>

        {/* Approved Applications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Approved Applications
          </h2>
          {approved.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No approved applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {approved.map((app) => (
                <div key={app.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {app.discord_avatar && (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                        alt={app.discord_username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                        sizes="40px"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.discord_username}</p>
                      <p className="text-xs text-gray-500">Approved {new Date(app.reviewed_at || app.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Waitlisted Applications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Waitlisted Applications
          </h2>
          {waitlisted.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No waitlisted applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {waitlisted.map((app) => (
                <div key={app.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {app.discord_avatar && (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                        alt={app.discord_username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                        sizes="40px"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.discord_username}</p>
                      <p className="text-xs text-gray-500">Waitlisted {new Date(app.reviewed_at || app.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rejected Applications */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Rejected Applications
          </h2>
          {rejected.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No rejected applications</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {rejected.map((app) => (
                <div key={app.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    {app.discord_avatar && (
                      <Image
                        src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                        alt={app.discord_username}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                        sizes="40px"
                        unoptimized
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{app.discord_username}</p>
                      <p className="text-xs text-gray-500">Rejected {new Date(app.reviewed_at || app.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}
        </section>

        {/* Expired Members */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Expired Members
          </h2>
          {expiredMembers.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No expired members</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiredMembers.slice(0, 30).map((s) => (
                <div key={s.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p className="font-medium">Discord ID: {s.customer.discord_user_id}</p>
                    <p className="text-xs text-gray-500">
                      Ended: {new Date(s.current_period_end).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Current Members */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Current Members
          </h2>
          {currentMembers.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400">No members found</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentMembers.slice(0, 30).map((m) => (
                <div key={m.user_id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={
                        m.avatar_url ||
                        `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(m.user_id) % 6n)}.png`
                      }
                      alt={m.display_name || m.username}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                      sizes="40px"
                      unoptimized
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{m.display_name || m.username}</p>
                      <p className="text-xs text-gray-500 truncate">{m.activity_status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
