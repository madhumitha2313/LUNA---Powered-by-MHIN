import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon, MicIcon, TrendIcon } from '../components/ui/icons'
import { TOPICS, MYTHS, DAILY } from '../lib/learnContent'
import { getProgress, isDone, level, completeLesson, recordMythScore } from '../lib/learnProgress'
import { getProfile, getCycleStats } from '../lib/localStore'
import { useT } from '../lib/i18n.jsx'
import CycleExplorer from '../components/CycleExplorer'

const BADGE = {
  firstperiod: 'First Guide', cycle: 'Cycle Expert', hormones: 'Hormone Aware', products: 'Products Pro',
  nutrition: 'Nutrition Champion', selfcare: 'Self-care Hero', mental: 'Mind Ally', pcos: 'PCOS Aware', endo: 'Endo Aware',
}

/** Which topics Mira recommends today, from cycle phase + first-time flag. */
function recommendedIds() {
  const ids = new Set()
  if (getProfile().firstTime) ids.add('firstperiod')
  const phase = getCycleStats().phase
  if (phase === 'menstrual') { ids.add('selfcare'); ids.add('nutrition') }
  else if (phase === 'luteal') { ids.add('mental') }
  else ids.add('cycle')
  return ids
}

export default function Learn() {
  const { t } = useT()
  const [prog, setProg] = useState(getProgress())
  const [active, setActive] = useState(null) // topic being viewed
  const [myth, setMyth] = useState(false) // myth game open
  const [cycle, setCycle] = useState(false) // cycle explorer open
  const rec = recommendedIds()
  const daily = DAILY[new Date().getDate() % DAILY.length]
  const pct = Math.round((prog.completed.length / TOPICS.length) * 100)

  function onComplete(topic) {
    setProg(completeLesson(topic.id, BADGE[topic.id]))
    setActive(null)
  }

  return (
    <PageShell max="max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('learnBadge')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('learnTitle')}</h1>
          <p className="mt-2 max-w-lg text-text-secondary">{t('learnSub')}</p>
        </div>
        <Button as={Link} to="/voice" variant="secondary" size="md">
          <MicIcon size={16} /> {t('learnAsk')}
        </Button>
      </div>

      {/* Progress / gamification */}
      <div className="mt-8 grid gap-4 sm:grid-cols-4">
        <ProgStat label={t('learnLevel')} value={level(prog.xp)} sub={`${prog.xp} XP`} />
        <ProgStat label={t('learnLessons')} value={`${prog.completed.length}/${TOPICS.length}`} sub={`${pct}% ${t('learnComplete')}`} />
        <ProgStat label={t('learnStreak')} value={`${prog.streak} 🔥`} sub={t('learnKeepGoing')} />
        <ProgStat label={t('learnBadges')} value={prog.badges.length} sub={prog.badges.length ? prog.badges[prog.badges.length - 1] : t('learnEarnFirst')} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-pill bg-white/[0.08]">
        <div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      {/* Daily learning */}
      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#FF4F9D]/[0.12] to-transparent p-6">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎯</span>
          <h2 className="font-heading text-lg font-semibold">{t('learnToday')}</h2>
          <Badge tone="accent" className="ml-auto">{daily.tag}</Badge>
        </div>
        <p className="mt-3 text-[1.05rem] leading-relaxed text-text-secondary">{daily.text}</p>
      </div>

      {/* Featured: interactive cycle explorer */}
      <button
        onClick={() => setCycle(true)}
        className="group mt-4 flex w-full items-center gap-4 overflow-hidden rounded-3xl border border-accent-primary/30 bg-gradient-to-r from-[#d97ba8]/[0.16] via-[#a78bfa]/[0.1] to-transparent p-5 text-left transition-all hover:border-accent-primary/60 hover:shadow-glow"
      >
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-3xl transition-transform group-hover:scale-110">🩸</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-lg font-semibold">{t('learnCycleCta')}</h2>
            <Badge tone="ai" icon={<SparklesIcon size={12} />}>3D</Badge>
          </div>
          <p className="mt-0.5 text-caption text-text-secondary">{t('learnCycleSub')}</p>
        </div>
        <ArrowRightIcon size={20} className="ml-auto shrink-0 text-accent-primary transition-transform group-hover:translate-x-1" />
      </button>

      {/* Topic cards */}
      <h2 className="mb-4 mt-10 font-heading text-lg font-semibold">{t('learnExplore')}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((tp) => {
          const done = isDone(tp.id)
          return (
            <Card key={tp.id} hover onClick={() => setActive(tp)} className="cursor-pointer">
              <div className="flex items-start justify-between">
                <span className="text-4xl">{tp.emoji}</span>
                {done ? (
                  <Badge tone="success">{t('learnCompleted')} ✓</Badge>
                ) : rec.has(tp.id) ? (
                  <Badge tone="ai" icon={<SparklesIcon size={12} />}>{t('learnForYou')}</Badge>
                ) : null}
              </div>
              <h3 className="mt-4 font-heading text-lg font-semibold">{tp.title}</h3>
              <div className="mt-2 flex items-center gap-2 text-caption text-text-muted">
                <span className={tp.accent}>{tp.level}</span>
                <span>·</span>
                <span>{tp.mins} {t('learnMin')}</span>
                <span>·</span>
                <span>{tp.cards.length} {t('learnCards')}</span>
              </div>
            </Card>
          )
        })}

        {/* Myth vs Fact game card */}
        <Card hover onClick={() => setMyth(true)} className="cursor-pointer border-accent-ai/30 bg-accent-ai/[0.05]">
          <div className="flex items-start justify-between">
            <span className="text-4xl">📚</span>
            <Badge tone="ai">{t('learnGame')}</Badge>
          </div>
          <h3 className="mt-4 font-heading text-lg font-semibold">{t('learnMythTitle')}</h3>
          <p className="mt-2 text-caption text-text-secondary">{t('learnBestScore')}: {prog.mythBest}/{MYTHS.length}</p>
        </Card>
      </div>

      {/* Printable first-period readiness guide (MHIN) */}
      <Card className="mt-8 flex flex-col gap-3 bg-bg-secondary/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🌸</span>
          <p className="text-caption text-text-secondary">{t('learnReadinessBody')}</p>
        </div>
        <Button as={Link} to="/readiness" size="md">{t('learnReadinessBtn')} <ArrowRightIcon size={16} /></Button>
      </Card>

      {active && <LessonViewer topic={active} t={t} onClose={() => setActive(null)} onComplete={onComplete} />}
      {myth && <MythGame t={t} onClose={() => setMyth(false)} onFinish={(s) => setProg(recordMythScore(s))} />}
      {cycle && <CycleExplorer startDay={getCycleStats().cycleDay || 1} onClose={() => setCycle(false)} />}
    </PageShell>
  )
}

