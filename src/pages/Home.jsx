import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import VoiceOrb from '../components/voice/VoiceOrb'
import {
  MicIcon,
  FileIcon,
  TrendIcon,
  StethoscopeIcon,
  UsersIcon,
  SparklesIcon,
  ArrowRightIcon,
  MoonIcon,
} from '../components/ui/icons'
import { getCurrentUser } from '../lib/auth'
import { getRecentLogs } from '../lib/logs'

function greeting(h = new Date().getHours()) {
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const QUICK_ACTIONS = [
  { label: 'Talk', to: '/voice', icon: MicIcon, tone: 'text-accent-secondary' },
  { label: 'Reports', to: '/voice', icon: FileIcon, tone: 'text-accent-ai' },
  { label: 'Timeline', to: '/voice', icon: TrendIcon, tone: 'text-success' },
  { label: 'Doctor Summary', to: '/voice', icon: StethoscopeIcon, tone: 'text-accent-secondary' },
  { label: 'Community', to: '/voice', icon: UsersIcon, tone: 'text-accent-ai' },
]

/**
 * Phase 3 — Home dashboard. Real data via getRecentLogs under the user's
 * session; honest empty states when there's no session/data (e.g. the static
 * preview). No fabricated values.
 */
export default function Home() {
  const [user, setUser] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    ;(async () => {
      const u = await getCurrentUser()
      if (!alive) return
      setUser(u)
      const recent = u ? await getRecentLogs(u.$id, 7) : []
      if (!alive) return
      setLogs(recent)
      setLoading(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  const name = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-28 sm:px-8">
        {/* Greeting */}
        <div className="flex items-center gap-2 animate-fade-up delay-0">
          <MoonIcon size={22} className="text-accent-secondary" />
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
            {greeting()}, {name}
          </h1>
        </div>
        <p className="mt-2 text-text-secondary animate-fade-up delay-1">
          How are you feeling today?
        </p>

        {/* Central mic hub */}
        <Card className="mt-8 flex flex-col items-center gap-6 bg-bg-secondary/40 py-12 animate-fade-up delay-2">
          <VoiceOrb state="idle" onClick={() => {}} className="scale-90" />
          <Link to="/voice">
            <Badge tone="accent" icon={<MicIcon size={14} />} className="cursor-pointer">
              Tap to talk to Luna
            </Badge>
          </Link>
        </Card>

        {/* Today's insight + recent timeline */}
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2 animate-fade-up delay-3">
            <div className="mb-4 flex items-center gap-2">
              <SparklesIcon size={18} className="text-accent-ai" />
              <h2 className="font-heading text-lg font-semibold">Today's Insight</h2>
            </div>
            {loading ? (
              <SkeletonLines />
            ) : logs.length === 0 ? (
              <EmptyState
                title="No insights yet"
                body="Log your first check-in with Luna and your personalised insight will appear here — generated from your own data, never a template."
              />
            ) : (
              <p className="text-text-secondary">
                {logs.length} recent check-in{logs.length > 1 ? 's' : ''} logged. Open your
                timeline to see trends across cycles.
              </p>
            )}
          </Card>

          <Card className="animate-fade-up delay-4">
            <h2 className="mb-4 font-heading text-lg font-semibold">Recent</h2>
            {loading ? (
              <SkeletonLines rows={3} />
            ) : logs.length === 0 ? (
              <EmptyState compact title="Nothing logged yet" body="Your recent check-ins will show here." />
            ) : (
              <ul className="space-y-3">
                {logs.slice(0, 5).map((l) => (
                  <li key={l.$id} className="flex items-center justify-between text-caption">
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
              <Link key={a.label} to={a.to}>
                <Card hover className={`flex flex-col items-center gap-3 py-6 text-center animate-fade-up delay-${Math.min(i, 5)}`}>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${a.tone}`}>
                    <a.icon size={22} />
                  </span>
                  <span className="text-caption text-text-secondary">{a.label}</span>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {!user && (
          <p className="mt-10 flex items-center justify-center gap-2 text-caption text-text-muted">
            <span>Sign-in & live data activate once Appwrite keys are configured.</span>
            <Link to="/" className="inline-flex items-center gap-1 text-accent-secondary hover:underline">
              About LUNA <ArrowRightIcon size={13} />
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
    <div className={compact ? '' : 'py-4'}>
      <p className="font-medium text-text-primary">{title}</p>
      <p className="mt-1 text-caption text-text-secondary">{body}</p>
    </div>
  )
}

function SkeletonLines({ rows = 2 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-3 w-full animate-pulse rounded-pill bg-white/[0.06]" style={{ width: `${90 - i * 15}%` }} />
      ))}
    </div>
  )
}
