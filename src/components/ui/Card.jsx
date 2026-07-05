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
          'border-white/[0.12] cursor-pointer transition-all duration-250 ease-luna',
          // pop on hover / touch-active — clear pink wash + pink border + glow.
          // Explicit rgba (accent-primary #d97ba8): Tailwind opacity modifiers
          // don't work on hex CSS-var colors, so we set the alpha literally.
          'hover:-translate-y-2 hover:scale-[1.02] hover:border-[rgba(217,123,168,0.7)] hover:bg-[rgba(217,123,168,0.12)] hover:shadow-glow',
          // pressed / tapped: a stronger pink tone
          'active:scale-[1.0] active:-translate-y-1 active:border-[rgba(217,123,168,0.95)] active:bg-[rgba(217,123,168,0.22)]',
        ],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
