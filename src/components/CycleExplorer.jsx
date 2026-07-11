import { useEffect, useMemo, useRef, useState } from 'react'
import Button from './ui/Button'
import { MicIcon } from './ui/icons'
import { useT } from '../lib/i18n.jsx'

/**
 * Interactive, animated 28-day menstrual-cycle explorer.
 * Drag the timeline (or press play) to move through the cycle and watch the
 * hormone curves, the phase marker on the wheel, and a per-day detail panel
 * (mood / energy / food / exercise / symptoms / self-care) update live.
 * Voice narration uses the Web Speech API so it works fully offline.
 */

const C = { primary: '#d97ba8', secondary: '#f5c6d6', ai: '#a78bfa', success: '#6ee7b7', warning: '#fbbf24', danger: '#fb7185', muted: '#94a3b8' }

// Phase model over a canonical 28-day cycle.
const PHASES = [
  {
    id: 'menstrual', from: 1, to: 5, emoji: '🌙', color: C.danger,
    body: 'The uterine lining sheds — this is your period. Hormones are at their lowest, so it’s natural to feel quieter.',
    mood: 'Reflective and tender', energy: 'Low — rest is right',
    food: 'Iron-rich greens, dates, lentils, warm soups', exercise: 'Gentle yoga, stretching, slow walks',
    symptoms: 'Cramps, tiredness, lower-back ache', care: 'Warm compress, early nights, be kind to yourself',
  },
  {
    id: 'follicular', from: 6, to: 13, emoji: '🌱', color: C.success,
    body: 'Estrogen rises and an egg is maturing. Energy and mood lift — often the best days of the month.',
    mood: 'Bright, optimistic, social', energy: 'Rising — you feel capable',
    food: 'Fresh fruit, seeds, lean protein, colourful veg', exercise: 'Try something new — cardio, dance, strength',
    symptoms: 'Skin clears, mind feels sharp', care: 'Start projects, connect with friends',
  },
  {
    id: 'ovulation', from: 14, to: 16, emoji: '✨', color: C.warning,
    body: 'Estrogen peaks and the egg is released. This is your most fertile window — confidence and energy are at their highest.',
    mood: 'Confident and expressive', energy: 'Peak',
    food: 'Fibre, antioxidants, plenty of water', exercise: 'High-energy workouts feel great',
    symptoms: 'A mild twinge, higher libido, clearer discharge', care: 'Big conversations, presentations, socialising',
  },
  {
    id: 'luteal', from: 17, to: 28, emoji: '🍂', color: C.ai,
    body: 'Progesterone rises to prepare the lining, then falls if there’s no pregnancy. You may feel more inward, with PMS late on.',
    mood: 'Inward and sensitive', energy: 'Winding down',
    food: 'Complex carbs, magnesium (dark chocolate, nuts), less salt & caffeine', exercise: 'Pilates, moderate strength, gentle walks',
    symptoms: 'Bloating, cravings, mood shifts, tender breasts', care: 'Slow down, journal, prioritise sleep',
  },
]

function phaseForDay(d) {
  return PHASES.find((p) => d >= p.from && d <= p.to) || PHASES[3]
}

// Smooth hormone approximations across the cycle (0..1), tasteful not clinical.
function estrogen(d) {
  // rises to a peak just before ovulation (~day 13), small secondary luteal bump
  const peak = Math.exp(-((d - 13) ** 2) / 14)
  const luteal = 0.45 * Math.exp(-((d - 21) ** 2) / 30)
  return Math.min(1, Math.max(0.08, peak + luteal))
}
function progesterone(d) {
  // low until after ovulation, peaks ~day 21, falls before next period
  const rise = 0.95 * Math.exp(-((d - 21) ** 2) / 26)
  return Math.min(1, Math.max(0.05, d < 14 ? 0.06 : rise))
}

// Build an SVG path for a hormone curve across the 28 days.
function curvePath(fn, w, h, pad) {
  const n = 28
  const pts = []
  for (let d = 1; d <= n; d++) {
    const x = pad + ((d - 1) / (n - 1)) * (w - pad * 2)
    const y = h - pad - fn(d) * (h - pad * 2)
    pts.push([x, y])
  }
  return pts.map((p, i) => (i === 0 ? `M${p[0].toFixed(1)},${p[1].toFixed(1)}` : `L${p[0].toFixed(1)},${p[1].toFixed(1)}`)).join(' ')
}

