import { cn } from '../../lib/cn'

/**
 * Small pill badge for feature tags and status indicators.
 * `tone` selects a token-driven color treatment.
 */
const TONES = {
  neutral: 'bg-white/5 text-text-secondary border-white/10',
  accent: 'bg-accent-primary/12 text-accent-secondary border-accent-primary/25',
  ai: 'bg-accent-ai/12 text-accent-ai border-accent-ai/25',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  danger: 'bg-danger/10 text-danger border-danger/25',
}

export default function Badge({ tone = 'neutral', icon, className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-3 py-1',
        'text-caption font-medium tracking-wide',
        TONES[tone],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
