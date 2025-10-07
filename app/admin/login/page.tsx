import Link from 'next/link'

export default function AdminLoginPage() {
  const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI!)}&response_type=code&scope=identify&state=${encodeURIComponent('/admin')}`

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Admin Login
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Authenticate with Discord to access the admin dashboard.
          </p>
          <Link
            href={discordAuthUrl}
            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Continue with Discord
          </Link>
          <Link
            href="/"
            className="block w-full text-center mt-4 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
