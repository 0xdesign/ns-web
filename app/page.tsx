import Link from 'next/link'
import { getMembers, getStatusBadge, getAvatarUrl } from '@/lib/supabase'

export default async function Home() {
  // Fetch members from Supabase
  const membersData = await getMembers()
  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Enhanced Header with glassmorphism */}
      <header className="sticky top-0 z-50 border-b border-neutral-200/10 dark:border-neutral-800/10 backdrop-blur-xl bg-white/80 dark:bg-neutral-950/80">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between items-center">
            <div className="flex items-center gap-2">
              {/* Logo with gradient effect */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-purple rounded-lg blur-lg opacity-30" />
                <div className="relative flex items-center gap-3 px-4 py-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700">
                  <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-neutral-900 to-neutral-700 dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
                  Creative Technologists
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                  AI-Powered Builders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Social proof indicator */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="flex -space-x-2">
                  {membersData.members.slice(0, 3).map((member) => {
                    const avatarUrl = getAvatarUrl(member.user_id)
                    return (
                      <div key={member.user_id} className="h-6 w-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white dark:ring-neutral-950 overflow-hidden">
                        <img src={avatarUrl} alt={member.username} className="w-full h-full object-cover" />
                      </div>
                    )
                  })}
                </div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {membersData.total} builders
                </span>
              </div>

              <Link
                href="/members"
                className="text-sm font-semibold text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors"
              >
                Members
              </Link>

              <Link
                href="/apply"
                className="group relative rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-200 hover:scale-105"
              >
                <span className="relative z-10">Apply to Join</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Immersive Hero with animated background */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-cyan/10 dark:from-neutral-950 dark:via-primary-950/20 dark:to-neutral-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.1),transparent_50%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.1),transparent_50%)]" />
          {/* Animated grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="group inline-flex items-center gap-2 rounded-full border border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-950/50 px-4 py-1.5 backdrop-blur-sm transition-all hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-100/50 dark:hover:bg-primary-900/50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
              </span>
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                Applications now open • Limited spots
              </span>
            </div>
          </div>

          <div className="text-center max-w-5xl mx-auto">
            {/* Main headline with gradient */}
            <h1 className="text-5xl sm:text-7xl lg:text-display-lg font-bold tracking-tight">
              <span className="block text-neutral-900 dark:text-white mb-2">
                Where Creators
              </span>
              <span className="block bg-gradient-to-r from-primary-600 via-accent-purple to-accent-cyan bg-clip-text text-transparent animate-gradient">
                Build with AI
              </span>
            </h1>

            {/* Subheadline with better hierarchy */}
            <p className="mt-8 text-xl sm:text-2xl leading-relaxed text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto font-medium">
              Join an exclusive community of high-potential creative technologists who transcend traditional boundaries.
              <span className="block mt-2 text-lg text-neutral-500 dark:text-neutral-400 font-normal">
                We&apos;re not just coders—we&apos;re creators harnessing AI to build extraordinary products.
              </span>
            </p>

            {/* CTA buttons with improved hierarchy */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/apply"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <span>Start Your Application</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/members"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 dark:border-neutral-700 px-8 py-4 text-base font-semibold text-neutral-900 dark:text-white hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-200"
              >
                <span>Meet the Community</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Hand-picked members</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Active daily builders</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Premium resources</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features with hover effects */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Built for Builders
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Every aspect of our community is designed to help you ship faster and build better.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Feature 1 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-accent-purple rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
            <div className="relative h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 group-hover:shadow-xl group-hover:shadow-primary-500/10">
              {/* Icon with gradient background */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl blur-sm opacity-50" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Curated Community
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Every member demonstrates exceptional creative and technical capability. No lurkers, only builders shipping real products.
              </p>

              {/* Hover arrow indicator */}
              <div className="mt-6 flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-purple to-accent-pink rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
            <div className="relative h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 group-hover:shadow-xl group-hover:shadow-accent-purple/10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl blur-sm opacity-50" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-pink shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                AI-First Mindset
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Master vibe coding, Claude integration, and cutting-edge AI workflows that 10x your output and unlock new possibilities.
              </p>

              <div className="mt-6 flex items-center gap-2 text-accent-purple font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-accent-cyan to-primary-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
            <div className="relative h-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-8 transition-all duration-300 group-hover:border-neutral-300 dark:group-hover:border-neutral-700 group-hover:shadow-xl group-hover:shadow-accent-cyan/10">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan to-primary-600 rounded-xl blur-sm opacity-50" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-primary-600 shadow-lg">
                  <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                Ship Fast
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Build products that matter. Get instant feedback from fellow creators who understand the craft and help you level up.
              </p>

              <div className="mt-6 flex items-center gap-2 text-accent-cyan font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-sm">Learn more</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Current Members Section */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-50/50 to-transparent dark:via-primary-950/20" />

        <div className="relative text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
            Meet Our Builders
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            {membersData.total} creative technologists shipping products and building with AI
          </p>
        </div>

        {/* Members Grid */}
        {membersData.members.length > 0 ? (
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {membersData.members.slice(0, 12).map((member) => {
              const badge = getStatusBadge(member.activity_status)
              return (
                <div
                  key={member.user_id}
                  className="group relative rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-xl hover:shadow-primary-500/10"
                >
                  {/* Avatar and name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-primary-400 to-primary-600 ring-2 ring-white dark:ring-neutral-900">
                        <img
                          src={getAvatarUrl(member.user_id)}
                          alt={member.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Status indicator dot */}
                      {member.activity_status === 'ACTIVE' && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white dark:ring-neutral-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                        {member.display_name}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                        @{member.username}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.color}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Summary */}
                  {member.summary && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-4">
                      {member.summary}
                    </p>
                  )}

                  {/* Activity stats */}
                  <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>{member.message_count} messages</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-600 dark:text-neutral-400">
              Members list will appear here once the bot API is running
            </p>
          </div>
        )}

        {/* View all link */}
        {membersData.members.length > 12 && (
          <div className="mt-12 text-center">
            <Link
              href="/members"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-semibold transition-colors"
            >
              <span>View all {membersData.total} members</span>
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Premium Pricing with enhanced design */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
        <div className="mx-auto max-w-4xl">
          {/* Pricing card with glow effect */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-accent-purple to-accent-cyan rounded-3xl blur-2xl opacity-20" />
            <div className="relative rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden">
              {/* Premium badge */}
              <div className="absolute top-0 right-0 mt-4 mr-4">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary-600 to-accent-purple px-3 py-1 text-xs font-semibold text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Premium Membership</span>
                </div>
              </div>

              <div className="p-8 sm:p-12">
                {/* Header */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                    Join the Community
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                    Get exclusive access to our private Discord, resources, and network of elite builders.
                  </p>
                </div>

                {/* Price */}
                <div className="text-center mb-10">
                  <div className="flex items-baseline justify-center gap-3 mb-4">
                    <span className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-primary-600 to-accent-purple bg-clip-text text-transparent">
                      $299
                    </span>
                    <span className="text-xl font-semibold text-neutral-500 dark:text-neutral-400">
                      / month
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Billed monthly • Cancel anytime • Keep access through period end
                  </p>
                </div>

                {/* Benefits with enhanced design */}
                <div className="space-y-4 mb-10">
                  {[
                    { icon: '🚀', title: 'Private Discord Community', desc: `Direct access to ${membersData.total}+ active builders and creators` },
                    { icon: '🎯', title: 'Weekly Accountability', desc: 'Progress tracking, check-ins, and peer support' },
                    { icon: '🧠', title: 'AI Workflows & Resources', desc: 'Exclusive prompts, templates, and cutting-edge techniques' },
                    { icon: '🤝', title: 'Expert Network', desc: 'Connect with founders, developers, and creative technologists' },
                    { icon: '📚', title: 'Premium Workshops', desc: 'Live sessions, masterclasses, and Q&A with industry leaders' },
                    { icon: '⚡', title: 'Early Access', desc: 'Beta features, tools, and community product launches' },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200">
                      <div className="flex-shrink-0 text-2xl">
                        {benefit.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900 dark:text-white mb-1">
                          {benefit.title}
                        </div>
                        <div className="text-sm text-neutral-600 dark:text-neutral-400">
                          {benefit.desc}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link
                  href="/apply"
                  className="group relative block w-full rounded-xl bg-gradient-to-r from-primary-600 to-accent-purple px-8 py-5 text-center text-lg font-semibold text-white shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                >
                  <span className="relative z-10 inline-flex items-center gap-2">
                    Start Your Application
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>

                {/* Trust footer */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    🔒 Secure payment • 💳 Cancel anytime • 🎓 Lifetime community access available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ teaser */}
          <div className="mt-12 text-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              Have questions?{' '}
              <a href="#faq" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                View our FAQ
              </a>
              {' '}or{' '}
              <a href="mailto:hello@creativetechs.com" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                contact us
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <footer className="relative border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-purple rounded-lg blur-lg opacity-30" />
                  <div className="relative flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900 dark:text-white">
                    Creative Technologists
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    AI-Powered Builders
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
                An exclusive community for high-potential creative technologists who use AI to build extraordinary products.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Community
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/members" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Member Directory
                  </Link>
                </li>
                <li>
                  <Link href="/apply" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Apply to Join
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Resources
              </h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/faq" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/guidelines" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © {new Date().getFullYear()} Creative Technologist Community. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="https://twitter.com" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://github.com" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://discord.com" className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors">
                <span className="sr-only">Discord</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
