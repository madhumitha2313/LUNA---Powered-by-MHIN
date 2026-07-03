import { useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { UsersIcon, ShieldIcon, SparklesIcon } from '../components/ui/icons'
import { seedCommunityData, aggregateByGroup, kAnonymityTest, K_THRESHOLD } from '../lib/community'

export default function Community() {
  const { visible, suppressed } = useMemo(() => aggregateByGroup(seedCommunityData()), [])
  const [test, setTest] = useState(null)
  const totalContributors = visible.reduce((a, g) => a + g.count, 0) + suppressed.reduce((a, g) => a + g.count, 0)

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="ai" icon={<UsersIcon size={14} />}>Community intelligence</Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          Population insights, privately
        </h1>
        <p className="mt-4 text-text-secondary">
          Menstrual-health patterns aggregated by school — so NGOs and schools can act, without ever
          exposing an individual. Protected by a hard <strong>k≥{K_THRESHOLD} suppression</strong>{' '}
          threshold (not differential privacy).
        </p>
      </div>

      {/* Summary + privacy badge */}
      <Card className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-bg-secondary/50">
        <div className="flex flex-wrap gap-8">
          <Stat label="Contributors" value={totalContributors} />
          <Stat label="Schools" value={visible.length + suppressed.length} />
          <Stat label="Shown" value={visible.length} />
          <Stat label="Suppressed" value={suppressed.length} />
        </div>
        <Badge tone="success" icon={<ShieldIcon size={14} />}>k-Anonymity Protected</Badge>
      </Card>

      <p className="mt-4 text-caption text-text-muted">
        Data on this page is <strong>synthetic seed data</strong> for demonstration — the only
        non-real data in MIRA.
      </p>

      {/* Visible groups */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {visible.map((g) => (
          <Card key={g.tag} hover>
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-semibold">{g.tag}</h3>
              <Badge tone="neutral">{g.count} contributors</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex items-center justify-between text-caption">
                <span className="text-text-muted">Average pain</span>
                <span className="font-stat font-semibold text-text-primary">{g.avgPain}/10</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-pill bg-white/5">
                <div className="h-full rounded-pill bg-accent-primary" style={{ width: `${(g.avgPain / 10) * 100}%` }} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-caption">
              <MiniStat label="High-pain days" value={`${g.highPainPct}%`} tone="text-danger" />
              <MiniStat label="Missed school" value={`${g.missedPct}%`} tone="text-warning" />
            </div>
            <p className="mt-3 text-caption text-text-secondary">
              Most reported: <span className="text-text-primary">{g.topSymptom}</span>
            </p>
            <Badge tone="success" className="mt-4" icon={<ShieldIcon size={12} />}>
              k-Anonymity Protected
            </Badge>
          </Card>
        ))}
      </div>

      {/* Suppressed groups */}
      {suppressed.length > 0 && (
        <Card className="mt-6 bg-bg-secondary/40">
          <div className="flex items-center gap-2">
            <ShieldIcon size={18} className="text-success" />
            <h2 className="font-heading text-lg font-semibold">Suppressed for privacy</h2>
          </div>
          <p className="mt-2 text-caption text-text-secondary">
            These groups have fewer than {K_THRESHOLD} contributors, so no statistics are shown — this
            is the k≥{K_THRESHOLD} suppression rule protecting individuals.
          </p>
          <ul className="mt-3 space-y-2">
            {suppressed.map((g) => (
              <li key={g.tag} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2.5 text-caption">
                <span className="text-text-secondary">{g.tag}</span>
                <span className="text-text-muted">Hidden · {g.count} &lt; {K_THRESHOLD} contributors</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Live k-anonymity test */}
      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-accent-ai" />
            <h2 className="font-heading text-lg font-semibold">k-Anonymity test</h2>
          </div>
          <Button onClick={() => setTest(kAnonymityTest())} size="md">
            Run test
          </Button>
        </div>
        <p className="mt-2 text-caption text-text-secondary">
          Proves the threshold live: a group of <strong>9</strong> must be suppressed; a group of{' '}
          <strong>10</strong> must be shown.
        </p>
        {test && (
          <div className="mt-4 space-y-2">
            {test.cases.map((c) => (
              <div
                key={c.n}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-[0.95rem] ${
                  c.ok ? 'border-success/25 bg-success/[0.08]' : 'border-danger/25 bg-danger/[0.08]'
                }`}
              >
                <span className="text-text-secondary">
                  Group of {c.n} → expected <span className="text-text-primary">{c.expected}</span>
                </span>
                <span className={c.ok ? 'font-semibold text-success' : 'font-semibold text-danger'}>
                  {c.actual} {c.ok ? '✓' : '✗'}
                </span>
              </div>
            ))}
            <p className={`mt-2 text-caption font-semibold ${test.pass ? 'text-success' : 'text-danger'}`}>
              {test.pass ? `PASS — k≥${test.k} suppression is enforced.` : 'FAIL'}
            </p>
          </div>
        )}
      </Card>
    </PageShell>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-caption text-text-muted">{label}</p>
    </div>
  )
}
function MiniStat({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className={`font-stat text-lg font-bold ${tone}`}>{value}</p>
      <p className="text-caption text-text-muted">{label}</p>
    </div>
  )
}
