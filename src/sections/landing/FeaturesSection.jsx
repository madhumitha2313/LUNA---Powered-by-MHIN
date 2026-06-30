import Card from '../../components/ui/Card'
import {
  MicIcon,
  BrainIcon,
  FileIcon,
  TrendIcon,
  StethoscopeIcon,
  UsersIcon,
  ShieldIcon,
} from '../../components/ui/icons'

const FEATURES = [
  {
    title: 'Voice First',
    body: 'Speak naturally in Tamil. No forms, no jargon — just a conversation that becomes a health log.',
    icon: MicIcon,
    tone: 'text-accent-secondary',
  },
  {
    title: 'AI Memory',
    body: 'Luna remembers context across cycles, so every check-in builds on the last instead of starting over.',
    icon: BrainIcon,
    tone: 'text-accent-ai',
  },
  {
    title: 'Document Intelligence',
    body: 'Upload a lab report and Luna reads it — pulling hemoglobin, ferritin and hormone values automatically.',
    icon: FileIcon,
    tone: 'text-accent-secondary',
  },
  {
    title: 'Trend Intelligence',
    body: 'Rolling cycle length, pain and flow trends surface patterns worth discussing — never a diagnosis.',
    icon: TrendIcon,
    tone: 'text-success',
  },
  {
    title: 'Doctor Summary',
    body: 'One tap turns months of logs into a clean, clinical summary your doctor can read in seconds.',
    icon: StethoscopeIcon,
    tone: 'text-accent-secondary',
  },
  {
    title: 'Community Dashboard',
    body: 'Anonymised, k-anonymity-protected insights reveal population trends without exposing any individual.',
    icon: UsersIcon,
    tone: 'text-accent-ai',
  },
  {
    title: 'Privacy',
    body: 'Your voice is deleted after processing. Your data is yours — encrypted, permissioned, deletable on demand.',
    icon: ShieldIcon,
    tone: 'text-success',
  },
]

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-accent-secondary/80">
            What Luna does
          </p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-section">
            Intelligence that listens first.
          </h2>
          <p className="mt-4 text-text-secondary">
            Seven capabilities working together to turn scattered signals into one
            continuous, understandable health story.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              hover
              className={`animate-fade-up delay-${Math.min(i, 5)}`}
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${f.tone}`}
              >
                <f.icon size={24} />
              </span>
              <h3 className="mt-5 font-heading text-lg font-semibold">{f.title}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-relaxed text-text-secondary">
                {f.body}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
