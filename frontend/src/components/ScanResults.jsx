import { useEffect, useRef } from 'react'
import { useSecurityStore } from '../store/useSecurityStore'

const STATUS_CONFIG = {
  safe: {
    label: 'Safe',
    scoreText: 'text-emerald-600 dark:text-emerald-400',
    ring: 'stroke-emerald-600',
    badge: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-400',
  },
  warning: {
    label: 'Warning',
    scoreText: 'text-amber-500 dark:text-amber-400',
    ring: 'stroke-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  critical: {
    label: 'Critical',
    scoreText: 'text-red-500 dark:text-red-400',
    ring: 'stroke-red-500',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400',
  },
}

function ScoreRing({ score, status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.warning
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className="stroke-slate-200 dark:stroke-slate-700"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          className={`${config.ring} transition-all duration-700`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${config.scoreText}`}>{score}</span>
        <span className="text-sm text-gray-600 dark:text-slate-400">/100</span>
      </div>
    </div>
  )
}

function ScanResults() {
  const { scanResult, isLoading } = useSecurityStore()
  const sectionRef = useRef(null)

  useEffect(() => {
    if (scanResult && !isLoading && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [scanResult, isLoading])

  if (!scanResult || isLoading) return null

  const config = STATUS_CONFIG[scanResult.status] || STATUS_CONFIG.warning
  const { findings } = scanResult

  return (
    <section
      id="results"
      ref={sectionRef}
      className="bg-gray-50 dark:bg-slate-900/50 py-20 md:py-28 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-2">
            Security Analysis Results
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400">
            Full report for{' '}
            <span className="font-semibold text-gray-900 dark:text-white">{scanResult.name}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Score card */}
          <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-6">
              Security Score
            </p>
            <ScoreRing score={scanResult.score} status={scanResult.status} />
            <span
              className={`mt-5 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${config.badge}`}
            >
              {config.label}
            </span>
          </div>

          {/* Package info + findings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">
                Package Information
              </h3>
              <dl className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Package Name', value: scanResult.name },
                  { label: 'Latest Version', value: scanResult.version },
                  { label: 'Weekly Downloads', value: scanResult.downloads },
                  { label: 'Publisher', value: scanResult.publisher },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg bg-gray-50 dark:bg-slate-800/50 px-4 py-3">
                    <dt className="text-sm font-medium text-gray-700 dark:text-slate-400 mb-1">
                      {item.label}
                    </dt>
                    <dd className="text-base font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {scanResult.recommendedVersion && scanResult.recommendedVersion !== scanResult.version && (
                <p className="mt-4 text-sm text-gray-600 dark:text-slate-400">
                  Recommended version:{' '}
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {scanResult.recommendedVersion}
                  </span>
                </p>
              )}
            </div>

            <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-5">
                Findings
              </h3>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                    Safe
                  </p>
                  <ul className="space-y-2">
                    {findings.safe.length > 0 ? (
                      findings.safe.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-emerald-600 dark:text-emerald-400 font-medium"
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-slate-500">No safe signals detected</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                    Risks
                  </p>
                  <ul className="space-y-2">
                    {findings.risk.length > 0 ? (
                      findings.risk.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-amber-500 dark:text-amber-400 font-medium"
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-slate-500">No risks detected</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI explanation — full width */}
        <div className="mt-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              AI Security Assessment
            </h3>
            <span className="inline-flex items-center rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-3 py-1 text-xs font-semibold">
              AI Powered
            </span>
          </div>
          <p className="text-base text-gray-600 dark:text-slate-300 leading-relaxed">
            {scanResult.aiExplanation}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ScanResults
