function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-100 via-slate-50 to-violet-100 dark:from-teal-950 dark:via-slate-900 dark:to-violet-950" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      <div className="pointer-events-none absolute w-96 h-96 rounded-full bg-teal-400/20 dark:bg-cyan-500/20 blur-3xl -top-20 -left-20 animate-aurora" />
      <div className="pointer-events-none absolute w-80 h-80 rounded-full bg-violet-400/20 dark:bg-fuchsia-600/20 blur-3xl -bottom-20 -right-20 animate-float-delayed" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-bold text-2xl md:text-4xl text-slate-900 dark:text-white mb-4 leading-tight">
          Ready to secure your{' '}
          <span className="text-gradient-hero">npm workflow</span>?
        </h2>
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-xl mx-auto">
          Scan any package in seconds. No signup required to try the demo.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#scanner"
            className="btn-glow inline-flex items-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Scanning Free
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </a>
          <a
            href="#features"
            className="inline-flex items-center rounded-xl border border-slate-300 dark:border-white/20 bg-white/60 dark:bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-semibold text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
          >
            Explore Features
          </a>
        </div>
      </div>
    </section>
  )
}

export default CtaBanner
