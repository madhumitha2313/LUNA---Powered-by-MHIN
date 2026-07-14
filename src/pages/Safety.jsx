import { useEffect, useMemo, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  RELATIONSHIPS, getCircle, addContact, removeContact,
  getHealthCard, saveHealthCard, getNumbers,
  getLocation, hospitalSearchUrl, osmUrl,
  getCheckin, startCheckin, cancelCheckin, primaryContact, locationMessage, shareVia,
} from '../lib/safety'
import { getProfile } from '../lib/localStore'

export default function Safety() {
  const { t } = useT()
  const [tick, setTick] = useState(0)
  const numbers = useMemo(() => getNumbers(), [])
  const circle = useMemo(() => getCircle(), [tick])
  const [loc, setLoc] = useState(null)

  useEffect(() => { getLocation().then(setLoc) }, [])

  return (
    <PageShell max="max-w-3xl">
      <div className="text-center">
        <Badge tone="danger" icon={<SparklesIcon size={14} />}>{t('safyBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('safyTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('safyTagline')}</p>
      </div>

      {/* Emergency numbers */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🚨 {t('safyNumbers')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {numbers.map((n) => (
          <a key={n.id} href={`tel:${n.number}`} className="flex items-center gap-3 rounded-2xl border border-danger/20 bg-danger/[0.06] p-3.5 transition hover:border-danger/50 active:scale-[0.98]">
            <span className="text-2xl">{n.emoji}</span>
            <div>
              <p className="text-[0.82rem] font-medium text-text-primary">{n.custom ? n.label : t(n.key)}</p>
              <p className="font-stat text-sm font-bold text-danger">{n.number}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Live location + hospital finder */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ShareLocationCard t={t} loc={loc} />
        <Card>
          <div className="flex items-center gap-2"><span className="text-lg">🏥</span><h3 className="font-heading font-semibold">{t('safyHospital')}</h3></div>
          <p className="mt-1 text-caption text-text-secondary">{loc ? t('safyLocOn') : t('safyLocOff')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={hospitalSearchUrl(loc, 'hospital')} target="_blank" rel="noreferrer" className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary">🏥 {t('safyFindHospital')}</a>
            <a href={hospitalSearchUrl(loc, "women's hospital")} target="_blank" rel="noreferrer" className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary">👩 {t('safyWomenHospital')}</a>
            <a href={osmUrl(loc)} target="_blank" rel="noreferrer" className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary">🗺️ OpenStreetMap</a>
          </div>
        </Card>
      </div>

      {/* Care circle */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">💗 {t('safyCircle')}</h2>
      <Card>
        {circle.length > 0 ? (
          <div className="space-y-2">
            {circle.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-primary/15 text-accent-secondary">{(c.name || '?')[0].toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.9rem] font-medium text-text-primary">{c.name}</p>
                  <p className="text-caption text-text-muted">{t(c.rel)} · {c.phone}</p>
                </div>
                <a href={`tel:${c.phone}`} className="rounded-pill bg-success/15 px-3 py-1.5 text-caption text-success">📞</a>
                <a href={shareVia('whatsapp', c.phone, locationMessage(loc, getProfile().name))} target="_blank" rel="noreferrer" className="rounded-pill bg-[#25d366]/15 px-3 py-1.5 text-caption text-[#25d366]">💬</a>
                <button onClick={() => { removeContact(c.id); setTick((v) => v + 1) }} className="text-text-muted hover:text-danger">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[0.9rem] text-text-secondary">{t('safyCircleEmpty')}</p>
        )}
        <AddContact t={t} onAdd={(c) => { addContact(c); setTick((v) => v + 1) }} />
      </Card>

      {/* Emergency health card */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🪪 {t('safyCard')}</h2>
      <HealthCardEditor t={t} />

      {/* Safety check-in */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">⏱️ {t('safyCheckin')}</h2>
      <SafetyCheckin t={t} loc={loc} />

      <p className="mt-6 text-center text-[0.8rem] leading-relaxed text-text-muted">🛡️ {t('safyPrivacy')}</p>
      <div className="h-24" />
      <BottomNav />
    </PageShell>
  )
}

function ShareLocationCard({ t, loc }) {
  const primary = primaryContact()
  const [sent, setSent] = useState(false)
  async function share() {
    const fresh = loc || (await getLocation())
    const msg = locationMessage(fresh, getProfile().name)
    try {
      if (navigator.share) { await navigator.share({ title: 'My location', text: msg, url: fresh?.maps }); setSent(true); return }
    } catch { /* fall through */ }
    const url = shareVia('whatsapp', primary?.phone, msg)
    if (url) { window.open(url, '_blank'); setSent(true) }
  }
  return (
    <Card>
      <div className="flex items-center gap-2"><span className="text-lg">📍</span><h3 className="font-heading font-semibold">{t('safyShareLoc')}</h3></div>
      <p className="mt-1 text-caption text-text-secondary">{loc ? t('safyLocReady') : t('safyLocGetting')}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={share}>{sent ? `✓ ${t('safyShared')}` : `↗ ${t('safyShareNow')}`}</Button>
        {loc && <a href={loc.maps} target="_blank" rel="noreferrer" className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary">🗺️ {t('safyPreview')}</a>}
      </div>
    </Card>
  )
}

function AddContact({ t, onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [rel, setRel] = useState('relMother')
  const [phone, setPhone] = useState('')
  if (!open) return <button onClick={() => setOpen(true)} className="mt-3 w-full rounded-2xl border border-dashed border-white/15 py-2.5 text-caption text-text-secondary hover:border-accent-primary/40">＋ {t('safyAddContact')}</button>
  return (
    <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
      <div className="flex flex-wrap gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('safyName')} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
        <select value={rel} onChange={(e) => setRel(e.target.value)} className="rounded-2xl border border-white/10 bg-white/[0.03] px-2 py-2 text-sm text-text-primary focus:outline-none">
          {RELATIONSHIPS.map((r) => <option key={r} value={r} className="bg-bg-card">{t(r)}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('safyPhone')} inputMode="tel" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
        <Button size="md" onClick={() => { if (name.trim() && phone.trim()) { onAdd({ name: name.trim(), rel, phone: phone.trim() }); setName(''); setPhone(''); setOpen(false) } }}>{t('plAdd')}</Button>
      </div>
    </div>
  )
}

const CARD_FIELDS = [
  ['name', 'safyfName'], ['age', 'safyfAge'], ['blood', 'safyfBlood'], ['conditions', 'safyfConditions'],
  ['allergies', 'safyfAllergies'], ['meds', 'safyfMeds'], ['doctor', 'safyfDoctor'], ['insurance', 'safyfInsurance'],
]
function HealthCardEditor({ t }) {
  const [card, setCard] = useState(getHealthCard())
  const [edit, setEdit] = useState(false)
  function set(k, v) { setCard((c) => ({ ...c, [k]: v })) }
  function save() { saveHealthCard(card); setEdit(false) }
  return (
    <Card className="bg-gradient-to-br from-[#d97ba8]/[0.1] to-transparent">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-lg">🪪</span><h3 className="font-heading font-semibold">{t('safyCardTitle')}</h3></div>
        <button onClick={() => (edit ? save() : setEdit(true))} className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary hover:text-text-primary">{edit ? `✓ ${t('safySave')}` : `✎ ${t('safyEdit')}`}</button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {CARD_FIELDS.map(([k, label]) => (
          <div key={k}>
            <p className="text-[0.7rem] uppercase tracking-wide text-text-muted">{t(label)}</p>
            {edit ? (
              <input value={card[k] || ''} onChange={(e) => set(k, e.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-text-primary focus:border-accent-primary/50 focus:outline-none" />
            ) : (
              <p className="mt-0.5 text-[0.9rem] text-text-secondary">{card[k] || '—'}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-3 text-[0.75rem] text-text-muted">{t('safyCardNote')}</p>
    </Card>
  )
}

function SafetyCheckin({ t, loc }) {
  const [active, setActive] = useState(getCheckin())
  const [remaining, setRemaining] = useState(0)
  const primary = primaryContact()

  useEffect(() => {
    if (!active) return
    const iv = setInterval(() => {
      const rem = Math.max(0, active.until - Date.now())
      setRemaining(rem)
      if (rem === 0) clearInterval(iv)
    }, 1000)
    return () => clearInterval(iv)
  }, [active])

  const expired = active && remaining === 0
  const mins = Math.floor(remaining / 60000)
  const secs = Math.floor((remaining % 60000) / 1000)

  function begin(m) {
    if (!primary) return
    const v = startCheckin({ minutes: m, contactId: primary.id, message: t('safyCheckinMsg') })
    setActive(v); setRemaining(m * 60000)
  }
  function stop() { cancelCheckin(); setActive(null) }

  return (
    <Card>
      <p className="text-[0.9rem] text-text-secondary">{t('safyCheckinSub')}</p>
      {!active ? (
        <>
          {!primary && <p className="mt-2 text-caption text-warning">⚠️ {t('safyNeedContact')}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {[15, 30, 60].map((m) => (
              <button key={m} onClick={() => begin(m)} disabled={!primary} className="rounded-pill border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-caption text-text-secondary hover:border-accent-primary/40 disabled:opacity-40">{m} {t('safyMin')}</button>
            ))}
          </div>
        </>
      ) : expired ? (
        <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/[0.08] p-4">
          <p className="text-[0.92rem] font-medium text-text-primary">⏰ {t('safyCheckinExpired')}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={shareVia('whatsapp', primary?.phone, locationMessage(loc, getProfile().name))} target="_blank" rel="noreferrer" className="rounded-pill bg-[#25d366]/15 px-3 py-1.5 text-caption text-[#25d366]">💬 {t('safyNotifyNow')}</a>
            <button onClick={stop} className="rounded-pill bg-white/[0.06] px-3 py-1.5 text-caption text-text-secondary">✓ {t('safyImOk')}</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-accent-primary/25 bg-accent-primary/[0.06] p-4">
          <div>
            <p className="text-caption text-text-muted">{t('safyCheckinActive')} · {primary?.name}</p>
            <p className="font-stat text-2xl font-bold text-text-primary">{mins}:{String(secs).padStart(2, '0')}</p>
          </div>
          <button onClick={stop} className="rounded-pill bg-success/15 px-4 py-2 text-caption font-medium text-success">✓ {t('safyImSafe')}</button>
        </div>
      )}
    </Card>
  )
}
