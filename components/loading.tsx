export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
        </div>
        <p className="text-neutral-600 dark:text-neutral-400 font-medium">
          Loading...
        </p>
      </div>
    </div>
  )
}
