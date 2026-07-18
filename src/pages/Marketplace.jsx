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
  CATEGORIES, category, BADGES, PERMISSIONS, PLUGINS, AGENTS, allItems, item, COLLECTIONS,
  isInstalled, isEnabled, install, uninstall, toggleEnable, installedItems, dataLog,
  recommendations, REVIEW_STEPS, SANDBOX, getMarket,
} from '../lib/marketplace'

function fill(t, key, vars = {}) { let s = t(key); Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) }); return s }
function fmtInstalls(n) { return n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k' : String(n) }
function Stars({ r }) { return <span className="text-warning">{'★'.repeat(Math.round(r))}<span className="text-white/20">{'★'.repeat(5 - Math.round(r))}</span></span> }

export default function Marketplace() {
  const { t } = useT()
  const [tab, setTab] = useState('discover')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const [detail, setDetail] = useState(null)

  const tabs = [['discover', '🛍️', 'mkTabDiscover'], ['agents', '🤖', 'mkTabAgents'], ['installed', '📦', 'mkTabInstalled'], ['trust', '🛡️', 'mkTabTrust']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('mkBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('mkTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('mkSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-md gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-pill px-2 py-2 text-[0.78rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'discover' && <DiscoverTab t={t} tick={tick} onOpen={setDetail} />}
        {tab === 'agents' && <AgentsTab t={t} tick={tick} onOpen={setDetail} />}
        {tab === 'installed' && <InstalledTab t={t} tick={tick} bump={bump} onOpen={setDetail} />}
        {tab === 'trust' && <TrustTab t={t} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('mkDisclaimer')}</p>
      </div>

      <div className="h-24" />
      {detail && <DetailModal t={t} id={detail} onClose={() => setDetail(null)} onChange={bump} />}
      <BottomNav />
    </PageShell>
  )
}

function BadgeChip({ t, badge }) {
  const b = BADGES[badge]
  return <Badge tone={b.tone}>{b.emoji} {t(b.key)}</Badge>
}

function PluginCard({ t, p, onOpen }) {
  return (
    <Card hover onClick={() => onOpen(p.id)} className="flex cursor-pointer flex-col">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.05] text-2xl">{p.isAgent ? p.emoji : category(p.cat)?.emoji}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-[0.92rem] font-semibold">{p.name}</p>
          <p className="truncate text-[0.72rem] text-text-muted">{p.dev}</p>
        </div>
        {isInstalled(p.id) && <span className="text-success" title={t('mkInstalled')}>✓</span>}
      </div>
      <p className="mt-2 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-text-secondary">{t(p.descKey)}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[0.72rem] text-text-muted"><Stars r={p.rating} /> <span>{fmtInstalls(p.installs)}</span></div>
        <BadgeChip t={t} badge={p.badge} />
      </div>
    </Card>
  )
}

// ── DISCOVER ──────────────────────────────────────────────────────────────────
function DiscoverTab({ t, tick, onOpen }) {
  const recs = useMemo(() => recommendations(), [tick])
  const [cat, setCat] = useState('')
  const list = cat ? PLUGINS.filter((p) => p.cat === cat) : PLUGINS

  return (
    <div className="space-y-6">
      {/* Recommended */}
      {recs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2"><SparklesIcon size={16} className="text-accent-ai" /><h2 className="font-heading text-lg font-semibold">{t('mkRecommended')}</h2></div>
          <div className="space-y-2">
            {recs.map((r) => {
              const p = item(r.id)
              return (
                <Card key={r.id} className="flex items-center gap-3 bg-accent-ai/[0.06]">
                  <span className="text-2xl">{category(p.cat)?.emoji}</span>
                  <div className="min-w-0 flex-1"><p className="font-heading text-[0.9rem] font-semibold">{p.name}</p><p className="text-[0.76rem] text-accent-ai">✨ {t(r.reasonKey)}</p></div>
                  <Button size="sm" onClick={() => onOpen(r.id)}>{t('mkView')}</Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Collections */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>✨</span><h2 className="font-heading text-lg font-semibold">{t('mkCollections')}</h2></div>
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
          {COLLECTIONS.map((c) => (
            <div key={c.id} className="w-52 shrink-0 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent p-4">
              <p className="text-2xl">{c.emoji}</p>
              <p className="mt-1 font-heading text-[0.9rem] font-semibold">{t(c.key)}</p>
              <div className="mt-2 flex gap-1">{c.items.map((id) => <button key={id} onClick={() => onOpen(id)} className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.05] text-sm hover:bg-white/10" title={item(id)?.name}>{item(id)?.isAgent ? item(id).emoji : category(item(id)?.cat)?.emoji}</button>)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setCat('')} className={`rounded-pill px-3 py-1.5 text-[0.74rem] font-medium transition ${!cat ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 text-text-secondary hover:text-text-primary'}`}>{t('mkAll')}</button>
          {CATEGORIES.filter((c) => c.id !== 'ai').map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-pill px-3 py-1.5 text-[0.74rem] font-medium transition ${cat === c.id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 text-text-secondary hover:text-text-primary'}`}>{c.emoji} {t(c.key)}</button>
          ))}
        </div>
      </div>

      {/* Plugin grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((p) => <PluginCard key={p.id} t={t} p={p} onOpen={onOpen} />)}
      </div>
    </div>
  )
}

// ── AGENTS ────────────────────────────────────────────────────────────────────
function AgentsTab({ t, tick, onOpen }) {
  return (
    <div className="space-y-4">
      <Card className="flex items-start gap-3 bg-accent-ai/[0.06]">
        <span className="text-2xl">🧩</span>
        <p className="text-[0.88rem] leading-relaxed text-text-secondary">{t('mkAgentsIntro')} <Link to="/voice" className="text-accent-secondary hover:underline">{t('mkSeeOrchestrator')} →</Link></p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2">
        {AGENTS.map((a) => (
          <Card key={a.id} hover onClick={() => onOpen(a.id)} className="flex cursor-pointer flex-col">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#d97ba8]/20 to-[#a78bfa]/20 text-2xl">{a.emoji}</div>
              <div className="min-w-0 flex-1"><p className="truncate font-heading text-[0.92rem] font-semibold">{a.name}</p><p className="text-[0.72rem] text-text-muted">{a.dev}</p></div>
              {isInstalled(a.id) && <span className="text-success">✓</span>}
            </div>
            <p className="mt-2 line-clamp-2 flex-1 text-[0.8rem] leading-relaxed text-text-secondary">{t(a.descKey)}</p>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[0.72rem] text-text-muted"><Stars r={a.rating} /> {fmtInstalls(a.installs)}</div>
              <BadgeChip t={t} badge={a.badge} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ── INSTALLED ─────────────────────────────────────────────────────────────────
function InstalledTab({ t, tick, bump, onOpen }) {
  const installed = useMemo(() => installedItems(), [tick])
  const log = useMemo(() => dataLog(), [tick])

  return (
    <div className="space-y-6">
      {installed.length === 0 ? (
        <Card className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-accent-ai/10 text-2xl">📦</div>
          <p className="font-heading font-semibold">{t('mkNoneTitle')}</p>
          <p className="mx-auto mt-1 max-w-sm text-caption text-text-secondary">{t('mkNoneSub')}</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {installed.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.05] text-xl">{p.isAgent ? p.emoji : category(p.cat)?.emoji}</div>
                <div className="min-w-0 flex-1">
                  <button onClick={() => onOpen(p.id)} className="truncate font-heading text-[0.9rem] font-semibold hover:underline">{p.name}</button>
                  <p className="text-[0.7rem] text-text-muted">v{p.ver} · {p.dev}</p>
                </div>
                <button onClick={() => { toggleEnable(p.id); bump() }} aria-pressed={p.enabled} className={`relative h-6 w-11 shrink-0 rounded-full transition ${p.enabled ? 'bg-accent-primary' : 'bg-white/15'}`}>
                  <span className="absolute top-1 h-4 w-4 rounded-full bg-white transition-all" style={{ left: p.enabled ? '1.5rem' : '0.25rem' }} />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {(p.perms || []).map((pm) => <span key={pm} className="rounded-pill bg-white/[0.05] px-2 py-0.5 text-[0.64rem] text-text-secondary">{PERMISSIONS[pm]?.emoji} {t(PERMISSIONS[pm]?.key)}</span>)}
                <button onClick={() => { uninstall(p.id); bump() }} className="ml-auto text-[0.72rem] text-danger hover:underline">🗑 {t('mkUninstall')}</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Data-sharing history */}
      {log.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>📜</span><h2 className="font-heading text-lg font-semibold">{t('mkDataLog')}</h2></div>
          <div className="space-y-1.5">
            {log.slice(0, 8).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-2 text-[0.76rem]">
                <span className="text-text-muted">{new Date(e.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-text-secondary">{fill(t, e.actionKey, { name: item(e.plugin)?.name || e.plugin })}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[0.74rem] text-text-muted">🛡️ {t('mkDataLogNote')}</p>
        </div>
      )}
    </div>
  )
}

// ── TRUST ─────────────────────────────────────────────────────────────────────
function TrustTab({ t }) {
  return (
    <div className="space-y-6">
      {/* Verification badges */}
      <div>
        <div className="mb-3 flex items-center gap-2"><ShieldIcon size={16} className="text-success" /><h2 className="font-heading text-lg font-semibold">{t('mkVerification')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('mkVerificationSub')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {Object.entries(BADGES).map(([k, b]) => (
            <div key={k} className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"><BadgeChip t={t} badge={k} /><span className="text-[0.78rem] text-text-secondary">{t(`${b.key}Desc`)}</span></div>
          ))}
        </div>
      </div>

      {/* Permission system */}
      <div>
        <div className="mb-3 flex items-center gap-2"><LockIcon size={16} className="text-accent-secondary" /><h2 className="font-heading text-lg font-semibold">{t('mkPermSystem')}</h2></div>
        <Card>
          <p className="text-[0.86rem] leading-relaxed text-text-secondary">{t('mkPermSystemDesc')}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(PERMISSIONS).map(([k, p]) => <span key={k} className={`rounded-pill px-2.5 py-1 text-[0.72rem] ${p.sensitive ? 'border border-warning/25 bg-warning/[0.06] text-warning' : 'bg-white/[0.05] text-text-secondary'}`}>{p.emoji} {t(p.key)}</span>)}
          </div>
        </Card>
      </div>

      {/* Sandbox */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>📦</span><h2 className="font-heading text-lg font-semibold">{t('mkSandbox')}</h2></div>
        <Card>
          <ul className="space-y-2">
            {SANDBOX.map((s) => <li key={s} className="flex items-start gap-2 text-[0.84rem] text-text-secondary"><span className="text-success">✓</span> {t(s)}</li>)}
          </ul>
        </Card>
      </div>

      {/* Review pipeline */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🔍</span><h2 className="font-heading text-lg font-semibold">{t('mkReview')}</h2></div>
        <div className="flex flex-wrap gap-2">
          {REVIEW_STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.74rem] text-text-secondary">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-accent-primary/20 text-[0.6rem] text-accent-secondary">{i + 1}</span>{t(s)}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy controls */}
      <Card className="bg-white/[0.02]">
        <p className="flex items-center gap-2 font-heading text-[0.9rem] font-semibold">🔒 {t('mkPrivacyControls')}</p>
        <ul className="mt-2 space-y-1.5">
          {['mkPcView', 'mkPcRevoke', 'mkPcExport', 'mkPcDelete', 'mkPcHistory'].map((k) => <li key={k} className="flex items-start gap-2 text-[0.82rem] text-text-secondary"><span>🔹</span> {t(k)}</li>)}
        </ul>
      </Card>

      {/* Partner portal */}
      <Card className="flex items-center gap-3 bg-gradient-to-br from-[#d97ba8]/[0.1] to-transparent">
        <span className="text-2xl">👩‍💻</span>
        <div className="flex-1"><p className="font-heading font-semibold">{t('mkPartner')}</p><p className="text-caption text-text-secondary">{t('mkPartnerSub')}</p></div>
        <Button as={Link} to="/developers" size="sm" variant="secondary">{t('mkPartnerCta')} <ArrowRightIcon size={14} /></Button>
      </Card>
    </div>
  )
}

// ── DETAIL / INSTALL MODAL ────────────────────────────────────────────────────
function DetailModal({ t, id, onClose, onChange }) {
  const p = useMemo(() => item(id), [id])
  const [confirming, setConfirming] = useState(false)
  const [tick, setTick] = useState(0)
  if (!p) return null
  const installed = isInstalled(p.id)

  function doInstall() { install(p.id); setConfirming(false); setTick((v) => v + 1); onChange() }
  function doUninstall() { uninstall(p.id); setTick((v) => v + 1); onChange() }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-text-muted hover:text-text-primary">✕</button>
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-[#d97ba8]/20 to-[#a78bfa]/20 text-3xl">{p.isAgent ? p.emoji : category(p.cat)?.emoji}</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-lg font-semibold">{p.name}</h3>
            <p className="text-caption text-text-secondary">{p.dev}</p>
            <div className="mt-1"><BadgeChip t={t} badge={p.badge} /></div>
          </div>
        </div>
        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white/[0.03] p-3 text-center">
          <div><p className="font-stat text-sm font-bold"><Stars r={p.rating} /></p><p className="text-[0.66rem] text-text-muted">{p.rating}</p></div>
          <div><p className="font-stat text-base font-bold">{fmtInstalls(p.installs)}</p><p className="text-[0.66rem] text-text-muted">{t('mkInstalls')}</p></div>
          <div><p className="font-stat text-base font-bold">v{p.ver}</p><p className="text-[0.66rem] text-text-muted">{t('mkVersion')}</p></div>
        </div>
        {/* Screenshots */}
        {p.shots && (
          <div className="mt-4 flex gap-2">
            {p.shots.map((s, i) => <div key={i} className="grid h-24 flex-1 place-items-center rounded-2xl border border-white/[0.06] bg-white/[0.02] text-4xl">{s}</div>)}
          </div>
        )}
        <p className="mt-4 text-[0.88rem] leading-relaxed text-text-secondary">{t(p.descKey)}</p>

        {/* Permissions */}
        <p className="mb-2 mt-4 flex items-center gap-1.5 text-caption font-semibold text-text-secondary"><LockIcon size={14} /> {t('mkPermsRequested')}</p>
        {p.perms && p.perms.length ? (
          <div className="space-y-1.5">
            {p.perms.map((pm) => (
              <div key={pm} className={`flex items-center gap-2 rounded-xl border p-2.5 ${PERMISSIONS[pm]?.sensitive ? 'border-warning/20 bg-warning/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                <span>{PERMISSIONS[pm]?.emoji}</span>
                <span className="text-[0.82rem] text-text-secondary">{t(PERMISSIONS[pm]?.key)}</span>
                {PERMISSIONS[pm]?.sensitive && <span className="ml-auto text-[0.64rem] text-warning">{t('mkSensitive')}</span>}
              </div>
            ))}
          </div>
        ) : <p className="text-[0.82rem] text-success">✓ {t('mkNoPerms')}</p>}

        {/* Privacy summary */}
        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
          <ShieldIcon size={15} className="mt-0.5 shrink-0 text-success" />
          <p className="text-[0.8rem] leading-relaxed text-text-secondary">{t(p.privacyKey)}</p>
        </div>

        {/* Languages */}
        {p.langs && <p className="mt-3 text-[0.72rem] text-text-muted">🌐 {p.langs.map((l) => t(`lang_${l}`)).join(' · ')}</p>}

        {/* Actions */}
        {installed ? (
          <>
            <div className="mt-4 rounded-2xl border border-success/25 bg-success/[0.06] p-3 text-center text-caption text-success">✓ {t('mkInstalled')}</div>
            <Button variant="ghost" className="mt-2 w-full" onClick={doUninstall}>{t('mkUninstall')}</Button>
          </>
        ) : confirming ? (
          <div className="mt-4 rounded-2xl border border-accent-primary/25 bg-accent-primary/[0.05] p-4">
            <p className="text-caption font-semibold">{t('mkConfirmTitle')}</p>
            <p className="mt-1 text-[0.8rem] text-text-secondary">{fill(t, 'mkConfirmSub', { n: (p.perms || []).length })}</p>
            <Button className="mt-3 w-full" onClick={doInstall}>🔒 {t('mkGrantInstall')}</Button>
            <Button variant="ghost" className="mt-1 w-full" onClick={() => setConfirming(false)}>{t('mkCancel')}</Button>
          </div>
        ) : (
          <Button className="mt-4 w-full" onClick={() => (p.perms && p.perms.length ? setConfirming(true) : doInstall())}>⬇️ {t('mkInstall')}</Button>
        )}
        <p className="mt-3 text-center text-[0.7rem] text-text-muted">{t('mkModalNote')}</p>
      </div>
    </div>
  )
}
