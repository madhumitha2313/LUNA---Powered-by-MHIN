import { useEffect, useRef, useState } from 'react'
import Button from './ui/Button'
import { MicIcon } from './ui/icons'
import { useT } from '../lib/i18n.jsx'

/**
 * Interactive reproductive-anatomy explorer. A tasteful, stylised SVG of the
 * uterus, ovaries, fallopian tubes, cervix and endometrium — tap an organ to
 * learn what it is and its role in the cycle. "Watch ovulation" animates an
 * egg travelling from an ovary into the uterus while the lining thickens.
 * Fully offline; voice narration via the Web Speech API.
 */

const C = { primary: '#d97ba8', secondary: '#f5c6d6', ai: '#a78bfa', success: '#6ee7b7', warning: '#fbbf24', danger: '#fb7185', line: '#c9d3e6' }

// Organ facts (names come from i18n so they localise; bodies stay in the
// shared lesson language, matching the rest of the learning content).
const ORGANS = {
  uterus: { key: 'an_uterus', body: 'A muscular, pear-shaped organ where a baby can grow. Each month its lining thickens and, if there’s no pregnancy, sheds as your period.' },
  ovaries: { key: 'an_ovaries', body: 'Two almond-sized glands that store your eggs and make estrogen and progesterone. Each cycle, one releases an egg.' },
  tubes: { key: 'an_tubes', body: 'Two fine tubes that carry the egg from the ovary toward the uterus. If fertilisation happens, it usually takes place here.' },
  cervix: { key: 'an_cervix', body: 'The narrow neck at the base of the uterus opening into the vagina. It stays closed to protect the uterus and changes through your cycle.' },
  endometrium: { key: 'an_endometrium', body: 'The soft inner lining of the uterus. It builds up each month for a possible pregnancy, and sheds as your period if there isn’t one.' },
}

