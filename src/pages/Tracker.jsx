import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { HeartIcon, TrendIcon, SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { getPeriods, addPeriod, removePeriod, getCycleStats } from '../lib/localStore'
import { useT } from '../lib/i18n.jsx'

// Static class strings only — Tailwind JIT can't see interpolated class names.
// Labels/notes are translation KEYS resolved with t() at render time.
const PHASES = {
  menstrual: {
    label: 'phaseMenstrual',
    badge: 'danger',
    wrap: 'bg-danger/10 text-danger',
    note: 'noteMenstrual',
  },
  follicular: {
    label: 'phaseFollicular',
    badge: 'success',
    wrap: 'bg-success/10 text-success',
    note: 'noteFollicular',
  },
  ovulation: {
    label: 'phaseOvulation',
    badge: 'warning',
    wrap: 'bg-warning/10 text-warning',
    note: 'noteOvulation',
  },
  luteal: {
    label: 'phaseLuteal',
    badge: 'ai',
    wrap: 'bg-accent-ai/10 text-accent-ai',
    note: 'notePMS',
  },
}

function fmt(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'
}

export default function Tracker() {
  const { t } = useT()
  const [periods, setPeriods] = useState(getPeriods())
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const stats = getCycleStats()

  const logPeriod = () => setPeriods(addPeriod(date))
  const remove = (d) => setPeriods(removePeriod(d))

  const phase = stats.phase ? PHASES[stats.phase] : null

  // 30-day forward strip around the predicted next period
  const strip = buildStrip(stats)

  return (
    <PageShell max="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="accent" icon={<HeartIcon size={14} />}>
            {t('trackerBadge')}
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {t('trackerTitle')}
          </h1>
          <p className="mt-2 text-text-secondary">{t('trackerSub')}</p>
        </div>
        <div className="flex items-end gap-2">
          <label className="block">
            <span className="mb-1.5 block text-caption text-text-muted">{t('periodStart')}</span>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
            />
          </label>
          <Button onClick={logPeriod} size="md">
            {t('log')}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label={t('cycleDayLabel')} value={stats.cycleDay ?? '—'} sub={phase ? t(phase.label) : t('logToBegin')} />
        <Stat
          label={t('avgCycle')}
          value={stats.avgCycleLength ? `${stats.avgCycleLength}${t('dShort')}` : '—'}
          sub={stats.regularity ? t(regularityKey(stats.regularity)) : t('needsLogs')}
        />
        <Stat
          label={t('nextPeriod')}
          value={stats.daysUntilNext != null ? daysLabel(stats.daysUntilNext, t) : '—'}
          sub={fmt(stats.predictedNext)}
        />
        <Stat label={t('lastStart')} value={fmt(stats.lastPeriodStart)} sub={`${periods.length} ${t('loggedWord')}`} />
      </div>

      {/* Current phase */}
      {phase && (
        <Card className="mt-6 flex items-center gap-4 bg-bg-secondary/50">
          <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${phase.wrap}`}>
            <TrendIcon size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-semibold">{t(phase.label)} {t('phaseWord')}</span>
              <Badge tone={phase.badge}>{t('dayWord')} {stats.cycleDay}</Badge>
            </div>
            <p className="mt-0.5 text-caption text-text-secondary">{t(phase.note)}</p>
          </div>
        </Card>
      )}

      {/* Forward strip */}
      {strip.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-4 font-heading text-lg font-semibold">{t('next4weeks')}</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {strip.map((d) => (
              <div
                key={d.iso}
                title={`${d.iso}${d.predictedPeriod ? ' · predicted period' : d.fertile ? ' · fertile window' : ''}`}
                className={`flex h-14 min-w-[34px] flex-1 flex-col items-center justify-center rounded-lg border text-caption ${
                  d.predictedPeriod
                    ? 'border-danger/40 bg-danger/15 text-danger'
                    : d.fertile
                      ? 'border-warning/40 bg-warning/10 text-warning'
                      : 'border-white/[0.06] bg-white/[0.02] text-text-muted'
                } ${d.isToday ? 'ring-2 ring-accent-primary/60' : ''}`}
              >
                <span className="font-stat font-semibold">{d.day}</span>
                <span className="text-[10px] opacity-70">{d.mon}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-caption text-text-muted">
            <Legend className="bg-danger/40" label={t('predictedPeriodLabel')} />
            <Legend className="bg-warning/40" label={t('fertileWindow')} />
            <Legend className="bg-accent-primary/60" label={t('todayLabel')} />
          </div>
          <p className="mt-3 text-caption text-text-muted">{t('predictionsNote')}</p>
        </Card>
      )}

      {/* History */}
      <Card className="mt-6">
        <h2 className="mb-3 font-heading text-lg font-semibold">{t('loggedStarts')}</h2>
        {periods.length === 0 ? (
          <p className="text-caption text-text-secondary">{t('noDatesLogged')}</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {periods.map((d) => (
              <li key={d} className="flex items-center justify-between py-2.5 text-[0.95rem]">
                <span className="text-text-secondary">
                  {new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <button onClick={() => remove(d)} className="text-caption text-text-muted hover:text-danger">
                  {t('remove')}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/symptoms" variant="secondary" size="lg">
          <SparklesIcon size={16} /> {t('pcosSymptoms')}
        </Button>
        <Button as={Link} to="/voice" size="lg">
          {t('logByVoice')} <ArrowRightIcon size={16} />
        </Button>
      </div>
    </PageShell>
  )
}

function regularityKey(r) {
  if (r === 'regular') return 'regRegular'
  if (r === 'slightly irregular') return 'regSlightly'
  return 'regIrregular'
}

function Stat({ label, value, sub }) {
  return (
    <Card className="py-5">
      <p className="text-caption text-text-muted">{label}</p>
      <p className="mt-1 font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-caption text-text-secondary">{sub}</p>
    </Card>
  )
}

function Legend({ className, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-full ${className}`} />
      {label}
    </span>
  )
}

function daysLabel(n, t) {
  if (n === 0) return t('today')
  if (n < 0) return `${-n}${t('dShort')} ${t('lateWord')}`
  return `${n}${t('dShort')}`
}

function buildStrip(stats) {
  if (!stats.predictedNext) return []
  const out = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const next = new Date(stats.predictedNext)
  const avg = stats.avgCycleLength || 28
  const ovulation = new Date(next.getTime() - 14 * 86400000)
  for (let i = 0; i < 28; i++) {
    const d = new Date(today.getTime() + i * 86400000)
    const diffToNext = Math.round((d - next) / 86400000)
    const predictedPeriod = diffToNext >= 0 && diffToNext <= 4
    const diffToOv = Math.abs(Math.round((d - ovulation) / 86400000))
    const fertile = !predictedPeriod && diffToOv <= 2
    out.push({
      iso: d.toISOString().slice(0, 10),
      day: d.getDate(),
      mon: d.toLocaleDateString(undefined, { month: 'short' }),
      predictedPeriod,
      fertile,
      isToday: i === 0,
    })
  }
  return out
}
