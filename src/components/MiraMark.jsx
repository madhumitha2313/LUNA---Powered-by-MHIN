/**
 * MIRA emblem — a pink circular badge holding a woman's side-profile with
 * flowing hair and a crescent moon. Vector, transparent background, scales from
 * favicon to hero. `size` is px; `glow` toggles the soft ambient ring.
 */
export default function MiraMark({ size = 36, glow = true, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="miraPink" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF8FC0" />
          <stop offset="45%" stopColor="#FF4F9D" />
          <stop offset="100%" stopColor="#FF2E8A" />
        </linearGradient>
        <radialGradient id="miraGlow" cx="50%" cy="50%" r="50%">
          <stop offset="58%" stopColor="#FF4F9D" stopOpacity="0" />
          <stop offset="100%" stopColor="#FF4F9D" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {glow && <circle cx="50" cy="50" r="49" fill="url(#miraGlow)" />}
      <circle cx="50" cy="50" r="45" fill="#08080a" stroke="url(#miraPink)" strokeWidth="3.5" />

      {/* Woman's side profile + flowing hair, as one silhouette */}
      <path
        fill="url(#miraPink)"
        d="M 43 70 C 41.5 66 40.5 64 40 62 C 37.5 61.5 35 60.5 34 58 C 33 57 33.5 55.5 34.5 55
           C 32.8 53.8 32.6 52 33.6 50.8 C 32.4 50 32 48.8 32.8 47.8 C 31.4 47.4 30.6 46.2 31.6 45
           C 29.8 44.6 28.6 43.4 29.8 42 C 31 40.6 32.4 40 33 38 C 34 32 39 27.5 45.5 26.5
           C 52 25.5 58 27.5 62 32 C 66.5 37 68.5 44 67.5 51.5 C 66.3 60 61.5 67 54.5 70.5
           C 58 66 60.5 60 61 54 C 61.5 47 60 40.5 55.5 36 C 52 32.5 47.5 31 43.5 32
           C 47 33 50 35.5 51.5 40 C 53 44.5 53 50 52 56 C 51.2 61 49 66 46.5 70 Z"
      />

      {/* Hair flow highlights */}
      <g fill="none" stroke="#FFB3D4" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path d="M49 31 C 56 34 60 41 59.5 49" />
        <path d="M52 63 C 57 58 59 51 58 45" />
      </g>

      {/* Crescent moon near the crown */}
      <path d="M55 22.5 a5.5 5.5 0 1 0 4.8 8.2 A4.3 4.3 0 0 1 55 22.5 Z" fill="#FFC2DE" />
    </svg>
  )
}

/** The "MiRA" wordmark — only the lowercase "i" is pink. */
export function MiraWordmark({ className }) {
  return (
    <span className={className}>
      M<span className="text-[#FF4F9D]">i</span>RA
    </span>
  )
}
