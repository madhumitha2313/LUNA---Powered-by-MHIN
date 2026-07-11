import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile } from '../lib/localStore'
import { journeyMilestones } from '../lib/cycleIntel'

// Milestone celebration copy. Titles come from i18n (jmT_*); the warm message
// and the "why it matters" line are curated here, matching how the app keeps
// longer written content in the shared learning language.
const META = {
  firstCycle: { emoji: '🌸', msg: 'You logged your very first cycle. This is where MIRA starts learning your unique rhythm.', why: 'Every prediction MIRA makes grows from this first data point.' },
  firstCheckin: { emoji: '😊', msg: 'Your first daily check-in is done. Small, honest notes today become powerful insights tomorrow.', why: 'Check-ins teach MIRA how your body and mood move through the month.' },
  hydration: { emoji: '💧', msg: 'You reached 8 glasses of water in a day. Your body — and your skin — will thank you.', why: 'Good hydration eases bloating, headaches and fatigue around your period.' },
  meditation: { emoji: '🧘', msg: 'You took a moment to breathe and reset. That matters more than it looks.', why: 'Calming your nervous system helps balance hormones and mood.' },
  streak7: { emoji: '🔥', msg: 'Seven days of showing up for yourself. Consistency like this is real self-care.', why: 'Regular logging sharpens MIRA’s predictions and reveals your patterns.' },
  moodUp: { emoji: '💖', msg: 'Your mood has been trending up. Look how far you’ve come.', why: 'Noticing upward trends helps you repeat what’s working for you.' },
  regular: { emoji: '📈', msg: 'Your cycle has settled into a steady rhythm — a wonderful sign of balance.', why: 'A regular cycle makes period and ovulation predictions far more accurate.' },
  healthy30: { emoji: '🏆', msg: '30 days of caring for your health with MIRA. This is a genuine milestone.', why: 'A full month of data lets MIRA understand your whole cycle.' },
  journey100: { emoji: '🎉', msg: '100 days together. This is your health story, and it’s beautiful.', why: 'Long-term tracking is how the deepest, most personal insights emerge.' },
}

function fmt(iso) {
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return '' }
}

export default function Journey() {
  const { t } = useT()
  const profile = getProfile()
  const { done, next, stats } = useMemo(() => journeyMilestones(), [])
  const [shared, setShared] = useState(false)
  const latest = done[0]

  async function share() {
    const name = profile.name || 'I'
    const summary = `${name}'s MIRA Health Journey — ${stats.checkins} check-ins, best streak ${stats.streak} days, ${done.length} wellness badges. 🌸`
    try {
      if (navigator.share) await navigator.share({ title: 'My MIRA Health Journey', text: summary })
      else { await navigator.clipboard.writeText(summary); setShared(true); setTimeout(() => setShared(false), 2000) }
    } catch { /* user cancelled */ }
  }

  return (
    <PageShell max="max-w-3xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('jmBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('jmTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('jmSub')}</p>
      </div>

      {/* Shareable Health Journey card */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#d97ba8]/25 via-[#a78bfa]/15 to-[#1e2433] p-6 shadow-glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-accent-secondary">{t('jmCardTitle')}</p>
            <h2 className="mt-1 font-heading text-2xl font-semibold">{profile.name ? `${profile.name}` : t('jmYou')}</h2>
          </div>
          <span className="text-4xl">{latest ? latest.emoji : '🌸'}</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <JStat value={stats.checkins} label={t('jmCheckins')} />
          <JStat value={`${stats.streak}🔥`} label={t('jmStreak')} />
          <JStat value={done.length} label={t('jmBadges')} />
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-caption text-text-secondary">{latest ? `${t('jmLatest')}: ${t('jmT_' + latest.id)}` : t('jmStart')}</p>
          <Button size="sm" variant="secondary" onClick={share}>{shared ? `✓ ${t('jmCopied')}` : `↗ ${t('jmShare')}`}</Button>
        </div>
      </div>

      {/* Next milestone */}
      {next && (
        <Card className="mt-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-70">{next.emoji}</span>
            <div className="flex-1">
              <p className="text-caption text-text-muted">{t('jmNext')}</p>
              <p className="font-heading font-semibold">{t('jmT_' + next.id)}</p>
            </div>
            <span className="font-stat text-sm text-text-secondary">{next.progress}/{next.goal}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-pill bg-white/[0.08]">
            <div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500" style={{ width: `${Math.min(100, (next.progress / next.goal) * 100)}%` }} />
          </div>
        </Card>
      )}

      {/* Timeline */}
      <h2 className="mb-4 mt-8 font-heading text-lg font-semibold">{t('jmTimeline')}</h2>
      {done.length > 0 ? (
        <ol className="relative ml-3 border-l-2 border-white/10">
          {done.map((m, i) => {
            const meta = META[m.id] || {}
            return (
              <li key={m.id} className="mb-6 ml-6 animate-fade-up" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="absolute -left-[1.15rem] grid h-9 w-9 place-items-center rounded-full bg-bg-card ring-2 ring-accent-primary/40 text-lg">{meta.emoji || m.emoji}</span>
                <Card className="bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading font-semibold">{t('jmT_' + m.id)}</h3>
                    <Badge tone="ai">{fmt(m.date)}</Badge>
                  </div>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-text-secondary">{meta.msg}</p>
                  {meta.why && (
                    <p className="mt-2 flex items-start gap-2 rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.06] p-3 text-[0.85rem] text-text-secondary">
                      <span>💡</span> {meta.why}
                    </p>
                  )}
                </Card>
              </li>
            )
          })}
        </ol>
      ) : (
        <Card className="text-center">
          <p className="text-text-secondary">{t('jmEmpty')}</p>
          <Button as={Link} to="/cycle" size="md" className="mt-4">💗 {t('ciLogToday')} <ArrowRightIcon size={16} /></Button>
        </Card>
      )}

      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

function JStat({ value, label }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-[0.7rem] text-text-muted">{label}</p>
    </div>
  )
}
