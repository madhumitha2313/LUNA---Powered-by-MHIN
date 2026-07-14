import { useEffect, useState } from 'react'

/**
 * MIRA Avatar — the emotional face of the app. A soft, glowing, minimal
 * character (not cartoon, not realistic) rendered as animated SVG so it's
 * fast and works offline. She blinks and breathes when idle, shows a listening
 * waveform, floating particles while thinking, an animated mouth while
 * speaking, and warm/soft expressions by emotion.
 *
 * Props: state = idle | listening | thinking | speaking; emotion = neutral |
 * happy | concerned; size (px).
 */
export default function MiraAvatar({ state = 'idle', emotion = 'neutral', size = 120 }) {
  const [blink, setBlink] = useState(false)

  // Natural, occasional blinking.
  useEffect(() => {
    let t
    const loop = () => {
      const next = 2200 + Math.random() * 3200
      t = setTimeout(() => {
        setBlink(true)
        setTimeout(() => setBlink(false), 140)
        loop()
      }, next)
    }
    loop()
    return () => clearTimeout(t)
  }, [])

  const speaking = state === 'speaking'
  const listening = state === 'listening'
  const thinking = state === 'thinking'
  const happy = emotion === 'happy'
  const concerned = emotion === 'concerned'

  // Mouth path by expression.
  const smile = happy
    ? 'M39 60 Q50 72 61 60'
    : concerned
      ? 'M42 63 Q50 60 58 63'
      : 'M41 61 Q50 68 59 61'

  const glow = listening ? '#FF4F9D' : happy ? '#f5c6d6' : concerned ? '#a78bfa' : '#d97ba8'

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      {/* soft aura */}
      <span
        className={`absolute rounded-full blur-xl ${listening ? 'animate-glow-pulse' : 'animate-breathe'}`}
        style={{ width: size * 0.9, height: size * 0.9, background: glow, opacity: listening ? 0.5 : 0.32 }}
      />
      {/* listening ping */}
      {listening && <span className="absolute rounded-full border-2 border-accent-primary/40 animate-ping" style={{ width: size * 0.86, height: size * 0.86 }} />}

      <svg viewBox="0 0 100 100" width={size} height={size} className={`relative ${state === 'idle' ? 'animate-float' : ''}`}>
        <defs>
          <radialGradient id="mafaceG" cx="0.42" cy="0.36" r="0.75">
            <stop offset="0%" stopColor="#ffeaf3" />
            <stop offset="55%" stopColor="#f7c9dd" />
            <stop offset="100%" stopColor="#d97ba8" />
          </radialGradient>
          <linearGradient id="mahairG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#c9a7e8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>

        {/* flowing hair behind */}
        <path d="M20 52 C14 26 34 10 50 10 C66 10 86 26 80 52 C86 60 84 76 76 82 C80 60 70 44 70 44 L30 44 C30 44 20 60 24 82 C16 76 14 60 20 52 Z" fill="url(#mahairG)" opacity="0.9" />

        {/* face */}
        <circle cx="50" cy="50" r="30" fill="url(#mafaceG)" />
        {/* rose-gold highlight */}
        <ellipse cx="40" cy="40" rx="10" ry="7" fill="#fff" opacity="0.22" />

        {/* cheeks */}
        <ellipse cx="36" cy="55" rx="4.5" ry="3" fill="#ff9ec4" opacity="0.55" />
        <ellipse cx="64" cy="55" rx="4.5" ry="3" fill="#ff9ec4" opacity="0.55" />

        {/* eyes (blink by scaling group) */}
        <g style={{ transform: blink ? 'scaleY(0.08)' : 'scaleY(1)', transformOrigin: '50px 45px', transition: 'transform .09s' }}>
          <g style={{ transform: thinking ? 'translateY(-1.5px)' : 'none', transition: 'transform .3s' }}>
            <ellipse cx="40" cy="45" rx="3.2" ry={listening ? 4.4 : 4} fill="#3b2a3a" />
            <ellipse cx="60" cy="45" rx="3.2" ry={listening ? 4.4 : 4} fill="#3b2a3a" />
            <circle cx="41.1" cy="43.6" r="1" fill="#fff" />
            <circle cx="61.1" cy="43.6" r="1" fill="#fff" />
          </g>
        </g>

        {/* mouth */}
        {speaking ? (
          <ellipse className="mira-talk" cx="50" cy="62" rx="6" ry="4" fill="#7a3350" />
        ) : (
          <path d={smile} stroke="#7a3350" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        )}
      </svg>

      {/* thinking particles */}
      {thinking && (
        <>
          {[0, 1, 2].map((i) => (
            <span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-accent-secondary animate-bounce"
              style={{ top: size * 0.12, left: size * (0.4 + i * 0.08), animationDelay: `${i * 150}ms` }} />
          ))}
        </>
      )}

      {/* happy sparkles */}
      {happy && [0, 1, 2].map((i) => (
        <span key={i} className="mira-sparkle absolute select-none" style={{ fontSize: 14, top: size * (0.06 + i * 0.28), left: size * (i % 2 ? 0.82 : 0.08), animationDelay: `${i * 0.4}s` }}>✨</span>
      ))}

      {/* listening / speaking waveform */}
      {(listening || speaking) && (
        <div className="absolute -bottom-1 flex items-end gap-[3px]" style={{ height: size * 0.16 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <span key={i} className="mira-wave-bar w-[3px] rounded-full bg-accent-primary"
              style={{ height: '100%', animationDelay: `${i * 90}ms`, animationDuration: `${0.6 + (i % 3) * 0.12}s` }} />
          ))}
        </div>
      )}
    </div>
  )
}
