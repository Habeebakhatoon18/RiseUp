import { useEffect, useState } from 'react'
import ThemeToggle from './ThemeToggle'

function Layout({ children }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Scanner', href: '#scanner' },
    { label: 'Analytics', href: '#analytics' },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navText = scrolled
    ? 'text-slate-700 hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400'
    : 'text-slate-700 hover:text-teal-600 dark:text-white/90 dark:hover:text-cyan-300'

  const logoText = scrolled
    ? 'text-slate-900 dark:text-white'
    : 'text-slate-900 dark:text-white'

  const logoIcon = scrolled
    ? 'bg-teal-600 text-white group-hover:bg-teal-700'
    : 'bg-teal-600 text-white group-hover:bg-teal-700 dark:bg-white dark:text-teal-950 dark:group-hover:bg-cyan-50'

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col transition-colors duration-300">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'py-2' : 'py-0'
        }`}
      >
        <div
          className={`transition-all duration-500 ${
            scrolled
              ? 'mx-4 md:mx-8 mt-3 rounded-2xl glass-card-light shadow-lg shadow-slate-200/50 dark:shadow-black/30 border border-slate-200/80 dark:border-slate-700/60'
              : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a
                href="#"
                className="flex items-center gap-2.5 group"
                onClick={() => setMobileOpen(false)}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg ${logoIcon}`}
                >
                  SI
                </span>
                <span className={`font-bold text-lg tracking-tight transition-colors ${logoText}`}>
                  Safe Install
                </span>
              </a>

              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`nav-link-underline rounded-lg px-4 py-2 text-sm font-medium transition-colors ${navText}`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="flex items-center gap-2">
                <ThemeToggle scrolled={scrolled} />

                <a
                  href="#scanner"
                  className={`btn-glow hidden sm:inline-flex items-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-500/20 hover:shadow-rose-500/35 transition-all duration-300 hover:-translate-y-0.5 bg-rose-500 hover:bg-rose-600 ${
                    scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
                  }`}
                >
                  <span className="relative z-10">Start Scanning</span>
                </a>

                <button
                  type="button"
                  className={`md:hidden p-2 rounded-xl transition-colors cursor-pointer ${
                    scrolled
                      ? 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-900/5 dark:text-white dark:hover:bg-white/10'
                  }`}
                  onClick={() => setMobileOpen((prev) => !prev)}
                  aria-label="Toggle menu"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {mobileOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
          } ${
            scrolled
              ? 'mx-4 rounded-2xl bg-white dark:bg-slate-900 shadow-lg mt-2 border border-slate-200 dark:border-slate-700'
              : 'bg-white/95 dark:bg-teal-950/95 backdrop-blur-md border-t border-slate-200/50 dark:border-white/10'
          }`}
        >
          <nav className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-600 dark:text-white dark:hover:bg-white/10 dark:hover:text-cyan-300 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#scanner"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-xl px-4 py-3 text-sm font-semibold text-white text-center bg-rose-500 hover:bg-rose-600 transition-colors"
            >
              Start Scanning
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="relative bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 noise-overlay pointer-events-none" />
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold text-xs shadow-lg">
                  SI
                </span>
                <span className="text-base font-bold">Safe Install</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
                Protect your supply chain with AI-powered npm package analysis.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">Product</p>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-4">Built for developers</p>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Scan before you install. Block threats before they reach production.
              </p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-500">
              &copy; {new Date().getFullYear()} Safe Install. All rights reserved.
            </p>
            <div className="flex items-center gap-2 rounded-full bg-slate-200/80 dark:bg-slate-800/80 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
