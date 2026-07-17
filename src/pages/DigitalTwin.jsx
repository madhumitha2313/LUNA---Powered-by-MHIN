import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile } from '../lib/localStore'
import { composite, forecast, SCENARIOS, simulate, trends, areasToWatch } from '../lib/twinModel'

const TONE_COLOR = { good: '#6ee7b7', ok: '#fbbf24', low: '#fb7185' }

function fill(t, key, vars = {}) {
  let s = t(key)
  Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
  return s
}

export default function DigitalTwin() {
  const { t } = useT()
  const profile = getProfile()
  const comp = useMemo(() => composite(), [])
  const fc = useMemo(() => forecast(), [])
  const tr = useMemo(() => trends(), [])
  const watch = useMemo(() => areasToWatch(), [])
  const [sel, setSel] = useState('energy')
  const selInd = comp.indicators.find((i) => i.id === sel)

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('twBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('twTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('twSub')}</p>
      </div>

      {/* Body avatar + score */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[300px_1fr]">
        <Card className="bg-gradient-to-b from-[#a78bfa]/[0.1] to-transparent">
          <BodyAvatar indicators={comp.indicators} sel={sel} onSelect={setSel} t={t} />
        </Card>
        <div className="space-y-4">
          <Card className="flex items-center gap-5">
            <ScoreRing score={comp.score} />
            <div className="flex-1">
              <h2 className="font-heading font-semibold">{t('twHealthScore')}</h2>
              <p className="mt-1 text-caption text-text-secondary">{fill(t, `twScore_${comp.score >= 75 ? 'high' : comp.score >= 55 ? 'mid' : 'care'}`, {})}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge tone="ai">{t(comp.confKey)} · {comp.confPct}%</Badge>
              </div>
            </div>
          </Card>
          {/* selected indicator detail */}
          {selInd && (
            <Card className="bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selInd.emoji}</span>
                <h3 className="font-heading font-semibold">{t(selInd.key)}</h3>
                <span className="ml-auto font-stat text-lg font-bold" style={{ color: TONE_COLOR[selInd.tone] }}>{selInd.value}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full rounded-pill" style={{ width: `${selInd.value}%`, background: TONE_COLOR[selInd.tone] }} /></div>
              <p className="mt-2 text-caption text-text-secondary">{t(`twDetail_${selInd.id}_${selInd.tone}`)}</p>
            </Card>
          )}
        </div>
      </div>

      {/* Forecast */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🔮 {t('twForecast')}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fc.map((f, i) => (
          <Card key={i} className="bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <p className="font-heading font-semibold capitalize">{t(`fm_${f.metric}`)}</p>
              <Badge tone="ai">{f.confPct}%</Badge>
            </div>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-text-secondary">{t(f.explanationKey)}</p>
            <p className="mt-2 flex items-start gap-1.5 text-caption text-accent-secondary">💡 {t(f.actionKey)}</p>
          </Card>
        ))}
      </div>

      {/* What-if simulator */}
      <h2 className="mb-1 mt-8 font-heading text-lg font-semibold">🧪 {t('twWhatIf')}</h2>
      <p className="mb-3 text-caption text-text-muted">{t('twWhatIfSub')}</p>
      <WhatIf t={t} />

      {/* Trends */}
      {tr.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">📈 {t('twTrends')}</h2>
          <div className="space-y-2.5">
            {tr.map((x, i) => <Card key={i} className="bg-accent-ai/[0.05]"><p className="text-[0.92rem] leading-relaxed text-text-secondary">{fill(t, x.key, x)}</p></Card>)}
          </div>
        </>
      )}

      {/* Areas to watch */}
      {watch.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">👀 {t('twWatch')}</h2>
          <div className="space-y-2.5">
            {watch.map((x, i) => <Card key={i} className="border-warning/25 bg-warning/[0.05]"><p className="text-[0.92rem] leading-relaxed text-text-secondary">{t(x.key)}</p></Card>)}
          </div>
        </>
      )}

      {/* Safety disclaimer */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('twDisclaimer')}</p>
      </div>

      <div className="mt-4 text-center"><Link to="/mira" className="text-caption text-accent-secondary hover:underline">{t('aiManageMemory')} →</Link></div>
      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

