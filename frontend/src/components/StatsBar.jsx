import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'

const STATS = [
  {
    label: 'Packages Scanned',
    value: 2400000,
    suffix: '+',
    format: (n) => `${(n / 1000000).toFixed(1)}M`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    color: 'from-teal-500 to-cyan-500',
  },
  {
    label: 'Threats Blocked',
    value: 18400,
    suffix: '+',
    format: (n) => `${(n / 1000).toFixed(1)}K`,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    color: 'from-rose-500 to-orange-500',
  },
  {
    label: 'Avg Scan Time',
    value: 1.2,
    suffix: 's',
    format: (n) => n.toFixed(1),
    isDecimal: true,
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-violet-500 to-fuchsia-500',
  },
  {
    label: 'Accuracy Rate',
    value: 99,
    suffix: '%',
    format: (n) => n.toString(),
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'from-cyan-500 to-teal-500',
  },
]

function StatItem({ stat, isInView, index }) {
  const count = useCountUp(
    stat.isDecimal ? stat.value * 10 : stat.value,
    isInView,
    stat.isDecimal ? 1200 : 1800,
  )

  const display = stat.isDecimal ? (count / 10).toFixed(1) : stat.format(count)

  return (
    <div
      className={`group relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
        {stat.icon}
      </div>
      <p className="font-extrabold text-3xl md:text-4xl mb-2 tracking-tight text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300">
        {display}
        <span className="text-rose-500">{stat.suffix}</span>
      </p>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
    </div>
  )
}

function StatsBar() {
  const [ref, isInView] = useInView(0.2)

  return (
    <section ref={ref} className="relative py-20 md:py-24 bg-slate-50 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-200/40 dark:from-teal-900/20 via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wider mb-10 text-teal-700 dark:text-teal-400">
          Trusted by developers worldwide
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {STATS.map((stat, index) => (
            <StatItem key={stat.label} stat={stat} isInView={isInView} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsBar
