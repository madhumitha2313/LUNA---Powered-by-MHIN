import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { HeartIcon, SparklesIcon, ShieldIcon, ArrowRightIcon } from '../components/ui/icons'
import { getProfile, saveProfile, getCycleStats, getLogs, getSymptoms, clearAllData } from '../lib/localStore'

export default function Profile() {
  const [profile, setProfile] = useState(getProfile())
  const [saved, setSaved] = useState(false)
  const stats = getCycleStats()
  const logs = getLogs()
  const symptomCount = Object.values(getSymptoms()).filter(Boolean).length

  const set = (k) => (e) => {
    setProfile((p) => ({ ...p, [k]: e.target.value }))
    setSaved(false)
  }
  function save() {
    saveProfile(profile)
    setSaved(true)
  }
  function wipe() {
    if (confirm('Delete all your MIRA data on this device? This cannot be undone.')) {
      clearAllData()
      setProfile(getProfile())
      location.reload()
    }
  }

  const initials = (profile.name || 'M').trim().slice(0, 1).toUpperCase()

  return (
    <PageShell max="max-w-3xl">
      {/* Identity */}
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary font-heading text-2xl font-bold text-bg-primary">
          {initials}
        </span>
        <div>
          <h1 className="font-heading text-2xl font-semibold">{profile.name || 'Your profile'}</h1>
          <p className="text-caption text-text-secondary">
            {profile.city ? profile.city + ' · ' : ''}Private to this device
          </p>
        </div>
      </div>

      {/* Snapshot */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <Snapshot label="Cycle day" value={stats.cycleDay ?? '—'} sub={stats.phase || 'no data'} />
        <Snapshot label="Check-ins" value={logs.length} sub="logged" />
        <Snapshot label="Symptoms" value={symptomCount} sub="tracked" />
      </div>

      {/* Details form */}
      <Card className="mt-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Your details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={profile.name} onChange={set('name')} placeholder="Your name" />
          <Field label="Age" value={profile.age} onChange={set('age')} placeholder="e.g. 24" />
          <Field label="City" value={profile.city} onChange={set('city')} placeholder="e.g. Chennai" />
          <label className="block">
            <span className="mb-1.5 block text-caption text-text-secondary">Primary concern</span>
            <select
              value={profile.condition}
              onChange={set('condition')}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
            >
              <option value="" className="bg-bg-card">Not sure yet</option>
              {['Irregular periods', 'Heavy bleeding', 'Painful periods', 'PCOS / PCOD', 'Fatigue / anaemia', 'General tracking'].map((c) => (
                <option key={c} value={c} className="bg-bg-card">{c}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <Button onClick={save} size="md">
            Save details
          </Button>
          {saved && <span className="text-caption text-success">Saved ✓</span>}
        </div>
      </Card>

      {/* Quick links */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <LinkCard to="/tracker" icon={HeartIcon} title="Cycle tracker" />
        <LinkCard to="/symptoms" icon={SparklesIcon} title="PCOS symptoms" />
        <LinkCard to="/report" icon={ArrowRightIcon} title="My report" />
      </div>

      {/* Privacy / data */}
      <Card className="mt-6 flex flex-col gap-3 bg-bg-secondary/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
          <p className="text-caption text-text-secondary">
            Your data lives only on this device (preview). Delete it any time — this actually removes
            every stored record.
          </p>
        </div>
        <Button onClick={wipe} variant="secondary" size="md" className="text-danger">
          Delete my data
        </Button>
      </Card>
    </PageShell>
  )
}

function Snapshot({ label, value, sub }) {
  return (
    <Card className="py-5 text-center">
      <p className="font-stat text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-caption text-text-secondary">{label}</p>
      <p className="text-caption text-text-muted">{sub}</p>
    </Card>
  )
}
function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-text-secondary">{label}</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
      />
    </label>
  )
}
function LinkCard({ to, icon: Icon, title }) {
  return (
    <Card hover as={Link} to={to} className="flex items-center gap-3 py-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-accent-secondary">
        <Icon size={20} />
      </span>
      <span className="text-[0.95rem] font-medium">{title}</span>
    </Card>
  )
}
