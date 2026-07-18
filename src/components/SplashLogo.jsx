import MiraMark from './MiraMark'

/**
 * App-open splash scene.
 *
 * The logo is PRESENT from the very first frame — stationary, sharp, fully
 * visible (only a 450ms opacity/scale settle, never a "forms-from-dots" reveal).
 * Around it: minimal, elegant thin wave lines and floating particle dots in a
 * rich darker pink (#D81B60) that complement and surround the logo rather than
 * building it. Background stays black. Motion is slow and premium.
 */
const WAVE = '#D81B60' // richer, darker pink for waves + particles

// Deterministic particle ring around the logo (no reveal — they just drift).
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2 + (i % 2 ? 0.35 : 0)
  const r = 44 + (i % 3) * 7            // % radius from centre (outside the logo)
  const size = i % 4 === 0 ? 4 : i % 3 === 0 ? 3 : 2.5
  const dx = Math.cos(a) * 6 * (i % 2 ? 1 : -1)
  const dy = Math.sin(a) * 6 * (i % 2 ? -1 : 1)
  return {
    left: 50 + Math.cos(a) * r,
    top: 50 + Math.sin(a) * r,
    size,
    dx: `${dx.toFixed(1)}px`,
    dy: `${dy.toFixed(1)}px`,
    dur: `${5.5 + (i % 5) * 0.9}s`,
    delay: `${(i % 7) * 0.4}s`,
    o: 0.4 + (i % 3) * 0.12,
  }
})

export default function SplashLogo({ size = 132 }) {
  const box = size * 2.15 // room for the surrounding waves + particles
  return (
    <div className="relative grid place-items-center" style={{ width: box, height: box }}>
      {/* Minimal, elegant thin wave lines — few smooth curves, low density */}
      <svg viewBox="0 0 200 200" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        <g fill="none" stroke={WAVE} strokeLinecap="round">
          <path className="animate-wave-flow" style={{ '--dur': '7s' }}
            d="M18 118 C 55 96, 78 150, 100 128 C 122 106, 150 150, 184 120"
            strokeWidth="1.4" opacity="0.7" />
          <path className="animate-wave-flow" style={{ '--dur': '8.5s', '--delay': '0.8s' }}
            d="M22 78 C 58 100, 82 58, 100 78 C 120 100, 148 60, 180 84"
            strokeWidth="1.1" opacity="0.5" />
        </g>
      </svg>

      {/* Floating particle dots — surround the logo, gentle drift */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="animate-splash-drift pointer-events-none absolute rounded-full"
          style={{
            left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size,
            marginLeft: -p.size / 2, marginTop: -p.size / 2,
            background: WAVE, boxShadow: `0 0 ${p.size * 2}px ${WAVE}`,
            '--dx': p.dx, '--dy': p.dy, '--dur': p.dur, '--delay': p.delay, '--o': p.o,
          }}
        />
      ))}

      {/* Soft ambient glow directly behind the logo */}
      <span className="pointer-events-none absolute animate-glow-pulse rounded-full bg-[#D81B60]/25 blur-2xl" style={{ width: size * 0.9, height: size * 0.9 }} />

      {/* The logo — present, stationary, sharp */}
      <div className="animate-logo-settle relative z-10">
        <MiraMark size={size} glow />
      </div>
    </div>
  )
}
