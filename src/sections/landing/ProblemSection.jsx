import Card from '../../components/ui/Card'
import Logo from '../../components/Logo'
import {
  HeartIcon,
  UsersIcon,
  StethoscopeIcon,
  FileIcon,
  SparklesIcon,
  BrainIcon,
  MicIcon,
} from '../../components/ui/icons'

const NODES = [
  { label: 'You', icon: HeartIcon },
  { label: 'Family', icon: UsersIcon },
  { label: 'Doctor', icon: StethoscopeIcon },
  { label: 'Hospital', icon: HeartIcon },
  { label: 'Lab', icon: FileIcon },
  { label: 'Apps', icon: SparklesIcon },
]

const CONNECTS = [
  {
    icon: MicIcon,
    title: 'Speaks your language',
    body: 'Log in Tamil by voice — no forms. Every conversation becomes structured health data automatically.',
  },
  {
    icon: BrainIcon,
    title: 'Remembers across visits',
    body: 'Context carries from one cycle to the next, so nothing is lost between a symptom, a lab and a check-up.',
  },
  {
    icon: StethoscopeIcon,
    title: 'Ready for your doctor',
    body: 'Months of scattered signals become one clean summary your doctor can read in seconds.',
  },
]

export default function ProblemSection() {
  return (
    <section id="problem" className="relative py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-caption font-medium uppercase tracking-[0.2em] text-accent-secondary/80">
            The problem
          </p>
          <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-section">
            Healthcare isn't missing data.
            <br />
            <span className="text-text-muted">It's missing connections.</span>
          </h2>
          <p className="mt-4 text-text-secondary">
            Your health story is scattered — a symptom here, a lab result there, an app in
            between. MIRA is the thread that ties them together.
          </p>
        </div>

        {/* Hub: sources connect through MIRA */}
        <Card className="mt-14 overflow-hidden bg-bg-secondary/50 p-8 sm:p-12">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6 sm:gap-x-8">
            {NODES.map((node, i) => (
              <div key={node.label} className="flex items-center gap-4 sm:gap-8">
                <div className="flex flex-col items-center gap-2.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-bg-card text-accent-secondary">
                    <node.icon size={24} />
                  </span>
                  <span className="text-caption text-text-secondary">{node.label}</span>
                </div>
                {i < NODES.length - 1 && (
                  <span
                    aria-hidden
                    className="hidden h-px w-6 bg-gradient-to-r from-accent-primary/40 to-accent-ai/40 sm:block"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Converge into MIRA */}
          <div className="mt-10 flex flex-col items-center">
            <span aria-hidden className="h-8 w-px bg-gradient-to-b from-transparent to-accent-ai/50" />
            <div className="flex items-center gap-3 rounded-pill border border-accent-ai/25 bg-accent-ai/[0.08] px-5 py-2.5 shadow-glow-ai">
              <Logo />
              <span className="text-[0.95rem] font-medium text-text-primary">
                connects every thread into one story
              </span>
            </div>
          </div>
        </Card>

        {/* What connection unlocks */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {CONNECTS.map((c) => (
            <Card key={c.title} hover>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-accent-secondary">
                <c.icon size={22} />
              </span>
              <h3 className="mt-4 font-heading text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{c.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
