import Link from 'next/link'

export default function ApplicationSuccessPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <h1 className="text-xl font-bold">Creative Technologists</h1>
            </Link>
          </div>
        </nav>
      </header>

      {/* Success Message */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <svg
              className="h-10 w-10 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Application Submitted!
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Thank you for applying to join our community
          </p>
        </div>

        {/* Next Steps */}
        <div className="mt-12 bg-white dark:bg-gray-800 shadow rounded-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            What Happens Next?
          </h2>

          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  1
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Application Review
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Our team will carefully review your application. We evaluate based on your demonstrated
                  expertise with AI tools, track record of building, and alignment with our community values.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  2
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Decision (2-3 Days)
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  You'll receive an email with our decision typically within 2-3 business days. If approved,
                  the email will include a secure payment link.
                </p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                  3
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Payment & Access
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Complete payment ($299/month) through the secure link. Your Discord role will be
                  assigned automatically within minutes, granting you instant access to all channels.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Check Your Email
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Make sure to check your spam folder if you don't see our email. Add our email
                  address to your contacts to ensure future communications reach your inbox.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-12 flex justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Back to Home
          </Link>
          <Link
            href="/members"
            className="px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Members
          </Link>
        </div>
      </div>
    </main>
  )
}
