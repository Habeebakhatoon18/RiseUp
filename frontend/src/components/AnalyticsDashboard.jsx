import { useEffect } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useSecurityStore } from '../store/useSecurityStore'
import { useThemeStore } from '../store/useThemeStore'

function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toLocaleString()
}

const STAT_CARDS = [
  {
    key: 'totalScans',
    label: 'Total Scans',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    accent: 'from-blue-600 to-blue-800',
    valueColor: 'text-blue-700 dark:text-blue-400',
  },
  {
    key: 'safePackages',
    label: 'Safe Packages',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: 'from-emerald-600 to-emerald-700',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'blockedInstalls',
    label: 'Blocked Installs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    accent: 'from-amber-500 to-amber-600',
    valueColor: 'text-amber-500 dark:text-amber-400',
  },
  {
    key: 'criticalRisks',
    label: 'Critical Risks Found',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    accent: 'from-red-500 to-red-600',
    valueColor: 'text-red-500 dark:text-red-400',
  },
]

function AnalyticsDashboard() {
  const { analytics, analyticsLoading, analyticsError, fetchAnalytics } = useSecurityStore()
  const theme = useThemeStore((s) => s.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const gridColor = isDark ? '#334155' : '#e2e8f0'
  const axisColor = isDark ? '#94a3b8' : '#64748b'
  const tooltipBg = isDark ? '#1e293b' : '#ffffff'
  const tooltipBorder = isDark ? '#334155' : '#e2e8f0'

  return (
    <section
      id="analytics"
      className="bg-white dark:bg-slate-950 py-20 md:py-28 transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-4 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-4">
            Analytics
          </span>
          <h2 className="font-bold text-2xl md:text-3xl text-gray-900 dark:text-white mb-3">
            Security Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Platform-wide scan activity and risk breakdown across all analyzed packages.
          </p>
        </div>

        {analyticsLoading && (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-700" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        )}

        {analyticsError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 px-4 py-3 text-center mb-8">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{analyticsError}</p>
          </div>
        )}

        {analytics && !analyticsLoading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {STAT_CARDS.map((card) => (
                <div
                  key={card.key}
                  className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:-translate-y-0.5"
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${card.accent} text-white mb-4 shadow-md`}>
                    {card.icon}
                  </div>
                  <p className={`font-bold text-2xl md:text-3xl mb-1 ${card.valueColor}`}>
                    {formatNumber(analytics[card.key])}
                  </p>
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Daily scan volume */}
              <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Daily Scan Volume
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                  Scans performed over the last 7 days
                </p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyVolume} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="day"
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        labelStyle={{ color: axisColor }}
                        cursor={{ fill: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)' }}
                      />
                      <Bar dataKey="scans" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Risk distribution */}
              <div className="rounded-lg shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                  Risk Distribution
                </h3>
                <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">
                  Breakdown of scan outcomes by severity
                </p>
                <div className="h-64 flex items-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.riskDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {analytics.riskDistribution.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                        formatter={(value) => [`${value}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-2">
                  {analytics.riskDistribution.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
                        {item.name}{' '}
                        <span className="text-gray-500 dark:text-slate-500">{item.value}%</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default AnalyticsDashboard