export default function AnatomyExplorer({ onClose }) {
  const { t, lang } = useT()
  const [sel, setSel] = useState('uterus')
  const [playing, setPlaying] = useState(false)
  const [egg, setEgg] = useState(0) // 0..1 progress of the egg along its path
  const [thick, setThick] = useState(0.4) // endometrium thickness 0..1
  const raf = useRef(null)

  useEffect(() => () => { try { window.speechSynthesis?.cancel(); cancelAnimationFrame(raf.current) } catch { /* ignore */ } }, [])

  function watchOvulation() {
    cancelAnimationFrame(raf.current)
    setPlaying(true)
    setSel('ovaries')
    const start = performance.now()
    const DUR = 4200
    const tick = (now) => {
      const p = Math.min(1, (now - start) / DUR)
      setEgg(p)
      setThick(0.35 + p * 0.6) // lining thickens as the cycle progresses
      if (p < 1) raf.current = requestAnimationFrame(tick)
      else setPlaying(false)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const SR_LANG = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN' }
  function narrate() {
    try {
      const sy = window.speechSynthesis
      if (!sy) return
      sy.cancel()
      const o = ORGANS[sel]
      const u = new SpeechSynthesisUtterance(`${t(o.key)}. ${o.body}`)
      u.lang = SR_LANG[lang] || 'en-US'
      u.rate = 0.98
      sy.speak(u)
    } catch { /* ignore */ }
  }

  // Egg travels from the right ovary, along the right tube, into the uterus.
  const eggPath = [ [252, 120], [232, 104], [206, 92], [178, 96], [162, 118] ]
  function pointAt(p) {
    const seg = p * (eggPath.length - 1)
    const i = Math.min(eggPath.length - 2, Math.floor(seg))
    const f = seg - i
    const a = eggPath[i], b = eggPath[i + 1]
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
  }
  const eggPos = pointAt(egg)

  const OProps = (id) => ({
    onClick: () => setSel(id),
    style: { cursor: 'pointer', transition: 'all .25s' },
    opacity: sel === id ? 1 : 0.85,
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🫀</span>
          <h3 className="font-heading text-lg font-semibold">{t('anTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('anSub')}</p>

        <div className="mt-4 grid gap-5 sm:grid-cols-[1fr_240px] sm:items-start">
          {/* Anatomical SVG */}
          <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-2">
            <svg viewBox="0 0 320 250" width="100%" role="img" aria-label={t('anTitle')}>
              <defs>
                <radialGradient id="anUt" cx="0.5" cy="0.4" r="0.7">
                  <stop offset="0%" stopColor="#f7d9e6" />
                  <stop offset="100%" stopColor={C.primary} />
                </radialGradient>
                <linearGradient id="anEgg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff" />
                  <stop offset="100%" stopColor={C.warning} />
                </linearGradient>
              </defs>

              {/* Fallopian tubes */}
              <path {...OProps('tubes')} d="M132,92 C100,74 74,84 66,112" fill="none" stroke={sel === 'tubes' ? C.secondary : C.line} strokeWidth={sel === 'tubes' ? 7 : 5} strokeLinecap="round" />
              <path {...OProps('tubes')} d="M188,92 C220,74 246,84 254,112" fill="none" stroke={sel === 'tubes' ? C.secondary : C.line} strokeWidth={sel === 'tubes' ? 7 : 5} strokeLinecap="round" />
              {/* fimbriae */}
              {[-1, 1].map((s) => (
                <g key={s} stroke={sel === 'tubes' ? C.secondary : C.line} strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
                  <line x1={160 + s * 94} y1="112" x2={160 + s * 100} y2="104" />
                  <line x1={160 + s * 94} y1="112" x2={160 + s * 102} y2="112" />
                  <line x1={160 + s * 94} y1="112" x2={160 + s * 100} y2="120" />
                </g>
              ))}

              {/* Ovaries */}
              <ellipse {...OProps('ovaries')} cx="58" cy="120" rx="17" ry="12" fill={sel === 'ovaries' ? C.warning : '#e7b6cb'} stroke="#fff" strokeWidth="1.5" />
              <ellipse {...OProps('ovaries')} cx="262" cy="120" rx="17" ry="12" fill={sel === 'ovaries' ? C.warning : '#e7b6cb'} stroke="#fff" strokeWidth="1.5" />

              {/* Uterus body */}
              <path {...OProps('uterus')} d="M160,72 C132,72 120,96 122,132 C123,164 142,188 160,194 C178,188 197,164 198,132 C200,96 188,72 160,72 Z" fill="url(#anUt)" stroke="#fff" strokeWidth="2" />
              {/* Endometrium (inner lining) — thickness animates */}
              <path onClick={() => setSel('endometrium')} style={{ cursor: 'pointer', transition: 'all .3s' }}
                d="M160,92 C144,92 137,110 138,134 C139,156 150,174 160,178 C170,174 181,156 182,134 C183,110 176,92 160,92 Z"
                fill="none" stroke={C.danger} strokeWidth={4 + thick * 12} opacity={sel === 'endometrium' ? 0.95 : 0.5} strokeLinejoin="round" />

              {/* Cervix */}
              <path {...OProps('cervix')} d="M150,194 L147,216 L173,216 L170,194 Z" fill={sel === 'cervix' ? C.ai : '#d8a9bf'} stroke="#fff" strokeWidth="1.5" />
              <rect {...OProps('cervix')} x="150" y="216" width="20" height="18" rx="4" fill={sel === 'cervix' ? C.ai : '#c99bb2'} opacity="0.7" />

              {/* Travelling egg */}
              {playing && (
                <>
                  <circle cx={eggPos[0]} cy={eggPos[1]} r="8" fill="url(#anEgg)" opacity="0.35" />
                  <circle cx={eggPos[0]} cy={eggPos[1]} r="4.5" fill="url(#anEgg)" stroke="#fff" strokeWidth="1" />
                </>
              )}
            </svg>
          </div>

          {/* Detail panel */}
          <div>
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(ORGANS).map((id) => (
                <button key={id} onClick={() => setSel(id)}
                  className={`rounded-pill px-2.5 py-1 text-[0.72rem] font-medium transition ${sel === id ? 'bg-accent-primary text-white' : 'bg-white/[0.05] text-text-muted hover:text-text-primary'}`}>
                  {t(ORGANS[id].key)}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h4 className="font-heading text-lg font-semibold text-accent-secondary">{t(ORGANS[sel].key)}</h4>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-text-secondary">{ORGANS[sel].body}</p>
            </div>
            <button onClick={narrate} className="mt-3 flex items-center gap-2 rounded-pill border border-white/10 px-3 py-1.5 text-caption text-text-secondary transition hover:border-accent-primary/50 hover:text-accent-primary">
              🔊 {t('ceListen')}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-caption text-text-muted">💡 {t('anTapHint')}</p>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" onClick={watchOvulation} disabled={playing}>
              <MicIcon size={16} /> {playing ? t('anWatching') : t('anWatch')}
            </Button>
            <Button size="md" onClick={onClose}>{t('learnDone')}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
