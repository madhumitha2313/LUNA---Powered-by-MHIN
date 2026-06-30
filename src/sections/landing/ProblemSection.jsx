import Card from '../../components/ui/Card'
import {
  HeartIcon,
  UsersIcon,
  StethoscopeIcon,
  FileIcon,
  SparklesIcon,
} from '../../components/ui/icons'

const NODES = [
  { label: 'Woman', icon: HeartIcon },
  { label: 'Family', icon: UsersIcon },
  { label: 'Doctor', icon: StethoscopeIcon },
  { label: 'Hospital', icon: HeartIcon },
  { label: 'Lab', icon: FileIcon },
  { label: 'Apps', icon: SparklesIcon },
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
        </div>

        {/* Connection diagram */}
        <Card className="mt-14 overflow-hidden bg-bg-secondary/50 p-8 sm:p-12">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between lg:gap-3">
            {NODES.map((node, i) => (
              <div key={node.label} className="flex items-center gap-6 lg:flex-col lg:gap-3">
                <div className="flex flex-col items-center gap-2.5">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-bg-card text-accent-secondary">
                    <node.icon size={24} />
                  </span>
                  <span className="text-caption text-text-secondary">{node.label}</span>
                </div>
                {i < NODES.length - 1 && (
                  <span
                    aria-hidden
                    className="h-px w-8 bg-gradient-to-r from-white/20 to-white/5 lg:h-8 lg:w-px lg:bg-gradient-to-b"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center">
            <span className="rounded-pill border border-danger/25 bg-danger/10 px-4 py-1.5 text-caption font-medium text-danger">
              Disconnected information
            </span>
          </div>
        </Card>

        <p className="mx-auto mt-10 max-w-xl text-center text-text-secondary">
          Every report, every symptom, every conversation lives in a different silo.
          LUNA is the connective tissue — listening, remembering, and translating it all
          into one continuous health story.
        </p>
      </div>
    </section>
  )
}
