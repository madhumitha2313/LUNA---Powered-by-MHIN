import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ArrowRightIcon, ShieldIcon, StethoscopeIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  SPECIALTIES, LANGS, DOCTORS, doctor, filterDoctors, suggestedSpecialty, slotsFor,
  bookAppointment, cancelAppointment, upcomingAppointments, pastAppointments, completeConsult,
  getPrescriptions, preConsult, addMedication, removeMedication, markDose, logSideEffect,
  adherence, getCarePlans, followUpTasks, consentLog, shareWithDoctor, revokeShare, getStore, recordTimeline,
} from '../lib/healthcare'

function fill(t, key, vars = {}) {
  let s = t(key)
  Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) })
  return s
}
function fmtDate(iso, lang, t) {
  const today = new Date().toISOString().slice(0, 10)
  const tmr = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (iso === today) return t('hcToday')
  if (iso === tmr) return t('hcTomorrow')
  try { return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { weekday: 'short', day: 'numeric', month: 'short' }) } catch { return iso }
}
const MODE_ICON = { video: '📹', chat: '💬', clinic: '🏥' }

export default function Healthcare() {
  const { t, lang } = useT()
  const [tab, setTab] = useState('home')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const [docModal, setDocModal] = useState(null)
  const [prepFor, setPrepFor] = useState(null)
  const [room, setRoom] = useState(null)

  const tabs = [['home', '🏠', 'hcTabHome'], ['doctors', '🩺', 'hcTabDoctors'], ['care', '💊', 'hcTabCare'], ['records', '🗂️', 'hcTabRecords']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('hcBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('hcTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('hcSub')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-lg gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex-1 rounded-pill px-2 py-2 text-[0.78rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'home' && <HomeTab t={t} lang={lang} tick={tick} bump={bump} onFind={() => setTab('doctors')} onRoom={setRoom} onPrep={setPrepFor} />}
        {tab === 'doctors' && <DoctorsTab t={t} lang={lang} onOpen={setDocModal} />}
        {tab === 'care' && <CareTab t={t} lang={lang} tick={tick} bump={bump} />}
        {tab === 'records' && <RecordsTab t={t} lang={lang} tick={tick} bump={bump} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('hcDisclaimer')}</p>
      </div>

      <div className="h-24" />
      {docModal && <DoctorModal t={t} lang={lang} docId={docModal} onClose={() => setDocModal(null)} onBooked={(appt) => { setDocModal(null); setPrepFor(appt) }} />}
      {prepFor && <PreConsultModal t={t} appt={prepFor} onClose={() => setPrepFor(null)} onJoin={(a) => { setPrepFor(null); setRoom(a) }} />}
      {room && <ConsultRoom t={t} appt={room} onClose={() => { setRoom(null); bump() }} />}
      <BottomNav />
    </PageShell>
  )
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function HomeTab({ t, lang, tick, bump, onFind, onRoom, onPrep }) {
  const up = useMemo(() => upcomingAppointments(), [tick])
  const tasks = useMemo(() => followUpTasks(), [tick])
  const plans = useMemo(() => getCarePlans(), [tick])
  const meds = useMemo(() => getStore().meds, [tick])
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Emergency */}
      <Card as={Link} to="/safety" className="flex items-center gap-3 border-danger/25 bg-danger/[0.06]" hover>
        <span className="text-2xl">🚨</span>
        <div className="flex-1"><p className="font-heading font-semibold">{t('hcEmergency')}</p><p className="text-caption text-text-secondary">{t('hcEmergencySub')}</p></div>
        <ArrowRightIcon size={16} />
      </Card>

      {/* Upcoming appointments */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>📅</span><h2 className="font-heading text-lg font-semibold">{t('hcUpcoming')}</h2></div>
        {up.length ? (
          <div className="space-y-3">
            {up.map((a) => {
              const d = doctor(a.docId)
              return (
                <Card key={a.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{d?.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading font-semibold">{d?.name}</p>
                      <p className="text-caption text-text-secondary">{t(`spec_${d?.spec}`)} · {MODE_ICON[a.mode]} {t(`mode_${a.mode}`)}</p>
                    </div>
                    <Badge tone="ai">{fmtDate(a.date, lang, t)} · {a.time}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => onRoom(a)}>{t('hcJoin')}</Button>
                    <Button size="sm" variant="secondary" onClick={() => onPrep(a)}>✨ {t('hcPrep')}</Button>
                    <Button size="sm" variant="ghost" onClick={() => { cancelAppointment(a.id); bump() }}>{t('hcCancel')}</Button>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="text-center">
            <p className="text-[0.92rem] text-text-secondary">{t('hcNoAppt')}</p>
            <Button size="sm" className="mt-3" onClick={onFind}><StethoscopeIcon size={15} /> {t('hcFindDoctor')}</Button>
          </Card>
        )}
      </div>

      {/* Follow-up tasks */}
      {tasks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>✅</span><h2 className="font-heading text-lg font-semibold">{t('hcFollowUps')}</h2></div>
          <div className="space-y-2">
            {tasks.map((x, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="text-lg">{x.icon}</span>
                <p className="text-[0.88rem] text-text-secondary">{fill(t, x.key, { ...x.vars, name: x.medNameKey ? t(x.medNameKey) : x.vars?.name })}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's medication */}
      {meds.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>💊</span><h2 className="font-heading text-lg font-semibold">{t('hcMedToday')}</h2></div>
          <div className="space-y-2">
            {meds.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <button onClick={() => { markDose(m.id); bump() }} className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition ${m.doses[today] ? 'border-success bg-success text-bg-primary' : 'border-white/20'}`}>{m.doses[today] ? '✓' : ''}</button>
                <div className="flex-1"><p className={`text-[0.9rem] ${m.doses[today] ? 'text-text-muted line-through' : 'text-text-primary'}`}>{t(m.nameKey)}</p><p className="text-[0.72rem] text-text-muted">{m.dose} · {(m.times || []).join(', ')}</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Care plan */}
      {plans.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>🎯</span><h2 className="font-heading text-lg font-semibold">{t('hcCarePlan')}</h2></div>
          <Card className="bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent">
            <p className="text-caption text-text-secondary">{fill(t, 'hcCarePlanBy', { name: doctor(plans[0].docId)?.name || '' })}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {plans[0].goals.map((g, i) => <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"><p className="text-[0.8rem] font-semibold">{t(g.key)}</p><p className="text-[0.72rem] text-text-muted">{g.target}</p></div>)}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── DOCTORS ──────────────────────────────────────────────────────────────────
function DoctorsTab({ t, lang, onOpen }) {
  const suggested = useMemo(() => suggestedSpecialty(), [])
  const [spec, setSpec] = useState('')
  const [flang, setFlang] = useState('')
  const [mode, setMode] = useState('')
  const results = useMemo(() => filterDoctors({ spec, lang: flang, mode }), [spec, flang, mode])

  return (
    <div className="space-y-4">
      <Card className="flex items-start gap-3 bg-accent-ai/[0.06]">
        <SparklesIcon size={18} className="mt-0.5 text-accent-ai" />
        <p className="text-[0.9rem] text-text-secondary">{fill(t, 'hcSuggest', { spec: t(`spec_${suggested}`) })} <button onClick={() => setSpec(suggested)} className="text-accent-secondary hover:underline">{t('hcShowThese')}</button></p>
      </Card>

      {/* Filters */}
      <div className="space-y-2">
        <FilterRow label={t('hcFilterSpec')}>
          <Chip on={!spec} onClick={() => setSpec('')}>{t('hcAll')}</Chip>
          {SPECIALTIES.map((s) => <Chip key={s.id} on={spec === s.id} onClick={() => setSpec(s.id)}>{s.emoji} {t(`spec_${s.id}`)}</Chip>)}
        </FilterRow>
        <FilterRow label={t('hcFilterLang')}>
          <Chip on={!flang} onClick={() => setFlang('')}>{t('hcAll')}</Chip>
          {LANGS.map((l) => <Chip key={l} on={flang === l} onClick={() => setFlang(l)}>{t(`lang_${l}`)}</Chip>)}
        </FilterRow>
        <FilterRow label={t('hcFilterMode')}>
          <Chip on={!mode} onClick={() => setMode('')}>{t('hcAll')}</Chip>
          {['video', 'chat', 'clinic'].map((m) => <Chip key={m} on={mode === m} onClick={() => setMode(m)}>{MODE_ICON[m]} {t(`mode_${m}`)}</Chip>)}
        </FilterRow>
      </div>

      <p className="text-caption text-text-muted">{fill(t, 'hcResults', { n: results.length })}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {results.map((d) => (
          <Card key={d.id} hover onClick={() => onOpen(d.id)} className="cursor-pointer">
            <div className="flex items-start gap-3">
              <span className="text-4xl">{d.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-heading font-semibold">{d.name}</p>
                  {d.verified && <span title="verified" className="text-accent-ai">✔</span>}
                </div>
                <p className="text-[0.72rem] text-text-secondary">{t(`spec_${d.spec}`)}</p>
                <p className="text-[0.7rem] text-text-muted">{d.qual}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.72rem] text-text-muted">
              <span>⭐ {d.rating} ({d.reviews})</span>
              <span>🩺 {fill(t, 'hcExp', { n: d.exp })}</span>
              <span>💰 ₹{d.fee}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.langs.map((l) => <span key={l} className="rounded-pill bg-white/[0.05] px-2 py-0.5 text-[0.64rem] text-text-secondary">{t(`lang_${l}`)}</span>)}
              {d.modes.map((m) => <span key={m} className="rounded-pill bg-accent-ai/[0.08] px-2 py-0.5 text-[0.64rem] text-accent-ai">{MODE_ICON[m]}</span>)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FilterRow({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
function Chip({ on, onClick, children }) {
  return <button onClick={onClick} className={`rounded-pill px-3 py-1.5 text-[0.74rem] font-medium transition ${on ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary'}`}>{children}</button>
}

function DoctorModal({ t, lang, docId, onClose, onBooked }) {
  const d = doctor(docId)
  const slots = useMemo(() => slotsFor(docId), [docId])
  const [mode, setMode] = useState(d.modes[0])
  const [slot, setSlot] = useState(null)
  return (
    <Sheet onClose={onClose}>
      <div className="flex items-start gap-3">
        <span className="text-5xl">{d.avatar}</span>
        <div className="flex-1">
          <div className="flex items-center gap-1.5"><h3 className="font-heading text-lg font-semibold">{d.name}</h3>{d.verified && <Badge tone="ai">✔ {t('hcVerified')}</Badge>}</div>
          <p className="text-caption text-text-secondary">{t(`spec_${d.spec}`)} · {d.qual}</p>
          <p className="text-[0.72rem] text-text-muted">{d.clinic}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-text-secondary">
        <span>⭐ {d.rating} ({d.reviews})</span><span>🩺 {fill(t, 'hcExp', { n: d.exp })}</span><span>💰 ₹{d.fee}</span>
        <span>🗣️ {d.langs.map((l) => t(`lang_${l}`)).join(', ')}</span>
      </div>
      <p className="mt-3 text-[0.86rem] leading-relaxed text-text-secondary">{t(d.bioKey)}</p>

      <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">{t('hcConsultType')}</p>
      <div className="flex flex-wrap gap-2">{d.modes.map((m) => <Chip key={m} on={mode === m} onClick={() => setMode(m)}>{MODE_ICON[m]} {t(`mode_${m}`)}</Chip>)}</div>

      <p className="mb-2 mt-4 text-caption font-semibold text-text-secondary">{t('hcPickSlot')}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {slots.map((s, i) => {
          const on = slot && slot.date === s.date && slot.time === s.time
          return <button key={i} onClick={() => setSlot(s)} className={`rounded-2xl border p-2.5 text-center text-[0.74rem] transition ${on ? 'border-accent-primary bg-accent-primary/15' : 'border-white/10 bg-white/[0.02] hover:border-accent-primary/40'}`}><span className="block font-medium">{fmtDate(s.date, lang, t)}</span><span className="text-text-muted">{s.time}</span></button>
        })}
      </div>

      <Button className="mt-5 w-full" disabled={!slot} onClick={() => onBooked(bookAppointment(docId, { ...slot, mode }))}>{slot ? fill(t, 'hcBookAt', { date: fmtDate(slot.date, lang, t), time: slot.time }) : t('hcSelectSlot')}</Button>
      <p className="mt-3 text-[0.72rem] text-text-muted">🛡️ {t('hcBookNote')}</p>
    </Sheet>
  )
}

// ── AI PRE-CONSULTATION ──────────────────────────────────────────────────────
function PreConsultModal({ t, appt, onClose, onJoin }) {
  const d = doctor(appt.docId)
  const [sections, setSections] = useState(() => preConsult().map((s) => ({ ...s })))
  const [shared, setShared] = useState(false)
  const toggle = (id) => setSections((prev) => prev.map((s) => (s.id === id ? { ...s, share: !s.share } : s)))
  const doShare = () => { shareWithDoctor(appt.docId, sections.filter((s) => s.share).map((s) => s.id)); setShared(true) }
  return (
    <Sheet onClose={onClose}>
      <Badge tone="ai" icon={<SparklesIcon size={13} />}>{t('pcBadge')}</Badge>
      <h3 className="mt-3 font-heading text-lg font-semibold">{t('pcTitle')}</h3>
      <p className="mt-1 text-caption text-text-secondary">{fill(t, 'pcSubFor', { name: d?.name || '' })}</p>

      <div className="mt-4 space-y-2.5">
        {sections.map((s) => (
          <div key={s.id} className={`rounded-2xl border p-3 transition ${s.share ? 'border-accent-primary/25 bg-accent-primary/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
            <div className="flex items-center gap-2">
              <span>{s.icon}</span>
              <p className="flex-1 font-heading text-[0.92rem] font-semibold">{t(s.titleKey)}</p>
              <button onClick={() => toggle(s.id)} aria-pressed={s.share} className={`relative h-5 w-9 shrink-0 rounded-full transition ${s.share ? 'bg-accent-primary' : 'bg-white/15'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${s.share ? 'left-4.5' : 'left-0.5'}`} style={{ left: s.share ? '1.125rem' : '0.125rem' }} /></button>
            </div>
            <ul className="mt-1.5 space-y-0.5 pl-6">
              {s.lines.map((ln, i) => <li key={i} className="text-[0.8rem] leading-relaxed text-text-secondary">• {ln.plain ? t(ln.key) : fill(t, ln.key, ln.vars || {})}</li>)}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[0.74rem] leading-relaxed text-text-muted">🔒 {t('pcConsent')}</p>
      {!shared ? (
        <Button className="mt-3 w-full" onClick={doShare}>🔒 {fill(t, 'pcShareBtn', { n: sections.filter((s) => s.share).length })}</Button>
      ) : (
        <div className="mt-3 rounded-2xl border border-success/25 bg-success/[0.06] p-3 text-center text-caption text-success">✓ {t('pcShared')}</div>
      )}
      <Button variant="secondary" className="mt-2 w-full" onClick={() => onJoin(appt)}>{MODE_ICON[appt.mode]} {t('pcJoinNow')} <ArrowRightIcon size={14} /></Button>
    </Sheet>
  )
}

// ── SECURE CONSULTATION ROOM ─────────────────────────────────────────────────
function ConsultRoom({ t, appt, onClose }) {
  const d = doctor(appt.docId)
  const [phase, setPhase] = useState('connecting') // connecting | live | done
  const [secs, setSecs] = useState(0)
  const [captured, setCaptured] = useState([])
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    const c = setTimeout(() => setPhase('live'), 1400)
    return () => clearTimeout(c)
  }, [])
  useEffect(() => {
    if (phase !== 'live') return
    const iv = setInterval(() => setSecs((s) => s + 1), 1000)
    // AI progressively "captures" discussion topics (with consent)
    const topics = ['crCap1', 'crCap2', 'crCap3', 'crCap4']
    const caps = topics.map((k, i) => setTimeout(() => setCaptured((prev) => [...prev, k]), 1600 + i * 1800))
    return () => { clearInterval(iv); caps.forEach(clearTimeout) }
  }, [phase])

  const mm = String(Math.floor(secs / 60)).padStart(2, '0')
  const ss = String(secs % 60).padStart(2, '0')

  function end() {
    completeConsult(appt.id)
    setSummary({ recs: ['pcRec1', 'pcRec2', 'pcRec3'], meds: ['rxMed1', 'rxMed2'], life: ['pcLife1', 'pcLife2'], follow: new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10) })
    setPhase('done')
  }

  return (
    <div className="fixed inset-0 z-[80] bg-bg-primary/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-3xl flex-col p-4">
        {phase !== 'done' ? (
          <>
            {/* top bar */}
            <div className="flex items-center gap-2 text-caption">
              <span className="flex items-center gap-1.5 rounded-pill bg-success/10 px-2.5 py-1 text-success"><ShieldIcon size={13} /> {t('crEncrypted')}</span>
              <span className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-text-secondary">📶 {t('crGood')}</span>
              <span className="ml-auto rounded-pill bg-white/[0.05] px-2.5 py-1 font-stat text-text-primary">⏱ {mm}:{ss}</span>
            </div>
            {/* video tiles */}
            <div className="relative mt-3 flex-1 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
              <div className="grid h-full place-items-center">
                {phase === 'connecting' ? (
                  <div className="text-center"><div className="mx-auto mb-3 h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-accent-primary" /><p className="text-caption text-text-secondary">{fill(t, 'crConnecting', { name: d?.name || '' })}</p></div>
                ) : (
                  <div className="text-center"><div className="text-7xl">{d?.avatar}</div><p className="mt-2 font-heading font-semibold">{d?.name}</p><p className="text-caption text-text-secondary">{t(`spec_${d?.spec}`)}</p></div>
                )}
              </div>
              <div className="absolute bottom-3 right-3 grid h-20 w-16 place-items-center rounded-2xl border border-white/15 bg-bg-card text-2xl">🙂</div>
            </div>
            {/* AI panel */}
            <div className="mt-3 rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.05] p-3">
              <p className="flex items-center gap-1.5 text-caption font-semibold text-accent-ai"><SparklesIcon size={13} /> {t('crAiPanel')}</p>
              {captured.length === 0 ? <p className="mt-1 text-[0.78rem] text-text-muted">{t('crListening')}</p> : (
                <ul className="mt-1.5 space-y-0.5">{captured.map((k, i) => <li key={i} className="text-[0.8rem] text-text-secondary animate-fade-up">✎ {t(k)}</li>)}</ul>
              )}
            </div>
            {/* controls */}
            <div className="mt-3 flex items-center justify-center gap-3">
              <button className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06] text-lg">🎤</button>
              <button className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06] text-lg">📹</button>
              <button onClick={end} className="rounded-pill bg-danger px-6 py-3 font-semibold text-white">{t('crEnd')}</button>
              <button onClick={onClose} className="grid h-12 w-12 place-items-center rounded-full bg-white/[0.06] text-lg" title={t('crExit')}>✕</button>
            </div>
            <p className="mt-2 text-center text-[0.7rem] text-text-muted">🔒 {t('crConsent')}</p>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-2xl">✓</div>
              <h3 className="mt-3 font-heading text-xl font-semibold">{t('crDoneTitle')}</h3>
              <p className="text-caption text-text-secondary">{fill(t, 'crDoneSub', { name: d?.name || '' })}</p>
            </div>
            <Card className="mt-5"><p className="font-heading font-semibold">📋 {t('pcSummary')}</p><ul className="mt-2 space-y-1">{summary.recs.map((k, i) => <li key={i} className="text-[0.86rem] text-text-secondary">• {t(k)}</li>)}</ul></Card>
            <Card className="mt-3"><p className="font-heading font-semibold">💊 {t('crRx')}</p><ul className="mt-2 space-y-1">{summary.meds.map((k, i) => <li key={i} className="text-[0.86rem] text-text-secondary">• {t(k)}</li>)}</ul><p className="mt-2 text-[0.74rem] text-warning">⚠️ {t('crMedNote')}</p></Card>
            <Card className="mt-3"><p className="font-heading font-semibold">🌿 {t('crLifestyle')}</p><ul className="mt-2 space-y-1">{summary.life.map((k, i) => <li key={i} className="text-[0.86rem] text-text-secondary">• {t(k)}</li>)}</ul></Card>
            <Card className="mt-3 flex items-center gap-3 bg-accent-ai/[0.05]"><span className="text-2xl">📅</span><div className="flex-1"><p className="text-caption text-text-secondary">{t('crNextFollow')}</p><p className="font-heading font-semibold">{summary.follow}</p></div></Card>
            <p className="mt-3 text-center text-[0.76rem] text-text-muted">{t('crSaved')}</p>
            <Button className="mt-4 w-full" onClick={onClose}>{t('crBackToHealth')}</Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── CARE ─────────────────────────────────────────────────────────────────────
function CareTab({ t, lang, tick, bump }) {
  const meds = useMemo(() => getStore().meds, [tick])
  const adh = useMemo(() => adherence(7), [tick])
  const [adding, setAdding] = useState(false)
  const [effFor, setEffFor] = useState(null)
  const today = new Date().toISOString().slice(0, 10)

  const LABS = [['🩸', 'labBlood'], ['⚗️', 'labHormone'], ['💊', 'labVitamin'], ['🧫', 'labUrine'], ['🖼️', 'labImaging'], ['🔬', 'labCheckup']]

  return (
    <div className="space-y-6">
      {/* Medications */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span>💊</span><h2 className="font-heading text-lg font-semibold">{t('hcMeds')}</h2>
          {adh != null && <Badge tone={adh >= 80 ? 'success' : 'warning'} className="ml-auto">{fill(t, 'hcAdherence', { n: adh })}</Badge>}
        </div>
        {meds.length === 0 ? (
          <Card className="text-center"><p className="text-[0.9rem] text-text-secondary">{t('hcNoMeds')}</p></Card>
        ) : (
          <div className="space-y-2">
            {meds.map((m) => (
              <Card key={m.id}>
                <div className="flex items-center gap-3">
                  <button onClick={() => { markDose(m.id); bump() }} className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition ${m.doses[today] ? 'border-success bg-success text-bg-primary' : 'border-white/20'}`}>{m.doses[today] ? '✓' : ''}</button>
                  <div className="flex-1"><p className="font-heading text-[0.92rem] font-semibold">{t(m.nameKey)}</p><p className="text-[0.72rem] text-text-muted">{m.dose} · {(m.times || []).join(', ')} · {t(`freq_${m.freq}`) || m.freq}</p></div>
                  <button onClick={() => { removeMedication(m.id); bump() }} className="text-text-muted hover:text-danger">🗑</button>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <button onClick={() => setEffFor(effFor === m.id ? null : m.id)} className="text-[0.74rem] text-accent-secondary hover:underline">📓 {t('hcSideEffect')}</button>
                  {m.sideEffects.length > 0 && <span className="text-[0.7rem] text-text-muted">{fill(t, 'hcSideCount', { n: m.sideEffects.length })}</span>}
                </div>
                {effFor === m.id && (
                  <form onSubmit={(e) => { e.preventDefault(); const v = e.target.eff.value.trim(); if (v) { logSideEffect(m.id, v); e.target.reset(); setEffFor(null); bump() } }} className="mt-2">
                    <input name="eff" placeholder={t('hcSidePlaceholder')} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
                    <p className="mt-1 text-[0.7rem] text-warning">⚠️ {t('hcSideNote')}</p>
                  </form>
                )}
              </Card>
            ))}
          </div>
        )}
        {adding ? (
          <Card className="mt-2">
            <form onSubmit={(e) => { e.preventDefault(); const f = e.target; if (f.nm.value.trim()) { addMedication({ nameKey: f.nm.value.trim(), dose: f.dose.value.trim() || '1', freq: 'daily', times: [f.time.value || '09:00'] }); f.reset(); setAdding(false); bump() } }} className="space-y-2">
              <input name="nm" placeholder={t('hcMedName')} className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
              <div className="flex gap-2">
                <input name="dose" placeholder={t('hcMedDose')} className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
                <input name="time" type="time" defaultValue="09:00" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
              </div>
              <div className="flex gap-2"><Button size="sm" type="submit">{t('hcAddMed')}</Button><Button size="sm" variant="ghost" type="button" onClick={() => setAdding(false)}>{t('hcCancel')}</Button></div>
            </form>
          </Card>
        ) : (
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => setAdding(true)}>+ {t('hcAddMed')}</Button>
        )}
      </div>

      {/* Lab tests (future booking) */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🧪</span><h2 className="font-heading text-lg font-semibold">{t('hcLabs')}</h2><Badge tone="neutral" className="ml-auto">{t('hcSoon')}</Badge></div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {LABS.map(([e, k]) => <div key={k} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"><div className="text-2xl">{e}</div><p className="mt-1 text-[0.76rem] text-text-secondary">{t(k)}</p></div>)}
        </div>
        <p className="mt-2 text-caption text-text-muted">{t('hcLabNote')}</p>
      </div>
    </div>
  )
}

// ── RECORDS ──────────────────────────────────────────────────────────────────
function RecordsTab({ t, lang, tick, bump }) {
  const past = useMemo(() => pastAppointments(), [tick])
  const rx = useMemo(() => getPrescriptions(), [tick])
  const timeline = useMemo(() => recordTimeline(), [tick])
  const log = useMemo(() => consentLog(), [tick])
  const shared = useMemo(() => getStore().shared, [tick])

  return (
    <div className="space-y-6">
      {/* Consultation history */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🗂️</span><h2 className="font-heading text-lg font-semibold">{t('hcHistory')}</h2></div>
        {past.filter((a) => a.status === 'completed').length === 0 ? (
          <Card className="text-center"><p className="text-[0.9rem] text-text-secondary">{t('hcNoHistory')}</p></Card>
        ) : (
          <div className="space-y-2">
            {past.filter((a) => a.status === 'completed').map((a) => {
              const d = doctor(a.docId)
              return (
                <Card key={a.id}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{d?.avatar}</span>
                    <div className="flex-1"><p className="font-heading text-[0.9rem] font-semibold">{d?.name}</p><p className="text-[0.72rem] text-text-muted">{fmtDate(a.date, lang, t)} · {t(`spec_${d?.spec}`)}</p></div>
                    <Badge tone="success">✓ {t('hcCompleted')}</Badge>
                  </div>
                  {a.summary && <ul className="mt-2 space-y-0.5 border-t border-white/[0.06] pt-2">{a.summary.recommendKeys.map((k, i) => <li key={i} className="text-[0.8rem] text-text-secondary">• {t(k)}</li>)}</ul>}
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Prescriptions */}
      {rx.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>💊</span><h2 className="font-heading text-lg font-semibold">{t('hcRx')}</h2></div>
          <div className="space-y-2">
            {rx.map((r) => (
              <Card key={r.id} className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{fill(t, 'hcRxFrom', { name: doctor(r.docId)?.name || '' })}</p><p className="text-[0.72rem] text-text-muted">{r.date} · {r.medKeys.map((k) => t(k)).join(', ')}</p></div>
                {r.signed && <Badge tone="ai">✔ {t('hcSigned')}</Badge>}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Report sharing & consent */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🔐</span><h2 className="font-heading text-lg font-semibold">{t('hcSharing')}</h2></div>
        {Object.keys(shared).length === 0 ? (
          <Card className="text-center"><p className="text-[0.9rem] text-text-secondary">{t('hcNoShares')}</p></Card>
        ) : (
          <div className="space-y-2">
            {Object.entries(shared).map(([docId, s]) => (
              <Card key={docId} className="flex items-center gap-3">
                <span className="text-2xl">{doctor(docId)?.avatar}</span>
                <div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{doctor(docId)?.name}</p><p className="text-[0.72rem] text-text-muted">{fill(t, 'hcShareInfo', { n: s.sections.length, date: s.expires.slice(0, 10) })}</p></div>
                <Button size="sm" variant="ghost" onClick={() => { revokeShare(docId); bump() }}>{t('hcRevoke')}</Button>
              </Card>
            ))}
          </div>
        )}
        <p className="mt-2 text-caption text-text-muted">🛡️ {t('hcSharingNote')}</p>
      </div>

      {/* Access log */}
      {log.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>📜</span><h2 className="font-heading text-lg font-semibold">{t('hcAccessLog')}</h2></div>
          <div className="space-y-1.5">
            {log.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-white/[0.02] px-3 py-2 text-[0.76rem]">
                <span className="text-text-muted">{new Date(e.at).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span className="text-text-secondary">{fill(t, `logAct_${e.actionKey}`, { name: e.docId ? doctor(e.docId)?.name || '' : '', n: e.count || 0 })}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unified timeline */}
      {timeline.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2"><span>🕑</span><h2 className="font-heading text-lg font-semibold">{t('hcTimeline')}</h2></div>
          <div className="space-y-2">
            {timeline.map((r, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
                <span className="text-lg">{r.icon}</span>
                <p className="flex-1 text-[0.84rem] text-text-secondary">{fill(t, r.key, r.vars)}</p>
                <span className="text-[0.7rem] text-text-muted">{r.at ? fmtDate(r.at, lang, t) : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── shared bottom sheet ──────────────────────────────────────────────────────
function Sheet({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-text-muted hover:text-text-primary">✕</button>
        {children}
      </div>
    </div>
  )
}
