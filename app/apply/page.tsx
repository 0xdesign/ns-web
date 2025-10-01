import Link from 'next/link'
import { getDiscordAuthUrl } from '@/lib/discord'

export const dynamic = 'force-dynamic'

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const discordAuthUrl = getDiscordAuthUrl()
  const params = await searchParams
  const error = params.error

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold">Creative Technologists</h1>
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              ← Back to Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Application Page */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            Apply to Join
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Join a curated community of high-potential creative technologists
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {error === 'oauth_failed' && 'Discord authentication failed'}
                  {error === 'missing_code' && 'Invalid authentication response'}
                  {error === 'access_denied' && 'You denied the authentication request'}
                  {!['oauth_failed', 'missing_code', 'access_denied'].includes(error) &&
                    'An error occurred. Please try again.'}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Application Process */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Application Process
          </h2>

          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Connect with Discord
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Sign in with your Discord account to verify your identity
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Complete Application
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Tell us about yourself, what you're building, and why you want to join
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Review & Approval
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Our team will review your application (typically within 2-3 days)
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
                  4
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Payment & Access
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  If approved, complete payment ($299/month) and gain instant Discord access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What We're Looking For */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            What We're Looking For
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We're seeking high-potential creative technologists who demonstrate:
          </p>
          <ul className="space-y-3 text-gray-600 dark:text-gray-300">
            <li className="flex">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Mastery of AI tools and vibe coding workflows</span>
            </li>
            <li className="flex">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Track record of shipping products and building in public</span>
            </li>
            <li className="flex">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Creative vision that transcends traditional coding boundaries</span>
            </li>
            <li className="flex">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Active engagement in technical communities</span>
            </li>
            <li className="flex">
              <span className="text-primary-600 mr-2">✓</span>
              <span>Commitment to collaborative learning and knowledge sharing</span>
            </li>
          </ul>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <a
            href={discordAuthUrl}
            className="inline-flex items-center gap-3 rounded-md bg-[#5865F2] px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-[#4752C4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5865F2] transition-colors"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Continue with Discord
          </a>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            You'll be redirected to Discord to authenticate
          </p>
        </div>
      </div>
    </main>
  )
}
