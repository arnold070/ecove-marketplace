/**
 * Server-side initializer — called once when the Next.js server starts.
 * Starts background jobs. Import this at the top of the root layout.
 */

// Only run on server
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  import('./jobs').then(({ startBackgroundJobs }) => {
    startBackgroundJobs()
  }).catch(() => {})
}

export {}
