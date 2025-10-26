import Link from 'next/link'
import Image from 'next/image'
import { getMembers, getAvatarUrl } from '@/lib/supabase'
import type { MemberStatus } from '@/lib/supabase'

export default async function MembersPage() {
  const { members } = await getMembers()
  const error = null

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold">Rasp</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/apply"
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500"
              >
                Apply to Join
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Member Directory */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Community Members
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Meet the Rasp community building the future
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              Make sure the Discord bot is running at http://localhost:8000
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No members found. The community is just getting started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member: MemberStatus) => (
              <div
                key={member.user_id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <Image
                      src={getAvatarUrl(member.user_id, member.avatar_url)}
                      alt={`${member.display_name || member.username}'s avatar`}
                      width={64}
                      height={64}
                      className="rounded-full w-12 h-12 md:w-16 md:h-16"
                      unoptimized
                    />
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {member.display_name || member.username}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
                      @{member.username}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.activity_status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : member.activity_status === 'NEW'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {member.activity_status}
                      </span>
                    </div>
                    {member.status_summary && (
                      <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {member.status_summary}
                      </p>
                    )}
                    {member.current_projects && member.current_projects.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                          Working on:
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.current_projects.slice(0, 3).map((project: string, i: number) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {project}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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
