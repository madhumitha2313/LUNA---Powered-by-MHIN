import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import MiraMark from './MiraMark'
import {
  HeartIcon,
  MicIcon,
  UsersIcon,
  FileIcon,
  StethoscopeIcon,
  ShieldIcon,
  ArrowRightIcon,
} from './ui/icons'
import { useT } from '../lib/i18n.jsx'

const TOUR_KEY = 'mira.showTour.v1'

/** Set right after onboarding so the tour shows once on the first home visit. */
export function armDashboardTour() {
  try {
    localStorage.setItem(TOUR_KEY, '1')
  } catch {
    /* ignore */
  }
}
export function shouldShowTour() {
  try {
    return localStorage.getItem(TOUR_KEY) === '1'
  } catch {
    return false
  }
}
function disarm() {
  try {
    localStorage.removeItem(TOUR_KEY)
  } catch {
    /* ignore */
  }
}

const FEATURES = [
  { icon: HeartIcon, tone: 'text-accent-primary', name: 'qaTracker', desc: 'tourTrackerD', to: '/tracker' },
  { icon: MicIcon, tone: 'text-accent-secondary', name: 'navTalk', desc: 'tourVoiceD', to: '/voice' },
  { icon: UsersIcon, tone: 'text-accent-ai', name: 'navLearn', desc: 'tourGuideD', to: '/guide' },
  { icon: FileIcon, tone: 'text-success', name: 'qaReport', desc: 'tourReportD', to: '/report' },
  { icon: StethoscopeIcon, tone: 'text-accent-secondary', name: 'navConditions', desc: 'tourCondD', to: '/conditions' },
  { icon: ShieldIcon, tone: 'text-accent-ai', name: 'menuSettings', desc: 'tourSettingsD', to: '/settings' },
]

/**
 * First-launch guided tour. Step 0 is the welcome + feature grid ("Take Tour" /
 * "Skip"); "Take Tour" walks each feature one card at a time, ending on a CTA
 * that can jump straight into that feature.
 */
export default function DashboardTour() {
  const { t } = useT()
  const navigate = useNavigate()
  const [open, setOpen] = useState(() => shouldShowTour())
  const [step, setStep] = useState(0) // 0 = welcome grid; 1..N = feature cards

  if (!open) return null

  const close = () => {
    disarm()
    setOpen(false)
  }
  const feature = step > 0 ? FEATURES[step - 1] : null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-card p-7 shadow-lift animate-fade-up">
        {step === 0 ? (
          <>
            <div className="flex justify-center">
              <MiraMark size={64} />
            </div>
            <h2 className="mt-4 text-center font-heading text-2xl font-bold tracking-tight">{t('tourTitle')}</h2>
            <p className="mx-auto mt-2 max-w-xs text-center text-text-secondary">{t('tourSub')}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div key={f.name} className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] ${f.tone}`}>
                    <f.icon size={18} />
                  </span>
                  <span className="text-[0.9rem] font-medium text-text-primary">{t(f.name)}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-2.5">
              <Button onClick={() => setStep(1)} size="lg" className="w-full">
                {t('takeTour')} <ArrowRightIcon size={18} />
              </Button>
              <button
                onClick={close}
                className="w-full rounded-pill px-5 py-2.5 text-caption text-text-muted hover:text-text-secondary"
              >
                {t('skipTour')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${feature.tone}`}>
                <feature.icon size={26} />
              </span>
              <span className="font-stat text-caption text-text-muted">
                {step}/{FEATURES.length}
              </span>
            </div>
            <h2 className="mt-5 font-heading text-2xl font-semibold tracking-tight">{t(feature.name)}</h2>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{t(feature.desc)}</p>

            <div className="mt-6 flex justify-center gap-1.5">
              {FEATURES.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-pill transition-all ${i === step - 1 ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20'}`}
                />
              ))}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  disarm()
                  setOpen(false)
                  navigate(feature.to)
                }}
                className="rounded-pill px-4 py-2.5 text-caption text-accent-secondary hover:underline"
              >
                {t('tourOpen')}
              </button>
              <Button
                onClick={() => (step < FEATURES.length ? setStep((s) => s + 1) : close())}
                size="lg"
              >
                {step < FEATURES.length ? t('next') : t('tourStart')} <ArrowRightIcon size={18} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