function ProgStat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-caption text-text-muted">{label}</p>
      <p className="mt-1 font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-0.5 text-caption text-accent-secondary">{sub}</p>
    </div>
  )
}

/** Swipeable reel of cards → mini quiz → completion. */
function LessonViewer({ topic, onClose, onComplete, t }) {
  const { lang } = useT()
  const total = topic.cards.length
  const [i, setI] = useState(0)
  const [stage, setStage] = useState('cards') // cards | quiz | done
  const [picked, setPicked] = useState(null)

  const isQuiz = stage === 'quiz'
  const correct = picked === topic.quiz.answer

  const SR_LANG = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN' }
  function narrate() {
    try {
      const sy = window.speechSynthesis
      if (!sy) return
      sy.cancel()
      const c = topic.cards[i]
      const u = new SpeechSynthesisUtterance(`${c.h}. ${c.b}`)
      u.lang = SR_LANG[lang] || 'en-US'
      u.rate = 0.98
      sy.speak(u)
    } catch { /* ignore */ }
  }
  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* ignore */ } }, [])

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">{topic.emoji}</span>
        <h3 className="font-heading text-lg font-semibold">{topic.title}</h3>
        <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
      </div>

      {/* progress dots */}
      <div className="mt-4 flex gap-1.5">
        {Array.from({ length: total + 1 }).map((_, n) => (
          <span key={n} className={`h-1.5 flex-1 rounded-pill ${(stage === 'cards' ? n <= i : true) ? 'bg-accent-primary' : 'bg-white/15'}`} />
        ))}
      </div>

      {stage === 'cards' && (
        <div className="mt-6 min-h-[220px]">
          <h4 className="font-heading text-xl font-semibold">{topic.cards[i].h}</h4>
          <p className="mt-3 text-[1.05rem] leading-relaxed text-text-secondary">{topic.cards[i].b}</p>
          <div className="mt-8 flex items-center justify-between">
            <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0} className="rounded-pill px-4 py-2 text-caption text-text-muted disabled:opacity-40">← {t('learnBack')}</button>
            <div className="flex items-center gap-2">
              <button onClick={narrate} title={t('ceListen')} aria-label={t('ceListen')} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-text-secondary transition hover:border-accent-primary/50 hover:text-accent-primary">🔊</button>
              <Button onClick={() => (i < total - 1 ? setI(i + 1) : setStage('quiz'))} size="md">
                {i < total - 1 ? t('learnNext') : t('learnQuiz')} <ArrowRightIcon size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {isQuiz && (
        <div className="mt-6 min-h-[220px]">
          <p className="text-caption text-accent-secondary">{t('learnQuickCheck')}</p>
          <h4 className="mt-1 font-heading text-xl font-semibold">{topic.quiz.q}</h4>
          <div className="mt-4 space-y-2.5">
            {topic.quiz.options.map((opt, n) => (
              <button
                key={n}
                onClick={() => setPicked(n)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                  picked == null
                    ? 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    : n === topic.quiz.answer
                      ? 'border-success/50 bg-success/10 text-text-primary'
                      : n === picked
                        ? 'border-danger/50 bg-danger/10'
                        : 'border-white/10 bg-white/[0.02] opacity-60'
                }`}
              >
                {opt}
                {picked != null && n === topic.quiz.answer && <span>✓</span>}
              </button>
            ))}
          </div>
          {picked != null && (
            <div className="mt-5 flex items-center justify-between">
              <p className={`text-caption ${correct ? 'text-success' : 'text-warning'}`}>{correct ? t('learnCorrect') : t('learnTryAgain')}</p>
              <Button onClick={() => setStage('done')} size="md">{t('learnFinish')}</Button>
            </div>
          )}
        </div>
      )}

      {stage === 'done' && (
        <div className="mt-6 min-h-[220px] text-center">
          <div className="text-5xl">🏆</div>
          <h4 className="mt-4 font-heading text-2xl font-semibold">{t('learnDoneTitle')}</h4>
          <p className="mt-2 text-text-secondary">+50 XP · {t('learnUnlocked')}: <span className="text-accent-secondary">{BADGE[topic.id]}</span></p>
          <div className="mt-6 flex justify-center gap-3">
            <Button as={Link} to="/voice" variant="secondary" size="md"><MicIcon size={16} /> {t('learnAsk')}</Button>
            <Button onClick={() => onComplete(topic)} size="md">{t('learnDone')}</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function MythGame({ onClose, onFinish, t }) {
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const m = MYTHS[i]
  const done = i >= MYTHS.length

  function answer(saysMyth) {
    if (answered != null) return
    const right = saysMyth === m.myth
    setAnswered(right)
    if (right) setScore((s) => s + 1)
  }
  function next() {
    if (i + 1 >= MYTHS.length) {
      onFinish(score)
      setI(MYTHS.length)
    } else {
      setI(i + 1)
      setAnswered(null)
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2">
        <span className="text-2xl">📚</span>
        <h3 className="font-heading text-lg font-semibold">{t('learnMythTitle')}</h3>
        <span className="ml-auto text-caption text-text-muted">{Math.min(i + 1, MYTHS.length)}/{MYTHS.length} · {score} {t('learnPts')}</span>
      </div>

      {!done ? (
        <div className="mt-6 min-h-[200px]">
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center text-[1.15rem] font-medium">"{m.s}"</p>
          {answered == null ? (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => answer(true)} className="rounded-2xl border border-danger/40 bg-danger/[0.08] py-4 font-semibold text-danger hover:bg-danger/15">{t('learnMyth')}</button>
              <button onClick={() => answer(false)} className="rounded-2xl border border-success/40 bg-success/[0.08] py-4 font-semibold text-success hover:bg-success/15">{t('learnFact')}</button>
            </div>
          ) : (
            <div className="mt-5">
              <p className={`font-heading font-semibold ${answered ? 'text-success' : 'text-warning'}`}>{answered ? t('learnNice') : t('learnNotQuite')} {m.myth ? t('learnItsMyth') : t('learnItsFact')}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{m.why}</p>
              <div className="mt-5 text-right"><Button onClick={next} size="md">{i + 1 >= MYTHS.length ? t('learnSeeScore') : t('learnNext')} <ArrowRightIcon size={16} /></Button></div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 min-h-[200px] text-center">
          <div className="text-5xl">{score >= MYTHS.length - 1 ? '🏆' : '🌸'}</div>
          <h4 className="mt-4 font-heading text-2xl font-semibold">{score}/{MYTHS.length}</h4>
          <p className="mt-2 text-text-secondary">{score >= MYTHS.length - 1 ? t('learnMythBuster') : t('learnGoodEffort')}</p>
          <div className="mt-6"><Button onClick={onClose} size="md">{t('learnDone')}</Button></div>
        </div>
      )}
    </Modal>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
