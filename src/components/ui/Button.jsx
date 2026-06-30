import { cn } from '../../lib/cn'

/**
 * House button. Variants map to design tokens only — no ad-hoc colors.
 * Gentle scale-down on press, soft lift on hover, 250ms house easing.
 */
const VARIANTS = {
  primary:
    'bg-accent-primary text-bg-primary hover:shadow-glow hover:-translate-y-0.5 font-semibold',
  secondary:
    'bg-white/5 text-text-primary border border-white/10 hover:bg-white/10 hover:-translate-y-0.5',
  ai: 'bg-accent-ai text-bg-primary hover:shadow-glow-ai hover:-translate-y-0.5 font-semibold',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
}

const SIZES = {
  sm: 'px-4 py-2 text-caption',
  md: 'px-5 py-2.5 text-[0.95rem]',
  lg: 'px-7 py-3.5 text-[1.02rem]',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-pill',
        'transition-all duration-250 ease-luna',
        'active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-accent-secondary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
