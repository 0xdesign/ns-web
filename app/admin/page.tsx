import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { getPendingApplications } from '@/lib/db'
import Link from 'next/link'

export default async function AdminPage() {
  // Check admin access
  const admin = await isAdmin()

  if (!admin) {
    redirect('/apply')
  }

  // Get pending applications
  const applications = await getPendingApplications()

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
            Pending Applications
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review and approve applications to join the community
          </p>
        </div>

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
                        <img
                          src={`https://cdn.discordapp.com/avatars/${app.discord_user_id}/${app.discord_avatar}.png`}
                          alt={app.discord_username}
                          className="w-12 h-12 rounded-full"
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
                          Social Links
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {JSON.parse(app.social_links).map((link: string, i: number) => (
                            <a
                              key={i}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 underline"
                            >
                              {new URL(link).hostname}
                            </a>
                          ))}
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
      </div>
    </main>
  )
}
