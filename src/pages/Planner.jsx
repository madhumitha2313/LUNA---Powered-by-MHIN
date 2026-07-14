import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import Confetti from '../components/Confetti'
import {
  HABITS, todaysPlan, doneToday, toggleHabit, habitStreak, wellnessStreak, reachedMilestone,
  getReminders, toggleReminder, deleteReminder, addReminder, suggestedReminders,
  periodPrep, PREP_ITEMS, prepDone, togglePrep,
} from '../lib/reminders'

export default function Planner() {
  const { t } = useT()
  const [tick, setTick] = useState(0)
  const [celebrate, setCelebrate] = useState(null)

  const plan = useMemo(() => todaysPlan(), [])
  const done = useMemo(() => doneToday(), [tick])
  const streak = useMemo(() => wellnessStreak(), [tick])
  const reminders = useMemo(() => getReminders(), [tick])
  const suggestions = useMemo(() => suggestedReminders(), [tick])
  const prep = useMemo(() => periodPrep(), [tick])
  const prepChecked = useMemo(() => prepDone(), [tick])

  const completedInPlan = plan.filter((id) => done.includes(id)).length
  const pct = Math.round((completedInPlan / plan.length) * 100)

  function onToggleHabit(id) {
    toggleHabit(id)
    setTick((v) => v + 1)
    const m = reachedMilestone()
    if (m) setCelebrate(m)
  }

  return (
    <PageShell max="max-w-4xl">
      {celebrate && <Confetti onDone={() => setCelebrate(null)} />}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('plEngine')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('plHeading')}</h1>
          <p className="mt-2 max-w-lg text-text-secondary">{t('plTagline')}</p>
        </div>
        <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-center">
          <p className="font-stat text-2xl font-bold">{streak}🔥</p>
          <p className="text-caption text-text-muted">{t('plStreak')}</p>
        </div>
      </div>

      {/* Period preparation mode */}
      {prep.active && (
        <Card className="mt-6 border-danger/25 bg-gradient-to-br from-[#fb7185]/[0.12] to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-xl">💕</span>
            <h2 className="font-heading text-lg font-semibold">{t('plPrepTitle')}</h2>
            <Badge tone="danger" className="ml-auto">{prep.days === 0 ? t('plPrepToday') : `${prep.days} ${t('ciDaysShort')}`}</Badge>
          </div>
          <p className="mt-2 text-[0.9rem] text-text-secondary">{t('plPrepSub')}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {PREP_ITEMS.map((it) => {
              const on = prepChecked.includes(it.id)
              return (
                <button key={it.id} onClick={() => { togglePrep(it.id); setTick((v) => v + 1) }}
                  className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${on ? 'border-success/40 bg-success/[0.08]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border ${on ? 'border-success bg-success/20 text-success' : 'border-white/20'}`}>{on ? '✓' : ''}</span>
                  <span className="text-xl">{it.emoji}</span>
                  <span className={`text-[0.88rem] ${on ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{t(it.key)}</span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* Today's wellness plan (AI habit coach) */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        <Card>
          <div className="flex items-center gap-2">
            <span className="text-lg">🌅</span>
            <h2 className="font-heading text-lg font-semibold">{t('plToday')}</h2>
            <span className="ml-auto text-caption text-text-muted">{completedInPlan}/{plan.length}</span>
          </div>
          <div className="mt-4 space-y-2">
            {plan.map((id) => {
              const h = HABITS[id]; const on = done.includes(id); const s = habitStreak(id)
              return (
                <button key={id} onClick={() => onToggleHabit(id)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${on ? 'border-success/40 bg-success/[0.08]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${on ? 'border-success bg-success/20 text-success' : 'border-white/20'}`}>{on ? '✓' : ''}</span>
                  <span className="text-xl">{h.emoji}</span>
                  <span className={`flex-1 text-[0.92rem] ${on ? 'text-text-muted line-through' : 'text-text-primary'}`}>{t(h.key)}</span>
                  {s > 1 && <span className="text-caption text-accent-secondary">{s}🔥</span>}
                </button>
              )
            })}
          </div>
          {pct === 100 && <p className="mt-3 text-center text-caption text-success">🎉 {t('plAllDone')}</p>}
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <ProgressRing pct={pct} />
          <p className="mt-2 text-caption text-text-muted">{t('plComplete')}</p>
        </Card>
      </div>

      {/* Habit builder */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🌱 {t('plHabits')}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(HABITS).map(([id, h]) => {
          const s = habitStreak(id); const on = done.includes(id)
          return (
            <button key={id} onClick={() => onToggleHabit(id)} className={`rounded-3xl border p-4 text-left transition ${on ? 'border-accent-primary/40 bg-accent-primary/[0.08]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{h.emoji}</span>
                {on && <span className="text-success">✓</span>}
              </div>
              <p className="mt-2 text-[0.85rem] font-medium text-text-primary">{t(h.key)}</p>
              <p className="mt-1 text-caption text-accent-secondary">{s > 0 ? `${s} ${t('plDayStreak')}` : t('plStart')}</p>
            </button>
          )
        })}
      </div>

      {/* Smart reminders */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🔔 {t('plReminders')}</h2>
      <Card>
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-xl">{r.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-[0.9rem] ${r.enabled ? 'text-text-primary' : 'text-text-muted'}`}>{r.custom ? r.label : t(r.key)}</p>
                <p className="text-caption text-text-muted">{r.time} · {t(`remType_${r.type}`)}</p>
              </div>
              <button onClick={() => { toggleReminder(r.id); setTick((v) => v + 1) }} aria-pressed={r.enabled}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.enabled ? 'bg-accent-primary' : 'bg-white/15'}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${r.enabled ? 'left-6' : 'left-1'}`} />
              </button>
              <button onClick={() => { deleteReminder(r.id); setTick((v) => v + 1) }} className="text-text-muted hover:text-danger" aria-label="delete">✕</button>
            </div>
          ))}
        </div>

        {/* Context-aware suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <p className="mb-2 text-caption text-text-muted">✨ {t('plSuggested')}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button key={s.key} onClick={() => { addReminder(s); setTick((v) => v + 1) }}
                  className="flex items-center gap-1.5 rounded-pill border border-accent-secondary/30 bg-accent-secondary/[0.08] px-3 py-1.5 text-caption text-text-secondary hover:border-accent-secondary/60">
                  {s.emoji} {t(s.key)} <span className="text-accent-primary">＋</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <AddReminder t={t} onAdd={(r) => { addReminder(r); setTick((v) => v + 1) }} />
      </Card>

      <div className="mt-6"><Link to="/journey" className="inline-flex items-center gap-1.5 text-caption text-accent-secondary hover:underline">{t('moSeeJourney')} <ArrowRightIcon size={14} /></Link></div>

      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

function ProgressRing({ pct }) {
  const R = 42, C = 2 * Math.PI * R
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
      <circle cx="55" cy="55" r={R} fill="none" stroke="url(#plg)" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset .6s ease' }} />
      <defs><linearGradient id="plg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f5c6d6" /><stop offset="100%" stopColor="#d97ba8" /></linearGradient></defs>
      <text x="55" y="62" textAnchor="middle" fill="#fff" fontSize="24" fontWeight="700">{pct}%</text>
    </svg>
  )
}

function AddReminder({ t, onAdd }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [time, setTime] = useState('09:00')
  if (!open) return <button onClick={() => setOpen(true)} className="mt-4 w-full rounded-2xl border border-dashed border-white/15 py-2.5 text-caption text-text-secondary hover:border-accent-primary/40">＋ {t('plAddReminder')}</button>
  return (
    <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
      <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t('plReminderName')}
        className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary focus:border-accent-primary/50 focus:outline-none" />
      <Button size="md" onClick={() => { if (label.trim()) { onAdd({ emoji: '🔔', label: label.trim(), time, type: 'custom' }); setLabel(''); setOpen(false) } }}>{t('plAdd')}</Button>
    </div>
  )
}
