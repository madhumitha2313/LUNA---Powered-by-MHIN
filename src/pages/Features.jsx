import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  MicIcon,
  BrainIcon,
  FileIcon,
  TrendIcon,
  StethoscopeIcon,
  UsersIcon,
  ShieldIcon,
  LeafIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '../components/ui/icons'

const FEATURES = [
  {
    icon: MicIcon,
    title: 'Voice First — in Tamil',
    tone: 'text-accent-secondary',
    body: 'Skip the forms. Speak naturally in Tamil and Mira turns the conversation into a structured health log — flow, pain, mood, sleep, stress and more.',
    points: ['Natural Tamil & Tamil-English speech', 'Live transcript with extraction chips', 'Confidence check with a follow-up when unsure'],
  },
  {
    icon: BrainIcon,
    title: 'AI Memory',
    tone: 'text-accent-ai',
    body: 'Every check-in builds on the last. Mira keeps context across cycles so your history is continuous, not a pile of disconnected entries.',
    points: ['Context carried across cycles', 'Trends computed on rolling windows', 'Nothing lost between visits'],
  },
  {
    icon: FileIcon,
    title: 'Document Intelligence',
    tone: 'text-accent-secondary',
    body: 'Upload a lab report and Mira reads it — pulling hemoglobin, ferritin, vitamin D and hormone values, then folding them into your risk indicators.',
    points: ['PDF & image reports', 'Auto-extracts key blood/hormone values', 'Low ferritin reinforces anaemia indicators'],
  },
  {
    icon: HeartIcon,
    title: 'Period & Cycle Tracker',
    tone: 'text-accent-secondary',
    body: 'Track period start dates and Mira estimates your cycle length, current phase and the next predicted date — all computed from your own logs.',
    points: ['Cycle length & phase from real data', 'Next-period prediction', 'Regularity signal over time'],
  },
  {
    icon: SparklesIcon,
    title: 'PCOS / PCOD Symptom Tracking',
    tone: 'text-accent-ai',
    body: 'Log common PCOS/PCOD symptoms over time and see which ones cluster — a clear picture to bring to a gynaecologist.',
    points: ['Guided symptom checklist', 'Pattern view over weeks', 'Educational, never diagnostic'],
  },
  {
    icon: TrendIcon,
    title: 'Trend Intelligence',
    tone: 'text-success',
    body: 'Rolling cycle length, pain and flow trends surface patterns worth discussing — always framed as a risk indicator, never a diagnosis.',
    points: ['Rolling cycle-length trend', 'Correlations: sleep · stress · pain', 'Plain-language explanations'],
  },
  {
    icon: StethoscopeIcon,
    title: 'Doctor Summary',
    tone: 'text-accent-secondary',
    body: 'One tap turns months of logs and report findings into a clean clinical summary your doctor can read in seconds — with an export option.',
    points: ['Cycle & symptom history', 'Report findings included', 'Export to PDF'],
  },
  {
    icon: UsersIcon,
    title: 'Community Intelligence',
    tone: 'text-accent-ai',
    body: 'Anonymised, population-level insights that never expose an individual — protected by a k≥10 suppression threshold, shown with a visible privacy badge.',
    points: ['Aggregated by group & month', 'k≥10 suppression (not differential privacy)', '“k-Anonymity Protected” indicator'],
  },
  {
    icon: LeafIcon,
    title: 'Sustainability',
    tone: 'text-success',
    body: 'See the modeled environmental footprint of your product choices, using published lifecycle-assessment data — clearly labelled as modeled, not sensor-measured.',
    points: ['Based on your logged product type', 'Cited emission factors', 'Transparent methodology note'],
  },
]

export default function Features() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>
          Everything MIRA does
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          Features, in full
        </h1>
        <p className="mt-4 text-text-secondary">
          Nine capabilities working together to turn scattered signals into one continuous,
          understandable health story — voice-first, private by design.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} hover>
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${f.tone}`}
            >
              <f.icon size={24} />
            </span>
            <h3 className="mt-5 font-heading text-lg font-semibold">{f.title}</h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-text-secondary">{f.body}</p>
            <ul className="mt-4 space-y-2">
              {f.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-caption text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary/70" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4 text-center">
        <ShieldIcon size={28} className="text-success" />
        <h2 className="font-heading text-2xl font-semibold">Private by design, always</h2>
        <p className="max-w-lg text-text-secondary">
          Your voice is transcribed and discarded — never stored. Your data is yours: encrypted,
          permissioned to you alone, and deletable on demand.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/voice" size="lg">
            <MicIcon size={18} /> Talk to Mira
          </Button>
          <Button as={Link} to="/how-it-works" variant="secondary" size="lg">
            How it works <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
