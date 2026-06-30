/**
 * Tiny classnames joiner — keeps component JSX readable without pulling in a
 * dependency. Falsy values are dropped so conditional classes stay tidy.
 */
export function cn(...parts) {
  return parts.filter(Boolean).join(' ')
}
