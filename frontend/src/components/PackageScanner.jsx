import { useState } from 'react'
import { useSecurityStore } from '../store/useSecurityStore'

const EXAMPLES = ['axios', 'lodash', 'express', 'react']

function PackageScanner() {
  const [input, setInput] = useState('')
  const { scanPackage, isLoading, error, clearResults } = useSecurityStore()

  const handleSubmit = (e) => {
    e.preventDefault()
    scanPackage(input)
  }

  const handleExampleClick = (pkg) => {
    setInput(pkg)
    clearResults()
  }

  return (
    <section
      id="scanner"
      className="bg-white dark:bg-slate-950 py-20 md:py-28 transition-colors duration-300"
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-4">
            Package Scanner
          </span>
          <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">
            Scan any npm package
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Enter a package name to run a full security analysis before you install.
          </p>
        </div>

        <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="package-input"
                className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2"
              >
                Package name
              </label>
              <input
                id="package-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter npm package name"
                disabled={isLoading}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-gray-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all disabled:opacity-60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-400">Examples:</span>
              {EXAMPLES.map((pkg) => (
                <button
                  key={pkg}
                  type="button"
                  onClick={() => handleExampleClick(pkg)}
                  disabled={isLoading}
                  className="rounded-full px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {pkg}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 dark:disabled:bg-blue-900 text-white px-6 py-3.5 text-sm font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Scanning…
                </>
              ) : (
                'Scan Package'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-4">
          Uses live API when available · falls back to local analysis automatically
        </p>
      </div>
    </section>
  )
}

export default PackageScanner
