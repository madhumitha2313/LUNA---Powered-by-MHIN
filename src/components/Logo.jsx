import { cn } from '../lib/cn'
import MiraMark, { MiraWordmark } from './MiraMark'

/**
 * MiRA lockup — the pink profile emblem + the "MiRA" wordmark (only the
 * lowercase "i" is pink). The "powered by MHIN" line is optional and rendered
 * small so the lockup stays clean in tight nav contexts.
 */
export default function Logo({ withTagline = false, className }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <MiraMark size={34} className="shrink-0" />
      <span className="flex flex-col leading-none">
        <MiraWordmark className="font-heading text-lg font-bold tracking-tight text-text-primary" />
        {withTagline && (
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-text-muted">
            powered by MHIN
          </span>
        )}
      </span>
    </div>
  )
}
