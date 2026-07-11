import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getCycleStats, getProfile } from '../lib/localStore'
import { computeHealthScore, predictions, insights, calendarModel } from '../lib/cycleIntel'
import CycleExplorer from '../components/CycleExplorer'
import DailyCheckIn from '../components/DailyCheckIn'

const PHASE_TONE = { menstrual: 'danger', follicular: 'success', ovulation: 'warning', luteal: 'ai' }

function fmtDate(iso, lang) {
  try { return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'short' }) }
  catch { return new Date(iso).toISOString().slice(0, 10) }
}

export default function Cycle() {
  const { t, lang } = useT()
  const [tick, setTick] = useState(0) // bump to recompute after a check-in
  const [explorer, setExplorer] = useState(false)
  const [checkin, setCheckin] = useState(false)

  const stats = useMemo(() => getCycleStats(), [tick])
  const hs = useMemo(() => computeHealthScore(), [tick])
  const preds = useMemo(() => predictions(), [tick])
  const tips = useMemo(() => insights(), [tick])
  const hasCycle = stats && stats.cycleDay != null

  return (
    <PageShell max="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('ciEngine')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('ciHeading')}</h1>
          <p className="mt-2 max-w-lg text-text-secondary">{t('ciTagline')}</p>
        </div>
        <Button size="md" onClick={() => setCheckin(true)}>💗 {t('ciLogToday')}</Button>
      </div>

      {/* Cycle summary hero */}
      <Card className="mt-6 overflow-hidden bg-gradient-to-br from-[#d97ba8]/[0.14] via-[#a78bfa]/[0.08] to-transparent">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing score={hs.score} label={t('ciWellness')} />
          <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label={t('ciCycleDay')} value={hasCycle ? stats.cycleDay : '—'} />
            <Stat label={t('ciPhase')} value={stats.phase ? <Badge tone={PHASE_TONE[stats.phase]}>{t(`phase_${stats.phase}`)}</Badge> : '—'} />
            <Stat label={t('ciNextPeriod')} value={hasCycle && stats.daysUntilNext != null ? `${stats.daysUntilNext}${t('ciDaysShort')}` : '—'} />
            <Stat label={t('ciRegularity')} value={stats.regularity ? t(`reg_${stats.regularity.replace(/\s/g, '')}`) : '—'} />
            <Stat label={t('ciMoodTrend')} value={<TrendPill dir={hs.trend} t={t} />} />
            <Stat label={t('ciNextOvulation')} value={preds.find((p) => p.key === 'ovulation') ? fmtDate(preds.find((p) => p.key === 'ovulation').date, lang) : '—'} />
          </div>
        </div>
      </Card>

      {/* AI health score detail + insights */}
      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-lg">🧠</span>
            <h2 className="font-heading text-lg font-semibold">{t('ciHealthScore')}</h2>
            {hs.score != null && <span className="ml-auto font-stat text-2xl font-bold">{hs.score}<span className="text-sm text-text-muted">/100</span></span>}
          </div>
          <p className="mt-2 text-caption text-accent-secondary">{t(hs.label)}</p>
          {hs.reasons.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {hs.reasons.map((r) => (
                <li key={r.key} className="flex items-start gap-2 text-[0.88rem] text-text-secondary">
                  <span>{r.good ? '✅' : '⚠️'}</span> {t(r.key)}
                </li>
              ))}
            </ul>
          )}
          {hs.suggestions.length > 0 && (
            <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t('ciSuggestions')}</p>
              <ul className="mt-1.5 space-y-1">
                {hs.suggestions.map((s) => <li key={s} className="text-[0.88rem] text-text-secondary">💡 {t(s)}</li>)}
              </ul>
            </div>
          )}
          {hs.score == null && <p className="mt-3 text-[0.88rem] text-text-secondary">{t('ciScoreEmpty')}</p>}
        </Card>

        <Card>
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span>
            <h2 className="font-heading text-lg font-semibold">{t('ciInsights')}</h2>
          </div>
          {tips.length > 0 ? (
            <ul className="mt-3 space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.06] p-3.5 text-[0.92rem] leading-relaxed text-text-secondary">
                  {t(tip.key).replace('{n}', tip.n ?? '')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[0.88rem] text-text-secondary">{t('ciInsightsEmpty')}</p>
          )}
        </Card>
      </div>

      {/* AI predictions */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">{t('ciPredictions')}</h2>
      {preds.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {preds.map((p) => <PredCard key={p.key} p={p} t={t} lang={lang} />)}
        </div>
      ) : (
        <Card><p className="text-[0.88rem] text-text-secondary">{t('ciPredEmpty')}</p></Card>
      )}

      {/* Premium calendar */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">{t('ciCalendar')}</h2>
      <CycleCalendar t={t} lang={lang} />

      {/* Explore + phase wheel */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <button onClick={() => setExplorer(true)} className="group flex items-center gap-4 rounded-3xl border border-accent-primary/30 bg-gradient-to-r from-[#d97ba8]/[0.14] to-transparent p-5 text-left transition hover:border-accent-primary/60 hover:shadow-glow">
          <span className="text-3xl transition-transform group-hover:scale-110">🩸</span>
          <div><h3 className="font-heading font-semibold">{t('learnCycleCta')}</h3><p className="text-caption text-text-secondary">{t('learnCycleSub')}</p></div>
          <ArrowRightIcon size={18} className="ml-auto text-accent-primary transition group-hover:translate-x-1" />
        </button>
        <Link to="/journey" className="group flex items-center gap-4 rounded-3xl border border-accent-ai/30 bg-gradient-to-r from-[#a78bfa]/[0.14] to-transparent p-5 transition hover:border-accent-ai/60 hover:shadow-glow-ai">
          <span className="text-3xl transition-transform group-hover:scale-110">🌟</span>
          <div><h3 className="font-heading font-semibold">{t('ciJourneyCta')}</h3><p className="text-caption text-text-secondary">{t('ciJourneySub')}</p></div>
          <ArrowRightIcon size={18} className="ml-auto text-accent-ai transition group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="h-24" />
      {explorer && <CycleExplorer startDay={stats.cycleDay || 1} onClose={() => setExplorer(false)} />}
      {checkin && <DailyCheckIn onClose={() => setCheckin(false)} onSaved={() => setTick((v) => v + 1)} />}
      <BottomNav />
    </PageShell>
  )
}

function ScoreRing({ score, label }) {
  const pct = score == null ? 0 : score
  const R = 46, CIRC = 2 * Math.PI * R
  const off = CIRC * (1 - pct / 100)
  const color = score == null ? '#94a3b8' : score >= 80 ? '#6ee7b7' : score >= 65 ? '#d97ba8' : score >= 50 ? '#fbbf24' : '#fb7185'
  return (
    <div className="mx-auto flex flex-col items-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={off} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset .8s ease' }} />
        <text x="60" y="58" textAnchor="middle" fill="#fff" fontSize="30" fontWeight="700">{score == null ? '—' : score}</text>
        <text x="60" y="78" textAnchor="middle" className="fill-text-muted" fontSize="10">/ 100</text>
      </svg>
      <p className="mt-1 text-caption text-text-muted">{label}</p>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[0.7rem] uppercase tracking-wide text-text-muted">{label}</p>
      <div className="mt-1 font-stat text-xl font-bold text-text-primary">{value}</div>
    </div>
  )
}

function TrendPill({ dir, t }) {
  if (!dir) return <span className="text-text-muted">—</span>
  const map = { up: ['text-success', '↑ ' + t('trendUp')], down: ['text-warning', '↓ ' + t('trendDown')], flat: ['text-text-muted', '→ ' + t('trendFlat')] }
  const [cls, txt] = map[dir]
  return <span className={`text-base ${cls}`}>{txt}</span>
}

function PredCard({ p, t, lang }) {
  const conf = Math.round((p.confidence || 0) * 100)
  let value
  if (p.key === 'nextPeriod') value = `${fmtDate(p.date, lang)}${p.days != null ? ` · ${p.days}${t('ciDaysShort')}` : ''}`
  else if (p.key === 'ovulation') value = fmtDate(p.date, lang)
  else if (p.key === 'fertile') value = `${fmtDate(p.dateStart, lang)}–${fmtDate(p.dateEnd, lang)}`
  else if (p.key === 'pain') value = t(`lvl_${p.level}`)
  else if (p.key === 'mood') value = t(`trend${p.level[0].toUpperCase()}${p.level.slice(1)}`)
  return (
    <Card className="bg-white/[0.02]">
      <p className="text-caption text-text-muted">{t(`pred_${p.key}`)}</p>
      <p className="mt-1 font-heading text-lg font-semibold">{value}</p>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-white/[0.08]">
          <div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary" style={{ width: `${conf}%` }} />
        </div>
        <span className="text-[0.7rem] text-text-muted">{conf}% {t('ciConfidence')}</span>
      </div>
    </Card>
  )
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
function CycleCalendar({ t, lang }) {
  const today = new Date()
  const [ym, setYm] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const marks = useMemo(() => calendarModel(ym.y, ym.m), [ym])
  const first = new Date(ym.y, ym.m, 1)
  const startPad = first.getDay()
  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate()
  const monthName = first.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { month: 'long', year: 'numeric' })
  const todayStr = today.toISOString().slice(0, 10)

  const cells = []
  for (let i = 0; i < startPad; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function color(day) {
    const key = new Date(ym.y, ym.m, day).toISOString().slice(0, 10)
    const m = marks[key] || {}
    if (m.period) return 'bg-danger/80 text-white'
    if (m.predicted) return 'border border-dashed border-danger/70 text-danger'
    if (m.ovulation) return 'bg-warning/80 text-black'
    if (m.fertile) return 'bg-warning/20 text-warning'
    return ''
  }
  function dot(day) {
    const key = new Date(ym.y, ym.m, day).toISOString().slice(0, 10)
    const m = marks[key] || {}
    return m.symptom || m.mood
  }

  const shift = (n) => setYm(({ y, m }) => { const d = new Date(y, m + n, 1); return { y: d.getFullYear(), m: d.getMonth() } })

  return (
    <Card>
      <div className="flex items-center justify-between">
        <button onClick={() => shift(-1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06]">‹</button>
        <p className="font-heading font-semibold capitalize">{monthName}</p>
        <button onClick={() => shift(1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/[0.06]">›</button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[0.7rem] text-text-muted">
        {WEEKDAYS.map((w, i) => <div key={i}>{w}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />
          const key = new Date(ym.y, ym.m, day).toISOString().slice(0, 10)
          const isToday = key === todayStr
          return (
            <div key={i} className={`relative flex h-9 items-center justify-center rounded-xl text-sm ${color(day)} ${isToday ? 'ring-2 ring-accent-primary' : ''}`}>
              {day}
              {dot(day) && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent-ai" />}
            </div>
          )
        })}
      </div>
      {/* legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[0.72rem] text-text-muted">
        <Legend cls="bg-danger/80" label={t('legPeriod')} />
        <Legend cls="border border-dashed border-danger/70" label={t('legPredicted')} />
        <Legend cls="bg-warning/80" label={t('legOvulation')} />
        <Legend cls="bg-warning/20" label={t('legFertile')} />
        <Legend dot label={t('legLog')} />
      </div>
    </Card>
  )
}

function Legend({ cls, label, dot }) {
  return (
    <span className="flex items-center gap-1.5">
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-accent-ai" /> : <span className={`h-3 w-3 rounded ${cls}`} />}
      {label}
    </span>
  )
}
