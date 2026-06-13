import { create } from 'zustand'
import { scanPackage as apiScanPackage, getAnalytics as apiGetAnalytics } from '../services/api'

export const useSecurityStore = create((set) => ({
  scanHistory: [],
  currentPackage: null,
  scanResult: null,
  isLoading: false,
  error: null,

  analytics: null,
  analyticsLoading: false,
  analyticsError: null,

  scanPackage: async (packageName) => {
    const trimmed = packageName.trim()
    if (!trimmed) {
      set({ error: 'Please enter a package name', scanResult: null })
      return
    }

    set({ isLoading: true, error: null, currentPackage: trimmed })

    try {
      const result = await apiScanPackage(trimmed)

      set((state) => ({
        scanResult: result,
        currentPackage: trimmed,
        isLoading: false,
        error: null,
        scanHistory: [
          { packageName: trimmed, result, scannedAt: new Date().toISOString() },
          ...state.scanHistory,
        ].slice(0, 20),
      }))
    } catch (err) {
      set({
        isLoading: false,
        error: err.message || 'Scan failed. Please try again.',
        scanResult: null,
      })
    }
  },

  clearResults: () => {
    set({ scanResult: null, currentPackage: null, error: null })
  },

  fetchAnalytics: async () => {
    set({ analyticsLoading: true, analyticsError: null })

    try {
      const data = await apiGetAnalytics()
      set({ analytics: data, analyticsLoading: false })
    } catch (err) {
      set({
        analyticsLoading: false,
        analyticsError: err.message || 'Failed to load analytics',
      })
    }
  },
}))
