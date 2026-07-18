import { useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { SparklesIcon, ShieldIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  ARCH_LAYERS, CLOUD_STACK, ENVIRONMENTS, AI_SERVICES, systemStatus, SLOS, PERF_TARGETS, REGIONS,
  CICD, RELEASE, CANARY, getFlags, toggleFlag, DR_SCENARIOS, CONTINUITY, BACKUP, OFFLINE, INCIDENT,
  OBSERVABILITY, ALERTS, SECURITY, SCALING, QUEUE, CACHING, COST, COMPLIANCE, FUTURE,
} from '../lib/infra'

const REGION_TONE = { primary: 'ai', active: 'success', planned: 'neutral' }

export default function Platform() {
  const { t } = useT()
  const [tab, setTab] = useState('architecture')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)

  const tabs = [['architecture', '🏗️', 'infTabArch'], ['status', '📊', 'infTabStatus'], ['delivery', '🚀', 'infTabDelivery'], ['resilience', '🛟', 'infTabResilience'], ['ops', '🔧', 'infTabOps']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('infBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('infTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('infSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-lg gap-1 overflow-x-auto rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)} aria-label={t(key)} className={`flex-1 shrink-0 whitespace-nowrap rounded-pill px-3 py-2 text-[0.72rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'architecture' && <ArchitectureTab t={t} />}
        {tab === 'status' && <StatusTab t={t} />}
        {tab === 'delivery' && <DeliveryTab t={t} tick={tick} bump={bump} />}
        {tab === 'resilience' && <ResilienceTab t={t} />}
        {tab === 'ops' && <OpsTab t={t} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('infDisclaimer')}</p>
      </div>

      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

// ── ARCHITECTURE ──────────────────────────────────────────────────────────────
function ArchitectureTab({ t }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🏗️</span><h2 className="font-heading text-lg font-semibold">{t('infArch')}</h2></div>
        <div className="space-y-1.5">
          {ARCH_LAYERS.map((l, i) => (
            <div key={l.key}>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <p className="mb-2 flex items-center gap-2 text-[0.78rem] font-semibold text-text-secondary">{l.emoji} {t(l.key)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {l.nodesKeys.map((n) => <span key={n} className="rounded-pill bg-accent-primary/[0.08] px-2.5 py-1 text-[0.72rem] text-accent-secondary">{t(n)}</span>)}
                </div>
              </div>
              {i < ARCH_LAYERS.length - 1 && <div className="flex justify-center py-0.5 text-text-muted">↓</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Cloud stack */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>☁️</span><h2 className="font-heading text-lg font-semibold">{t('infStack')}</h2></div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CLOUD_STACK.map((g) => (
            <Card key={g.key} className="bg-white/[0.02]">
              <p className="mb-2 text-[0.82rem] font-semibold">{g.emoji} {t(g.key)}</p>
              <div className="flex flex-wrap gap-1.5">{g.items.map((it) => <span key={it} className="rounded-pill bg-white/[0.05] px-2 py-0.5 text-[0.68rem] text-text-secondary">{it}</span>)}</div>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-[0.7rem] text-text-muted">{t('infStackNote')}</p>
      </div>

      {/* Environments */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🧪</span><h2 className="font-heading text-lg font-semibold">{t('infEnvironments')}</h2></div>
        <div className="flex flex-wrap items-center gap-1.5">
          {ENVIRONMENTS.map((e, i) => (
            <span key={e} className="flex items-center gap-1.5">
              <span className="rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.74rem] text-text-secondary">{t(e)}</span>
              {i < ENVIRONMENTS.length - 1 && <span className="text-text-muted">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* AI services */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🧠</span><h2 className="font-heading text-lg font-semibold">{t('infAiServices')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('infAiServicesSub')}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {AI_SERVICES.map((s) => <div key={s.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"><div className="text-2xl">{s.emoji}</div><p className="mt-1 text-[0.72rem] text-text-secondary">{t(s.key)}</p></div>)}
        </div>
      </div>
    </div>
  )
}

// ── STATUS ────────────────────────────────────────────────────────────────────
function StatusTab({ t }) {
  const status = useMemo(() => systemStatus(), [])
  return (
    <div className="space-y-6">
      {/* Banner */}
      <Card className="flex items-center gap-3 border-success/25 bg-success/[0.06]">
        <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-glow-pulse rounded-full bg-success opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-success" /></span>
        <div className="flex-1"><p className="font-heading font-semibold">{t('infAllOk')}</p><p className="text-caption text-text-secondary">{t('infAllOkSub')}</p></div>
      </Card>

      {/* Services */}
      <div className="space-y-2">
        {status.services.map((s) => (
          <div key={s.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <span className="h-2 w-2 shrink-0 rounded-full bg-success" />
            <p className="flex-1 text-[0.86rem] font-medium text-text-secondary">{t(s.key)}</p>
            <span className="text-[0.72rem] text-text-muted">{s.latency < 1000 ? `${s.latency}ms` : `${(s.latency / 1000).toFixed(1)}s`}</span>
            <span className="w-14 text-right text-[0.72rem] text-success">{s.uptime}%</span>
          </div>
        ))}
      </div>

      {/* SLOs */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🎯</span><h2 className="font-heading text-lg font-semibold">{t('infSlos')}</h2></div>
        <div className="grid gap-3 sm:grid-cols-2">
          {SLOS.map((s) => (
            <Card key={s.key} className="bg-white/[0.02]">
              <div className="flex items-center justify-between"><p className="text-[0.84rem] font-semibold">{t(s.key)}</p><Badge tone="success">{s.target}</Badge></div>
              <div className="mt-2 h-2 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-success" style={{ width: `${s.pct}%` }} /></div>
              <p className="mt-1.5 text-[0.72rem] text-text-muted">{t('infActual')}: {typeof s.actual === 'number' && s.actual > 50 ? s.actual + '%' : s.actual}{s.key === 'sloLatency' ? 's' : s.key === 'sloRecovery' ? ' min' : s.key === 'sloErrorBudget' ? '%' : ''}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Performance targets */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>⚡</span><h2 className="font-heading text-lg font-semibold">{t('infPerf')}</h2></div>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
          {PERF_TARGETS.map((p, i) => (
            <div key={p.key} className={`flex items-center gap-3 px-4 py-2.5 text-[0.82rem] ${i % 2 ? 'bg-white/[0.02]' : ''}`}>
              <span className="flex-1 text-text-secondary">{t(p.key)}</span>
              <span className="text-text-muted">{p.target}</span>
              <span className="w-14 text-right font-stat text-success">{p.actual}</span>
              <span className="text-success">✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Regions */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🌍</span><h2 className="font-heading text-lg font-semibold">{t('infRegions')}</h2></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {REGIONS.map((r) => (
            <div key={r.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <div className="text-2xl">{r.emoji}</div>
              <p className="mt-1 text-[0.76rem] text-text-secondary">{t(r.key)}</p>
              <Badge tone={REGION_TONE[r.status]} className="mt-1">{t(`infReg_${r.status}`)}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── DELIVERY ──────────────────────────────────────────────────────────────────
function DeliveryTab({ t, tick, bump }) {
  const flags = useMemo(() => getFlags(), [tick])
  return (
    <div className="space-y-6">
      {/* CI/CD */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🔄</span><h2 className="font-heading text-lg font-semibold">{t('infCicd')}</h2></div>
        <div className="flex flex-wrap items-center gap-1.5">
          {CICD.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[0.72rem] text-text-secondary"><span className="grid h-4 w-4 place-items-center rounded-full bg-accent-primary/20 text-[0.6rem] text-accent-secondary">{i + 1}</span>{t(c)}</span>
              {i < CICD.length - 1 && <span className="text-text-muted">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Release strategy */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>📦</span><h2 className="font-heading text-lg font-semibold">{t('infRelease')}</h2></div>
        <div className="flex flex-wrap items-center gap-1.5">
          {RELEASE.map((r, i) => (
            <span key={r} className="flex items-center gap-1.5">
              <span className="rounded-pill bg-accent-primary/[0.08] px-3 py-1.5 text-[0.74rem] text-accent-secondary">{t(r)}</span>
              {i < RELEASE.length - 1 && <span className="text-text-muted">→</span>}
            </span>
          ))}
        </div>
      </div>

      {/* Canary + blue-green */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-white/[0.02]">
          <p className="mb-2 text-[0.84rem] font-semibold">🐤 {t('infCanary')}</p>
          <div className="flex flex-wrap gap-1.5">{CANARY.map((c) => <span key={c} className="rounded-pill bg-white/[0.05] px-2 py-0.5 text-[0.7rem] text-text-secondary">{c}</span>)}</div>
          <p className="mt-2 text-[0.72rem] text-text-muted">{t('infCanaryNote')}</p>
        </Card>
        <Card className="bg-white/[0.02]">
          <p className="mb-2 text-[0.84rem] font-semibold">🔵🟢 {t('infBlueGreen')}</p>
          <p className="text-[0.78rem] leading-relaxed text-text-secondary">{t('infBlueGreenDesc')}</p>
        </Card>
      </div>

      {/* Feature flags (interactive) */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🚩</span><h2 className="font-heading text-lg font-semibold">{t('infFlags')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('infFlagsSub')}</p>
        <Card>
          <div className="space-y-2">
            {flags.map((f) => (
              <div key={f.id} className="flex items-center gap-3 border-b border-white/[0.04] pb-2 last:border-0 last:pb-0">
                <p className="flex-1 text-[0.86rem] text-text-secondary">{t(f.key)}</p>
                <button onClick={() => { toggleFlag(f.id); bump() }} aria-pressed={f.on} className={`relative h-6 w-11 shrink-0 rounded-full transition ${f.on ? 'bg-accent-primary' : 'bg-white/15'}`}>
                  <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: f.on ? '1.5rem' : '0.25rem' }} />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[0.72rem] text-text-muted">{t('infFlagsNote')}</p>
        </Card>
      </div>

      {/* Auto scaling */}
      <List t={t} icon="📈" titleKey="infScaling" items={SCALING} />
    </div>
  )
}

// ── RESILIENCE ────────────────────────────────────────────────────────────────
function ResilienceTab({ t }) {
  return (
    <div className="space-y-6">
      {/* DR scenarios */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>🛟</span><h2 className="font-heading text-lg font-semibold">{t('infDr')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('infDrSub')}</p>
        <div className="space-y-2">
          {DR_SCENARIOS.map((d) => (
            <Card key={d.key} className="flex items-start gap-3">
              <span className="text-xl">{d.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[0.86rem] font-semibold">{t(d.key)}</p>
                <p className="mt-0.5 flex items-start gap-1.5 text-[0.8rem] text-text-secondary"><span className="text-success">→</span> {t(d.recoveryKey)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <List t={t} icon="🔋" titleKey="infContinuity" items={CONTINUITY} tone="success" />
      <List t={t} icon="💾" titleKey="infBackup" items={BACKUP} chips />
      <List t={t} icon="✈️" titleKey="infOffline" items={OFFLINE} chips />

      {/* Incident management */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🚨</span><h2 className="font-heading text-lg font-semibold">{t('infIncident')}</h2></div>
        <div className="flex flex-wrap items-center gap-1.5">
          {INCIDENT.map((c, i) => (
            <span key={c} className="flex items-center gap-1.5">
              <span className="flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[0.72rem] text-text-secondary"><span className="grid h-4 w-4 place-items-center rounded-full bg-accent-primary/20 text-[0.6rem] text-accent-secondary">{i + 1}</span>{t(c)}</span>
              {i < INCIDENT.length - 1 && <span className="text-text-muted">→</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── OPS ───────────────────────────────────────────────────────────────────────
function OpsTab({ t }) {
  return (
    <div className="space-y-6">
      <Card className="flex items-start gap-3 border-accent-ai/20 bg-accent-ai/[0.05]">
        <ShieldIcon size={18} className="mt-0.5 text-accent-ai" />
        <p className="text-[0.86rem] leading-relaxed text-text-secondary">{t('infOpsIntro')}</p>
      </Card>
      <List t={t} icon="📡" titleKey="infObservability" items={OBSERVABILITY} chips />
      <List t={t} icon="🔔" titleKey="infAlerting" items={ALERTS} chips />
      <List t={t} icon="🔐" titleKey="infSecurity" items={SECURITY} tone="success" />
      <List t={t} icon="🗂️" titleKey="infQueue" items={QUEUE} chips />
      <List t={t} icon="⚡" titleKey="infCaching" items={CACHING} chips />
      <List t={t} icon="💰" titleKey="infCost" items={COST} chips />
      <List t={t} icon="📋" titleKey="infCompliance" items={COMPLIANCE} tone="success" />
      <List t={t} icon="🚀" titleKey="infFuture" items={FUTURE} chips />
    </div>
  )
}

function List({ t, icon, titleKey, items, chips, tone }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2"><span>{icon}</span><h2 className="font-heading text-lg font-semibold">{t(titleKey)}</h2></div>
      {chips ? (
        <div className="flex flex-wrap gap-2">{items.map((k) => <span key={k} className="rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.76rem] text-text-secondary">{t(k)}</span>)}</div>
      ) : (
        <Card><ul className="grid gap-1.5 sm:grid-cols-2">{items.map((k) => <li key={k} className="flex items-start gap-2 text-[0.84rem] text-text-secondary"><span className={tone === 'success' ? 'text-success' : 'text-accent-secondary'}>{tone === 'success' ? '✓' : '▪'}</span> {t(k)}</li>)}</ul></Card>
      )}
    </div>
  )
}
