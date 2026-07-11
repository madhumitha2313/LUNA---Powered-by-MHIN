import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon, MicIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile } from '../lib/localStore'
import {
  mealPlan, phaseFoods, nutritionScore, getWaterToday, addWater, WATER_GOAL,
  nutritionInsight, groceryList, SUBSTITUTES, logMeal,
} from '../lib/nutritionIntel'
import FoodAnalyzer from '../components/FoodAnalyzer'

const PHASE_TONE = { menstrual: 'danger', follicular: 'success', ovulation: 'warning', luteal: 'ai' }

function greetKey() {
  const h = new Date().getHours()
  return h < 12 ? 'nuMorning' : h < 17 ? 'nuAfternoon' : 'nuEvening'
}

export default function Nutrition() {
  const { t } = useT()
  const profile = getProfile()
  const [tick, setTick] = useState(0)
  const [scan, setScan] = useState(false)
  const [grocery, setGrocery] = useState(false)

  const score = useMemo(() => nutritionScore(), [tick])
  const water = useMemo(() => getWaterToday(), [tick])
  const plan = useMemo(() => mealPlan(), [])
  const foods = useMemo(() => phaseFoods(), [])
  const insight = useMemo(() => nutritionInsight(), [tick])
  const condition = (profile.condition || '').toLowerCase()

  const ironTotal = plan.meals.reduce((a, m) => a + (m.iron || 0), 0)
  const proteinTotal = plan.meals.reduce((a, m) => a + (m.protein || 0), 0)

  return (
    <PageShell max="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Badge tone="success" icon={<SparklesIcon size={14} />}>{t('nuEngine')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t(greetKey())}{profile.name ? `, ${profile.name}` : ''} 🌸</h1>
          <p className="mt-2 max-w-lg text-text-secondary">{t('nuTagline')}</p>
        </div>
        <Badge tone={PHASE_TONE[plan.phase]}>{t(`phase_${plan.phase}`)}</Badge>
      </div>

      {/* Score + hydration + macros */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="flex items-center gap-5 bg-gradient-to-br from-[#6ee7b7]/[0.12] via-[#d97ba8]/[0.06] to-transparent">
          <ScoreRing score={score.score} label={t('nuScore')} />
          <div className="flex-1">
            <h2 className="font-heading font-semibold">{t('nuTodayNutrition')}</h2>
            <div className="mt-3 space-y-2.5">
              <Bar label={t('nuIron')} value={ironTotal} goal={18} unit="mg" color="#fb7185" />
              <Bar label={t('nuProtein')} value={proteinTotal} goal={50} unit="g" color="#a78bfa" />
            </div>
          </div>
        </Card>

        {/* Animated water bottle */}
        <Card className="flex items-center gap-5">
          <WaterBottle filled={water} goal={WATER_GOAL} />
          <div className="flex-1">
            <h2 className="font-heading font-semibold">{t('nuHydration')}</h2>
            <p className="mt-1 font-stat text-2xl font-bold">{water}<span className="text-sm text-text-muted">/{WATER_GOAL} {t('nuGlasses')}</span></p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={() => setTick((v) => (addWater(1), v + 1))}>+1 💧</Button>
              <Button size="sm" variant="secondary" onClick={() => setTick((v) => (addWater(-1), v + 1))}>−1</Button>
            </div>
            {water >= WATER_GOAL && <p className="mt-2 text-caption text-success">🎉 {t('nuHydrated')}</p>}
          </div>
        </Card>
      </div>

      {/* Condition banner */}
      {(condition.includes('pcos') || condition.includes('pcod')) && (
        <Card className="mt-4 border-accent-ai/25 bg-accent-ai/[0.06]">
          <p className="flex items-start gap-2 text-[0.9rem] text-text-secondary"><span>🧬</span> {t('nuPcosNote')}</p>
        </Card>
      )}
      {condition.includes('iron') || condition.includes('anaem') || condition.includes('anem') ? (
        <Card className="mt-4 border-danger/25 bg-danger/[0.06]">
          <p className="flex items-start gap-2 text-[0.9rem] text-text-secondary"><span>🩸</span> {t('nuIronNote')}</p>
        </Card>
      ) : null}

      {/* Insight */}
      <Card className="mt-4">
        <div className="flex items-center gap-2"><span className="text-lg">✨</span><h2 className="font-heading text-lg font-semibold">{t('nuInsight')}</h2></div>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-text-secondary">{t(insight.key)}</p>
      </Card>

      {/* Recommended foods for phase */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🌿 {t('nuPhaseFoods')}</h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {foods.map(([e, name]) => (
          <div key={name} className="flex min-w-[92px] flex-col items-center gap-1 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
            <span className="text-3xl">{e}</span>
            <span className="text-[0.72rem] text-text-secondary">{name}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <ActionCard emoji="📸" title={t('nuScanFood')} sub={t('nuScanSub')} onClick={() => setScan(true)} tone="border-accent-primary/30" />
        <ActionCard emoji="🛒" title={t('nuGrocery')} sub={t('nuGrocerySub')} onClick={() => setGrocery(true)} tone="border-success/30" />
        <ActionCard emoji="🎙️" title={t('nuAskMira')} sub={t('nuAskSub')} to="/voice" tone="border-accent-ai/30" />
      </div>

      {/* AI meal plan */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🍽️ {t('nuMealPlan')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {plan.meals.map((m) => (
          <Card key={m.slot} className="bg-white/[0.02]">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{m.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] uppercase tracking-wide text-accent-secondary">{t(`nuSlot_${m.slot}`)}</p>
                <h3 className="font-heading font-semibold leading-tight">{m.name}</h3>
                <p className="mt-1 text-caption text-text-secondary">{t(m.whyKey)}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-text-muted">
              <span>🔥 {m.kcal} kcal</span><span>🩸 {m.iron}mg</span><span>💪 {m.protein}g</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setTick((v) => (logMeal({ slot: m.slot, name: m.name, healthy: true }), v + 1))} className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-[0.72rem] font-medium text-text-secondary hover:text-text-primary">✓ {t('nuLog')}</button>
              <a href={`https://www.swiggy.com/search?query=${encodeURIComponent(m.name)}`} target="_blank" rel="noreferrer" className="rounded-pill bg-[#fc8019]/15 px-3 py-1.5 text-[0.72rem] font-medium text-[#fc8019] hover:bg-[#fc8019]/25">🛵 Swiggy</a>
              <a href={`https://www.zomato.com/search?q=${encodeURIComponent(m.name)}`} target="_blank" rel="noreferrer" className="rounded-pill bg-[#e23744]/15 px-3 py-1.5 text-[0.72rem] font-medium text-[#e23744] hover:bg-[#e23744]/25">🍴 Zomato</a>
            </div>
          </Card>
        ))}
      </div>

      {/* Smart substitutes */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🔄 {t('nuSwaps')}</h2>
      <Card>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SUBSTITUTES.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-[0.85rem]">
              <span className="text-text-muted line-through">{s.from}</span>
              <ArrowRightIcon size={14} className="text-success" />
              <span className="text-text-primary">{s.to}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="mt-6"><Link to="/journey" className="inline-flex items-center gap-1.5 text-caption text-accent-secondary hover:underline">{t('moSeeJourney')} <ArrowRightIcon size={14} /></Link></div>

      <div className="h-24" />
      {scan && <FoodAnalyzer onClose={() => setScan(false)} onLogged={() => setTick((v) => v + 1)} />}
      {grocery && <GroceryModal t={t} items={groceryList()} onClose={() => setGrocery(false)} />}
      <BottomNav />
    </PageShell>
  )
}

function ScoreRing({ score, label }) {
  const pct = score == null ? 0 : score
  const R = 40, C = 2 * Math.PI * R
  const color = score == null ? '#94a3b8' : score >= 80 ? '#6ee7b7' : score >= 60 ? '#d97ba8' : '#fbbf24'
  return (
    <div className="flex flex-col items-center">
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle cx="52" cy="52" r={R} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 52 52)" style={{ transition: 'stroke-dashoffset .8s ease' }} />
        <text x="52" y="50" textAnchor="middle" fill="#fff" fontSize="26" fontWeight="700">{score == null ? '—' : score}</text>
        <text x="52" y="68" textAnchor="middle" className="fill-text-muted" fontSize="9">/100</text>
      </svg>
      <p className="mt-1 text-caption text-text-muted">{label}</p>
    </div>
  )
}

function Bar({ label, value, goal, unit, color }) {
  const pct = Math.min(100, Math.round((value / goal) * 100))
  return (
    <div>
      <div className="flex justify-between text-caption"><span className="text-text-secondary">{label}</span><span className="text-text-muted">{Math.round(value)}/{goal}{unit}</span></div>
      <div className="mt-1 h-2 overflow-hidden rounded-pill bg-white/[0.08]"><div className="h-full rounded-pill transition-all duration-500" style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  )
}

function WaterBottle({ filled, goal }) {
  const pct = Math.min(100, (filled / goal) * 100)
  return (
    <svg width="60" height="110" viewBox="0 0 60 110">
      <defs>
        <clipPath id="bottleClip"><path d="M20 8h20v10c0 3 6 6 6 14v66c0 4-3 6-6 6H20c-3 0-6-2-6-6V32c0-8 6-11 6-14V8z" /></clipPath>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8fd3ff" /><stop offset="100%" stopColor="#4aa3e0" /></linearGradient>
      </defs>
      <rect x="24" y="2" width="12" height="8" rx="2" fill="#c9d3e6" />
      <g clipPath="url(#bottleClip)">
        <rect x="0" y="0" width="60" height="110" fill="rgba(255,255,255,0.06)" />
        <rect x="0" y={110 - pct * 1.1} width="60" height={pct * 1.1 + 10} fill="url(#water)" style={{ transition: 'y .6s ease' }} />
      </g>
      <path d="M20 8h20v10c0 3 6 6 6 14v66c0 4-3 6-6 6H20c-3 0-6-2-6-6V32c0-8 6-11 6-14V8z" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    </svg>
  )
}

function ActionCard({ emoji, title, sub, onClick, to, tone }) {
  const inner = (
    <>
      <span className="text-3xl transition-transform group-hover:scale-110">{emoji}</span>
      <div><h3 className="font-heading font-semibold leading-tight">{title}</h3><p className="text-caption text-text-secondary">{sub}</p></div>
    </>
  )
  const cls = `group flex items-center gap-3 rounded-3xl border ${tone} bg-white/[0.02] p-4 text-left transition hover:bg-white/[0.04]`
  return to ? <Link to={to} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls}>{inner}</button>
}

function GroceryModal({ t, items, onClose }) {
  const [checked, setChecked] = useState({})
  function copy() {
    try { navigator.clipboard?.writeText(items.map((i) => `• ${i}`).join('\n')) } catch { /* ignore */ }
  }
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span><h3 className="font-heading text-lg font-semibold">{t('nuGrocery')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('nuGroceryFrom')}</p>
        <ul className="mt-4 space-y-1.5">
          {items.map((it, i) => (
            <li key={i}>
              <button onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))} className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left">
                <span className={`grid h-5 w-5 place-items-center rounded-md border ${checked[i] ? 'border-success bg-success/20 text-success' : 'border-white/20'}`}>{checked[i] ? '✓' : ''}</span>
                <span className={`text-sm capitalize ${checked[i] ? 'text-text-muted line-through' : 'text-text-secondary'}`}>{it}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="md" onClick={copy}>📋 {t('nuCopyList')}</Button>
          <Button size="md" onClick={onClose}>{t('learnDone')}</Button>
        </div>
      </div>
    </div>
  )
}
