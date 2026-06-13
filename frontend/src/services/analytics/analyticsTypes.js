/** Canonical summary metric keys — add new keys here to scale without UI refactors */
export const ANALYTICS_SUMMARY_KEYS = [
  'totalScans',
  'safePackages',
  'blockedInstalls',
  'criticalRisksFound',
]

export const ANALYTICS_SOURCES = {
  LIVE: 'live',
  FALLBACK: 'fallback',
}

/**
 * @typedef {Object} AnalyticsSummary
 * @property {number} totalScans
 * @property {number} safePackages
 * @property {number} blockedInstalls
 * @property {number} criticalRisksFound
 */

/**
 * @typedef {Object} AnalyticsData
 * @property {AnalyticsSummary} summary
 * @property {{ dailyVolume: Array, riskDistribution: Array }} charts
 * @property {Record<string, unknown>} extensions
 */

/**
 * @typedef {Object} AnalyticsResult
 * @property {AnalyticsData} data
 * @property {'live'|'fallback'} source
 */
