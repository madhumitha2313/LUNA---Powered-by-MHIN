import { cn } from '../../lib/cn'

/**
 * Animated tag that pops in as a structured field resolves during voice
 * extraction (flow, pain, mood, fatigue, stress, sleep). Phase 2 renders one
 * of these per detected field straight from the model's JSON output — this is
 * the "wow" moment, so the entrance is deliberately springy but brief.
 */
const TONES = {
  flow: 'border-accent-primary/30 text-accent-secondary bg-accent-primary/10',
  pain: 'border-danger/30 text-danger bg-danger/10',
  mood: 'border-accent-ai/30 text-accent-ai bg-accent-ai/10',
  fatigue: 'border-warning/30 text-warning bg-warning/10',
  stress: 'border-warning/30 text-warning bg-warning/10',
  sleep: 'border-success/30 text-success bg-success/10',
  default: 'border-white/10 text-text-secondary bg-white/5',
}

export default function ExtractionChip({ field, value, tone, style }) {
  return (
    <span
      style={style}
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5',
        'text-caption font-medium animate-chip-in',
        TONES[tone] || TONES.default
      )}
    >
      <span className="uppercase tracking-wide opacity-70">{field}</span>
      <span className="font-stat text-text-primary">{value}</span>
    </span>
  )
}
