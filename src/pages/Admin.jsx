import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useT } from '../lib/i18n.jsx'
import {
  KPIS, USER_GROWTH, FEATURE_USAGE, LANGUAGES, USERS, AI_CENTER, PROMPTS,
  CMS, DOCTORS, HOSPITALS, FLAGS, TICKETS, AUDIT, ROLE_SECTIONS, ROLES,
} from '../lib/adminData'

const SECTIONS = {
  overview: '📊 Overview', users: '👥 Users', ai: '🧠 AI Center', cms: '📚 Content',
  doctors: '🩺 Professionals', flags: '🚩 Feature flags', support: '🎫 Support', audit: '📝 Audit',
  doctor: '🩺 Doctor portal', nutritionist: '🥗 Nutritionist portal',
}

const STATUS_TONE = {
  active: 'success', verified: 'success', published: 'success', live: 'success', resolved: 'success',
  review: 'warning', pending: 'warning', 'in progress': 'warning', assigned: 'warning',
  suspended: 'danger', rejected: 'danger',
  inactive: 'muted', draft: 'muted', archived: 'muted', open: 'ai', closed: 'muted',
}

export default function Admin() {
  const { t } = useT()
  const [role, setRole] = useState('superadmin')
  const allowed = ROLE_SECTIONS[role]
  const [section, setSection] = useState(allowed[0])
  const active = allowed.includes(section) ? section : allowed[0]

  function pickRole(r) { setRole(r); setSection(ROLE_SECTIONS[r][0]) }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛰️</span>
              <h1 className="font-heading text-2xl font-semibold">{t('admTitle')}</h1>
              <Badge tone="warning">{t('admDemo')}</Badge>
            </div>
            <p className="mt-1 text-caption text-text-muted">{t('admSub')}</p>
          </div>
          {/* Role switcher */}
          <div className="ml-auto flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button key={r.id} onClick={() => pickRole(r.id)}
                className={`flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-caption font-medium transition ${role === r.id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 bg-white/[0.03] text-text-secondary hover:text-text-primary'}`}>
                {r.emoji} {t(r.key)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row">
          {/* Sidebar nav */}
          <nav className="flex gap-1.5 overflow-x-auto lg:w-52 lg:flex-col lg:overflow-visible">
            {allowed.map((s) => (
              <button key={s} onClick={() => setSection(s)}
                className={`shrink-0 rounded-2xl px-3.5 py-2 text-left text-[0.88rem] transition lg:w-full ${active === s ? 'bg-accent-primary/15 font-medium text-text-primary' : 'text-text-secondary hover:bg-white/[0.04]'}`}>
                {SECTIONS[s]}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {active === 'overview' && <Overview t={t} />}
            {active === 'users' && <Users t={t} />}
            {active === 'ai' && <AICenter t={t} />}
            {active === 'cms' && <Content t={t} />}
            {active === 'doctors' && <Professionals t={t} />}
            {active === 'flags' && <Flags t={t} />}
            {active === 'support' && <Support t={t} />}
            {active === 'audit' && <AuditLog t={t} />}
            {active === 'doctor' && <DoctorPortal t={t} />}
            {active === 'nutritionist' && <NutritionistPortal t={t} />}
          </div>
        </div>

        <p className="mt-10 text-center text-[0.75rem] text-text-muted">
          {t('admFooter')} · <Link to="/home" className="hover:text-accent-secondary">← {t('admBackApp')}</Link>
        </p>
      </div>
    </div>
  )
}

function Pill({ status }) {
  const tone = STATUS_TONE[status] || 'muted'
  const cls = { success: 'text-success bg-success/10', warning: 'text-warning bg-warning/10', danger: 'text-danger bg-danger/10', ai: 'text-accent-ai bg-accent-ai/10', muted: 'text-text-muted bg-white/[0.06]' }[tone]
  return <span className={`rounded-pill px-2.5 py-0.5 text-[0.7rem] font-medium capitalize ${cls}`}>{status}</span>
}

function Overview({ t }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {KPIS.map((k) => (
          <Card key={k.key} className="p-4">
            <div className="flex items-center justify-between"><span className="text-lg">{k.emoji}</span><span className={`text-[0.65rem] ${k.up ? 'text-success' : 'text-text-muted'}`}>{k.delta}</span></div>
            <p className="mt-2 font-stat text-xl font-bold">{k.value}</p>
            <p className="text-[0.7rem] text-text-muted">{t(k.key)}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="font-heading font-semibold">{t('admUserGrowth')}</h3>
          <p className="text-caption text-text-muted">{t('admThousands')}</p>
          <LineChart data={USER_GROWTH} />
        </Card>
        <Card>
          <h3 className="font-heading font-semibold">{t('admFeatureUse')}</h3>
          <div className="mt-4 space-y-2.5">
            {FEATURE_USAGE.map(([name, v]) => <BarRow key={name} label={name} value={v} />)}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-heading font-semibold">{t('admLangDist')}</h3>
        <div className="mt-4 space-y-2.5">
          {LANGUAGES.map(([name, v]) => <BarRow key={name} label={name} value={v} />)}
        </div>
      </Card>
    </div>
  )
}

/** Single-series line — magnitude over time, one hue, direct end label. */
function LineChart({ data }) {
  const W = 460, H = 150, PAD = 26
  const max = Math.max(...data.map((d) => d.v)) * 1.1
  const x = (i) => PAD + (i / (data.length - 1)) * (W - PAD * 2)
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2)
  const path = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ')
  const area = `${path} L${x(data.length - 1)},${H - PAD} L${x(0)},${H - PAD} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="mt-3">
      <defs><linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#d97ba8" stopOpacity="0.35" /><stop offset="100%" stopColor="#d97ba8" stopOpacity="0" /></linearGradient></defs>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={PAD} y1={PAD + g * (H - PAD * 2)} x2={W - PAD} y2={PAD + g * (H - PAD * 2)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />)}
      <path d={area} fill="url(#agrad)" />
      <path d={path} fill="none" stroke="#d97ba8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={x(i)} cy={y(d.v)} r="2.5" fill="#d97ba8"><title>{d.m}: {d.v}k</title></circle>)}
      {data.map((d, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-text-muted" fontSize="9">{d.m}</text>)}
      <text x={x(data.length - 1)} y={y(data[data.length - 1].v) - 8} textAnchor="end" fill="#f5c6d6" fontSize="11" fontWeight="700">{data[data.length - 1].v}k</text>
    </svg>
  )
}

/** Horizontal magnitude bar with a direct value label. */
function BarRow({ label, value }) {
  return (
    <div className="flex items-center gap-3" title={`${label}: ${value}%`}>
      <span className="w-28 shrink-0 truncate text-caption text-text-secondary">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-white/[0.06]">
        <div className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary" style={{ width: `${value}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right font-stat text-caption text-text-secondary">{value}%</span>
    </div>
  )
}

function TableCard({ title, sub, headers, rows }) {
  return (
    <Card className="overflow-hidden">
      <div className="mb-3"><h3 className="font-heading font-semibold">{title}</h3>{sub && <p className="text-caption text-text-muted">{sub}</p>}</div>
      <div className="-mx-2 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[0.85rem]">
          <thead><tr className="text-[0.68rem] uppercase tracking-wide text-text-muted">{headers.map((h) => <th key={h} className="px-2 py-2 font-medium">{h}</th>)}</tr></thead>
          <tbody>{rows}</tbody>
        </table>
      </div>
    </Card>
  )
}

function Users({ t }) {
  const [q, setQ] = useState('')
  const rows = useMemo(() => USERS.filter((u) => (u.name + u.id + u.lang).toLowerCase().includes(q.toLowerCase())), [q])
  return (
    <div className="space-y-4">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admSearchUsers')}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
      <TableCard title={t('admUsers')} sub={`${rows.length} ${t('admShown')}`} headers={['ID', 'User', 'Lang', 'Plan', 'Last active', 'Status', '']}
        rows={rows.map((u) => (
          <tr key={u.id} className="border-t border-white/[0.05]">
            <td className="px-2 py-2.5 font-mono text-[0.75rem] text-text-muted">{u.id}</td>
            <td className="px-2 py-2.5 text-text-primary">{u.name} <span className="text-text-muted">· {u.country}</span></td>
            <td className="px-2 py-2.5 text-text-secondary">{u.lang}</td>
            <td className="px-2 py-2.5">{u.plan === 'Premium' ? <span className="text-accent-secondary">⭐ Premium</span> : <span className="text-text-muted">Free</span>}</td>
            <td className="px-2 py-2.5 text-text-muted">{u.last}</td>
            <td className="px-2 py-2.5"><Pill status={u.status} /></td>
            <td className="px-2 py-2.5 text-right"><button className="text-text-muted hover:text-text-primary">⋯</button></td>
          </tr>
        ))} />
    </div>
  )
}

function AICenter({ t }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {AI_CENTER.map((m) => (
          <Card key={m.key} className="p-4">
            <p className="text-[0.7rem] uppercase tracking-wide text-text-muted">{t(m.key)}</p>
            <p className={`mt-1 font-stat text-lg font-bold ${m.tone === 'good' ? 'text-success' : m.tone === 'warn' ? 'text-warning' : 'text-text-primary'}`}>{m.value}</p>
          </Card>
        ))}
      </div>
      <TableCard title={t('admPrompts')} sub={t('admPromptsSub')} headers={['Version', 'Author', 'When', 'Reason', 'Status']}
        rows={PROMPTS.map((p) => (
          <tr key={p.v} className="border-t border-white/[0.05]">
            <td className="px-2 py-2.5 font-mono text-text-primary">{p.v}</td>
            <td className="px-2 py-2.5 text-text-secondary">{p.author}</td>
            <td className="px-2 py-2.5 text-text-muted">{p.when}</td>
            <td className="px-2 py-2.5 text-text-secondary">{p.reason}</td>
            <td className="px-2 py-2.5"><Pill status={p.status} /></td>
          </tr>
        ))} />
    </div>
  )
}

function Content({ t }) {
  return (
    <TableCard title={t('admContent')} sub={t('admContentSub')} headers={['Title', 'Category', 'Lang', 'Status', '']}
      rows={CMS.map((c, i) => (
        <tr key={i} className="border-t border-white/[0.05]">
          <td className="px-2 py-2.5 text-text-primary">{c.title}</td>
          <td className="px-2 py-2.5 text-text-secondary">{c.cat}</td>
          <td className="px-2 py-2.5 text-text-muted">{c.lang}</td>
          <td className="px-2 py-2.5"><Pill status={c.status} /></td>
          <td className="px-2 py-2.5 text-right text-caption">
            {c.status === 'review' ? <span className="text-success">✓ {t('admApprove')}</span> : c.status === 'draft' ? <span className="text-accent-secondary">{t('admEdit')}</span> : <span className="text-text-muted">{t('admView')}</span>}
          </td>
        </tr>
      ))} />
  )
}

function Professionals({ t }) {
  return (
    <div className="space-y-4">
      <TableCard title={t('admDoctors')} sub={t('admDoctorsSub')} headers={['Name', 'Specialty', 'City', 'Exp', 'Status', '']}
        rows={DOCTORS.map((d, i) => (
          <tr key={i} className="border-t border-white/[0.05]">
            <td className="px-2 py-2.5 text-text-primary">{d.name}</td>
            <td className="px-2 py-2.5 text-text-secondary">{d.spec}</td>
            <td className="px-2 py-2.5 text-text-muted">{d.city}</td>
            <td className="px-2 py-2.5 text-text-muted">{d.exp}</td>
            <td className="px-2 py-2.5"><Pill status={d.status} /></td>
            <td className="px-2 py-2.5 text-right text-caption">{d.status === 'pending' ? <span className="text-success">✓ {t('admVerify')}</span> : <span className="text-text-muted">{t('admView')}</span>}</td>
          </tr>
        ))} />
      <TableCard title={t('admHospitals')} headers={['Name', 'City', 'Type', 'Emergency']}
        rows={HOSPITALS.map((h, i) => (
          <tr key={i} className="border-t border-white/[0.05]">
            <td className="px-2 py-2.5 text-text-primary">{h.name}</td>
            <td className="px-2 py-2.5 text-text-secondary">{h.city}</td>
            <td className="px-2 py-2.5 text-text-muted">{h.type}</td>
            <td className="px-2 py-2.5">{h.emg ? <span className="text-success">✓ 24/7</span> : <span className="text-text-muted">—</span>}</td>
          </tr>
        ))} />
    </div>
  )
}

function Flags({ t }) {
  const [flags, setFlags] = useState(FLAGS)
  return (
    <Card>
      <h3 className="font-heading font-semibold">{t('admFlags')}</h3>
      <p className="text-caption text-text-muted">{t('admFlagsSub')}</p>
      <div className="mt-4 space-y-2">
        {flags.map((f, i) => (
          <div key={f.key} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex-1"><p className="text-[0.9rem] text-text-primary">{t(f.key)}</p><p className="text-caption text-text-muted">{f.rollout}</p></div>
            <button onClick={() => setFlags((fs) => fs.map((x, j) => j === i ? { ...x, on: !x.on } : x))}
              className={`relative h-6 w-11 shrink-0 rounded-full transition ${f.on ? 'bg-accent-primary' : 'bg-white/15'}`}>
              <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${f.on ? 'left-6' : 'left-1'}`} />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Support({ t }) {
  return (
    <div className="space-y-4">
      <TableCard title={t('admTickets')} headers={['ID', 'Category', 'Status', 'When']}
        rows={TICKETS.map((tk) => (
          <tr key={tk.id} className="border-t border-white/[0.05]">
            <td className="px-2 py-2.5 font-mono text-[0.75rem] text-text-muted">{tk.id}</td>
            <td className="px-2 py-2.5 text-text-primary">{tk.cat}</td>
            <td className="px-2 py-2.5"><Pill status={tk.status} /></td>
            <td className="px-2 py-2.5 text-text-muted">{tk.when}</td>
          </tr>
        ))} />
      <AuditLog t={t} />
    </div>
  )
}

function AuditLog({ t }) {
  return (
    <Card>
      <h3 className="font-heading font-semibold">{t('admAudit')}</h3>
      <p className="text-caption text-text-muted">{t('admAuditSub')}</p>
      <ol className="mt-3 space-y-2">
        {AUDIT.map((a, i) => (
          <li key={i} className="flex items-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-[0.85rem]">
            <span className="text-text-muted">🕒 {a.when}</span>
            <span className="text-text-primary">{a.action}</span>
            <span className="ml-auto text-caption text-text-muted">{a.who}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}

function DoctorPortal({ t }) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-[#a78bfa]/[0.1] to-transparent">
        <h3 className="font-heading text-lg font-semibold">🩺 {t('admDoctorTitle')}</h3>
        <p className="mt-1 text-caption text-text-secondary">{t('admDoctorSub')}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['📅', 'admDocAppts', '6'], ['📄', 'admDocReports', '3'], ['💬', 'admDocMessages', '2']].map(([e, k, v]) => (
          <Card key={k} className="p-4"><span className="text-2xl">{e}</span><p className="mt-2 font-stat text-xl font-bold">{v}</p><p className="text-caption text-text-muted">{t(k)}</p></Card>
        ))}
      </div>
      <Card><p className="text-[0.85rem] text-text-secondary">🔒 {t('admDocPrivacy')}</p></Card>
    </div>
  )
}

function NutritionistPortal({ t }) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-[#6ee7b7]/[0.1] to-transparent">
        <h3 className="font-heading text-lg font-semibold">🥗 {t('admNutriTitle')}</h3>
        <p className="mt-1 text-caption text-text-secondary">{t('admNutriSub')}</p>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['🍽️', 'admNutriPlans', '4'], ['📄', 'admNutriShared', '2'], ['📚', 'admNutriLibrary', '58']].map(([e, k, v]) => (
          <Card key={k} className="p-4"><span className="text-2xl">{e}</span><p className="mt-2 font-stat text-xl font-bold">{v}</p><p className="text-caption text-text-muted">{t(k)}</p></Card>
        ))}
      </div>
      <Card><p className="text-[0.85rem] text-text-secondary">🔒 {t('admDocPrivacy')}</p></Card>
    </div>
  )
}
