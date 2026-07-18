import { useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ShieldIcon, LockIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile } from '../lib/localStore'
import {
  TIERS, tier, COMPARE, CYCLES, REGIONS, priceOf, familyPrice, studentPrice, STUDENT_DISCOUNT,
  getSub, subscribe, startTrial, cancelPlan, pausePlan, resumePlan, isPremium, trialDaysLeft,
  coinBalance, coinsEarned, COIN_STORE, redeem, isRedeemed, referralCode, certificates,
  ETHICS, NEVER_MONETIZE, PROGRAMS, PAY_METHODS, ROADMAP,
} from '../lib/billing'
import { totalXP } from '../lib/journeyStory'

function fill(t, key, vars = {}) { let s = t(key); Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) }); return s }

export default function Premium() {
  const { t } = useT()
  const [tab, setTab] = useState('plans')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const [confirm, setConfirm] = useState(null)

  const tabs = [['plans', '💎', 'pmTabPlans'], ['rewards', '🎁', 'pmTabRewards'], ['trust', '🛡️', 'pmTabTrust']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('pmBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('pmTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('pmSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-md gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-pill px-2 py-2 text-[0.8rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'plans' && <PlansTab t={t} tick={tick} bump={bump} onConfirm={setConfirm} />}
        {tab === 'rewards' && <RewardsTab t={t} tick={tick} bump={bump} />}
        {tab === 'trust' && <TrustTab t={t} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('pmDisclaimer')}</p>
      </div>

      <div className="h-24" />
      {confirm && <ConfirmModal t={t} data={confirm} onClose={() => setConfirm(null)} onDone={() => { setConfirm(null); bump() }} />}
      <BottomNav />
    </PageShell>
  )
}

// ── PLANS ─────────────────────────────────────────────────────────────────────
function PlansTab({ t, tick, bump, onConfirm }) {
  const sub = useMemo(() => getSub(), [tick])
  const [cycle, setCycleLocal] = useState(sub.cycle)
  const [reg, setReg] = useState(sub.region)
  const trialLeft = trialDaysLeft()

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card className={`flex flex-wrap items-center gap-3 ${isPremium() ? 'border-accent-primary/25 bg-accent-primary/[0.06]' : 'bg-white/[0.02]'}`}>
        <span className="text-3xl">{tier(sub.tier)?.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold">{fill(t, 'pmCurrent', { tier: t(tier(sub.tier)?.nameKey) })}</p>
          <p className="text-caption text-text-secondary">
            {sub.status === 'trial' ? fill(t, 'pmTrialLeft', { n: trialLeft }) : sub.status === 'paused' ? t('pmPaused') : sub.tier === 'free' ? t('pmFreeForever') : t('pmActive')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {sub.tier !== 'free' && sub.status !== 'paused' && <Button size="sm" variant="ghost" onClick={() => { pausePlan(); bump() }}>{t('pmPause')}</Button>}
          {sub.status === 'paused' && <Button size="sm" variant="secondary" onClick={() => { resumePlan(); bump() }}>{t('pmResume')}</Button>}
          {sub.tier !== 'free' && <Button size="sm" variant="ghost" onClick={() => { cancelPlan(); bump() }}>{t('pmCancel')}</Button>}
        </div>
      </Card>

      {/* Region + cycle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          {CYCLES.filter((c) => c.id !== 'lifetime').map((c) => (
            <button key={c.id} onClick={() => setCycleLocal(c.id)} className={`rounded-pill px-3 py-1.5 text-[0.76rem] font-medium transition ${cycle === c.id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 text-text-secondary hover:text-text-primary'}`}>
              {t(c.labelKey)}{c.save ? <span className="ml-1 text-[0.66rem] opacity-80">−{c.save}%</span> : ''}
            </button>
          ))}
        </div>
        <select value={reg} onChange={(e) => setReg(e.target.value)} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.76rem] text-text-secondary outline-none">
          {REGIONS.map((r) => <option key={r.id} value={r.id} className="bg-bg-card">{r.symbol} {r.id}</option>)}
        </select>
      </div>

      {/* Tier cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {TIERS.map((tr) => {
          const price = priceOf(tr.id, cycle, reg)
          const current = sub.tier === tr.id
          return (
            <Card key={tr.id} className={`flex flex-col ${tr.highlight ? 'border-accent-primary/40 bg-gradient-to-b from-accent-primary/[0.1] to-transparent' : ''}`}>
              {tr.highlight && <Badge tone="accent" className="mb-2 self-start">⭐ {t('pmPopular')}</Badge>}
              <div className="flex items-center gap-2"><span className="text-2xl">{tr.emoji}</span><h3 className="font-heading text-lg font-semibold">{t(tr.nameKey)}</h3></div>
              <p className="mt-1 text-caption text-text-secondary">{t(tr.taglineKey)}</p>
              <div className="mt-3">
                {tr.priceINR === 0 ? <p className="font-stat text-2xl font-bold">{t('pmFree')}</p> : (
                  <>
                    <p className="font-stat text-2xl font-bold">{price.perMonth}<span className="text-caption font-normal text-text-muted"> / {t('perMo')}</span></p>
                    <p className="text-[0.7rem] text-text-muted">{fill(t, 'pmBilledAs', { total: price.total, cycle: t(CYCLES.find((c) => c.id === cycle).labelKey) })}</p>
                  </>
                )}
              </div>
              <ul className="mt-3 flex-1 space-y-1.5">
                {tr.featureKeys.slice(0, 8).map((f) => <li key={f} className="flex items-start gap-1.5 text-[0.8rem] text-text-secondary"><span className="text-success">✓</span> {t(f)}</li>)}
                {tr.featureKeys.length > 8 && <li className="text-[0.75rem] text-text-muted">{fill(t, 'pmMoreFeatures', { n: tr.featureKeys.length - 8 })}</li>}
              </ul>
              <div className="mt-4">
                {current ? <Button variant="secondary" className="w-full" disabled>✓ {t('pmYourPlan')}</Button>
                  : tr.id === 'free' ? <Button variant="ghost" className="w-full" onClick={() => { cancelPlan(); bump() }}>{t('pmDowngrade')}</Button>
                    : <Button variant={tr.highlight ? 'primary' : 'secondary'} className="w-full" onClick={() => onConfirm({ tier: tr.id, cycle, reg, price })}>{t('pmChoose')} {t(tr.nameKey)}</Button>}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Trial CTA */}
      {sub.tier === 'free' && (
        <Card className="flex flex-wrap items-center gap-3 border-accent-ai/25 bg-accent-ai/[0.06]">
          <span className="text-2xl">🎁</span>
          <div className="min-w-0 flex-1"><p className="font-heading font-semibold">{t('pmTryTitle')}</p><p className="text-caption text-text-secondary">{t('pmTrySub')}</p></div>
          <Button size="sm" onClick={() => { startTrial('plus'); bump() }}>{t('pmStartTrial')}</Button>
        </Card>
      )}

      {/* Comparison table */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">{t('pmCompare')}</h2>
        <div className="overflow-x-auto rounded-3xl border border-white/[0.06]">
          <table className="w-full text-[0.8rem]">
            <thead><tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="p-3 text-left font-medium text-text-muted">{t('pmFeature')}</th>
              {TIERS.map((tr) => <th key={tr.id} className="p-3 text-center font-heading font-semibold">{tr.emoji}<span className="ml-1 hidden sm:inline">{t(tr.nameKey)}</span></th>)}
            </tr></thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.key} className="border-b border-white/[0.04]">
                  <td className="p-3 text-text-secondary">{t(row.key)}</td>
                  {['free', 'plus', 'pro'].map((k) => <td key={k} className="p-3 text-center">{cell(row[k], t)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Family & student */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="bg-white/[0.02]">
          <div className="flex items-center gap-2"><span className="text-xl">👨‍👩‍👧</span><h3 className="font-heading font-semibold">{t('pmFamily')}</h3></div>
          <p className="mt-1 text-caption text-text-secondary">{t('pmFamilyDesc')}</p>
          <p className="mt-2 font-stat text-lg font-bold">{familyPrice(reg)}<span className="text-caption font-normal text-text-muted"> / {t('perMo')}</span></p>
          <p className="text-[0.72rem] text-text-muted">{t('pmFamilyNote')}</p>
        </Card>
        <Card className="bg-white/[0.02]">
          <div className="flex items-center gap-2"><span className="text-xl">🎓</span><h3 className="font-heading font-semibold">{t('pmStudent')}</h3></div>
          <p className="mt-1 text-caption text-text-secondary">{fill(t, 'pmStudentDesc', { n: STUDENT_DISCOUNT })}</p>
          <p className="mt-2 font-stat text-lg font-bold">{studentPrice('plus', reg)}<span className="text-caption font-normal text-text-muted"> / {t('perMo')}</span></p>
          <p className="text-[0.72rem] text-text-muted">{t('pmStudentNote')}</p>
        </Card>
      </div>
    </div>
  )
}
function cell(v, t) {
  if (v === true) return <span className="text-success">✓</span>
  if (v === false) return <span className="text-text-muted">—</span>
  return <span className="text-[0.72rem] text-text-secondary">{t(`val_${v}`)}</span>
}

function ConfirmModal({ t, data, onClose, onDone }) {
  const tr = tier(data.tier)
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="text-center"><span className="text-4xl">{tr.emoji}</span><h3 className="mt-2 font-heading text-lg font-semibold">{fill(t, 'pmConfirmTitle', { tier: t(tr.nameKey) })}</h3></div>
        <div className="mt-4 space-y-2 rounded-2xl bg-white/[0.03] p-4 text-[0.86rem]">
          <div className="flex justify-between"><span className="text-text-muted">{t('pmPlan')}</span><span className="font-medium">{t(tr.nameKey)}</span></div>
          <div className="flex justify-between"><span className="text-text-muted">{t('pmBilling')}</span><span className="font-medium">{t(CYCLES.find((c) => c.id === data.cycle).labelKey)}</span></div>
          <div className="flex justify-between border-t border-white/[0.06] pt-2"><span className="text-text-muted">{t('pmTotal')}</span><span className="font-stat font-bold">{data.price.total}</span></div>
        </div>
        <Button className="mt-4 w-full" onClick={() => { subscribe(data.tier, data.cycle); onDone() }}>🔒 {t('pmConfirmPay')}</Button>
        <Button variant="ghost" className="mt-1 w-full" onClick={onClose}>{t('pmCancel')}</Button>
        <p className="mt-3 text-center text-[0.72rem] text-text-muted">{t('pmNoCharge')}</p>
      </div>
    </div>
  )
}

// ── REWARDS ───────────────────────────────────────────────────────────────────
function RewardsTab({ t, tick, bump }) {
  const balance = useMemo(() => coinBalance(), [tick])
  const earned = useMemo(() => coinsEarned(), [tick])
  const xp = useMemo(() => totalXP(), [tick])
  const code = useMemo(() => referralCode(), [])
  const certs = useMemo(() => certificates(), [tick])
  const [copied, setCopied] = useState(false)

  function copy() { try { navigator.clipboard?.writeText(code) } catch { /* ignore */ } setCopied(true); setTimeout(() => setCopied(false), 1500) }
  function download(c) {
    try {
      const txt = `MIRA · ${t(c.titleKey)}\n${getProfile().name || 'MIRA member'}\n${new Date().toLocaleDateString()}\n\n${t('certSigned')}`
      const b = new Blob([txt], { type: 'text/plain' }); const u = URL.createObjectURL(b); const a = document.createElement('a')
      a.href = u; a.download = `mira-${c.id}-certificate.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000)
    } catch { /* ignore */ }
  }

  return (
    <div className="space-y-6">
      {/* Loyalty */}
      <Card className="bg-gradient-to-br from-[#d97ba8]/[0.12] to-transparent">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent-primary/15 text-3xl">🪙</div>
          <div className="flex-1">
            <p className="font-stat text-3xl font-bold">{balance.toLocaleString()}</p>
            <p className="text-caption text-text-muted">{t('pmCoins')}</p>
          </div>
          <div className="text-right text-[0.72rem] text-text-muted">
            <p>{fill(t, 'pmXp', { n: xp.toLocaleString() })}</p>
            <p>{fill(t, 'pmEarnedTotal', { n: earned.toLocaleString() })}</p>
          </div>
        </div>
        <p className="mt-3 text-[0.78rem] leading-relaxed text-text-secondary">💡 {t('pmCoinsEarn')}</p>
      </Card>

      {/* Coin store */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">🛍️ {t('pmStore')}</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {COIN_STORE.map((item) => {
            const owned = isRedeemed(item.id); const afford = balance >= item.cost
            return (
              <Card key={item.id} className="flex items-center gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(item.nameKey)}</p><p className="text-[0.72rem] text-text-muted">🪙 {item.cost}</p></div>
                {owned ? <Badge tone="success">✓ {t('pmOwned')}</Badge>
                  : <Button size="sm" variant={afford ? 'primary' : 'secondary'} disabled={!afford} onClick={() => { redeem(item.id); bump() }}>{afford ? t('pmRedeem') : t('pmNeedMore')}</Button>}
              </Card>
            )
          })}
        </div>
        <p className="mt-2 text-[0.74rem] text-text-muted">🛡️ {t('pmCoinsNote')}</p>
      </div>

      {/* Referral */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">💝 {t('pmReferral')}</h2>
        <Card className="bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent">
          <p className="text-[0.9rem] text-text-secondary">{t('pmReferralDesc')}</p>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-dashed border-accent-primary/40 bg-white/[0.03] px-4 py-3 text-center font-stat text-lg tracking-widest">{code}</code>
            <Button size="md" variant="secondary" onClick={copy}>{copied ? '✓ ' + t('pmCopied') : t('pmCopy')}</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {['pmRefReward1', 'pmRefReward2', 'pmRefReward3'].map((k) => <span key={k} className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-[0.72rem] text-text-secondary">🎁 {t(k)}</span>)}
          </div>
        </Card>
      </div>

      {/* Certificates */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">📜 {t('pmCerts')}</h2>
        <div className="space-y-2">
          {certs.map((c) => (
            <Card key={c.id} className={`flex items-center gap-3 ${c.earned ? '' : 'opacity-60'}`}>
              <span className="text-2xl">{c.emoji}</span>
              <div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(c.titleKey)}</p><p className="text-[0.72rem] text-text-muted">{c.earned ? t('pmCertEarned') : t(c.reqKey)}</p></div>
              {c.earned ? <Button size="sm" variant="secondary" onClick={() => download(c)}>⬇️ {t('pmDownloadCert')}</Button> : <span className="text-text-muted">🔒</span>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── TRUST ─────────────────────────────────────────────────────────────────────
function TrustTab({ t }) {
  return (
    <div className="space-y-6">
      <Card className="border-success/25 bg-success/[0.05] text-center">
        <ShieldIcon size={28} className="mx-auto text-success" />
        <h2 className="mt-2 font-heading text-lg font-semibold">{t('pmPledge')}</h2>
        <p className="mx-auto mt-1 max-w-md text-caption text-text-secondary">{t('pmPledgeSub')}</p>
      </Card>

      {/* Ethical commitments */}
      <div className="grid gap-2.5 sm:grid-cols-2">
        {ETHICS.map((e) => (
          <Card key={e.titleKey} className="bg-white/[0.02]">
            <p className="flex items-center gap-2 font-heading text-[0.9rem] font-semibold">{e.emoji} {t(e.titleKey)}</p>
            <p className="mt-1 text-[0.8rem] leading-relaxed text-text-secondary">{t(e.descKey)}</p>
          </Card>
        ))}
      </div>

      {/* Never monetize */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 font-heading text-lg font-semibold"><LockIcon size={18} className="text-accent-secondary" /> {t('pmNeverTitle')}</h2>
        <Card>
          <div className="flex flex-wrap gap-2">
            {NEVER_MONETIZE.map((k) => <span key={k} className="flex items-center gap-1.5 rounded-pill border border-danger/25 bg-danger/[0.05] px-3 py-1.5 text-[0.78rem] text-text-secondary">🚫 {t(k)}</span>)}
          </div>
          <p className="mt-3 text-[0.8rem] leading-relaxed text-text-muted">{t('pmNeverNote')}</p>
        </Card>
      </div>

      {/* Ethical advertising */}
      <Card className="bg-white/[0.02]">
        <p className="flex items-center gap-2 font-heading text-[0.9rem] font-semibold">📣 {t('pmAdTitle')}</p>
        <p className="mt-1 text-[0.82rem] leading-relaxed text-text-secondary">{t('pmAdDesc')}</p>
      </Card>

      {/* Programs */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">🤝 {t('pmPrograms')}</h2>
        <div className="grid gap-2.5 sm:grid-cols-3">
          {PROGRAMS.map((p) => (
            <Card key={p.titleKey} className="bg-white/[0.02]">
              <p className="flex items-center gap-2 font-heading text-[0.86rem] font-semibold">{p.emoji} {t(p.titleKey)}</p>
              <p className="mt-1 text-[0.78rem] leading-relaxed text-text-secondary">{t(p.descKey)}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">💳 {t('pmPayMethods')}</h2>
        <div className="flex flex-wrap gap-2">
          {PAY_METHODS.map(([e, n]) => <span key={n} className="flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[0.78rem] text-text-secondary">{e} {n}</span>)}
        </div>
        <p className="mt-2 text-caption text-text-muted">{t('pmPayNote')}</p>
      </div>

      {/* Future roadmap */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-semibold">🚀 {t('pmRoadmap')}</h2>
        <div className="flex flex-wrap gap-2">
          {ROADMAP.map((k) => <span key={k} className="rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1.5 text-caption text-text-muted">{t(k)}</span>)}
        </div>
      </div>
    </div>
  )
}
