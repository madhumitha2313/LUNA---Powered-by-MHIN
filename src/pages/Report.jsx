import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Logo from '../components/Logo'
import { ArrowRightIcon, StethoscopeIcon } from '../components/ui/icons'
import { getLogs, getCycleStats, getSymptoms, getProfile } from '../lib/localStore'

const SYMPTOM_LABELS = {
  irregular: 'Irregular / missed periods', heavy: 'Heavy or prolonged bleeding', spotting: 'Spotting between periods',
  pelvic_pain: 'Pelvic / lower-abdomen pain', acne: 'Acne / oily skin', hirsutism: 'Excess facial / body hair',
  hair_thinning: 'Scalp hair thinning', dark_patches: 'Dark skin patches', weight: 'Weight gain', cravings: 'Sugar cravings',
  bloating: 'Bloating', mood: 'Mood swings / anxiety', fatigue: 'Fatigue', sleep: 'Sleep problems',
}

/** Derive plain-language risk indicators (never diagnoses) from the data. */
function computeIndicators(logs, symptomKeys, stats) {
  const out = []
  const heavyPain = logs.filter((l) => l.flow === 'heavy' && l.pain != null && l.pain >= 7).length
  const fatigueHeavy = logs.filter((l) => l.fatigue && l.flow === 'heavy').length
  if (heavyPain >= 2)
    out.push('Recurring heavy menstrual bleeding with significant pain — consider evaluation for menorrhagia and anaemia.')
  if (fatigueHeavy >= 1)
    out.push('Fatigue reported alongside heavy bleeding — iron studies (ferritin, Hb) may be worth discussing.')
  if (symptomKeys.length >= 4)
    out.push('Multiple PCOS/PCOD-associated symptoms tracked — consider PCOS screening (ultrasound + hormonal panel).')
  if (stats.regularity === 'irregular')
    out.push('Irregular cycle length observed — discuss cycle regulation with a gynaecologist.')
  if (out.length === 0) out.push('No specific risk pattern flagged from the available entries. Continue routine tracking.')
  return out
}

function fmt(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

export default function Report() {
  const logs = getLogs()
  const stats = getCycleStats()
  const symptoms = getSymptoms()
  const profile = getProfile()
  const symptomKeys = Object.keys(symptoms).filter((k) => symptoms[k])
  const indicators = computeIndicators(logs, symptomKeys, stats)
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        {/* Controls */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold">Health summary report</h1>
            <p className="text-caption text-text-secondary">Doctor-ready. Print or save as PDF to share.</p>
          </div>
          <div className="flex gap-2">
            <Button as={Link} to="/home" variant="secondary" size="md">
              Back
            </Button>
            <Button onClick={() => window.print()} size="md">
              Print / Save PDF <ArrowRightIcon size={16} />
            </Button>
          </div>
        </div>

        {/* The printable sheet */}
        <div className="report-sheet card-base p-8 sm:p-10">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b border-white/[0.1] pb-6">
            <div>
              <Logo withTagline />
              <p className="mt-3 font-heading text-xl font-semibold text-text-primary">
                Menstrual Health Summary
              </p>
              <p className="text-caption text-text-secondary">Prepared for clinical discussion</p>
            </div>
            <div className="text-right text-caption text-text-secondary">
              <p>Generated</p>
              <p className="font-medium text-text-primary">{today}</p>
            </div>
          </div>

          {/* Patient */}
          <Section title="Patient">
            <Grid>
              <KV k="Name" v={profile.name || '—'} />
              <KV k="Age" v={profile.age || '—'} />
              <KV k="City" v={profile.city || '—'} />
              <KV k="Reported concern" v={profile.condition || '—'} />
            </Grid>
          </Section>

          {/* Cycle */}
          <Section title="Cycle summary">
            <Grid>
              <KV k="Average cycle length" v={stats.avgCycleLength ? `${stats.avgCycleLength} days` : '—'} />
              <KV k="Cycle regularity" v={stats.regularity || 'insufficient data'} />
              <KV k="Last period start" v={fmt(stats.lastPeriodStart)} />
              <KV k="Predicted next period" v={fmt(stats.predictedNext)} />
              <KV k="Current cycle day" v={stats.cycleDay ?? '—'} />
              <KV k="Current phase" v={stats.phase || '—'} />
            </Grid>
          </Section>

          {/* Symptoms */}
          <Section title="Tracked symptoms">
            {symptomKeys.length === 0 ? (
              <p className="text-caption text-text-secondary">None recorded.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {symptomKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-[0.95rem] text-text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary/70" />
                    {SYMPTOM_LABELS[k] || k}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Recent check-ins */}
          <Section title={`Recent check-ins (${logs.length})`}>
            {logs.length === 0 ? (
              <p className="text-caption text-text-secondary">No check-ins logged yet.</p>
            ) : (
              <table className="w-full border-collapse text-left text-caption">
                <thead>
                  <tr className="border-b border-white/[0.1] text-text-muted">
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Flow</th>
                    <th className="py-2 pr-3 font-medium">Pain</th>
                    <th className="py-2 pr-3 font-medium">Mood</th>
                    <th className="py-2 pr-3 font-medium">Fatigue</th>
                    <th className="py-2 font-medium">Sleep</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 12).map((l) => (
                    <tr key={l.id || l.$id} className="border-b border-white/[0.05] text-text-secondary">
                      <td className="py-2 pr-3">{fmt(l.date)}</td>
                      <td className="py-2 pr-3">{l.flow || '—'}</td>
                      <td className="py-2 pr-3">{l.pain != null ? l.pain : '—'}</td>
                      <td className="py-2 pr-3">{l.mood || '—'}</td>
                      <td className="py-2 pr-3">{l.fatigue || '—'}</td>
                      <td className="py-2">{l.sleep || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Indicators */}
          <Section title="Risk indicators (for discussion)">
            <ul className="space-y-2">
              {indicators.map((t, i) => (
                <li key={i} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                  <span className="report-accent mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <p className="mt-6 border-t border-white/[0.1] pt-4 text-caption text-text-muted">
            This summary is generated from self-reported tracking in MIRA. It lists risk indicators
            and patterns for discussion — it is <strong>not a diagnosis</strong> and does not replace
            clinical assessment. Generated by MIRA · powered by MHIN.
          </p>
        </div>

        <div className="no-print mt-8 flex justify-center">
          <Button as={Link} to="/doctors" size="lg">
            <StethoscopeIcon size={16} /> Find a specialist near me <ArrowRightIcon size={16} />
          </Button>
        </div>
      </main>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
        {title}
      </h2>
      {children}
    </section>
  )
}
function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{children}</div>
}
function KV({ k, v }) {
  return (
    <div>
      <p className="text-caption text-text-muted">{k}</p>
      <p className="text-[0.95rem] font-medium text-text-primary">{v}</p>
    </div>
  )
}
