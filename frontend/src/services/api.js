import { getPackageData, getAnalyticsData } from '../data/mockData'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const MOCK_DELAY = 800
const REQUEST_TIMEOUT = 4000

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function mockScanPackage(packageName) {
  await delay(MOCK_DELAY)
  return getPackageData(packageName)
}

async function fetchFromBackend(packageName) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const response = await fetch(
      `${API_BASE}/api/scan/${encodeURIComponent(packageName)}`,
      { signal: controller.signal },
    )

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function scanPackage(packageName) {
  const trimmed = packageName.trim()
  if (!trimmed) {
    throw new Error('Please enter a package name')
  }

  try {
    return await fetchFromBackend(trimmed)
  } catch {
    return mockScanPackage(trimmed)
  }
}

export async function getAnalytics() {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    try {
      const response = await fetch(`${API_BASE}/api/analytics`, {
        signal: controller.signal,
      })

      if (!response.ok) throw new Error('Backend unavailable')
      return await response.json()
    } finally {
      clearTimeout(timeoutId)
    }
  } catch {
    await delay(MOCK_DELAY)
    return getAnalyticsData()
  }
}
