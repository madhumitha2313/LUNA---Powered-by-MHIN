import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './ui/Button'
import VoiceOrb from './voice/VoiceOrb'
import ExtractionChip from './voice/ExtractionChip'
import { MicIcon, SparklesIcon, LeafIcon, HeartIcon, StethoscopeIcon, ArrowRightIcon } from './ui/icons'

/**
 * "Watch Demo" — an auto-advancing, narrated walkthrough that teaches a
 * first-time user how MIRA works. A self-contained interactive demo (no external
 * video); a real MP4 can replace the <Stage> frames later if desired.
 */
const STEPS = [
  {
    icon: MicIcon,
    title: 'Talk in Tamil',
    caption: 'Tap the moon and just talk — “ரொம்ப வலி, அதிக ரத்தப்போக்கு.” No forms.',
    stage: () => (
      <div className="flex justify-center py-4">
        <VoiceOrb state="listening" onClick={() => {}} className="scale-90" />
      </div>
    ),
  },
  {
    icon: SparklesIcon,
    title: 'See it understood',
    caption: 'MIRA extracts your signals live and shows a confidence score.',
    stage: () => (
      <div className="flex flex-wrap justify-center gap-2 py-8">
        <ExtractionChip field="flow" value="heavy" tone="flow" />
        <ExtractionChip field="pain" value="8" tone="pain" />
        <ExtractionChip field="fatigue" value="severe" tone="fatigue" />
      </div>
    ),
  },
  {
    icon: LeafIcon,
    title: 'Get tips for right now',
    caption: 'It replies in Tamil with foods and activities suited to your cycle phase.',
    stage: () => (
      <div className="mx-auto max-w-xs space-y-2 py-4 text-left">
        <Tip icon={LeafIcon} text="Iron-rich greens · ginger tea" />
        <Tip icon={HeartIcon} text="Warm compress · gentle stretching" />
      </div>
    ),
  },
  {
    icon: HeartIcon,
    title: 'Track your cycle',
    caption: 'Log period dates; MIRA predicts your next period and phase.',
    stage: () => (
      <div className="mx-auto grid max-w-xs grid-cols-2 gap-3 py-4">
        <MiniStat label="Cycle day" value="14" />
        <MiniStat label="Next period" value="14d" />
      </div>
    ),
  },
  {
    icon: StethoscopeIcon,
    title: 'Share with your doctor',
    caption: 'Generate a doctor-ready report and find a specialist near you.',
    stage: () => (
      <div className="mx-auto max-w-xs py-6 text-center">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left text-caption text-text-secondary">
          <p className="font-semibold text-text-primary">Menstrual Health Summary</p>
          <p className="mt-1">Cycle · symptoms · risk indicators — ready to print.</p>
        </div>
      </div>
    ),
  },
]

export default function DemoModal({ open, onClose }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!open) return
    setI(0)
    const t = setInterval(() => setI((n) => (n + 1) % STEPS.length), 3800)
    return () => clearInterval(t)
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  const step = STEPS[i]
  const last = i === STEPS.length - 1

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg overflow-hidden rounded-card border border-white/10 bg-bg-card shadow-lift">
        <div className="flex items-center justify-between px-6 pt-5">
          <span className="inline-flex items-center gap-2 text-caption text-text-muted">
            <SparklesIcon size={14} className="text-accent-ai" /> How MIRA works
          </span>
          <button onClick={onClose} aria-label="Close demo" className="text-text-muted hover:text-text-primary">
            ✕
          </button>
        </div>

        {/* Stage */}
        <div className="mx-6 mt-4 min-h-[220px] rounded-2xl border border-white/[0.06] bg-bg-secondary/50">
          {step.stage()}
        </div>

        {/* Caption */}
        <div className="px-6 pb-2 pt-5 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-secondary">
              <step.icon size={18} />
            </span>
            <h3 className="font-heading text-lg font-semibold">{step.title}</h3>
          </div>
          <p className="mx-auto max-w-sm text-[0.95rem] text-text-secondary">{step.caption}</p>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-4">
          {STEPS.map((_, n) => (
            <button
              key={n}
              onClick={() => setI(n)}
              aria-label={`Step ${n + 1}`}
              className={`h-1.5 rounded-full transition-all duration-250 ${
                n === i ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/15'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] p-4">
          <Button variant="ghost" size="md" onClick={() => setI((n) => (n - 1 + STEPS.length) % STEPS.length)}>
            Back
          </Button>
          {last ? (
            <Button as={Link} to="/voice" size="md" onClick={onClose}>
              <MicIcon size={16} /> Try it now <ArrowRightIcon size={16} />
            </Button>
          ) : (
            <Button size="md" onClick={() => setI((n) => (n + 1) % STEPS.length)}>
              Next <ArrowRightIcon size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Tip({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-caption text-text-secondary">
      <Icon size={16} className="text-success" />
      {text}
    </div>
  )
}
function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-center">
      <p className="font-stat text-xl font-bold text-text-primary">{value}</p>
      <p className="text-caption text-text-muted">{label}</p>
    </div>
  )
}