function BodyAvatar({ indicators, sel, onSelect, t }) {
  return (
    <div className="relative mx-auto" style={{ width: 200 }}>
      <svg viewBox="0 0 200 230" width="200" height="230">
        <defs>
          <radialGradient id="twbody" cx="0.5" cy="0.3" r="0.8"><stop offset="0%" stopColor="#c9a7e8" stopOpacity="0.5" /><stop offset="100%" stopColor="#a78bfa" stopOpacity="0.15" /></radialGradient>
        </defs>
        {/* soft aura */}
        <ellipse cx="100" cy="115" rx="70" ry="105" fill="url(#twbody)" />
        {/* stylised silhouette (abstract, not anatomical) */}
        <circle cx="100" cy="40" r="18" fill="none" stroke="#c9a7e8" strokeWidth="2" opacity="0.7" />
        <path d="M78,62 C74,72 72,86 76,104 C64,112 60,132 62,158 M122,62 C126,72 128,86 124,104 C136,112 140,132 138,158 M84,60 C82,110 82,160 90,200 C94,208 106,208 110,200 C118,160 118,110 116,60"
          fill="none" stroke="#c9a7e8" strokeWidth="2" opacity="0.5" strokeLinecap="round" />
        {/* indicator nodes */}
        {indicators.map((ind) => {
          const on = sel === ind.id
          return (
            <g key={ind.id} onClick={() => onSelect(ind.id)} style={{ cursor: 'pointer' }}>
              {on && <circle cx={ind.x} cy={ind.y} r="14" fill="none" stroke={TONE_COLOR[ind.tone]} strokeWidth="1.5" opacity="0.5" className="animate-glow-pulse" />}
              <circle cx={ind.x} cy={ind.y} r={on ? 10 : 8} fill={TONE_COLOR[ind.tone]} opacity={on ? 1 : 0.8} stroke="#0d1117" strokeWidth="2" />
              <text x={ind.x} y={ind.y + 3.5} textAnchor="middle" fontSize="9">{ind.emoji}</text>
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-1.5">
        {indicators.map((ind) => (
          <button key={ind.id} onClick={() => onSelect(ind.id)} className={`rounded-pill px-2.5 py-1 text-[0.66rem] transition ${sel === ind.id ? 'bg-accent-primary/15 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>{ind.emoji} {t(ind.key)}</button>
        ))}
      </div>
    </div>
  )
}

function ScoreRing({ score }) {
  const R = 34, C = 2 * Math.PI * R
  const color = score >= 75 ? '#6ee7b7' : score >= 55 ? '#d97ba8' : '#fbbf24'
  return (
    <svg width="86" height="86" viewBox="0 0 86 86">
      <circle cx="43" cy="43" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="43" cy="43" r={R} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - score / 100)} transform="rotate(-90 43 43)" style={{ transition: 'stroke-dashoffset .8s ease' }} />
      <text x="43" y="49" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">{score}</text>
    </svg>
  )
}

function WhatIf({ t }) {
  const [id, setId] = useState('sleep8')
  const sim = useMemo(() => simulate(id), [id])
  return (
    <Card>
      <div className="flex flex-wrap gap-2">
        {SCENARIOS.map((s) => (
          <button key={s.id} onClick={() => setId(s.id)} className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption font-medium transition ${id === s.id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary'}`}>{s.emoji} {t(s.key)}</button>
        ))}
      </div>
      {sim && (
        <div className="mt-4 space-y-3">
          <p className="text-[0.9rem] text-text-secondary">{t(`scExplain_${id}`)}</p>
          {sim.rows.map((r) => (
            <div key={r.metric}>
              <div className="flex justify-between text-caption"><span className="text-text-secondary">{t(`fm_${r.metric}`)}</span><span className="text-success">+{r.delta} →</span></div>
              <div className="mt-1 h-2.5 overflow-hidden rounded-pill bg-white/[0.06]">
                <div className="relative h-full rounded-pill bg-white/15" style={{ width: `${r.base}%` }}>
                  <div className="absolute inset-y-0 left-0 rounded-pill bg-gradient-to-r from-accent-secondary to-success transition-all duration-700" style={{ width: `${(r.projected / Math.max(1, r.base)) * 100}%` }} />
                </div>
              </div>
              <div className="mt-0.5 flex justify-between text-[0.68rem] text-text-muted"><span>{t('twNow')} {r.base}</span><span className="text-success">{t('twProjected')} {r.projected}</span></div>
            </div>
          ))}
          <p className="mt-2 text-[0.72rem] text-text-muted">🛡️ {t('twSimNote')}</p>
        </div>
      )}
    </Card>
  )
}
