import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getLogs } from '../lib/localStore'
import {
  EMOTIONS, summarizeMood, recommendationsFor, symptomFood, moodSummary, moodStreak,
  moodInsights, affirmationOfDay, challengeOfDay, addGratitude,
} from '../lib/moodIntel'
import MoodCheckIn from '../components/MoodCheckIn'
import MoodRoom from '../components/MoodRoom'

const EMO = Object.fromEntries(EMOTIONS.map((e) => [e.id, e]))

function lastBucket() {
  const last = getLogs().find((l) => l.moods?.length || l.mood)
  return summarizeMood(last?.moods || (last?.mood ? [last.mood] : [])).bucket
}

export default function Mood() {
  const { t } = useT()
  const [tick, setTick] = useState(0)
  const [checkin, setCheckin] = useState(false)
  const [room, setRoom] = useState(false)

  const summary = useMemo(() => moodSummary(7), [tick])
  const streak = useMemo(() => moodStreak(), [tick])
  const insights = useMemo(() => moodInsights(), [tick])
  const bucket = useMemo(() => lastBucket(), [tick])
  const reco = useMemo(() => recommendationsFor(bucket), [bucket])
  const food = useMemo(() => [...symptomFood(), ...reco.food].slice(0, 4), [bucket, tick])
  const challenge = challengeOfDay()

  return (
    <PageShell max="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('moEngine')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('moHeading')}</h1>
          <p className="mt-2 max-w-lg text-text-secondary">{t('moGreeting')}</p>
        </div>
        <Button size="md" onClick={() => setCheckin(true)}>💗 {t('moCheckin')}</Button>
      </div>

      {/* This week emotional summary + affirmation */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Card className="bg-gradient-to-br from-[#d97ba8]/[0.14] via-[#a78bfa]/[0.08] to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h2 className="font-heading text-lg font-semibold">{t('moThisWeek')}</h2>
          </div>
          {summary.count > 0 ? (
            <>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <MiniStat value={summary.count} label={t('moLogged')} />
                <MiniStat value={summary.positivity != null ? `${summary.positivity}%` : '—'} label={t('moPositivity')} />
                <MiniStat value={`${streak}🔥`} label={t('moStreak')} />
              </div>
              {summary.top.length > 0 && (
                <div className="mt-4">
                  <p className="text-caption text-text-muted">{t('moTopMoods')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {summary.top.map((id) => EMO[id] && (
                      <span key={id} className="flex items-center gap-1.5 rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption">
                        <span className="text-base">{EMO[id].emoji}</span> {t(`emo_${id}`)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="mt-3 text-[0.9rem] text-text-secondary">{t('moEmpty')}</p>
          )}
        </Card>

        <Card className="flex flex-col justify-center bg-gradient-to-br from-[#a78bfa]/[0.14] to-transparent text-center">
          <p className="text-caption uppercase tracking-wide text-accent-secondary">{t('moAffirmation')}</p>
          <p className="mt-3 font-heading text-xl font-medium leading-snug">“{t(affirmationOfDay())}”</p>
        </Card>
      </div>

      {/* Mood insights */}
      {insights.length > 0 && (
        <Card className="mt-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">✨</span><h2 className="font-heading text-lg font-semibold">{t('moInsights')}</h2>
          </div>
          <ul className="mt-3 space-y-2.5">
            {insights.map((i, n) => (
              <li key={n} className="rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.06] p-3.5 text-[0.92rem] leading-relaxed text-text-secondary">{t(i.key)}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* Mood Room + challenge */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <button onClick={() => setRoom(true)} className="group flex items-center gap-4 overflow-hidden rounded-3xl border border-accent-ai/30 bg-gradient-to-r from-[#a78bfa]/[0.16] via-[#d97ba8]/[0.08] to-transparent p-5 text-left transition hover:border-accent-ai/60 hover:shadow-glow-ai">
          <span className="text-3xl transition-transform group-hover:scale-110">🕊️</span>
          <div><h3 className="font-heading font-semibold">{t('moRoomCta')}</h3><p className="text-caption text-text-secondary">{t('moRoomSub')}</p></div>
          <ArrowRightIcon size={18} className="ml-auto text-accent-ai transition group-hover:translate-x-1" />
        </button>
        <Card className="flex items-center gap-4 bg-white/[0.02]">
          <span className="text-3xl">{challenge.emoji}</span>
          <div className="min-w-0">
            <p className="text-caption uppercase tracking-wide text-text-muted">{t('moChallenge')}</p>
            <p className="font-heading font-semibold leading-tight">{t(challenge.key)}</p>
          </div>
        </Card>
      </div>

      {/* AI wellness recommendations */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">💚 {t('moWellness')}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {reco.wellness.map((a) => (
          <Card key={a.key} className="bg-white/[0.02]">
            <span className="text-3xl">{a.emoji}</span>
            <h3 className="mt-2 font-heading font-semibold">{t(a.key)}</h3>
            <p className="mt-1 text-caption text-text-secondary">{t(`${a.key}Why`)}</p>
            <div className="mt-3 flex items-center gap-2 text-[0.72rem] text-text-muted">
              <span>⏱ {a.mins}m</span><span>·</span><span>{t(`lvl_${a.level}`)}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Entertainment */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🎬 {t('moEntertainment')}</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {reco.ent.map((e, i) => (
          <Card key={i} className="flex gap-3 bg-white/[0.02]">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d97ba8]/30 to-[#a78bfa]/20 text-2xl">{e.emoji}</div>
            <div className="min-w-0">
              <p className="text-[0.7rem] uppercase tracking-wide text-accent-secondary">{t(`ent_${e.type}`)} · {e.mins}</p>
              <h3 className="font-heading text-sm font-semibold leading-tight">{e.title}</h3>
              <p className="mt-1 text-[0.78rem] leading-snug text-text-secondary">{t(e.whyKey)}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Food */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🍽️ {t('moFood')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {food.map((f, i) => (
          <Card key={i} className="bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{f.emoji}</span>
              <div>
                <h3 className="font-heading font-semibold">{t(f.key)}</h3>
                <p className="text-caption text-text-secondary">{t(f.benefitKey)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`https://www.swiggy.com/search?query=${encodeURIComponent(t(f.key))}`} target="_blank" rel="noreferrer" className="rounded-pill bg-[#fc8019]/15 px-3 py-1.5 text-[0.72rem] font-medium text-[#fc8019] hover:bg-[#fc8019]/25">🛵 Swiggy</a>
              <a href={`https://www.zomato.com/search?q=${encodeURIComponent(t(f.key))}`} target="_blank" rel="noreferrer" className="rounded-pill bg-[#e23744]/15 px-3 py-1.5 text-[0.72rem] font-medium text-[#e23744] hover:bg-[#e23744]/25">🍴 Zomato</a>
            </div>
          </Card>
        ))}
      </div>

      {/* Gratitude journal */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🙏 {t('moGratitude')}</h2>
      <GratitudeCard t={t} onSaved={() => setTick((v) => v + 1)} />

      <div className="mt-6">
        <Link to="/journey" className="inline-flex items-center gap-1.5 text-caption text-accent-secondary hover:underline">{t('moSeeJourney')} <ArrowRightIcon size={14} /></Link>
      </div>

      <div className="h-24" />
      {checkin && <MoodCheckIn onClose={() => setCheckin(false)} onSaved={() => setTick((v) => v + 1)} />}
      {room && <MoodRoom bucket={bucket} onClose={() => setRoom(false)} />}
      <BottomNav />
    </PageShell>
  )
}

function MiniStat({ value, label }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-[0.7rem] text-text-muted">{label}</p>
    </div>
  )
}

function GratitudeCard({ t, onSaved }) {
  const [highlight, setHighlight] = useState('')
  const [grateful, setGrateful] = useState('')
  const [proud, setProud] = useState('')
  const [saved, setSaved] = useState(false)

  function save() {
    if (!highlight.trim() && !grateful.trim() && !proud.trim()) return
    addGratitude({ highlight: highlight.trim(), grateful: grateful.trim(), proud: proud.trim() })
    setSaved(true); setHighlight(''); setGrateful(''); setProud('')
    onSaved?.()
    setTimeout(() => setSaved(false), 3500)
  }
  const field = (val, set, ph) => (
    <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
  )
  return (
    <Card>
      {saved ? (
        <div className="py-4 text-center">
          <div className="text-3xl">🌷</div>
          <p className="mt-2 font-heading font-semibold">{t('moGratThanks')}</p>
          <p className="mt-1 text-caption text-text-secondary">{t('moGratReflection')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {field(highlight, setHighlight, t('moGratHighlight'))}
          {field(grateful, setGrateful, t('moGratGrateful'))}
          {field(proud, setProud, t('moGratProud'))}
          <div className="flex justify-end"><Button size="md" onClick={save}>{t('moGratSave')}</Button></div>
        </div>
      )}
    </Card>
  )
}
