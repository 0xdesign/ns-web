interface ErrorMessageProps {
  title: string
  message: string
}

export function ErrorMessage({ title, message }: ErrorMessageProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow p-6 text-center">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
      </div>
    </main>
  )
}
