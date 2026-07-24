import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import DashboardTour from '../components/DashboardTour'
import CycleGuideIntro, { shouldShowCycleGuide } from '../components/CycleGuideIntro'
import Card from '../components/ui/Card'
import {
  MicIcon,
  HeartIcon,
  FileIcon,
  SparklesIcon,
  UsersIcon,
  TrendIcon,
  LeafIcon,
  ArrowRightIcon,
  MoonIcon,
} from '../components/ui/icons'
import { getCurrentUser } from '../lib/auth'
import { currentUser } from '../lib/authStore'
import { getRecentLogs } from '../lib/logs'
import { isAppwriteDataConfigured } from '../lib/config'
import { getLogs as getLocalLogs, getCycleStats, getProfile, addLog } from '../lib/localStore'
import { useT } from '../lib/i18n.jsx'

function greetingKey(h = new Date().getHours()) {
  if (h < 12) return 'greetMorning'
  if (h < 17) return 'greetAfternoon'
  return 'greetEvening'
}

const PHASE_KEY = {
  menstrual: 'phaseMenstrualFull',
  follicular: 'phaseFollicularFull',
  ovulation: 'phaseOvulationFull',
  luteal: 'phaseLutealFull',
}
const PHASE_MSG = {
  menstrual: 'phaseMsgMenstrual',
  follicular: 'phaseMsgFollicular',
  ovulation: 'phaseMsgOvulation',
  luteal: 'phaseMsgLuteal',
}
const ENERGY = { menstrual: 'energyLow', follicular: 'energyHigh', ovulation: 'energyHigh', luteal: 'energyMid' }

// 8 quick actions — horizontally scrollable.
const QUICK_ACTIONS = [
  { key: 'qaTalk', to: '/voice', icon: MicIcon, tone: 'text-accent-secondary', emoji: '🎤' },
  { key: 'qaLogSym', to: '/symptoms', icon: SparklesIcon, tone: 'text-accent-ai', emoji: '🩸' },
  { key: 'qaMood', to: '/mood', icon: HeartIcon, tone: 'text-accent-primary', emoji: '😊' },
  { key: 'qaWater', to: '/nutrition', icon: LeafIcon, tone: 'text-accent-secondary', emoji: '💧' },
  { key: 'qaFood', to: '/nutrition', icon: LeafIcon, tone: 'text-success', emoji: '🥗' },
  { key: 'qaUpload', to: '/report', icon: FileIcon, tone: 'text-success', emoji: '📄' },
  { key: 'qaWellness', to: '/planner', icon: UsersIcon, tone: 'text-accent-ai', emoji: '🧘' },
  { key: 'qaCalendar', to: '/cycle', icon: TrendIcon, tone: 'text-accent-secondary', emoji: '📅' },
  { key: 'qaSafety', to: '/safety', icon: HeartIcon, tone: 'text-danger', emoji: '🛡️' },
]

const MOODS = [
  { key: 'moodHappy', emoji: '😊', val: 'happy' },
  { key: 'moodCalm', emoji: '😌', val: 'calm' },
  { key: 'moodTired', emoji: '😴', val: 'tired' },
  { key: 'moodSad', emoji: '😢', val: 'sad' },
  { key: 'moodAnxious', emoji: '😰', val: 'anxious' },
  { key: 'moodEmotional', emoji: '😭', val: 'emotional' },
]

// Phase-aware daily recommendation cards (title/body are i18n keys).
const RECS = {
  menstrual: [
    { emoji: '🛌', t: 'recRestT', b: 'recRestB' },
    { emoji: '🥬', t: 'recIronT', b: 'recIronB' },
    { emoji: '🫖', t: 'recWarmT', b: 'recWarmB' },
  ],
  follicular: [
    { emoji: '🏃‍♀️', t: 'recMoveT', b: 'recMoveB' },
    { emoji: '💧', t: 'recHydrateT', b: 'recHydrateB' },
    { emoji: '🥗', t: 'recFreshT', b: 'recFreshB' },
  ],
  ovulation: [
    { emoji: '💧', t: 'recHydrateT', b: 'recHydrateB' },
    { emoji: '🏃‍♀️', t: 'recMoveT', b: 'recMoveB' },
    { emoji: '🧘‍♀️', t: 'recBreatheT', b: 'recBreatheB' },
  ],
  luteal: [
    { emoji: '🧘‍♀️', t: 'recBreatheT', b: 'recBreatheB' },
    { emoji: '🍫', t: 'recComfortT', b: 'recComfortB' },
    { emoji: '💧', t: 'recHydrateT', b: 'recHydrateB' },
  ],
}

function healthScore(stats, latest) {
  let s = 72
  if (latest && (Date.now() - new Date(latest.date)) < 2 * 864e5) s += 6
  if (stats.regularity === 'regular') s += 5
  if (latest?.pain != null && latest.pain >= 7) s -= 12
  if (latest?.mood && ['sad', 'anxious', 'emotional'].includes(latest.mood)) s -= 5
  return Math.max(45, Math.min(98, s))
}
function isFertile(stats) {
  if (stats.phase === 'ovulation') return true
  if (stats.daysUntilNext != null) return stats.daysUntilNext >= 12 && stats.daysUntilNext <= 16
  return false
}

