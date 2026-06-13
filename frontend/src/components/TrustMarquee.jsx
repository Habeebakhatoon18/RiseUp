const PACKAGES = [
  'axios', 'react', 'express', 'lodash', 'next', 'vite', 'typescript',
  'tailwindcss', 'zustand', 'prisma', 'eslint', 'prettier',
]

function TrustMarquee() {
  const items = [...PACKAGES, ...PACKAGES]

  return (
    <div className="relative border-t border-slate-200 dark:border-white/10 overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white dark:from-teal-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-violet-100 dark:from-violet-950 to-transparent z-10 pointer-events-none" />

      <div className="py-5 flex">
        <div className="flex animate-marquee whitespace-nowrap">
          {items.map((pkg, i) => (
            <span
              key={`${pkg}-${i}`}
              className="inline-flex items-center gap-2 mx-6 text-sm font-medium text-slate-500 hover:text-teal-600 dark:text-slate-400 dark:hover:text-cyan-300 transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500/60" />
              {pkg}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TrustMarquee
