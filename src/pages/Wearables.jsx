import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  CATALOG, METRICS, catalogItem, getState, connectedDevices, hasWearable,
  connectDevice, disconnectDevice, renameDevice, togglePause, syncNow,
  setAutoLog, setMetric, daySignals, wearableScore, insights, heartNote,
  tempSignal, healthTimeline,
} from '../lib/wearables'

function fill(t, key, vars = {}) {
  let s = t(key)
  Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
  return s
}
function ago(iso, t) {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso)) / 60000))
  if (m < 1) return t('wSyncNow')
  if (m < 60) return fill(t, 'wSyncMin', { n: m })
  const h = Math.round(m / 60)
  return h < 24 ? fill(t, 'wSyncHr', { n: h }) : fill(t, 'wSyncDay', { n: Math.round(h / 24) })
}
const CAT_EMOJI = { platform: '📲', ring: '💍', watch: '⌚', scale: '⚖️' }
const battColor = (b) => (b > 40 ? '#6ee7b7' : b > 15 ? '#fbbf24' : '#fb7185')

export default function Wearables() {
  const { t, lang } = useT()
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const state = useMemo(() => getState(), [tick])
  const devices = state.devices
  const connected = hasWearable()
  const [picker, setPicker] = useState(false)
  const [manage, setManage] = useState(null) // device id being managed

  const sig = useMemo(() => daySignals(), [tick])
  const score = useMemo(() => wearableScore(), [tick])
  const ins = useMemo(() => insights(), [tick])
  const heart = useMemo(() => heartNote(), [tick])
  const temp = useMemo(() => tempSignal(), [tick])
  const timeline = useMemo(() => healthTimeline(5), [tick])

  const doConnect = (id) => { connectDevice(id); setPicker(false); bump() }

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('wBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('wTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('wSub')}</p>
      </div>

      {/* Connected devices */}
      <div className="mb-3 mt-8 flex items-center gap-2">
        <span className="text-lg">📡</span>
        <h2 className="font-heading text-lg font-semibold">{t('wConnected')}</h2>
        <Button size="sm" variant="secondary" className="ml-auto" onClick={() => setPicker(true)}>+ {t('wAdd')}</Button>
      </div>

      {devices.length === 0 ? (
        <Card className="text-center">
          <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-full bg-accent-ai/10 text-3xl">⌚</div>
          <p className="font-heading font-semibold">{t('wEmptyTitle')}</p>
          <p className="mx-auto mt-1 max-w-sm text-caption text-text-secondary">{t('wEmptySub')}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => doConnect('oura')}>💍 {t('wQuickRing')}</Button>
            <Button size="sm" variant="secondary" onClick={() => doConnect('apple-health')}>🍎 {t('wQuickHealth')}</Button>
            <Button size="sm" variant="secondary" onClick={() => setPicker(true)}>{t('wBrowseAll')}</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {devices.map((d) => {
            const item = catalogItem(d.catalogId)
            return (
              <Card key={d.id} className={d.paused ? 'opacity-60' : ''}>
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.04] text-xl">{item?.brand || item?.emoji || CAT_EMOJI[d.category]}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading font-semibold">{d.name}</p>
                    <p className="text-[0.72rem] text-text-muted">{t(`wCat_${d.category}`)} · v{d.firmware}</p>
                  </div>
                  <span className="flex items-center gap-1 text-caption" style={{ color: battColor(d.battery) }}>🔋 {d.battery}%</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-[0.74rem]">
                  <span className={`flex items-center gap-1.5 ${d.paused ? 'text-text-muted' : 'text-success'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${d.paused ? 'bg-text-muted' : 'bg-success animate-glow-pulse'}`} />
                    {d.paused ? t('wPaused') : t('wSynced')} · {ago(d.lastSync, t)}
                  </span>
                  <div className="flex gap-1.5">
                    <button onClick={() => { syncNow(d.id); bump() }} className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-[0.7rem] text-text-secondary hover:text-text-primary">↻ {t('wSyncBtn')}</button>
                    <button onClick={() => setManage(manage === d.id ? null : d.id)} className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-[0.7rem] text-text-secondary hover:text-text-primary">⚙</button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(item?.metrics || []).map((m) => <span key={m} className="rounded-pill bg-accent-ai/[0.08] px-2 py-0.5 text-[0.64rem] text-accent-ai">{t(`wm_${m}`)}</span>)}
                </div>
                {manage === d.id && (
                  <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
                    <input defaultValue={d.name} onBlur={(e) => { if (e.target.value.trim()) { renameDevice(d.id, e.target.value.trim()); bump() } }}
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 text-caption outline-none focus:border-accent-primary/50" />
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => { togglePause(d.id); bump() }} className="rounded-pill border border-white/10 px-3 py-1 text-[0.72rem] text-text-secondary hover:text-text-primary">{d.paused ? '▶ ' + t('wResume') : '⏸ ' + t('wPause')}</button>
                      <button onClick={() => { disconnectDevice(d.id); setManage(null); bump() }} className="rounded-pill border border-danger/25 px-3 py-1 text-[0.72rem] text-danger hover:bg-danger/10">🗑 {t('wRemove')}</button>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {connected && score.hasData && (
        <>
          {/* Wearable health score + today snapshot */}
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <Card className="flex items-center gap-5 bg-gradient-to-br from-[#a78bfa]/[0.12] to-transparent">
              <ScoreRing score={score.score} />
              <div className="flex-1">
                <h2 className="font-heading font-semibold">{t('wScoreTitle')}</h2>
                <p className="mt-1 text-caption text-text-secondary">{t(score.explainKey)}</p>
                <p className="mt-2 flex items-start gap-1.5 text-caption text-accent-secondary">💡 {t(score.suggestKey)}</p>
              </div>
            </Card>
            <Card>
              <p className="mb-3 font-heading font-semibold">{t('wToday')}</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric emoji="😴" label={t('wm_sleep')} value={`${sig.sleep.hours}h`} sub={`${t('wScore')} ${sig.sleep.score}`} />
                <Metric emoji="🚶‍♀️" label={t('wSteps')} value={sig.activity.steps.toLocaleString()} sub={`${sig.activity.distance} km`} />
                <Metric emoji="❤️" label={t('wRestHR')} value={`${sig.heart.restingHR}`} sub="bpm" />
                <Metric emoji="🫀" label="HRV" value={`${sig.heart.hrv}`} sub="ms" />
                <Metric emoji="🔋" label={t('wm_recovery')} value={`${sig.heart.recovery}`} sub={t('wReady')} />
                <Metric emoji="🌊" label={t('wm_stress')} value={`${sig.stress.calm}`} sub={t('wCalm')} />
              </div>
            </Card>
          </div>

          {/* AI insights */}
          {ins.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">✨ {t('wInsights')}</h2>
              <div className="space-y-2.5">
                {ins.map((x, i) => (
                  <Card key={i} className="flex items-start gap-3 bg-accent-ai/[0.05]">
                    <span className="text-xl">{x.icon}</span>
                    <p className="text-[0.92rem] leading-relaxed text-text-secondary">{fill(t, x.key, x.vars)}</p>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Intelligence cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Card>
              <div className="flex items-center gap-2"><span>😴</span><h3 className="font-heading font-semibold">{t('wSleepTitle')}</h3></div>
              <div className="mt-3 flex gap-1.5">
                <Stage label={t('wDeep')} min={sig.sleep.deep} tone="#a78bfa" total={sig.sleep.hours * 60} />
                <Stage label={t('wRem')} min={sig.sleep.rem} tone="#d97ba8" total={sig.sleep.hours * 60} />
                <Stage label={t('wLight')} min={sig.sleep.light} tone="#6ee7b7" total={sig.sleep.hours * 60} />
              </div>
              <p className="mt-3 text-caption text-text-secondary">{fill(t, 'wSleepNote', { h: sig.sleep.hours, a: sig.sleep.awakenings })}</p>
            </Card>
            <Card>
              <div className="flex items-center gap-2"><span>❤️</span><h3 className="font-heading font-semibold">{t('wHeartTitle')}</h3></div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-stat text-2xl font-bold">{sig.heart.restingHR}<span className="ml-1 text-caption font-normal text-text-muted">bpm</span></span>
                <span className="text-caption text-text-muted">HRV {sig.heart.hrv}ms</span>
              </div>
              {heart && <p className={`mt-2 text-caption ${heart.tone === 'warning' ? 'text-warning' : 'text-text-secondary'}`}>{heart.tone === 'warning' ? '⚠️ ' : '✓ '}{t(heart.key)}</p>}
            </Card>
            {temp && (
              <Card>
                <div className="flex items-center gap-2"><span>🌡️</span><h3 className="font-heading font-semibold">{t('wTempTitle')}</h3></div>
                <p className="mt-2 font-stat text-xl font-bold">{temp.deviation > 0 ? '+' : ''}{temp.deviation}°C</p>
                <p className="mt-1 text-caption text-text-secondary">{t(temp.key)}</p>
                <Badge tone="ai" className="mt-2">{temp.confPct}% {t('wConf')}</Badge>
              </Card>
            )}
            <Card>
              <div className="flex items-center gap-2"><span>🌊</span><h3 className="font-heading font-semibold">{t('wStressTitle')}</h3></div>
              <div className="mt-3 h-2 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full rounded-pill bg-gradient-to-r from-success to-warning" style={{ width: `${sig.stress.level}%` }} /></div>
              <p className="mt-2 text-caption text-text-secondary">{sig.stress.level >= 60 ? t('wStressHi') : t('wStressOk')}</p>
            </Card>
          </div>

          {/* Digital Twin fusion */}
          <Card className="mt-6 flex items-center gap-4 bg-gradient-to-br from-[#a78bfa]/[0.12] via-[#d97ba8]/[0.06] to-transparent">
            <span className="text-3xl">🧬</span>
            <div className="flex-1">
              <p className="font-heading font-semibold">{t('wFusionTitle')}</p>
              <p className="mt-1 text-caption text-text-secondary">{t('wFusionSub')}</p>
            </div>
            <Button as={Link} to="/twin" size="sm" variant="secondary">{t('wOpenTwin')} <ArrowRightIcon size={14} /></Button>
          </Card>

          {/* Health timeline */}
          {timeline.length > 0 && (
            <>
              <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🕑 {t('wTimeline')}</h2>
              <div className="space-y-2.5">
                {timeline.map((row) => (
                  <Card key={row.day} className="bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-semibold text-text-secondary">{fmtDay(row.day, lang, t)}</p>
                      <Badge tone="ai">{t(`phase_${row.phase}`)}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                      {row.items.map((it, i) => <span key={i} className="text-[0.8rem] text-text-secondary">{it.icon} {fill(t, it.key, it.vars)}</span>)}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Privacy & control */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🔒 {t('wPrivacy')}</h2>
      <Card>
        <Toggle label={t('wAutoLog')} sub={t('wAutoLogSub')} on={state.autoLog} onClick={() => { setAutoLog(!state.autoLog); bump() }} />
        <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">{t('wMetricControl')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {METRICS.map((m) => (
            <Toggle key={m} compact label={t(`wm_${m}`)} on={state.metrics[m] !== false} onClick={() => { setMetric(m, !(state.metrics[m] !== false)); bump() }} />
          ))}
        </div>
        <p className="mt-4 text-[0.8rem] leading-relaxed text-text-muted">🛡️ {t('wPrivacyNote')}</p>
      </Card>

      {/* Future devices */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🚀 {t('wFuture')}</h2>
      <div className="flex flex-wrap gap-2">
        {['🩸 CGM', '🩺 BP', '🌡️ Thermometer', '📈 ECG', '🫁 SpO₂', '🧪 Home lab', '💧 Smart bottle', '💊 Dispenser'].map((f) => (
          <span key={f} className="rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-caption text-text-muted">{f}</span>
        ))}
      </div>
      <p className="mt-3 text-caption text-text-muted">{t('wFutureNote')}</p>

      {/* Disclaimer */}
      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('wDisclaimer')}</p>
      </div>

      <div className="h-24" />
      {picker && <DevicePicker t={t} onPick={doConnect} onClose={() => setPicker(false)} connected={devices.map((d) => d.catalogId)} />}
      <BottomNav />
    </PageShell>
  )
}

function Metric({ emoji, label, value, sub }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-[0.68rem] text-text-muted">{emoji} {label}</p>
      <p className="mt-1 font-stat text-lg font-bold">{value}</p>
      <p className="text-[0.66rem] text-text-muted">{sub}</p>
    </div>
  )
}

function Stage({ label, min, tone, total }) {
  return (
    <div className="flex-1" style={{ flexGrow: Math.max(0.4, min / total) }}>
      <div className="h-2 rounded-pill" style={{ background: tone }} />
      <p className="mt-1 text-[0.62rem] text-text-muted">{label} {Math.round(min)}m</p>
    </div>
  )
}

function Toggle({ label, sub, on, onClick, compact }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${compact ? 'rounded-xl bg-white/[0.02] px-3 py-2' : 'border-b border-white/[0.06] pb-3'}`}>
      <div>
        <p className={compact ? 'text-caption' : 'font-heading font-semibold'}>{label}</p>
        {sub && <p className="text-caption text-text-secondary">{sub}</p>}
      </div>
      <button onClick={onClick} aria-pressed={on} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-accent-primary' : 'bg-white/15'}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
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

function DevicePicker({ t, onPick, onClose, connected }) {
  const groups = [
    { key: 'wGrpPlatform', cat: 'platform' }, { key: 'wGrpRing', cat: 'ring' },
    { key: 'wGrpWatch', cat: 'watch' }, { key: 'wGrpScale', cat: 'scale' },
  ]
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">{t('wPickTitle')}</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-secondary">{t('wPickSub')}</p>
        {groups.map((g) => (
          <div key={g.cat} className="mt-4">
            <p className="mb-2 text-caption font-semibold text-text-muted">{t(g.key)}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CATALOG.filter((c) => c.category === g.cat).map((c) => {
                const on = connected.includes(c.id)
                return (
                  <button key={c.id} disabled={on} onClick={() => onPick(c.id)}
                    className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${on ? 'border-success/25 bg-success/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-accent-primary/50 hover:bg-accent-primary/[0.06]'}`}>
                    <span className="text-xl">{c.brand || c.emoji || '📟'}</span>
                    <span className="flex-1 text-[0.9rem] font-medium">{c.name}</span>
                    <span className="text-caption">{on ? <span className="text-success">✓ {t('wConnectedTag')}</span> : <span className="text-accent-secondary">+ {t('wConnect')}</span>}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <p className="mt-4 text-[0.74rem] leading-relaxed text-text-muted">🛡️ {t('wPickNote')}</p>
      </div>
    </div>
  )
}

function fmtDay(iso, lang, t) {
  const d = new Date(iso)
  const today = new Date().toISOString().slice(0, 10)
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  if (iso === today) return t('wToday2')
  if (iso === yest) return t('wYesterday')
  try { return d.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { weekday: 'short', day: 'numeric', month: 'short' }) } catch { return iso }
}
