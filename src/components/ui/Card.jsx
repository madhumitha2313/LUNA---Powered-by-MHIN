import { cn } from '../../lib/cn'

/**
 * House card — 24px radius, soft shadow, hairline border.
 *
 * Pass `hover` for the interactive lift: the border subtly highlights at rest
 * and the card "pops" (lifts + scales + accent glow) on hover/touch. Works with
 * pointer hover and, on touch devices, the active state.
 */
export default function Card({ as: Tag = 'div', hover = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'card-base p-6',
        hover && [
          // subtle highlighted border at rest
          'border-white/[0.12] cursor-pointer',
          // pop on hover / touch-active
          'hover:-translate-y-2 hover:scale-[1.02] hover:border-accent-primary/40 hover:shadow-glow',
          'active:scale-[1.0] active:-translate-y-1',
        ],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
