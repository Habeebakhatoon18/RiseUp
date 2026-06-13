import { getFallbackAnalytics } from '../../data/fallbackAnalytics'
import { ANALYTICS_SOURCES } from './analyticsTypes'
import { isValidAnalyticsSummary, normalizeAnalyticsPayload } from './normalizeAnalytics'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const ANALYTICS_ENDPOINT = `${API_BASE}/api/analytics`
const REQUEST_TIMEOUT_MS = 4000
const FALLBACK_DELAY_MS = 800

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchLiveAnalytics() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(ANALYTICS_ENDPOINT, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const payload = await response.json()

    if (!isValidAnalyticsSummary(payload)) {
      throw new Error('Invalid analytics response structure')
    }

    return normalizeAnalyticsPayload(payload)
  } finally {
    clearTimeout(timeoutId)
  }
}

async function fetchFallbackAnalytics() {
  await delay(FALLBACK_DELAY_MS)
  const fallback = getFallbackAnalytics()

  if (fallback.summary) {
    return fallback
  }

  return normalizeAnalyticsPayload(fallback)
}

/**
 * Fetches analytics from the backend. Never throws — always resolves with data.
 * @returns {Promise<import('./analyticsTypes').AnalyticsResult>}
 */
export async function getAnalytics() {
  try {
    const data = await fetchLiveAnalytics()
    return { data, source: ANALYTICS_SOURCES.LIVE }
  } catch {
    const data = await fetchFallbackAnalytics()
    return { data, source: ANALYTICS_SOURCES.FALLBACK }
  }
}
