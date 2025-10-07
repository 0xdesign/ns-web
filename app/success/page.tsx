import Link from 'next/link'
import { generateJoinState, getJoinDiscordAuthUrl } from '@/lib/discord'

export const dynamic = 'force-dynamic'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ app?: string; joined?: string; error?: string }>
}) {
  const params = await searchParams
  const appId = params.app
  const joined = params.joined
  const error = params.error

  let joinUrl: string | null = null
  let joinConfigError: string | null = null
  try {
    const state = generateJoinState({ appId: appId || 'unknown' })
    joinUrl = getJoinDiscordAuthUrl(state)
  } catch (e) {
    // join not configured; hide the button
    joinUrl = null
    joinConfigError = e instanceof Error ? e.message : 'Discord join OAuth not configured'
    console.warn('⚠️  Discord join button unavailable:', joinConfigError)
    console.warn('   → Set DISCORD_JOIN_REDIRECT_URI and DISCORD_BOT_TOKEN in .env')
  }

  const inviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || ''

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
          Payment Successful
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Welcome! Join our Discord to access the community.
        </p>

        {joined === '1' && (
          <div className="mt-6 rounded-md bg-green-50 dark:bg-green-900/20 p-4 text-sm text-green-800 dark:text-green-200">
            You’ve been added to the server. Check your Discord.
          </div>
        )}
        {error && (
          <div className="mt-6 rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
            Join error: {error}
          </div>
        )}

        <div className="mt-10 flex flex-col items-center gap-4">
          {joinUrl ? (
            <a
              href={joinUrl}
              className="inline-flex items-center justify-center rounded-md bg-[#5865F2] px-6 py-3 text-white font-semibold shadow hover:bg-[#4752C4]"
            >
              Join Discord (1‑click)
            </a>
          ) : inviteUrl ? (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-[#5865F2] px-6 py-3 text-white font-semibold shadow hover:bg-[#4752C4]"
            >
              Join Discord Server
            </a>
          ) : (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Discord join link unavailable</p>
              <p className="mt-1 text-xs">Contact an admin for an invite</p>
            </div>
          )}

          {joinUrl && inviteUrl && (
            <a
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 dark:text-gray-300 underline"
            >
              Or open the invite link
            </a>
          )}

          {!joinUrl && joinConfigError && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {joinConfigError}
            </p>
          )}

          <Link
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
          >
            Return to homepage
          </Link>
        </div>
      </div>
    </main>
  )
}

