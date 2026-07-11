import { useEffect, useRef, useState } from 'react'
import { useT } from '../lib/i18n.jsx'
import { affirmationOfDay } from '../lib/moodIntel'

/**
 * Mood Room — a calming, full-screen space whose atmosphere adapts to the
 * user's mood. A guided breathing pacer, drifting ambient particles, a warm
 * affirmation, and an optional soft ambient tone synthesised on-device (Web
 * Audio) so it works fully offline.
 */
const THEMES = {
  anxious: { grad: 'from-[#16223f] via-[#241f3a] to-[#33223a]', particle: '💧', nameKey: 'roomRain' },
  low: { grad: 'from-[#33223a] via-[#472a37] to-[#5a3a2b]', particle: '🦋', nameKey: 'roomSunset' },
  uplifted: { grad: 'from-[#4a2b4a] via-[#8a4f86] to-[#d97ba8]', particle: '🌸', nameKey: 'roomSunrise' },
  calm: { grad: 'from-[#241f3a] via-[#342a48] to-[#4a2b4a]', particle: '✨', nameKey: 'roomGlow' },
  tired: { grad: 'from-[#161b28] via-[#241f3a] to-[#342a48]', particle: '🌙', nameKey: 'roomNight' },
  irritated: { grad: 'from-[#241f3a] via-[#33223a] to-[#3f3a24]', particle: '🍃', nameKey: 'roomCool' },
}
const PHASES = [
  { key: 'breatheIn', ms: 4000, scale: 1.35 },
  { key: 'breatheHold', ms: 4000, scale: 1.35 },
  { key: 'breatheOut', ms: 6000, scale: 0.8 },
]

export default function MoodRoom({ bucket = 'calm', onClose }) {
  const { t } = useT()
  const theme = THEMES[bucket] || THEMES.calm
  const [pi, setPi] = useState(0)
  const [sound, setSound] = useState(false)
  const audioRef = useRef(null)

  // Breathing cycle
  useEffect(() => {
    const cur = PHASES[pi]
    const to = setTimeout(() => setPi((n) => (n + 1) % PHASES.length), cur.ms)
    return () => clearTimeout(to)
  }, [pi])

  // Optional ambient tone (soft synth pad)
  useEffect(() => {
    if (!sound) return
    let ctx, gain, oscs = []
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
      gain = ctx.createGain()
      gain.gain.value = 0
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 2)
      gain.connect(ctx.destination)
      ;[196, 261.6, 329.6].forEach((f, i) => {
        const o = ctx.createOscillator()
        o.type = 'sine'
        o.frequency.value = f
        const g = ctx.createGain()
        g.gain.value = i === 0 ? 1 : 0.5
        o.connect(g); g.connect(gain); o.start()
        oscs.push(o)
      })
      audioRef.current = { ctx, gain }
    } catch { /* audio unavailable */ }
    return () => {
      try {
        if (gain && ctx) { gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4) }
        setTimeout(() => { oscs.forEach((o) => { try { o.stop() } catch { /* */ } }); try { ctx.close() } catch { /* */ } }, 500)
      } catch { /* */ }
    }
  }, [sound])

  const cur = PHASES[pi]

  return (
    <div className={`fixed inset-0 z-[80] overflow-hidden bg-gradient-to-br ${theme.grad}`}>
      {/* drifting particles */}
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="pointer-events-none absolute animate-float-up select-none"
          style={{ left: `${(i * 7 + 5) % 96}%`, bottom: '-8%', fontSize: `${14 + (i % 4) * 8}px`, opacity: 0.5, animationDelay: `${(i % 7) * 0.9}s`, animationDuration: `${9 + (i % 5) * 2}s` }}>
          {theme.particle}
        </span>
      ))}

      {/* top bar */}
      <div className="relative z-10 flex items-center justify-between p-5">
        <p className="text-sm font-medium text-white/80">🕊️ {t('roomTitle')} · {t(theme.nameKey)}</p>
        <div className="flex items-center gap-3">
          <button onClick={() => setSound((s) => !s)} className="rounded-full border border-white/20 px-3 py-1.5 text-caption text-white/80 backdrop-blur-sm transition hover:bg-white/10">
            {sound ? `🔊 ${t('roomSoundOn')}` : `🔈 ${t('roomSoundOff')}`}
          </button>
          <button onClick={onClose} className="rounded-full border border-white/20 px-3 py-1.5 text-caption text-white/80 backdrop-blur-sm transition hover:bg-white/10">
            ✕ {t('roomExit')}
          </button>
        </div>
      </div>

      {/* breathing pacer */}
      <div className="relative z-10 flex h-[70vh] flex-col items-center justify-center">
        <div
          className="grid place-items-center rounded-full bg-white/10 backdrop-blur-md"
          style={{ width: 220, height: 220, transform: `scale(${cur.scale})`, transition: `transform ${cur.ms}ms cubic-bezier(0.4,0,0.2,1)`, boxShadow: '0 0 80px rgba(217,123,168,0.4)' }}
        >
          <div className="grid h-40 w-40 place-items-center rounded-full bg-white/10">
            <span className="text-center text-lg font-medium text-white">{t(cur.key)}</span>
          </div>
        </div>
        <p className="mt-14 max-w-md px-6 text-center text-xl font-heading font-medium text-white/90">“{t(affirmationOfDay())}”</p>
        <p className="mt-3 text-caption text-white/60">{t('roomStay')}</p>
      </div>
    </div>
  )
}
