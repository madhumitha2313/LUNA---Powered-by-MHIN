import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  MicIcon,
  BrainIcon,
  TrendIcon,
  StethoscopeIcon,
  ShieldIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '../components/ui/icons'

const STEPS = [
  {
    n: '01',
    icon: MicIcon,
    title: 'You speak, in Tamil',
    body: 'Tap the moon and talk the way you would to a friend. No forms, no medical jargon — just your own words about how you feel today.',
  },
  {
    n: '02',
    icon: SparklesIcon,
    title: 'Mira understands',
    body: 'Your speech is transcribed and structured into fields — flow, pain, mood, fatigue, sleep, stress — with a confidence check. If something is unclear, Mira asks a short follow-up instead of guessing.',
  },
  {
    n: '03',
    icon: BrainIcon,
    title: 'Mira remembers',
    body: 'Each entry is added to your continuous history. Context carries across cycles, so today builds on everything that came before.',
  },
  {
    n: '04',
    icon: TrendIcon,
    title: 'Patterns surface',
    body: 'Rolling trends and correlations reveal what’s worth noticing — heavy bleeding with fatigue, cycle-length shifts — always as a risk indicator to discuss, never a diagnosis.',
  },
  {
    n: '05',
    icon: StethoscopeIcon,
    title: 'You share with a doctor',
    body: 'When it matters, one tap turns months of logs and any lab findings into a clean summary your doctor can read in seconds.',
  },
]

export default function HowItWorks() {
  return (
    <PageShell max="max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent" icon={<SparklesIcon size={14} />}>
          How it works
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          From a conversation to a clear health story
        </h1>
        <p className="mt-4 text-text-secondary">
          Five steps, one continuous thread. Here’s exactly what happens between you speaking and
          your doctor understanding.
        </p>
      </div>

      {/* Steps */}
      <ol className="mt-14 space-y-5">
        {STEPS.map((s) => (
          <li key={s.n}>
            <Card hover className="flex items-start gap-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-accent-secondary">
                <s.icon size={24} />
              </span>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-stat text-caption font-semibold text-text-muted">{s.n}</span>
                  <h3 className="font-heading text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{s.body}</p>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      {/* Privacy pipeline */}
      <Card className="mt-12 bg-bg-secondary/50">
        <div className="flex items-center gap-2">
          <ShieldIcon size={20} className="text-success" />
          <h2 className="font-heading text-xl font-semibold">What happens to your voice</h2>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            ['Captured', 'Audio is used only to produce a transcript, in the moment.'],
            ['Transcribed', 'The words become structured fields — the audio is no longer needed.'],
            ['Discarded', 'The raw audio is dropped immediately and never written to storage.'],
          ].map(([t, b], i) => (
            <div key={t} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="font-stat text-caption font-semibold text-accent-secondary">
                  {i + 1}
                </span>
                <span className="font-medium text-text-primary">{t}</span>
              </div>
              <p className="text-caption text-text-secondary">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-caption text-text-muted">
          Outputs are always framed as risk indicators or patterns worth discussing with a doctor —
          never a diagnosis.
        </p>
      </Card>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/voice" size="lg">
          <MicIcon size={18} /> Try it now
        </Button>
        <Button as={Link} to="/features" variant="secondary" size="lg">
          See all features <ArrowRightIcon size={16} />
        </Button>
      </div>
    </PageShell>
  )
}
