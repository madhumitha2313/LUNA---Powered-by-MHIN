import { cn } from '../../lib/cn'

/**
 * Confidence meter shown after extraction. Below `lowThreshold` the bar turns
 * to the warning tone and Phase 2 surfaces a styled follow-up question rather
 * than silently guessing.
 */
export default function ConfidenceMeter({ value = 0, lowThreshold = 0.6, className }) {
  const pct = Math.round(value * 100)
  const isLow = value < lowThreshold

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between text-caption">
        <span className="text-text-muted">Extraction confidence</span>
        <span className={cn('font-stat font-semibold', isLow ? 'text-warning' : 'text-success')}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-pill bg-white/5">
        <div
          className={cn(
            'h-full rounded-pill transition-[width] duration-250 ease-luna',
            isLow ? 'bg-warning' : 'bg-success'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