export default function Home() {
  const { t } = useT()
  const [user, setUser] = useState(() => currentUser())
  const [logs, setLogs] = useState([])
  const [savedInsight, setSavedInsight] = useState(false)
  const [moodSaved, setMoodSaved] = useState(false)
  const [guideDone, setGuideDone] = useState(() => !shouldShowCycleGuide())
  const stats = getCycleStats()
  const profile = getProfile()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const u = await getCurrentUser()
      if (!alive) return
      setUser(u || currentUser())
      const recent = isAppwriteDataConfigured && u ? await getRecentLogs(u.$id, 7) : getLocalLogs().slice(0, 7)
      if (!alive) return
      setLogs(recent)
    })()
    return () => {
      alive = false
    }
  }, [])

  const name = (user?.name || profile.name || 'there').split(' ')[0]
  const latest = logs[0]
  const phase = stats.phase || null
  const score = healthScore(stats, latest)
  const fertile = isFertile(stats)

  const insightKey = latest?.pain != null && latest.pain >= 5
    ? 'insightPain'
    : phase
      ? { menstrual: 'insightMenstrual', follicular: 'insightFollicular', ovulation: 'insightOvulation', luteal: 'insightLuteal' }[phase]
      : 'insightNoData'

  // Data-derived "Mira Remembers" cards.
  const memories = []
  if (stats.avgCycleLength) memories.push(`${t('memAvgPre')} ${stats.avgCycleLength} ${t('daysLower')}.`)
  if (stats.regularity) memories.push(`${t('memRegularPre')} ${t(regKey(stats.regularity))}.`)
  if (latest?.mood) memories.push(`${t('memMoodPre')} ${latest.mood}.`)
  if (memories.length < 3) memories.push(t('memFirst'))

  const recs = RECS[phase] || RECS.follicular

  function logMood(val) {
    addLog({ mood: val, source: 'mood-snapshot' })
    setMoodSaved(true)
    setLogs(getLocalLogs().slice(0, 7))
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {guideDone ? <DashboardTour /> : <CycleGuideIntro onClose={() => setGuideDone(true)} />}
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-32 pt-28 sm:px-8">
        {/* Greeting + dynamic phase message */}
        <div className="flex items-center gap-2 animate-fade-up delay-0">
          <MoonIcon size={22} className="text-accent-secondary" />
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {t(greetingKey())}, {name} <span className="text-accent-primary">🌸</span>
          </h1>
        </div>
        <p className="mt-2 text-text-secondary animate-fade-up delay-1">
          {phase ? t(PHASE_MSG[phase]) : t('phaseMsgNoData')}
        </p>

        {/* TODAY'S HEALTH — hero card */}
        <div className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#FF4F9D]/[0.14] via-[#A855F7]/[0.06] to-transparent p-6 animate-fade-up delay-2 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">{t('todayHealth')}</h2>
            <Link to="/cycle" className="text-caption text-accent-secondary hover:underline">
              {t('seeAll')} <ArrowRightIcon size={12} className="inline" />
            </Link>
          </div>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            {/* Health score ring */}
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="44" fill="none" stroke="url(#hs)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - score / 100)}
                />
                <defs>
                  <linearGradient id="hs" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FF8FC0" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="font-stat text-3xl font-bold text-text-primary">{score}</p>
                <p className="text-[10px] uppercase tracking-wide text-text-muted">{t('healthScore')}</p>
              </div>
            </div>
            {/* Stat grid */}
            <div className="grid flex-1 grid-cols-2 gap-3">
              <Stat label={t('cycleDayLabel')} value={stats.cycleDay ?? '—'} sub={phase ? t(PHASE_KEY[phase]) : t('logToBegin')} />
              <Stat
                label={t('nextPeriod')}
                value={stats.daysUntilNext != null ? `${Math.max(stats.daysUntilNext, 0)}${t('dShort')}` : '—'}
                sub={t('avgWord') + ' ' + (stats.avgCycleLength || '—') + t('dShort')}
              />
              <Stat label={t('ovulationLabel')} value={fertile ? '🌱' : '—'} sub={fertile ? t('ovFertile') : t('ovNot')} />
              <Stat label={t('energyLabel')} value={<EnergyDots level={phase ? ENERGY[phase] : 'energyMid'} />} sub={t(phase ? ENERGY[phase] : 'energyMid')} />
            </div>
          </div>
        </div>

        {/* Talk to Mira CTA */}
        <Card hover as={Link} to="/voice" className="mt-6 flex items-center gap-4 bg-bg-secondary/40 animate-fade-up delay-2">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7BB5] to-[#FF2E8A] text-white shadow-[0_0_20px_rgba(255,79,157,0.45)]">
            <MicIcon size={22} />
          </span>
          <div>
            <p className="font-heading font-semibold">{t('navTalk')}</p>
            <p className="text-caption text-text-secondary">{t('tapToTalk')}</p>
          </div>
          <ArrowRightIcon size={18} className="ml-auto text-text-muted" />
        </Card>

        {/* QUICK ACTIONS — horizontal scroll */}
        <h2 className="mb-3 mt-8 font-heading text-lg font-semibold animate-fade-up delay-3">{t('quickActions')}</h2>
        <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          {QUICK_ACTIONS.map((a) => {
            const inner = (
              <>
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-caption text-text-secondary">{t(a.key)}</span>
              </>
            )
            const cls = 'flex min-w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-4 text-center transition-all duration-250 hover:border-accent-primary/40 hover:bg-accent-primary/[0.06] active:scale-95'
            return a.scroll ? (
              <button key={a.key} onClick={() => document.getElementById(a.scroll)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className={cls}>
                {inner}
              </button>
            ) : (
              <Link key={a.key} to={a.to} className={cls}>
                {inner}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {/* Today's AI Insight */}
          <Card className="animate-fade-up delay-3">
            <div className="mb-3 flex items-center gap-2">
              <SparklesIcon size={18} className="text-accent-ai" />
              <h2 className="font-heading text-lg font-semibold">{t('todayInsight')}</h2>
            </div>
            <p className="text-[0.95rem] leading-relaxed text-text-secondary">{t(insightKey)}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setSavedInsight((v) => !v)}
                className={`rounded-pill border px-4 py-1.5 text-caption transition-colors ${
                  savedInsight ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-secondary' : 'border-white/15 text-text-secondary hover:border-white/30'
                }`}
              >
                {savedInsight ? `✓ ${t('insightSaved')}` : t('insightSave')}
              </button>
              <Link to="/voice" className="rounded-pill border border-white/15 px-4 py-1.5 text-caption text-text-secondary hover:border-white/30">
                {t('insightAsk')}
              </Link>
            </div>
          </Card>

          {/* Mood snapshot */}
          <Card id="mood-card" className="animate-fade-up delay-4">
            <h2 className="mb-3 font-heading text-lg font-semibold">{t('moodTitle')}</h2>
            <div className="grid grid-cols-3 gap-2.5">
              {MOODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => logMood(m.val)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.02] py-3 transition-all duration-250 hover:border-accent-primary/40 hover:bg-accent-primary/[0.06] active:scale-95"
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-[0.8rem] text-text-secondary">{t(m.key)}</span>
                </button>
              ))}
            </div>
            {moodSaved && <p className="mt-3 text-caption text-success">{t('moodSaved')}</p>}
          </Card>
        </div>

        {/* MIRA Remembers */}
        <h2 className="mb-3 mt-8 flex items-center gap-2 font-heading text-lg font-semibold animate-fade-up delay-4">
          <SparklesIcon size={18} className="text-accent-secondary" /> {t('miraRemembers')}
          <Link to="/mira" className="ml-auto text-caption font-normal text-accent-secondary hover:underline">🧠 {t('coOpenBrain')} <ArrowRightIcon size={12} className="inline" /></Link>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {memories.slice(0, 3).map((m, i) => (
            <Card key={i} className="bg-bg-secondary/40">
              <p className="text-[0.95rem] leading-relaxed text-text-secondary">{m}</p>
            </Card>
          ))}
        </div>

        {/* Daily recommendations */}
        <h2 className="mb-3 mt-8 font-heading text-lg font-semibold animate-fade-up delay-5">{t('dailyRecs')}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {recs.map((r) => (
            <Card key={r.t} hover as={Link} to="/guide" className="flex items-start gap-3">
              <span className="text-2xl">{r.emoji}</span>
              <div>
                <p className="font-heading font-semibold">{t(r.t)}</p>
                <p className="mt-1 text-caption text-text-secondary">{t(r.b)}</p>
              </div>
            </Card>
          ))}
        </div>

        {!user && (
          <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-caption text-text-muted">
            <span>{t('signInSync')}</span>
            <Link to="/login" className="inline-flex items-center gap-1 text-accent-secondary hover:underline">
              {t('navLogin')} <ArrowRightIcon size={13} />
            </Link>
          </p>
        )}
      </main>
      <BottomNav />
    </div>
  )
}

function regKey(r) {
  if (r === 'regular') return 'regRegular'
  if (r === 'slightly irregular') return 'regSlightly'
  return 'regIrregular'
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-caption text-text-muted">{label}</p>
      <p className="mt-0.5 font-stat text-xl font-bold text-text-primary">{value}</p>
      <p className="text-[0.72rem] text-text-secondary">{sub}</p>
    </div>
  )
}

function EnergyDots({ level }) {
  const n = level === 'energyHigh' ? 3 : level === 'energyMid' ? 2 : 1
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < n ? 'bg-accent-primary' : 'bg-white/15'}`} />
      ))}
    </span>
  )
}
