import { initSentryServer } from '../sentry.server.config'
import { initSentryEdge } from '../sentry.edge.config'

export function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    initSentryEdge()
    return
  }
  initSentryServer()
}

