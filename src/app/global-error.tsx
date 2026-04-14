'use client'

import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  Sentry.captureException(error)

  return (
    <html>
      <body className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <h1 className="text-lg font-extrabold text-gray-900">Something went wrong</h1>
          <p className="text-sm text-gray-500 mt-1">
            Please try again. If this keeps happening, contact support.
          </p>
          <button
            onClick={() => reset()}
            className="mt-4 w-full py-2.5 rounded-xl text-white font-bold text-sm"
            style={{ background: '#f68b1f' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}

