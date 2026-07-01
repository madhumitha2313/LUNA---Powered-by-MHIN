import { cn } from '../lib/cn'

/**
 * MIRA wordmark + crescent moon glyph. The "powered by MHIN" line is optional
 * and rendered small so the lockup stays clean in tight nav contexts.
 */
export default function Logo({ withTagline = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-accent-primary/25 blur-md" />
        <svg viewBox="0 0 24 24" className="relative h-7 w-7">
          <defs>
            <radialGradient id="logoMoon" cx="38%" cy="36%" r="72%">
              <stop offset="0%" stopColor="#F5C6D6" />
              <stop offset="55%" stopColor="#D97BA8" />
              <stop offset="100%" stopColor="#A78BFA" />
            </radialGradient>
          </defs>
          <path
            d="M15 2a10 10 0 1 0 5.5 18.4A12 12 0 0 1 15 2Z"
            fill="url(#logoMoon)"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-semibold tracking-tight text-text-primary">
          MIRA
        </span>
        {withTagline && (
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-text-muted">
            powered by MHIN
          </span>
        )}
      </span>
    </div>
  )
}
