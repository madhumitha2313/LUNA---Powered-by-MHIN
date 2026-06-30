import { cn } from '../../lib/cn'

/**
 * House card — 24px radius, soft shadow, 1px hairline border.
 * Pass `hover` to enable the soft lift-on-hover interaction.
 */
export default function Card({ as: Tag = 'div', hover = false, className, children, ...props }) {
  return (
    <Tag
      className={cn(
        'card-base p-6',
        hover && 'hover:-translate-y-1 hover:shadow-lift hover:border-white/15',
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  )
}
