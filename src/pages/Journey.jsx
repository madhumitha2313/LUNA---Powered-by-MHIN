import { useMemo, useState } from 'react'
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
import { totalXP, wellnessLevel, badges, aiReflection, todaysEncouragement, aiLetter, monthlyStory } from '../lib/journeyStory'
import MiraAvatar from '../components/MiraAvatar'

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
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' }
}
function fill(t, key, vars = {}) {
  let s = t(key)
  Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
  return s
}

export default function Journey() {
  const { t } = useT()
  const profile = getProfile()
  const { done, next, stats } = useMemo(() => journeyMilestones(), [])
  const xp = useMemo(() => totalXP(), [])
  const level = useMemo(() => wellnessLevel(xp), [xp])
  const badgeList = useMemo(() => badges(), [])
  const reflection = useMemo(() => aiReflection(), [])
  const letter = useMemo(() => aiLetter(), [])
  const story = useMemo(() => monthlyStory(), [])
  const [shared, setShared] = useState(false)
  const [showLetter, setShowLetter] = useState(false)
  const [showStory, setShowStory] = useState(false)
  const earned = badgeList.filter((b) => b.earned)

  async function share() {
    const name = profile.name || 'I'
    const summary = `${name}'s MIRA Health Journey — ${t(level.key)} (Level ${level.n}), ${xp} XP, ${earned.length} badges. 🌸`
    try {
      if (navigator.share) await navigator.share({ title: 'My MIRA Health Journey', text: summary })
      else { await navigator.clipboard.writeText(summary); setShared(true); setTimeout(() => setShared(false), 2000) }
    } catch { /* cancelled */ }
  }

  return (
    <PageShell max="max-w-3xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('jmBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('jrTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('jrSub')}</p>
      </div>

      {/* Wellness level hero with evolving avatar */}
      <Card className="mt-6 overflow-hidden bg-gradient-to-br from-[#d97ba8]/[0.16] via-[#a78bfa]/[0.08] to-transparent">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <MiraAvatar state="idle" emotion="happy" size={96} level={level.n} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-caption uppercase tracking-wide text-text-muted">{t('jrLevelLabel')} {level.n}</p>
            <h2 className="font-heading text-2xl font-semibold">{level.emoji} {t(level.key)}</h2>
            <div className="mt-3 flex items-center gap-2">
              <span className="font-stat text-sm text-text-secondary">{xp} XP</span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-white/[0.08]">
                <div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-700" style={{ width: `${level.pct}%` }} />
              </div>
            </div>
            <p className="mt-1.5 text-caption text-text-muted">{level.next ? fill(t, 'jrToNext', { x: `${level.toNext} XP · ${t(level.next.key)}` }) : t('jrMaxLevel')}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-end">
          <Button size="sm" variant="secondary" onClick={() => setShowStory(true)} disabled={!story.hasData}>🎁 {fill(t, 'jrOpenStory', { x: story.monthName })}</Button>
          <Button size="sm" variant="secondary" onClick={share}>{shared ? `✓ ${t('jmCopied')}` : `↗ ${t('jmShare')}`}</Button>
        </div>
      </Card>

      {/* AI reflection + encouragement */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Card className="bg-accent-ai/[0.05]">
          <div className="flex items-center gap-2"><span className="text-lg">✨</span><h3 className="font-heading font-semibold">{t('jrReflection')}</h3></div>
          <p className="mt-2 text-[0.92rem] leading-relaxed text-text-secondary">{fill(t, reflection.key, reflection.vars)}</p>
        </Card>
        <Card className="flex flex-col justify-center bg-gradient-to-br from-[#a78bfa]/[0.12] to-transparent text-center">
          <p className="text-caption uppercase tracking-wide text-accent-secondary">{t('jrEncourage')}</p>
          <p className="mt-2 font-heading text-lg font-medium leading-snug">“{t(todaysEncouragement())}”</p>
        </Card>
      </div>

      {/* AI letter */}
      <button onClick={() => letter.unlocked && setShowLetter(true)} disabled={!letter.unlocked}
        className={`mt-4 flex w-full items-center gap-4 rounded-3xl border p-5 text-left transition ${letter.unlocked ? 'border-accent-primary/30 bg-gradient-to-r from-[#d97ba8]/[0.12] to-transparent hover:border-accent-primary/60 hover:shadow-glow' : 'border-white/[0.06] bg-white/[0.02] opacity-70'}`}>
        <span className="text-3xl">💌</span>
        <div className="flex-1">
          <h3 className="font-heading font-semibold">{t('jrLetter')}</h3>
          <p className="text-caption text-text-secondary">{letter.unlocked ? t('jrReadLetter') : t('jrLetterLocked')}</p>
        </div>
        {letter.unlocked && <ArrowRightIcon size={18} className="text-accent-primary" />}
      </button>

      {/* Achievement badges */}
      <div className="mb-3 mt-8 flex items-center gap-2">
        <span className="text-lg">🏅</span><h2 className="font-heading text-lg font-semibold">{t('jrBadges')}</h2>
        <Badge tone="success" className="ml-auto">{fill(t, 'jrBadgesEarned', { x: earned.length })}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {badgeList.map((b) => (
          <div key={b.id} className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${b.earned ? 'border-accent-primary/30 bg-accent-primary/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <span className={`text-3xl ${b.earned ? '' : 'opacity-30 grayscale'}`}>{b.emoji}</span>
            <span className={`text-[0.72rem] leading-tight ${b.earned ? 'text-text-secondary' : 'text-text-muted'}`}>{t(b.key)}</span>
            {!b.earned && <span className="text-[0.6rem] text-text-muted">🔒 {t('jrLocked')}</span>}
          </div>
        ))}
      </div>

      {/* Next milestone */}
      {next && (
        <Card className="mt-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl opacity-70">{next.emoji}</span>
            <div className="flex-1"><p className="text-caption text-text-muted">{t('jmNext')}</p><p className="font-heading font-semibold">{t('jmT_' + next.id)}</p></div>
            <span className="font-stat text-sm text-text-secondary">{next.progress}/{next.goal}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-pill bg-white/[0.08]"><div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500" style={{ width: `${Math.min(100, (next.progress / next.goal) * 100)}%` }} /></div>
        </Card>
      )}

      {/* Milestone timeline */}
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
                  {meta.why && <p className="mt-2 flex items-start gap-2 rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.06] p-3 text-[0.85rem] text-text-secondary"><span>💡</span> {meta.why}</p>}
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

      {showLetter && (
        <Modal onClose={() => setShowLetter(false)}>
          <div className="text-center"><span className="text-4xl">💌</span><h3 className="mt-2 font-heading text-xl font-semibold">{t('jrLetter')}</h3></div>
          <p className="mt-4 whitespace-pre-line text-[0.95rem] leading-relaxed text-text-secondary">{fill(t, 'jrLetterBody', letter.vars)}</p>
          <div className="mt-5 flex justify-end"><Button size="md" onClick={() => setShowLetter(false)}>{t('learnDone')}</Button></div>
        </Modal>
      )}

      {showStory && <MonthlyStory t={t} story={story} onClose={() => setShowStory(false)} />}

      <BottomNav />
    </PageShell>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

/** Spotify-Wrapped-style month story: a few swipeable cards. */
function MonthlyStory({ t, story, onClose }) {
  const EMO = { happy: '😊', calm: '😌', loved: '🥰', excited: '🤩', tired: '😴', sad: '😔', anxious: '😰', neutral: '😐' }
  const slides = [
    { bg: 'from-[#d97ba8] to-[#a78bfa]', big: '🎁', title: t('msTitle').replace('{x}', story.monthName), sub: t('msIntro') },
    { bg: 'from-[#a78bfa] to-[#6ee7b7]', big: story.topMood ? (EMO[story.topMood] || '💗') : '💗', title: t('msMostMood'), sub: story.topMood ? t(`emo_${story.topMood}`) : '—' },
    { bg: 'from-[#6ee7b7] to-[#d97ba8]', big: '💧', title: t('msHydration'), sub: `${story.water} ${t('nuGlasses')}` },
    { bg: 'from-[#fbbf24] to-[#d97ba8]', big: '🏅', title: t('msBadges'), sub: `${story.badges}` },
    { bg: 'from-[#d97ba8] to-[#a78bfa]', big: '💖', title: t('msReflectionTitle'), sub: t('msReflection') },
  ]
  const [i, setI] = useState(0)
  const s = slides[i]
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className={`relative flex aspect-[9/16] max-h-[85vh] w-full max-w-sm flex-col items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br ${s.bg} p-8 text-center`} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-white/80 hover:text-white">✕</button>
        <div className="flex gap-1.5 absolute top-4 left-4 right-12">
          {slides.map((_, n) => <span key={n} className={`h-1 flex-1 rounded-full ${n <= i ? 'bg-white' : 'bg-white/30'}`} />)}
        </div>
        <div className="text-7xl drop-shadow-lg">{s.big}</div>
        <h3 className="mt-6 font-heading text-2xl font-bold text-white">{s.title}</h3>
        <p className="mt-2 text-lg font-medium text-white/90">{s.sub}</p>
        <div className="absolute inset-x-8 bottom-8 flex justify-between">
          <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="rounded-pill bg-white/20 px-4 py-2 text-sm text-white disabled:opacity-30">←</button>
          {i < slides.length - 1
            ? <button onClick={() => setI((v) => v + 1)} className="rounded-pill bg-white px-5 py-2 text-sm font-semibold text-[#d97ba8]">{t('msNext')} →</button>
            : <button onClick={onClose} className="rounded-pill bg-white px-5 py-2 text-sm font-semibold text-[#d97ba8]">{t('msClose')}</button>}
        </div>
      </div>
    </div>
  )
}
