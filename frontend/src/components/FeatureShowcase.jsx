import { useState } from 'react'
import { useInView } from '../hooks/useInView'
import { DEMOS } from './InteractiveTerminal'

const FEATURES = [
  {
    id: 'cve',
    gradient: 'from-teal-500 to-cyan-500',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'CVE Detection',
    description:
      'Cross-reference packages against known vulnerability databases in real time.',
    demoIndex: 0,
  },
  {
    id: 'scripts',
    gradient: 'from-orange-500 to-amber-500',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Script Analysis',
    description:
      'Flag post-install and pre-install scripts that execute shell commands.',
    demoIndex: 1,
  },
  {
    id: 'supply',
    gradient: 'from-violet-500 to-fuchsia-500',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
      </svg>
    ),
    title: 'Supply Chain',
    description:
      'Detect compromised versions and typosquatting before they reach production.',
    demoIndex: 2,
  },
]

const STATUS_STYLES = {
  safe: { badge: 'bg-teal-500/10 text-teal-700 dark:text-teal-400', dot: 'bg-teal-500' },
  warning: { badge: 'bg-orange-500/10 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  critical: { badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-400', dot: 'bg-rose-500' },
}

function FeatureShowcase({ onSelectDemo }) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [ref, isInView] = useInView(0.15)

  const handleSelect = (index) => {
    setActiveFeature(index)
    onSelectDemo(FEATURES[index].demoIndex)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="relative bg-white dark:bg-slate-950 py-24 md:py-32 overflow-hidden transition-colors duration-300">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-teal-500/10 dark:from-teal-500/5 to-transparent rounded-full blur-3xl" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-800 px-4 py-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-5">
            Platform capabilities
          </span>
          <h2 className="font-bold text-2xl md:text-4xl mb-5 tracking-tight text-slate-900 dark:text-white">
            Security checks that run{' '}
            <span className="text-gradient-brand">before you install</span>
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed text-slate-600 dark:text-slate-400">
            Every scan combines static analysis, dependency graphs, and AI
            reasoning — the same depth you'd expect from enterprise tooling.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const isActive = activeFeature === index
            const demo = DEMOS[feature.demoIndex]
            const statusStyle = STATUS_STYLES[demo.status]

            return (
              <button
                key={feature.id}
                type="button"
                onClick={() => handleSelect(index)}
                className={`group relative text-left rounded-2xl transition-all duration-500 cursor-pointer overflow-hidden ${
                  isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                } ${
                  isActive
                    ? 'shadow-xl feature-tab-active ring-2 ring-teal-500/30'
                    : 'shadow-md hover:shadow-xl hover:-translate-y-1'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {isActive && (
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
                )}

                <div
                  className={`p-8 h-full transition-colors duration-300 ${
                    isActive
                      ? 'bg-gradient-to-br from-teal-50/90 to-white dark:from-teal-950/40 dark:to-slate-900'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm mb-6 leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>

                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ${statusStyle.badge}`}>
                    <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
                    {demo.package} — {demo.score}/100
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FeatureShowcase
