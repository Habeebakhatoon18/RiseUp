import { useCallback, useEffect, useRef, useState } from 'react'
import { theme } from '../theme/colors'

const DEMOS = [
  {
    package: 'axios',
    version: '1.7.9',
    score: 96,
    status: 'safe',
    lines: [
      { text: 'Scanning axios@1.7.9...', color: 'text-slate-400', delay: 400 },
      { text: '✓ No known CVEs detected', color: theme.safe.text, delay: 900 },
      { text: '✓ No suspicious scripts', color: theme.safe.text, delay: 1300 },
      { text: '✓ Safe to install', color: theme.safe.text, delay: 1700 },
    ],
  },
  {
    package: 'lodash',
    version: '4.17.21',
    score: 72,
    status: 'warning',
    lines: [
      { text: 'Scanning lodash@4.17.21...', color: 'text-slate-400', delay: 400 },
      { text: '⚠ Vulnerable dependency found', color: theme.warning.text, delay: 900 },
      { text: '⚠ Post-install script detected', color: theme.warning.text, delay: 1300 },
      { text: '⚠ Review before installing', color: theme.warning.text, delay: 1700 },
    ],
  },
  {
    package: 'minimist',
    version: '1.2.5',
    score: 34,
    status: 'critical',
    lines: [
      { text: 'Scanning minimist@1.2.5...', color: 'text-slate-400', delay: 400 },
      { text: '✗ Known compromised version', color: theme.critical.text, delay: 900 },
      { text: '✗ Supply chain risk detected', color: theme.critical.text, delay: 1300 },
      { text: '✗ Install blocked', color: theme.critical.text, delay: 1700 },
    ],
  },
]

const STATUS_COLORS = {
  safe: theme.safe.bg,
  warning: theme.warning.bg,
  critical: theme.critical.bg,
}

function InteractiveTerminal({ activeDemo = 0, tiltStyle = {}, onMouseEnter, onMouseMove, onMouseLeave }) {
  const [typedCommand, setTypedCommand] = useState('')
  const [visibleLines, setVisibleLines] = useState([])
  const [isTyping, setIsTyping] = useState(true)
  const [progress, setProgress] = useState(0)
  const demo = DEMOS[activeDemo]
  const timersRef = useRef([])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  useEffect(() => {
    clearTimers()
    setTypedCommand('')
    setVisibleLines([])
    setIsTyping(true)
    setProgress(0)

    const command = `sentrix scan ${demo.package}`
    let charIndex = 0

    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100))
    }, 40)

    const typeChar = () => {
      if (charIndex <= command.length) {
        setTypedCommand(command.slice(0, charIndex))
        charIndex += 1
        timersRef.current.push(setTimeout(typeChar, 50))
      } else {
        setIsTyping(false)
        demo.lines.forEach((line) => {
          timersRef.current.push(
            setTimeout(() => {
              setVisibleLines((prev) => [...prev, line])
            }, line.delay),
          )
        })
      }
    }

    timersRef.current.push(setTimeout(typeChar, 300))

    return () => {
      clearTimers()
      clearInterval(progressInterval)
    }
  }, [activeDemo, demo, clearTimers])

  return (
    <div
      className="gradient-border terminal-glow relative z-10"
      style={tiltStyle}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className={`gradient-border-inner overflow-hidden shadow-2xl shadow-black/40 ${theme.terminal.shell}`}>
        <div className={`relative flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b ${theme.terminal.header}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`flex-shrink-0 h-3 w-3 rounded-full ${theme.terminal.trafficClose}`} />
            <span className={`flex-shrink-0 h-3 w-3 rounded-full ${theme.terminal.trafficMin}`} />
            <span className={`flex-shrink-0 h-3 w-3 rounded-full ${theme.terminal.trafficMax}`} />
            <span className="ml-2 text-xs font-medium text-slate-500 tracking-wide truncate">
              sentrix — zsh
            </span>
          </div>
          <span
            className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white ${STATUS_COLORS[demo.status]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            {demo.status}
          </span>
        </div>

        <div className="px-4 sm:px-5 py-2 border-b border-slate-800/80">
          <div className="h-1 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="p-5 sm:p-6 font-mono text-left min-h-[180px] relative z-10 bg-slate-950">
          <p className="text-sm mb-4 break-all">
            <span className={`${theme.terminal.prompt} font-medium`}>❯</span>{' '}
            <span className="text-slate-100">{typedCommand}</span>
            {isTyping && <span className={`${theme.terminal.cursor} animate-blink ml-0.5`}>▋</span>}
          </p>

          <div className="space-y-2">
            {visibleLines.map((line, index) => (
              <p
                key={`${activeDemo}-${index}`}
                className={`text-sm leading-relaxed animate-fade-up ${line.color}`}
                style={{ animationDuration: '0.4s' }}
              >
                {line.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export { DEMOS }
export default InteractiveTerminal
