import { useState } from 'react'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ShieldIcon, HeartIcon, SparklesIcon } from '../components/ui/icons'
import { isAppwriteConfigured, isAppwriteDataConfigured, appwriteConfig } from '../lib/config'
import {
  getAppwriteConfig,
  saveAppwriteConfig,
  clearAppwriteConfig,
  getSettings,
  saveSettings,
  clearAllData,
} from '../lib/localStore'

export default function Settings() {
  const cfg = getAppwriteConfig()
  // Show the ACTIVE resolved config (baked-in MIRA project) so the fields reflect
  // what the app is really connected to, not just any local override.
  const [aw, setAw] = useState({
    endpoint: cfg.endpoint || appwriteConfig.endpoint,
    projectId: cfg.projectId || appwriteConfig.projectId,
    databaseId: cfg.databaseId || appwriteConfig.databaseId,
  })
  const [settings, setSettings] = useState(getSettings())
  const [savedMsg, setSavedMsg] = useState('')

  const setAwField = (k) => (e) => setAw((p) => ({ ...p, [k]: e.target.value }))
  const setSetting = (k, v) => {
    const next = saveSettings({ [k]: v })
    setSettings(next)
    flash('Saved ✓')
  }
  function flash(m) {
    setSavedMsg(m)
    setTimeout(() => setSavedMsg(''), 1600)
  }

  function connectAppwrite() {
    saveAppwriteConfig(aw)
    window.location.reload() // config is read at load — reload to apply
  }
  function disconnectAppwrite() {
    clearAppwriteConfig()
    window.location.reload()
  }
  function wipe() {
    if (confirm('Delete all your MIRA health data on this device? This cannot be undone.')) {
      clearAllData()
      window.location.reload()
    }
  }

  return (
    <PageShell max="max-w-3xl">
      <div className="mb-8">
        <Badge tone="neutral" icon={<ShieldIcon size={14} />}>Settings</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight">Settings</h1>
        {savedMsg && <p className="mt-2 text-caption text-success">{savedMsg}</p>}
      </div>

      {/* Account sync */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-accent-ai" />
            <h2 className="font-heading text-lg font-semibold">Account sync (Appwrite)</h2>
          </div>
          <Badge tone={isAppwriteConfigured ? 'success' : 'neutral'}>
            {isAppwriteDataConfigured ? 'Connected (auth + data)' : isAppwriteConfigured ? 'Connected (auth)' : 'Not connected'}
          </Badge>
        </div>
        <p className="mb-4 text-caption text-text-secondary">
          Paste your Appwrite <strong>Project ID</strong> to enable real accounts and cloud sync.
          The endpoint and project id are public (not secrets). Add a Database ID too to sync your
          logs across devices.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Endpoint" value={aw.endpoint} onChange={setAwField('endpoint')} placeholder="https://cloud.appwrite.io/v1" />
          <Field label="Project ID" value={aw.projectId} onChange={setAwField('projectId')} placeholder="e.g. 665f0a…" />
          <Field label="Database ID (optional)" value={aw.databaseId} onChange={setAwField('databaseId')} placeholder="for log sync" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={connectAppwrite} size="md" disabled={!aw.projectId.trim()}>
            Connect & reload
          </Button>
          {isAppwriteConfigured && (
            <Button onClick={disconnectAppwrite} variant="secondary" size="md">
              Disconnect
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-warning/20 bg-warning/[0.06] p-3 text-caption text-text-secondary">
          Setup checklist in Appwrite: enable <strong>Auth → Email/Password</strong>, and under{' '}
          <strong>Settings → Platforms</strong> add a <strong>Web platform</strong> for your app's
          hostname (e.g. <code>localhost</code> and your deploy domain) so browser requests are
          allowed. Real accounts require running on an <code>http(s)</code> origin — the single-file
          <code> file://</code> preview can't create sessions.
        </div>
      </Card>

      {/* Emergency contact */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center gap-2">
          <HeartIcon size={18} className="text-accent-secondary" />
          <h2 className="font-heading text-lg font-semibold">Emergency contact</h2>
        </div>
        <p className="mb-4 text-caption text-text-secondary">
          If you ever tell Mira you're in distress, this person appears first — one tap to call them.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            value={settings.emergencyName}
            onChange={(e) => setSettings((s) => ({ ...s, emergencyName: e.target.value }))}
            onBlur={() => setSetting('emergencyName', settings.emergencyName)}
            placeholder="e.g. Amma"
          />
          <Field
            label="Phone"
            value={settings.emergencyPhone}
            onChange={(e) => setSettings((s) => ({ ...s, emergencyPhone: e.target.value }))}
            onBlur={() => setSetting('emergencyPhone', settings.emergencyPhone)}
            placeholder="e.g. 98xxxxxxxx"
          />
        </div>
      </Card>

      {/* Preferences */}
      <Card className="mb-6">
        <h2 className="mb-4 font-heading text-lg font-semibold">Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-caption text-text-muted">Default language</span>
            <select
              value={settings.language}
              onChange={(e) => setSetting('language', e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
            >
              {['English', 'Tamil', 'Telugu'].map((l) => (
                <option key={l} value={l} className="bg-bg-card">{l}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6 text-[0.95rem] text-text-secondary">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => setSetting('notifications', e.target.checked)}
              className="h-4 w-4 accent-accent-primary"
            />
            Cycle & check-in reminders
          </label>
        </div>
        <p className="mt-3 text-caption text-text-muted">Dark mode is the default MIRA theme.</p>
      </Card>

      {/* Data */}
      <Card className="flex flex-col gap-3 bg-bg-secondary/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
          <p className="text-caption text-text-secondary">
            Your health data is stored on this device (and in Appwrite if connected). Delete it any
            time — this actually removes every local record.
          </p>
        </div>
        <Button onClick={wipe} variant="secondary" size="md" className="text-danger">
          Delete my data
        </Button>
      </Card>
    </PageShell>
  )
}

function Field({ label, value, onChange, onBlur, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-text-muted">{label}</span>
      <input
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
      />
    </label>
  )
}
