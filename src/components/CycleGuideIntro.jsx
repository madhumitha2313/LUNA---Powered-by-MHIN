import { useState } from 'react'
import Button from './ui/Button'
import MiraMark from './MiraMark'
import { MoonIcon, LeafIcon, SparklesIcon, HeartIcon, ArrowRightIcon } from './ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile, saveProfile } from '../lib/localStore'

const PHASES = [
  { icon: MoonIcon, color: '#D81B60', name: 'cgPhase1Name', body: 'cgPhase1Body' },
  { icon: LeafIcon, color: '#22c55e', name: 'cgPhase2Name', body: 'cgPhase2Body' },
  { icon: SparklesIcon, color: '#a78bfa', name: 'cgPhase3Name', body: 'cgPhase3Body' },
  { icon: HeartIcon, color: '#FF4F9D', name: 'cgPhase4Name', body: 'cgPhase4Body' },
]
// Wrap-up slide (why tracking matters + how MIRA helps) appended after the 4 phases.
const SLIDE_COUNT = PHASES.length + 1

const DOT_POS = [
  'top-0 left-1/2 -translate-x-1/2',
  'right-0 top-1/2 -translate-y-1/2',
  'bottom-0 left-1/2 -translate-x-1/2',
  'left-0 top-1/2 -translate-y-1/2',
]

/** Per-account: has this user already seen (or dismissed) the cycle guide intro? */
export function shouldShowCycleGuide() {
  return !getProfile().cycleGuideSeen
}

/**
 * First-login welcome dialog offering a short, skippable menstrual-cycle
 * education carousel. Shows once per account (gated by profile.cycleGuideSeen);
 * pass forceOpen to replay it on demand from Settings.
 */
export default function CycleGuideIntro({ forceOpen = false, onClose }) {
  const { t } = useT()
  const [open, setOpen] = useState(() => forceOpen || shouldShowCycleGuide())
  const [stage, setStage] = useState('ask') // ask | slides | done
  const [slide, setSlide] = useState(0)

  if (!open) return null

  function finish(choice) {
    saveProfile({ cycleGuideSeen: true, cycleGuideChoice: choice })
    setOpen(false)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-card p-7 shadow-lift animate-fade-up">
        {stage === 'ask' && (
          <>
            <div className="flex justify-center"><MiraMark size={60} /></div>
            <h2 className="mt-4 text-center font-heading text-2xl font-bold tracking-tight">{t('cgWelcomeTitle')}</h2>
            <p className="mx-auto mt-2.5 max-w-xs text-center text-[0.95rem] leading-relaxed text-text-secondary">
              {t('cgWelcomeBody')}
            </p>
            <div className="mt-7 space-y-2.5">
              <Button onClick={() => { setSlide(0); setStage('slides') }} size="lg" className="w-full">
                {t('cgYes')} <ArrowRightIcon size={18} />
              </Button>
              <button
                onClick={() => finish('skip')}
                className="w-full rounded-pill px-5 py-2.5 text-caption text-text-muted hover:text-text-secondary"
              >
                {t('cgSkip')}
              </button>
            </div>
          </>
        )}

        {stage === 'slides' && slide < PHASES.length && (
          <PhaseSlide
            t={t}
            phase={PHASES[slide]}
            index={slide}
            onSkip={() => finish('yes')}
            onNext={() => setSlide((s) => s + 1)}
          />
        )}

        {stage === 'slides' && slide === PHASES.length && (
          <>
            <div className="flex justify-center"><MiraMark size={56} /></div>
            <h3 className="mt-4 text-center font-heading text-xl font-semibold">{t('cgWhyTitle')}</h3>
            <p className="mt-2.5 text-center text-[0.92rem] leading-relaxed text-text-secondary">{t('cgWhyBody')}</p>
            <Dots count={SLIDE_COUNT} active={slide} />
            <div className="mt-7 flex items-center justify-between gap-3">
              <button onClick={() => finish('yes')} className="rounded-pill px-4 py-2.5 text-caption text-text-muted hover:text-text-secondary">
                {t('skip')}
              </button>
              <Button onClick={() => setStage('done')} size="lg">
                {t('cont')} <ArrowRightIcon size={18} />
              </Button>
            </div>
          </>
        )}

        {stage === 'done' && (
          <>
            <div className="flex justify-center"><MiraMark size={64} /></div>
            <h2 className="mt-4 text-center font-heading text-2xl font-bold tracking-tight">{t('cgDoneTitle')}</h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-text-secondary">{t('cgDoneBody')}</p>
            <div className="mt-7">
              <Button onClick={() => finish('yes')} size="lg" className="w-full">
                {t('cgContinue')} <ArrowRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function PhaseSlide({ t, phase, index, onSkip, onNext }) {
  const Icon = phase.icon
  return (
    <>
      <div className="relative mx-auto h-28 w-28">
        <div className="absolute inset-3 rounded-full border border-white/[0.08]" />
        {PHASES.map((p, i) => {
          const active = i === index
          const PIcon = p.icon
          return (
            <span
              key={p.name}
              className={`absolute flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${DOT_POS[i]} ${
                active ? 'scale-110 border-transparent shadow-lift' : 'border-white/10 bg-white/[0.03] opacity-50'
              }`}
              style={active ? { background: p.color } : undefined}
            >
              <PIcon size={16} className={active ? 'text-white' : 'text-text-muted'} />
            </span>
          )
        })}
        <span className="absolute inset-0 flex items-center justify-center">
          <Icon size={22} style={{ color: phase.color }} />
        </span>
      </div>
      <h3 className="mt-5 text-center font-heading text-xl font-semibold">{t(phase.name)}</h3>
      <p className="mt-2.5 text-center text-[0.92rem] leading-relaxed text-text-secondary">{t(phase.body)}</p>
      <Dots count={SLIDE_COUNT} active={index} />
      <div className="mt-7 flex items-center justify-between gap-3">
        <button onClick={onSkip} className="rounded-pill px-4 py-2.5 text-caption text-text-muted hover:text-text-secondary">
          {t('skip')}
        </button>
        <Button onClick={onNext} size="lg">
          {t('cont')} <ArrowRightIcon size={18} />
        </Button>
      </div>
    </>
  )
}

function Dots({ count, active }) {
  return (
    <div className="mt-5 flex justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className={`h-1.5 rounded-pill transition-all ${i === active ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20'}`} />
      ))}
    </div>
  )
}
