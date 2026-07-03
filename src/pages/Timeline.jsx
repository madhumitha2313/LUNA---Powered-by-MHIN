import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ExtractionChip from '../components/voice/ExtractionChip'
import { TrendIcon, MicIcon, ArrowRightIcon } from '../components/ui/icons'
import { getLogs } from '../lib/localStore'

function chipsFor(l) {
  const out = []
  if (l.flow) out.push(['flow', l.flow])
  if (l.pain != null) out.push(['pain', String(l.pain)])
  if (l.mood) out.push(['mood', l.mood])
  if (l.fatigue) out.push(['fatigue', l.fatigue])
  if (l.sleep) out.push(['sleep', l.sleep])
  if (l.stress) out.push(['stress', l.stress])
  return out
}

function TrendArrow({ cur, prev }) {
  if (cur == null || prev == null) return null
  if (cur > prev) return <span className="text-danger">↑ higher</span>
  if (cur < prev) return <span className="text-success">↓ lower</span>
  return <span className="text-text-muted">→ same</span>
}

export default function Timeline() {
  const logs = getLogs() // newest first

  return (
    <PageShell max="max-w-3xl">
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="success" icon={<TrendIcon size={14} />}>Your history</Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">Timeline</h1>
        <p className="mt-3 text-text-secondary">
          Every check-in you've logged, newest first — with how your pain moved between entries.
        </p>
      </div>

      {logs.length === 0 ? (
        <Card className="mt-10 text-center">
          <p className="font-medium text-text-primary">No check-ins yet</p>
          <p className="mt-1 text-caption text-text-secondary">
            Talk to Mira and your entries will appear here as an elegant timeline.
          </p>
          <div className="mt-5 flex justify-center">
            <Button as={Link} to="/voice" size="lg">
              <MicIcon size={18} /> Log your first check-in <ArrowRightIcon size={16} />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="relative mt-10 pl-6">
          {/* vertical line */}
          <span className="absolute left-2 top-2 bottom-2 w-px bg-gradient-to-b from-accent-primary/40 via-white/10 to-transparent" />
          <div className="space-y-5">
            {logs.map((l, i) => {
              const prev = logs[i + 1] // older entry
              return (
                <div key={l.id || l.$id} className="relative animate-fade-up">
                  <span className="absolute -left-[18px] top-5 h-2.5 w-2.5 rounded-full bg-accent-primary ring-4 ring-bg-primary" />
                  <Card hover>
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-semibold">
                        {new Date(l.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-caption">
                        {l.pain != null && prev?.pain != null ? (
                          <TrendArrow cur={l.pain} prev={prev.pain} />
                        ) : (
                          <span className="text-text-muted">
                            {new Date(l.date).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        )}
                      </span>
                    </div>

                    {chipsFor(l).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chipsFor(l).map(([field, value]) => (
                          <ExtractionChip key={field} field={field} value={value} tone={field} />
                        ))}
                      </div>
                    )}

                    {l.rawTranscript && (
                      <p className="mt-3 text-caption italic text-text-muted">“{l.rawTranscript}”</p>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/report" variant="secondary" size="lg">
            Doctor summary
          </Button>
          <Button as={Link} to="/impact" size="lg">
            Leave report <ArrowRightIcon size={16} />
          </Button>
        </div>
      )}
    </PageShell>
  )
}
