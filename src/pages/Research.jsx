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
  CONSENT_LEVELS, getResearch, setLevel, anyConsent, consentHistory, anonymize, anonId,
  PRIVACY_TECH, STUDIES, study, joinedStudies, isJoined, joinStudy, leaveStudy,
  eligibilityMatches, studyExplainer, populationStats, fairnessMetrics, contribution,
} from '../lib/research'

const HUE = '#a78bfa' // single sequential hue for magnitude charts
function fill(t, key, vars = {}) { let s = t(key); Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) }); return s }

export default function Research() {
  const { t, lang } = useT()
  const [tab, setTab] = useState('participation')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const [explainId, setExplainId] = useState(null)

  const tabs = [['participation', '🙋‍♀️', 'reTabPart'], ['studies', '🔬', 'reTabStudies'], ['insights', '📊', 'reTabInsights']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('reBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('reTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('reSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-md gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-pill px-2 py-2 text-[0.8rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'participation' && <ParticipationTab t={t} lang={lang} tick={tick} bump={bump} />}
        {tab === 'studies' && <StudiesTab t={t} tick={tick} onExplain={setExplainId} />}
        {tab === 'insights' && <InsightsTab t={t} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('reDisclaimer')}</p>
      </div>

      <div className="h-24" />
      {explainId && <ExplainerModal t={t} id={explainId} onClose={() => setExplainId(null)} onJoined={() => { setExplainId(null); bump() }} />}
      <BottomNav />
    </PageShell>
  )
}

// ── PARTICIPATION ─────────────────────────────────────────────────────────────
function ParticipationTab({ t, lang, tick, bump }) {
  const r = useMemo(() => getResearch(), [tick])
  const joined = useMemo(() => joinedStudies(), [tick])
  const contrib = useMemo(() => contribution(), [tick])
  const log = useMemo(() => consentHistory(), [tick])
  const anon = useMemo(() => anonymize(), [tick])
  const active = anyConsent()

  function download() {
    try {
      const blob = new Blob([JSON.stringify({ anonId: anonId(), levels: r.levels, joined: r.joined, consentHistory: log }, null, 2)], { type: 'application/json' })
      const u = URL.createObjectURL(blob); const a = document.createElement('a')
      a.href = u; a.download = 'mira-consent-history.json'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      {/* Privacy status */}
      <Card className={`flex items-center gap-3 ${active ? 'border-accent-ai/25 bg-accent-ai/[0.06]' : 'border-success/25 bg-success/[0.06]'}`}>
        <span className="text-2xl">{active ? '🔬' : '🔒'}</span>
        <div className="flex-1">
          <p className="font-heading font-semibold">{active ? t('rePartActive') : t('rePartOff')}</p>
          <p className="text-caption text-text-secondary">{active ? fill(t, 'rePartActiveSub', { n: contrib.levelsOn }) : t('rePartOffSub')}</p>
        </div>
      </Card>

      {/* Consent levels */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🎚️</span><h2 className="font-heading text-lg font-semibold">{t('reConsentLevels')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('reConsentIntro')}</p>
        <div className="space-y-2">
          {CONSENT_LEVELS.map((lv) => (
            <div key={lv.id} className={`rounded-2xl border p-3.5 transition ${r.levels[lv.id] ? 'border-accent-primary/25 bg-accent-primary/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{lv.emoji}</span>
                <div className="min-w-0 flex-1"><p className="font-heading text-[0.92rem] font-semibold">{t(lv.titleKey)}</p></div>
                <button onClick={() => { setLevel(lv.id, !r.levels[lv.id]); bump() }} aria-pressed={r.levels[lv.id]} className={`relative h-6 w-11 shrink-0 rounded-full transition ${r.levels[lv.id] ? 'bg-accent-primary' : 'bg-white/15'}`}>
                  <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: r.levels[lv.id] ? '1.5rem' : '0.25rem' }} />
                </button>
              </div>
              <p className="mt-1.5 pl-9 text-[0.8rem] leading-relaxed text-text-secondary">{t(lv.descKey)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Anonymisation engine */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🕵️‍♀️</span><h2 className="font-heading text-lg font-semibold">{t('reAnon')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('reAnonIntro')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="border-danger/20 bg-danger/[0.04]">
            <p className="mb-2 text-caption font-semibold text-danger">🚫 {t('reAnonRemoved')}</p>
            <ul className="space-y-1.5">
              {anon.removed.map((x) => (
                <li key={x.key} className="flex items-center gap-2 text-[0.8rem]">
                  <span className="text-text-muted line-through">{x.before}</span>
                  <span className="ml-auto text-[0.66rem] text-text-muted">{t(x.key)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-success/20 bg-success/[0.04]">
            <p className="mb-2 text-caption font-semibold text-success">✓ {t('reAnonKept')}</p>
            <ul className="space-y-1.5">
              {anon.kept.map((x) => (
                <li key={x.key} className="flex items-center gap-2 text-[0.8rem]">
                  <span className="font-medium text-text-primary">{x.value}</span>
                  <span className="ml-auto text-[0.66rem] text-text-muted">{t(x.key)}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <p className="mt-2 text-[0.76rem] text-text-muted">🛡️ {t('reAnonNote')}</p>
      </div>

      {/* My active studies */}
      {joined.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>📋</span><h2 className="font-heading text-lg font-semibold">{t('reMyStudies')}</h2></div>
          <div className="space-y-2">
            {joined.map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <span className="text-2xl">{s.emoji}</span>
                <div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(s.titleKey)}</p><p className="text-[0.72rem] text-text-muted">{t(s.orgKey)}</p></div>
                <Button size="sm" variant="ghost" onClick={() => { leaveStudy(s.id); bump() }}>{t('reLeave')}</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Contribution & badges */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>💝</span><h2 className="font-heading text-lg font-semibold">{t('reContribution')}</h2></div>
        <Card className="bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat n={contrib.joinedCount} labelKey="reStudiesJoined" t={t} />
            <Stat n={contrib.levelsOn} labelKey="reLevelsOn" t={t} />
            <Stat n={contrib.dataPoints} labelKey="reDataPoints" t={t} />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {contrib.badges.map((b) => (
              <div key={b.id} title={t(b.titleKey)} className={`flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[0.72rem] ${b.earned ? 'border-accent-primary/30 bg-accent-primary/10 text-text-primary' : 'border-white/[0.06] text-text-muted opacity-50'}`}>
                <span>{b.emoji}</span> {t(b.titleKey)}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Consent history */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span>📜</span><h2 className="font-heading text-lg font-semibold">{t('reHistory')}</h2>
          {log.length > 0 && <Button size="sm" variant="secondary" className="ml-auto" onClick={download}>⬇️ {t('reDownload')}</Button>}
        </div>
        {log.length === 0 ? (
          <Card className="text-center"><p className="text-[0.9rem] text-text-secondary">{t('reNoHistory')}</p></Card>
        ) : (
          <div className="space-y-1.5">
            {log.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-2 text-[0.76rem]">
                <span className="text-text-muted">{new Date(e.at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-text-secondary">{fill(t, `reLog_${e.actionKey}`, { level: e.level ? t(CONSENT_LEVELS.find((l) => l.id === e.level)?.titleKey || e.level) : '', study: e.study ? t(study(e.study)?.titleKey || '') : '' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
function Stat({ n, labelKey, t }) {
  return <div><p className="font-stat text-2xl font-bold text-text-primary">{n.toLocaleString()}</p><p className="text-[0.68rem] text-text-muted">{t(labelKey)}</p></div>
}

// ── STUDIES ───────────────────────────────────────────────────────────────────
function StudiesTab({ t, tick, onExplain }) {
  const matches = useMemo(() => eligibilityMatches(), [tick])
  const [status, setStatus] = useState('active')
  const list = STUDIES.filter((s) => s.status === status)
  const STATUS = [['active', 'reActive'], ['upcoming', 'reUpcoming'], ['completed', 'reCompleted']]
  const ORG_TONE = { hospital: 'danger', university: 'ai', ngo: 'success' }

  return (
    <div className="space-y-5">
      {/* Eligibility matches */}
      {matches.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2"><SparklesIcon size={16} className="text-accent-ai" /><h2 className="font-heading text-lg font-semibold">{t('reMatches')}</h2></div>
          <div className="space-y-2">
            {matches.map((m) => {
              const s = study(m.id)
              return (
                <Card key={m.id} className="flex items-start gap-3 bg-accent-ai/[0.06]">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[0.9rem] font-semibold">{t(s.titleKey)}</p>
                    <p className="mt-0.5 text-[0.78rem] text-accent-ai">✨ {t(m.reasonKey)}</p>
                  </div>
                  <Button size="sm" onClick={() => onExplain(m.id)} disabled={isJoined(m.id)}>{isJoined(m.id) ? t('reJoined') : t('reLearnMore')}</Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1.5">
        {STATUS.map(([id, key]) => (
          <button key={id} onClick={() => setStatus(id)} className={`rounded-pill px-3.5 py-1.5 text-[0.78rem] font-medium transition ${status === id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary'}`}>{t(key)}</button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{s.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[0.92rem] font-semibold">{t(s.titleKey)}</p>
                <p className="text-[0.72rem] text-text-muted">{t(s.orgKey)}</p>
              </div>
              <Badge tone={ORG_TONE[s.orgType]}>{t(`org_${s.orgType}`)}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] text-text-muted">
              <span>⏱️ {t(s.durationKey)}</span><span>📊 {t(s.commitmentKey)}</span>
            </div>
            <p className="mt-2 flex-1 text-[0.8rem] leading-relaxed text-text-secondary">{t(s.benefitKey)}</p>
            <div className="mt-3">
              {s.status === 'completed' ? <Badge tone="neutral">✓ {t('reCompleted')}</Badge>
                : s.status === 'upcoming' ? <Badge tone="warning">🗓️ {t('reUpcoming')}</Badge>
                : <Button size="sm" onClick={() => onExplain(s.id)} disabled={isJoined(s.id)}>{isJoined(s.id) ? '✓ ' + t('reJoined') : t('reLearnMore')}</Button>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function ExplainerModal({ t, id, onClose, onJoined }) {
  const ex = useMemo(() => studyExplainer(id), [id])
  const [done, setDone] = useState(false)
  if (!ex) return null
  const s = ex.study
  function accept() { setLevel(s.level, true); joinStudy(s.id); setDone(true) }
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-text-muted hover:text-text-primary">✕</button>
        <Badge tone="ai" icon={<SparklesIcon size={13} />}>{t('exBadge')}</Badge>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl">{s.emoji}</span>
          <div><h3 className="font-heading text-lg font-semibold">{t(s.titleKey)}</h3><p className="text-caption text-text-secondary">{t(s.orgKey)}</p></div>
        </div>

        {!done ? (
          <>
            <p className="mt-3 text-caption text-text-secondary">{t('exIntro')}</p>
            <div className="mt-3 space-y-2">
              {ex.rows.map((r) => (
                <div key={r.labelKey} className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                  <span className="text-lg">{r.icon}</span>
                  <div><p className="text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t(r.labelKey)}</p><p className="mt-0.5 text-[0.85rem] leading-relaxed text-text-secondary">{t(r.valueKey)}</p></div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-2xl border border-accent-primary/20 bg-accent-primary/[0.05] p-3">
              <LockIcon size={16} className="text-accent-secondary" />
              <p className="text-[0.78rem] text-text-secondary">{fill(t, 'exEnables', { level: t(ex.levelKey) })}</p>
            </div>
            <Button className="mt-4 w-full" onClick={accept}>{t('exAccept')}</Button>
            <Button variant="ghost" className="mt-1 w-full" onClick={onClose}>{t('exDecline')}</Button>
            <p className="mt-3 text-center text-[0.72rem] text-text-muted">{t('exWithdraw')}</p>
          </>
        ) : (
          <div className="mt-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-2xl">✓</div>
            <h3 className="mt-3 font-heading text-lg font-semibold">{t('exJoinedTitle')}</h3>
            <p className="mt-1 text-caption text-text-secondary">{t('exJoinedSub')}</p>
            <Button className="mt-4 w-full" onClick={onJoined}>{t('exDone')}</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── INSIGHTS ──────────────────────────────────────────────────────────────────
function InsightsTab({ t }) {
  const p = useMemo(() => populationStats(), [])
  const fair = useMemo(() => fairnessMetrics(), [])

  return (
    <div className="space-y-6">
      <Card className="flex items-center gap-4 bg-gradient-to-br from-[#a78bfa]/[0.12] to-transparent">
        <div><p className="font-stat text-3xl font-bold text-text-primary">{p.participants.toLocaleString()}</p><p className="text-caption text-text-muted">{t('reParticipants')}</p></div>
        <div className="ml-auto text-right"><p className="font-stat text-3xl font-bold text-text-primary">{p.studies}</p><p className="text-caption text-text-muted">{t('reStudiesLbl')}</p></div>
      </Card>
      <p className="-mt-3 text-caption text-text-muted">🛡️ {t('reAggregateNote')}</p>

      {/* Cycle length distribution */}
      <ChartCard t={t} titleKey="rePopCycle">
        <BarDist data={p.cycleLength} suffix="%" />
      </ChartCard>

      {/* Hydration trend */}
      <ChartCard t={t} titleKey="rePopHydration">
        <AreaLine data={p.hydration} suffix="%" labelsKey="reLast7" t={t} />
      </ChartCard>

      {/* Mood trend */}
      <ChartCard t={t} titleKey="rePopMood">
        <AreaLine data={p.mood} suffix="" labelsKey="reWeekly" t={t} />
      </ChartCard>

      {/* Top symptoms */}
      <ChartCard t={t} titleKey="rePopSymptoms">
        <BarDist data={p.topSymptoms.map((s) => ({ label: t(s.label), v: s.v }))} suffix="%" />
      </ChartCard>

      {/* Privacy-preserving tech */}
      <div>
        <div className="mb-3 flex items-center gap-2"><ShieldIcon size={16} className="text-accent-ai" /><h2 className="font-heading text-lg font-semibold">{t('rePrivacyTech')}</h2></div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PRIVACY_TECH.map((x) => (
            <Card key={x.titleKey} className="bg-white/[0.02]">
              <p className="flex items-center gap-2 font-heading text-[0.9rem] font-semibold">{x.emoji} {t(x.titleKey)}</p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-text-secondary">{t(x.descKey)}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* AI fairness */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>⚖️</span><h2 className="font-heading text-lg font-semibold">{t('reFairness')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('reFairnessIntro')}</p>
        <div className="space-y-3">
          {fair.map((f) => (
            <Card key={f.key} className="bg-white/[0.02]">
              <p className="mb-2 text-caption font-semibold text-text-secondary">{t(f.key)}</p>
              <div className="space-y-1.5">
                {f.groups.map((g) => (
                  <div key={g.g} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 text-[0.74rem] text-text-muted">{g.g}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full rounded-pill" style={{ width: `${g.v}%`, background: HUE }} /></div>
                    <span className="w-9 shrink-0 text-right text-[0.72rem] text-text-secondary">{g.v}%</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* For researchers / governance */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🏛️</span><h2 className="font-heading text-lg font-semibold">{t('reGovernance')}</h2></div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[['🏥', 'reGovHospital'], ['🎓', 'reGovUniversity'], ['📋', 'reGovEthics'], ['🔐', 'reGovAudit']].map(([e, k]) => (
            <Card key={k} className="bg-white/[0.02]"><p className="flex items-center gap-2 font-heading text-[0.88rem] font-semibold">{e} {t(k)}</p><p className="mt-1 text-[0.78rem] leading-relaxed text-text-secondary">{t(k + 'Desc')}</p></Card>
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ t, titleKey, children }) {
  return (
    <Card>
      <p className="mb-3 font-heading text-[0.95rem] font-semibold">{t(titleKey)}</p>
      {children}
    </Card>
  )
}

// Horizontal single-hue magnitude bars, baseline-anchored, rounded data-ends.
function BarDist({ data, suffix }) {
  const max = Math.max(...data.map((d) => d.v), 1)
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="w-14 shrink-0 text-[0.72rem] text-text-muted">{d.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-pill bg-white/[0.05]">
            <div className="h-full rounded-pill" style={{ width: `${(d.v / max) * 100}%`, background: HUE }} title={`${d.v}${suffix}`} />
          </div>
          <span className="w-9 shrink-0 text-right text-[0.72rem] text-text-secondary">{d.v}{suffix}</span>
        </div>
      ))}
    </div>
  )
}

// Single-series area+line over time (sequential hue), with min/max direct labels.
function AreaLine({ data, suffix, labelsKey, t }) {
  const W = 300, H = 90, pad = 6
  const max = Math.max(...data), min = Math.min(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return [x, y]
  })
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - pad} L${pts[0][0].toFixed(1)},${H - pad} Z`
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img">
        <defs><linearGradient id="reArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={HUE} stopOpacity="0.35" /><stop offset="100%" stopColor={HUE} stopOpacity="0.02" /></linearGradient></defs>
        <path d={area} fill="url(#reArea)" />
        <path d={line} fill="none" stroke={HUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={HUE}><title>{data[i]}{suffix}</title></circle>)}
      </svg>
      <div className="mt-1 flex justify-between text-[0.68rem] text-text-muted"><span>{t(labelsKey)}</span><span>{min}{suffix} – {max}{suffix}</span></div>
    </div>
  )
}
