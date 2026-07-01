import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import VoiceOrb from '../components/voice/VoiceOrb'
import {
  MicIcon,
  HeartIcon,
  TrendIcon,
  SparklesIcon,
  UsersIcon,
  ArrowRightIcon,
  MoonIcon,
} from '../components/ui/icons'
import { getCurrentUser } from '../lib/auth'
import { getRecentLogs } from '../lib/logs'
import { isAppwriteConfigured } from '../lib/config'
import { getLogs as getLocalLogs, getCycleStats } from '../lib/localStore'

function greeting(h = new Date().getHours()) {
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const PHASE_LABEL = {
  menstrual: 'Menstrual phase',
  follicular: 'Follicular phase',
  ovulation: 'Ovulation window',
  luteal: 'Luteal phase',
}

const QUICK_ACTIONS = [
  { label: 'Talk', to: '/voice', icon: MicIcon, tone: 'text-accent-secondary' },
  { label: 'Cycle Tracker', to: '/tracker', icon: HeartIcon, tone: 'text-accent-primary' },
  { label: 'PCOS / PCOD', to: '/symptoms', icon: SparklesIcon, tone: 'text-accent-ai' },
  { label: 'Features', to: '/features', icon: TrendIcon, tone: 'text-success' },
  { label: 'Community', to: '/how-it-works', icon: UsersIcon, tone: 'text-accent-ai' },
]

export default function Home() {
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const stats = getCycleStats()

  useEffect(() => {
    let alive = true
    ;(async () => {
      const u = await getCurrentUser()
      if (!alive) return
      setUser(u)
      // Real data: Appwrite when configured, else the browser-local check-ins.
      const recent = isAppwriteConfigured && u ? await getRecentLogs(u.$id, 7) : getLocalLogs().slice(0, 7)
      if (!alive) return
      setLogs(recent)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const name = user?.name?.split(' ')[0] || 'there'
  const latest = logs[0]

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        <div className="flex items-center gap-2 animate-fade-up delay-0">
          <MoonIcon size={22} className="text-accent-secondary" />
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {greeting()}, {name}
          </h1>
        </div>
        <p className="mt-2 text-text-secondary animate-fade-up delay-1">How are you feeling today?</p>

        {/* Mic hub */}
        <Card className="mt-8 flex flex-col items-center gap-6 bg-bg-secondary/40 py-12 animate-fade-up delay-2">
          <VoiceOrb state="idle" onClick={() => {}} className="scale-90" />
          <Link to="/voice">
            <Badge tone="accent" icon={<MicIcon size={14} />} className="cursor-pointer">
              Tap to talk to Luna
            </Badge>
          </Link>
        </Card>

        {/* Cycle + insight + recent */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {/* Cycle snapshot */}
          <Card hover as={Link} to="/tracker" className="animate-fade-up delay-3">
            <div className="mb-4 flex items-center gap-2">
              <HeartIcon size={18} className="text-accent-primary" />
              <h2 className="font-heading text-lg font-semibold">Cycle</h2>
            </div>
            {stats.cycleDay ? (
              <>
                <p className="font-stat text-3xl font-bold text-text-primary">Day {stats.cycleDay}</p>
                <p className="mt-1 text-caption text-accent-secondary">{PHASE_LABEL[stats.phase]}</p>
                <p className="mt-3 text-caption text-text-secondary">
                  Next period {stats.daysUntilNext >= 0 ? `in ${stats.daysUntilNext} days` : 'expected'} ·
                  avg {stats.avgCycleLength}d
                </p>
              </>
            ) : (
              <p className="text-caption text-text-secondary">
                Log your period start in the tracker to see your cycle day and next-period estimate.
              </p>
            )}
          </Card>

          {/* Today's insight */}
          <Card className="animate-fade-up delay-3">
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon size={18} className="text-accent-ai" />
              <h2 className="font-heading text-lg font-semibold">Today's Insight</h2>
            </div>
            {loading ? (
              <Skeleton />
            ) : latest ? (
              <p className="text-[0.95rem] text-text-secondary">
                Last check-in noted{' '}
                <span className="text-text-primary">
                  {[latest.flow, latest.pain != null ? `pain ${latest.pain}` : null, latest.mood]
                    .filter(Boolean)
                    .join(', ') || 'your update'}
                </span>
                . Keep logging to unlock trend insights across cycles.
              </p>
            ) : (
              <EmptyState
                title="No insights yet"
                body="Log your first check-in with Luna and your personalised insight appears here — from your own data."
              />
            )}
          </Card>

          {/* Recent */}
          <Card className="animate-fade-up delay-4">
            <h2 className="mb-4 font-heading text-lg font-semibold">Recent</h2>
            {loading ? (
              <Skeleton rows={3} />
            ) : logs.length === 0 ? (
              <EmptyState compact title="Nothing logged yet" body="Your recent check-ins will show here." />
            ) : (
              <ul className="space-y-3">
                {logs.slice(0, 5).map((l) => (
                  <li key={l.id || l.$id} className="flex items-center justify-between text-caption">
                    <span className="text-text-secondary">
                      {new Date(l.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-stat text-text-primary">
                      {[l.flow, l.pain != null ? `pain ${l.pain}` : null].filter(Boolean).join(' · ') || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Quick actions */}
        <div className="mt-8">
          <h2 className="mb-4 font-heading text-lg font-semibold animate-fade-up delay-4">Quick actions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {QUICK_ACTIONS.map((a, i) => (
              <Card
                key={a.label}
                hover
                as={Link}
                to={a.to}
                className={`flex flex-col items-center gap-3 py-6 text-center animate-fade-up delay-${Math.min(i, 5)}`}
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${a.tone}`}>
                  <a.icon size={22} />
                </span>
                <span className="text-caption text-text-secondary">{a.label}</span>
              </Card>
            ))}
          </div>
        </div>

        {!user && (
          <p className="mt-10 flex items-center justify-center gap-2 text-caption text-text-muted">
            <span>Sign in to sync across devices — or keep going, everything works right here.</span>
            <Link to="/login" className="inline-flex items-center gap-1 text-accent-secondary hover:underline">
              Log in <ArrowRightIcon size={13} />
            </Link>
          </p>
        )}
      </main>
      <Footer />
    </div>
  )
}

function EmptyState({ title, body, compact }) {
  return (
    <div className={compact ? '' : 'py-2'}>
      <p className="font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-caption text-text-secondary">{body}</p>
    </div>
  )
}

function Skeleton({ rows = 2 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 animate-pulse rounded-pill bg-white/[0.06]" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  )
}
