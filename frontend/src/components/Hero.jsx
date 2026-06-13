import { useCallback, useEffect, useRef, useState } from 'react'
import { DEMOS } from './InteractiveTerminal'
import InteractiveTerminal from './InteractiveTerminal'
import FeatureShowcase from './FeatureShowcase'
import StatsBar from './StatsBar'
import TrustMarquee from './TrustMarquee'
import CtaBanner from './CtaBanner'

function Hero() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const heroRef = useRef(null)
  const terminalRef = useRef(null)
  const demo = DEMOS[activeDemo]

  const handleHeroMouseMove = useCallback((e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMousePos({ x, y })
  }, [])

  const handleTerminalMouseMove = useCallback((e) => {
    if (!terminalRef.current) return
    const rect = terminalRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ rotateX: -y * 4, rotateY: x * 4 })
  }, [])

  const handleTerminalMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0 })
    setIsPaused(false)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % 3)
    }, 6000)
    return () => clearInterval(interval)
  }, [isPaused])

  const selectDemo = useCallback((index) => {
    setActiveDemo(index)
    setIsPaused(true)
  }, [])

  const tiltStyle = {
    transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
  }

  const glowStyle = {
    transform: `translate(${mousePos.x * 40}px, ${mousePos.y * 40}px)`,
  }

  const scoreColor =
    demo.status === 'safe'
      ? 'text-teal-600 dark:text-teal-300'
      : demo.status === 'warning'
        ? 'text-orange-600 dark:text-orange-300'
        : 'text-rose-600 dark:text-rose-300'

  return (
    <>
      <section
        ref={heroRef}
        className="relative overflow-hidden transition-colors duration-300"
        onMouseMove={handleHeroMouseMove}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-white to-violet-100 dark:from-teal-950 dark:via-slate-900 dark:to-violet-950 transition-colors duration-300" />
          <div className="absolute inset-0 bg-slate-900/0 dark:bg-black/25" />
          <div className="absolute inset-0 noise-overlay pointer-events-none" />
          <div
            className="pointer-events-none absolute w-[600px] h-[600px] rounded-full blur-3xl animate-gradient-shift top-[-15%] right-[-10%] bg-teal-400/20 dark:bg-fuchsia-600/25"
            style={glowStyle}
          />
          <div className="pointer-events-none absolute w-[450px] h-[450px] rounded-full blur-3xl animate-float bottom-[5%] left-[-10%] bg-cyan-400/15 dark:bg-cyan-500/20" />
          <div className="pointer-events-none absolute w-[350px] h-[350px] rounded-full blur-3xl animate-float-delayed top-[35%] left-[25%] bg-violet-400/10 dark:bg-rose-500/15" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.04]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.5) 1px, transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 lg:pt-32 pb-20 md:pb-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="animate-fade-up stagger-1 inline-flex items-center gap-2.5 rounded-full glass-card px-5 py-2 text-sm font-medium text-slate-700 dark:text-white mb-8 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 cursor-default">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                </span>
                AI-Powered Supply Chain Security
              </div>

              <h1 className="animate-fade-up stagger-2 font-extrabold text-3xl md:text-5xl lg:text-[3.25rem] text-slate-900 dark:text-white leading-[1.15] tracking-tight mb-6">
                Install npm Packages{' '}
                <span className="text-gradient-hero">Safely</span>
                <br className="hidden sm:block" />
                <span className="text-slate-600 dark:text-slate-300 font-bold"> with AI Security</span>
              </h1>

              <p className="animate-fade-up stagger-3 text-lg md:text-xl text-slate-600 dark:text-slate-300/90 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Scan packages before installation. Detect vulnerabilities,
                malicious scripts, and supply chain risks in seconds.
              </p>

              <div className="animate-fade-up stagger-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <a
                  href="#scanner"
                  className="btn-glow group relative inline-flex items-center justify-center gap-2.5 w-full sm:w-auto rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 hover:-translate-y-1 bg-rose-500 hover:bg-rose-600"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start Scanning
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </a>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl glass-card px-8 py-4 text-sm font-semibold text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
                >
                  View Demo
                </a>
              </div>

              <div className="animate-fade-up stagger-5 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">Try:</span>
                {['axios', 'lodash', 'react'].map((pkg, i) => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => selectDemo(i)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-300 cursor-pointer ${
                      activeDemo === i
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25'
                        : 'glass-card text-slate-700 dark:text-white hover:bg-white dark:hover:bg-white/15'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            <div className="animate-fade-up stagger-4 w-full max-w-lg mx-auto lg:max-w-none lg:pl-4">
              <div ref={terminalRef} className="relative" style={{ perspective: '1200px' }}>
                <div className="absolute -inset-3 rounded-2xl bg-gradient-to-br from-teal-400/20 via-transparent to-violet-400/20 dark:from-cyan-500/20 dark:to-fuchsia-500/20 blur-2xl animate-glow-pulse pointer-events-none -z-10" />

                <InteractiveTerminal
                  activeDemo={activeDemo}
                  tiltStyle={tiltStyle}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseMove={handleTerminalMouseMove}
                  onMouseLeave={handleTerminalMouseLeave}
                />

                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                      <span className={`text-sm font-bold ${scoreColor}`}>{demo.score}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Security score</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white truncate capitalize">{demo.status}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between glass-card rounded-xl px-4 py-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-500 opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium truncate">Live preview</span>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 ml-3">
                      {[0, 1, 2].map((i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectDemo(i)}
                          className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                            activeDemo === i
                              ? 'w-7 bg-gradient-to-r from-teal-500 to-cyan-500'
                              : 'w-2 bg-slate-300 dark:bg-white/30 hover:bg-slate-400 dark:hover:bg-white/50'
                          }`}
                          aria-label={`Demo ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-xl px-4 py-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Protected</p>
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-300">2.4M+ scans</p>
                  </div>
                  <div className="glass-card rounded-xl px-4 py-3 text-center">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Engine</p>
                    <p className="text-sm font-bold text-violet-600 dark:text-fuchsia-300">99% accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <TrustMarquee />
        </div>
      </section>

      <StatsBar />

      <div id="features">
        <FeatureShowcase onSelectDemo={selectDemo} />
      </div>

      <CtaBanner />
    </>
  )
}

export default Hero