export default function CycleExplorer({ startDay = 1, onClose }) {
  const { t, lang } = useT()
  const [day, setDay] = useState(Math.min(28, Math.max(1, startDay || 1)))
  const [playing, setPlaying] = useState(false)
  const timer = useRef(null)
  const ph = phaseForDay(day)

  // auto-advance when playing
  useEffect(() => {
    if (!playing) return
    timer.current = setInterval(() => {
      setDay((d) => (d >= 28 ? 1 : d + 1))
    }, 650)
    return () => clearInterval(timer.current)
  }, [playing])

  // stop narration when unmounting
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* ignore */ } }, [])

  const W = 300, H = 120, PAD = 12
  const estPath = useMemo(() => curvePath(estrogen, W, H, PAD), [])
  const progPath = useMemo(() => curvePath(progesterone, W, H, PAD), [])
  const markerX = PAD + ((day - 1) / 27) * (W - PAD * 2)

  // Wheel geometry: day 1 at top, clockwise.
  const R = 78, CX = 100, CY = 100
  const ang = ((day - 1) / 28) * 2 * Math.PI - Math.PI / 2
  const mx = CX + R * Math.cos(ang)
  const my = CY + R * Math.sin(ang)

  const SR_LANG = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN' }
  function narrate() {
    try {
      const sy = window.speechSynthesis
      if (!sy) return
      sy.cancel()
      const label = t(`phase_${ph.id}`)
      const text = `${t('ceDay')} ${day}. ${label}. ${ph.body}`
      const u = new SpeechSynthesisUtterance(text)
      u.lang = SR_LANG[lang] || 'en-US'
      u.rate = 0.98
      sy.speak(u)
    } catch { /* ignore */ }
  }

  const field = (icon, label, value, color) => (
    <div className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
      <span className="text-lg" aria-hidden>{icon}</span>
      <div>
        <p className="text-[0.7rem] font-medium uppercase tracking-wide" style={{ color }}>{label}</p>
        <p className="mt-0.5 text-[0.9rem] leading-snug text-text-secondary">{value}</p>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🩸</span>
          <h3 className="font-heading text-lg font-semibold">{t('ceTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('ceSub')}</p>

        <div className="mt-5 grid gap-6 sm:grid-cols-[200px_1fr] sm:items-center">
          {/* Cycle wheel */}
          <div className="mx-auto">
            <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow">
              <defs>
                <linearGradient id="ceGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={C.primary} />
                  <stop offset="100%" stopColor={C.ai} />
                </linearGradient>
              </defs>
              {/* phase arcs */}
              {PHASES.map((p) => {
                const a0 = ((p.from - 1) / 28) * 2 * Math.PI - Math.PI / 2
                const a1 = (p.to / 28) * 2 * Math.PI - Math.PI / 2
                const x0 = CX + R * Math.cos(a0), y0 = CY + R * Math.sin(a0)
                const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1)
                const large = a1 - a0 > Math.PI ? 1 : 0
                return (
                  <path key={p.id} d={`M${x0.toFixed(1)},${y0.toFixed(1)} A${R},${R} 0 ${large} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`}
                    fill="none" stroke={p.color} strokeWidth={ph.id === p.id ? 12 : 8} strokeLinecap="round"
                    opacity={ph.id === p.id ? 1 : 0.35} style={{ transition: 'all .3s' }} />
                )
              })}
              {/* moving marker */}
              <circle cx={mx} cy={my} r="9" fill="url(#ceGlow)" stroke="#fff" strokeWidth="2" style={{ transition: 'cx .3s, cy .3s' }} />
              {/* center label */}
              <text x="100" y="92" textAnchor="middle" className="fill-text-muted" fontSize="11">{t('ceDay')}</text>
              <text x="100" y="116" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="700">{day}</text>
            </svg>
            <div className="mt-1 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-caption font-medium" style={{ background: `${ph.color}22`, color: ph.color }}>
                {ph.emoji} {t(`phase_${ph.id}`)}
              </span>
            </div>
          </div>

          {/* Hormone curve + narration */}
          <div>
            <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <path d={estPath} fill="none" stroke={C.primary} strokeWidth="2.5" />
              <path d={progPath} fill="none" stroke={C.ai} strokeWidth="2.5" strokeDasharray="4 3" />
              <line x1={markerX} y1={PAD} x2={markerX} y2={H - PAD} stroke="#fff" strokeWidth="1" opacity="0.5" style={{ transition: 'x1 .3s, x2 .3s' }} />
              <circle cx={markerX} cy={H - PAD - estrogen(day) * (H - PAD * 2)} r="3.5" fill={C.primary} style={{ transition: 'cx .3s, cy .3s' }} />
              <circle cx={markerX} cy={H - PAD - progesterone(day) * (H - PAD * 2)} r="3.5" fill={C.ai} style={{ transition: 'cx .3s, cy .3s' }} />
            </svg>
            <div className="mt-2 flex items-center gap-4 text-[0.72rem] text-text-muted">
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded" style={{ background: C.primary }} /> {t('ceEstrogen')}</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2 w-3 rounded" style={{ background: C.ai }} /> {t('ceProgesterone')}</span>
            </div>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-text-secondary">{ph.body}</p>
          </div>
        </div>

        {/* Timeline control */}
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying((v) => !v)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-primary text-white shadow-glow transition hover:scale-105"
              aria-label={playing ? t('cePause') : t('cePlay')}
            >
              {playing ? '❚❚' : '▶'}
            </button>
            <input
              type="range" min="1" max="28" value={day}
              onChange={(e) => { setPlaying(false); setDay(Number(e.target.value)) }}
              className="mira-range h-2 w-full cursor-pointer appearance-none rounded-pill"
              style={{ background: `linear-gradient(90deg, ${C.primary} ${((day - 1) / 27) * 100}%, rgba(255,255,255,0.1) ${((day - 1) / 27) * 100}%)` }}
            />
            <span className="w-14 shrink-0 text-right font-stat text-sm text-text-secondary">{day}/28</span>
          </div>
        </div>

        {/* Per-phase guidance */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
          {field('💗', t('ceMood'), ph.mood, C.primary)}
          {field('⚡', t('ceEnergy'), ph.energy, C.warning)}
          {field('🥗', t('ceFood'), ph.food, C.success)}
          {field('🏃‍♀️', t('ceExercise'), ph.exercise, C.secondary)}
          {field('🩺', t('ceSymptoms'), ph.symptoms, C.danger)}
          {field('🧘', t('ceCare'), ph.care, C.ai)}
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <Button variant="secondary" size="md" onClick={narrate}><MicIcon size={16} /> {t('ceListen')}</Button>
          <Button size="md" onClick={onClose}>{t('learnDone')}</Button>
        </div>
      </div>
    </div>
  )
}
