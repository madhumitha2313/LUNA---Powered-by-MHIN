import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ShieldIcon, LockIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  PRINCIPLES, GOV_LAYERS, CAN, CANNOT, CONFIDENCE, safetyCheck, NEVER_FABRICATE, explain,
  fairness, METRICS, OVERSIGHT, PROMPT_GOV, MODEL_CARD, CHANGE_STEPS, REDTEAM, INCIDENT, AUDIT,
  FEEDBACK_ASPECTS, submitFeedback, feedbackCount, getTrust, setPersonalization,
} from '../lib/governance'

function fill(t, key, vars = {}) { let s = t(key); Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) }); return s }
const HUE = '#a78bfa'
const CK_TONE = { pass: { c: '#6ee7b7', i: '✓' }, flag: { c: '#fbbf24', i: '⚠' }, block: { c: '#fb7185', i: '⛔' } }

export default function Trust() {
  const { t } = useT()
  const [tab, setTab] = useState('principles')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)

  const tabs = [['principles', '🧭', 'raiTabPrinciples'], ['safety', '🛡️', 'raiTabSafety'], ['explain', '💡', 'raiTabExplain'], ['governance', '🏛️', 'raiTabGov'], ['you', '👤', 'raiTabYou']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<ShieldIcon size={14} />}>{t('raiBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('raiTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('raiSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-lg gap-1 overflow-x-auto rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)} aria-label={t(key)} className={`flex-1 shrink-0 whitespace-nowrap rounded-pill px-3 py-2 text-[0.72rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'principles' && <PrinciplesTab t={t} />}
        {tab === 'safety' && <SafetyTab t={t} />}
        {tab === 'explain' && <ExplainTab t={t} />}
        {tab === 'governance' && <GovernanceTab t={t} />}
        {tab === 'you' && <YouTab t={t} tick={tick} bump={bump} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('raiDisclaimer')}</p>
      </div>

      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

// ── PRINCIPLES ────────────────────────────────────────────────────────────────
function PrinciplesTab({ t }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🧭</span><h2 className="font-heading text-lg font-semibold">{t('raiPrinciples')}</h2></div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <Card key={p.key} className="text-center"><div className="text-2xl">{p.emoji}</div><p className="mt-1 font-heading text-[0.82rem] font-semibold">{t(p.key)}</p></Card>
          ))}
        </div>
      </div>

      {/* Can / cannot */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-success/20 bg-success/[0.04]">
          <p className="mb-2 flex items-center gap-2 font-heading text-[0.9rem] font-semibold text-success">✓ {t('raiCan')}</p>
          <ul className="space-y-1">{CAN.map((k) => <li key={k} className="text-[0.82rem] text-text-secondary">• {t(k)}</li>)}</ul>
        </Card>
        <Card className="border-danger/20 bg-danger/[0.04]">
          <p className="mb-2 flex items-center gap-2 font-heading text-[0.9rem] font-semibold text-danger">✕ {t('raiCannot')}</p>
          <ul className="space-y-1">{CANNOT.map((k) => <li key={k} className="text-[0.82rem] text-text-secondary">• {t(k)}</li>)}</ul>
        </Card>
      </div>

      {/* Governance layers */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🧱</span><h2 className="font-heading text-lg font-semibold">{t('raiLayers')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('raiLayersSub')}</p>
        <div className="space-y-1.5">
          {GOV_LAYERS.map((l, i) => (
            <div key={l.n}>
              <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-primary/15 font-stat text-[0.78rem] font-bold text-accent-secondary">{l.n}</span>
                <p className="text-[0.86rem] font-medium text-text-secondary">{t(l.key)}</p>
              </div>
              {i < GOV_LAYERS.length - 1 && <div className="ml-6 h-2 w-0.5 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── SAFETY (live checkpoint runner) ──────────────────────────────────────────
function SafetyTab({ t }) {
  const [text, setText] = useState('')
  const result = useMemo(() => (text.trim().length > 2 ? safetyCheck(text) : null), [text])
  const samples = [['🌸', 'sampleNormal'], ['🩺', 'sampleMedical'], ['🚨', 'sampleEmergency'], ['💗', 'sampleCrisis']]
  const SAMPLE_TEXT = { sampleNormal: 'What foods help with period cramps?', sampleMedical: 'Do I have PCOS?', sampleEmergency: 'I have severe chest pain and can’t breathe', sampleCrisis: 'I don’t want to be here anymore' }

  return (
    <div className="space-y-6">
      <Card>
        <p className="mb-2 flex items-center gap-1.5 font-heading text-[0.92rem] font-semibold"><SparklesIcon size={15} className="text-accent-ai" /> {t('raiRunner')}</p>
        <p className="mb-3 text-caption text-text-muted">{t('raiRunnerSub')}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={t('raiRunnerPh')} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[0.9rem] outline-none focus:border-accent-primary/50" />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {samples.map(([e, k]) => <button key={k} onClick={() => setText(SAMPLE_TEXT[k])} className="rounded-pill border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.72rem] text-text-secondary hover:text-text-primary">{e} {t(k)}</button>)}
        </div>

        {result && (
          <div className="mt-4">
            <div className={`mb-3 rounded-2xl border p-3 text-[0.86rem] ${result.crisis || result.emergency ? 'border-danger/30 bg-danger/[0.08] text-danger' : result.blocked ? 'border-danger/30 bg-danger/[0.08] text-danger' : result.flagged ? 'border-warning/30 bg-warning/[0.06] text-warning' : 'border-success/30 bg-success/[0.06] text-success'}`}>
              {t(result.verdictKey)}
              {(result.crisis || result.emergency) && <Link to="/safety" className="ml-1 underline">{t('raiGetHelp')}</Link>}
            </div>
            <div className="space-y-1.5">
              {result.checks.map((c) => {
                const tn = CK_TONE[c.status]
                return (
                  <div key={c.key} className="flex items-start gap-2.5 rounded-xl bg-white/[0.02] px-3 py-2">
                    <span style={{ color: tn.c }}>{tn.i}</span>
                    <div className="min-w-0 flex-1"><p className="text-[0.82rem] font-medium">{t(c.key)}</p><p className="text-[0.74rem] text-text-muted">{t(c.detailKey)}</p></div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Confidence levels */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>📊</span><h2 className="font-heading text-lg font-semibold">{t('raiConfidence')}</h2></div>
        <div className="space-y-2">
          {CONFIDENCE.map((c) => (
            <Card key={c.key} className="flex items-start gap-3">
              <Badge tone={c.tone}>{t(c.key)}</Badge>
              <div className="min-w-0 flex-1"><p className="text-[0.72rem] text-text-muted">{c.pct}</p><p className="mt-0.5 text-[0.82rem] text-text-secondary">{t(c.whyKey)}</p></div>
            </Card>
          ))}
        </div>
      </div>

      {/* Hallucination prevention */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🚫</span><h2 className="font-heading text-lg font-semibold">{t('raiNeverFab')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('raiNeverFabSub')}</p>
        <Card>
          <div className="flex flex-wrap gap-2">{NEVER_FABRICATE.map((k) => <span key={k} className="rounded-pill border border-danger/20 bg-danger/[0.05] px-3 py-1.5 text-[0.78rem] text-text-secondary">🚫 {t(k)}</span>)}</div>
        </Card>
      </div>

      {/* Emergency & crisis handling */}
      <Card className="flex items-center gap-3 border-accent-ai/20 bg-accent-ai/[0.05]">
        <span className="text-2xl">🆘</span>
        <div className="flex-1"><p className="font-heading font-semibold">{t('raiEmergency')}</p><p className="text-caption text-text-secondary">{t('raiEmergencyDesc')}</p></div>
        <Button as={Link} to="/safety" size="sm" variant="secondary">{t('raiSafetyLink')} <ArrowRightIcon size={14} /></Button>
      </Card>
    </div>
  )
}

// ── EXPLAINABILITY (live) ────────────────────────────────────────────────────
function ExplainTab({ t }) {
  const ex = useMemo(() => explain(), [])
  const rows = [
    { icon: '💬', labelKey: 'exWhat', value: t(ex.whatKey) },
    { icon: '🤔', labelKey: 'exWhy', value: t(ex.whyKey) },
    { icon: '➡️', labelKey: 'exNext', value: t(ex.nextKey) },
  ]
  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 bg-accent-ai/[0.06]">
        <SparklesIcon size={18} className="mt-0.5 text-accent-ai" />
        <p className="text-[0.88rem] leading-relaxed text-text-secondary">{t('raiExplainIntro')}</p>
      </Card>

      <Card className="bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent">
        {rows.map((r) => (
          <div key={r.labelKey} className="border-b border-white/[0.06] py-3 first:pt-0 last:border-0 last:pb-0">
            <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{r.icon} {t(r.labelKey)}</p>
            <p className="mt-1 text-[0.9rem] leading-relaxed text-text-secondary">{r.value}</p>
          </div>
        ))}
        {/* Which data */}
        <div className="border-t border-white/[0.06] py-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">📂 {t('exWhich')}</p>
          <ul className="mt-1.5 space-y-1">
            {ex.dataPoints.map((d, i) => <li key={i} className="text-[0.84rem] text-text-secondary">• {fill(t, d.key, d.vars || {})}</li>)}
          </ul>
        </div>
        {/* Confidence */}
        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3">
          <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">🎯 {t('exCertainty')}</p>
          <Badge tone="ai" className="ml-auto">{t(ex.confKey)} · {ex.confPct}%</Badge>
        </div>
      </Card>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">{t('raiExplainNote')}</p>
      </div>
    </div>
  )
}

// ── GOVERNANCE ────────────────────────────────────────────────────────────────
function GovernanceTab({ t }) {
  const fa = useMemo(() => fairness(), [])
  return (
    <div className="space-y-6">
      {/* Fairness dashboard */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>⚖️</span><h2 className="font-heading text-lg font-semibold">{t('raiFairness')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('raiFairnessSub')}</p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {fa.map((f) => (
            <Card key={f.key} className="bg-white/[0.02]">
              <p className="mb-2 text-caption font-semibold text-text-secondary">{t(f.key)}</p>
              <div className="space-y-1.5">
                {f.groups.map((g) => (
                  <div key={g.g} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[0.72rem] text-text-muted">{g.g}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full rounded-pill" style={{ width: `${g.v}%`, background: HUE }} /></div>
                    <span className="w-8 shrink-0 text-right text-[0.7rem] text-text-secondary">{g.v}%</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>📈</span><h2 className="font-heading text-lg font-semibold">{t('raiMetrics')}</h2></div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {METRICS.map((m) => (
            <Card key={m.key} className="text-center"><p className="font-stat text-xl font-bold" style={{ color: m.tone === 'success' ? '#6ee7b7' : m.tone === 'ai' ? '#a78bfa' : '#e8e0e6' }}>{m.value}</p><p className="mt-0.5 text-[0.7rem] text-text-muted">{t(m.key)}</p></Card>
          ))}
        </div>
      </div>

      {/* Model card */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🧠</span><h2 className="font-heading text-lg font-semibold">{t('raiModelCard')}</h2></div>
        <Card>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2"><span className="text-caption text-text-muted">{t('mcVersion')}</span><Badge tone="ai">{MODEL_CARD.version}</Badge></div>
          {[['📚', 'mcTrainLabel', MODEL_CARD.trainKey], ['⚡', 'mcCapLabel', MODEL_CARD.capKey], ['⚠️', 'mcLimitLabel', MODEL_CARD.limitKey]].map(([e, lab, val]) => (
            <div key={lab} className="pt-2"><p className="text-[0.72rem] font-semibold text-text-muted">{e} {t(lab)}</p><p className="text-[0.82rem] text-text-secondary">{t(val)}</p></div>
          ))}
        </Card>
      </div>

      {/* Ops sections */}
      <GovList t={t} icon="👤" titleKey="raiOversight" items={OVERSIGHT} />
      <GovList t={t} icon="📝" titleKey="raiPromptGov" items={PROMPT_GOV} chips />
      <GovList t={t} icon="🚀" titleKey="raiChange" items={CHANGE_STEPS} numbered />
      <GovList t={t} icon="🎯" titleKey="raiRedteam" items={REDTEAM} chips />
      <GovList t={t} icon="🚨" titleKey="raiIncident" items={INCIDENT} numbered />
      <GovList t={t} icon="📜" titleKey="raiAudit" items={AUDIT} chips />
    </div>
  )
}

function GovList({ t, icon, titleKey, items, chips, numbered }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2"><span>{icon}</span><h2 className="font-heading text-lg font-semibold">{t(titleKey)}</h2></div>
      {chips ? (
        <div className="flex flex-wrap gap-2">{items.map((k) => <span key={k} className="rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.76rem] text-text-secondary">{t(k)}</span>)}</div>
      ) : numbered ? (
        <div className="flex flex-wrap gap-2">{items.map((k, i) => <span key={k} className="flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.76rem] text-text-secondary"><span className="grid h-4 w-4 place-items-center rounded-full bg-accent-primary/20 text-[0.6rem] text-accent-secondary">{i + 1}</span>{t(k)}</span>)}</div>
      ) : (
        <Card><ul className="space-y-1.5">{items.map((k) => <li key={k} className="flex items-start gap-2 text-[0.84rem] text-text-secondary"><span className="text-accent-secondary">▪</span> {t(k)}</li>)}</ul></Card>
      )}
    </div>
  )
}

// ── YOU (user control + feedback) ────────────────────────────────────────────
function YouTab({ t, tick, bump }) {
  const trust = useMemo(() => getTrust(), [tick])
  const [sent, setSent] = useState(false)

  return (
    <div className="space-y-6">
      {/* Transparency controls */}
      <div>
        <div className="mb-3 flex items-center gap-2"><LockIcon size={16} className="text-accent-secondary" /><h2 className="font-heading text-lg font-semibold">{t('raiControls')}</h2></div>
        <Card>
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div><p className="font-heading text-[0.9rem] font-semibold">{t('raiPersonalization')}</p><p className="text-caption text-text-secondary">{t('raiPersonalizationSub')}</p></div>
            <button onClick={() => { setPersonalization(!trust.personalization); bump() }} aria-pressed={trust.personalization} className={`relative h-6 w-11 shrink-0 rounded-full transition ${trust.personalization ? 'bg-accent-primary' : 'bg-white/15'}`}>
              <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: trust.personalization ? '1.5rem' : '0.25rem' }} />
            </button>
          </div>
          <ul className="mt-3 space-y-2">
            {[['🧠', 'raiCtlMemory', '/mira'], ['📄', 'raiCtlReports', '/report'], ['🔬', 'raiCtlResearch', '/research'], ['🎙️', 'raiCtlVoice', '/voice']].map(([e, k, to]) => (
              <li key={k}><Link to={to} className="flex items-center gap-2 text-[0.84rem] text-text-secondary hover:text-text-primary">{e} {t(k)} <ArrowRightIcon size={13} className="text-text-muted" /></Link></li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Feedback */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>💬</span><h2 className="font-heading text-lg font-semibold">{t('raiFeedback')}</h2></div>
        <Card>
          {sent ? (
            <div className="py-4 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-success/15 text-2xl">💚</div><p className="mt-2 font-heading font-semibold">{t('raiThanks')}</p><p className="text-caption text-text-secondary">{fill(t, 'raiFeedbackCount', { n: feedbackCount() })}</p></div>
          ) : (
            <>
              <p className="text-[0.86rem] text-text-secondary">{t('raiFeedbackPrompt')}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => { submitFeedback(true); setSent(true); bump() }}>👍 {t('raiHelpful')}</Button>
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => { submitFeedback(false); setSent(true); bump() }}>👎 {t('raiNotHelpful')}</Button>
              </div>
              <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">{t('raiRateAspects')}</p>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_ASPECTS.map((k) => <button key={k} onClick={() => { submitFeedback(true, k); setSent(true); bump() }} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.74rem] text-text-secondary hover:text-text-primary">{t(k)}</button>)}
              </div>
            </>
          )}
        </Card>
        <p className="mt-2 text-[0.74rem] text-text-muted">🛡️ {t('raiFeedbackNote')}</p>
      </div>
    </div>
  )
}
