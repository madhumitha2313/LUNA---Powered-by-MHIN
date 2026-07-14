import { useEffect, useState } from 'react'

/**
 * A lightweight confetti + flowers burst for streak celebrations. Renders a
 * fixed overlay of falling pieces for a couple of seconds, then removes itself.
 */
const PIECES = ['🌸', '🌷', '✨', '🎉', '💗', '⭐']
const COLORS = ['#d97ba8', '#a78bfa', '#f5c6d6', '#6ee7b7', '#fbbf24']

export default function Confetti({ onDone }) {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const to = setTimeout(() => { setGone(true); onDone?.() }, 2600)
    return () => clearTimeout(to)
  }, [onDone])
  if (gone) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      {Array.from({ length: 40 }).map((_, i) => {
        const useEmoji = i % 3 === 0
        return (
          <span
            key={i}
            className="animate-confetti absolute top-0 select-none"
            style={{
              left: `${(i * 2.5 + 2) % 98}%`,
              fontSize: useEmoji ? `${16 + (i % 4) * 6}px` : undefined,
              width: useEmoji ? undefined : '9px',
              height: useEmoji ? undefined : '14px',
              background: useEmoji ? undefined : COLORS[i % COLORS.length],
              borderRadius: '2px',
              animationDuration: `${1.6 + (i % 5) * 0.35}s`,
              animationDelay: `${(i % 8) * 0.12}s`,
            }}
          >
            {useEmoji ? PIECES[i % PIECES.length] : ''}
          </span>
        )
      })}
    </div>
  )
}
