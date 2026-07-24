import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ShieldIcon, HeartIcon, SparklesIcon, MoonIcon } from '../components/ui/icons'
import CycleGuideIntro from '../components/CycleGuideIntro'
import { isAppwriteConfigured, isAppwriteDataConfigured, appwriteConfig } from '../lib/config'
import { useT, LANGS } from '../lib/i18n.jsx'
import {
  getAppwriteConfig,
  saveAppwriteConfig,
  clearAppwriteConfig,
  getSettings,
  saveSettings,
  clearAllData,
} from '../lib/localStore'

export default function Settings() {
  const { t, lang, setLang } = useT()
  const location = useLocation()
  const sectionRefs = { language: useRef(null), notifications: useRef(null), 'privacy-security': useRef(null) }
  const [highlight, setHighlight] = useState('')

  useEffect(() => {
    const section = new URLSearchParams(location.search).get('section')
    const el = section && sectionRefs[section]?.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setHighlight(section)
      const id = setTimeout(() => setHighlight(''), 2000)
      return () => clearTimeout(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search])

  const ring = (key) => (highlight === key ? 'ring-2 ring-accent-primary/50' : '')
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
  const [replayGuide, setReplayGuide] = useState(false)

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
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{t('menuSettings')}</h1>
        {savedMsg && <p className="mt-2 text-caption text-success">{savedMsg}</p>}
      </div>

      {/* Account sync */}
      <Card className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon size={18} className="text-accent-ai" />
            <h2 className="font-heading text-lg font-semibold">{t('accountSync')}</h2>
          </div>
          <Badge tone={isAppwriteConfigured ? 'success' : 'neutral'}>
            {isAppwriteDataConfigured ? t('connBadgeAuthData') : isAppwriteConfigured ? t('connBadgeAuth') : t('connBadgeNone')}
          </Badge>
        </div>
        <p className="mb-4 text-caption text-text-secondary">{t('accountSyncDesc')}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Endpoint" value={aw.endpoint} onChange={setAwField('endpoint')} placeholder="https://cloud.appwrite.io/v1" />
          <Field label="Project ID" value={aw.projectId} onChange={setAwField('projectId')} placeholder="e.g. 665f0a…" />
          <Field label="Database ID (optional)" value={aw.databaseId} onChange={setAwField('databaseId')} placeholder="for log sync" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={connectAppwrite} size="md" disabled={!aw.projectId.trim()}>
            {t('connectReload')}
          </Button>
          {isAppwriteConfigured && (
            <Button onClick={disconnectAppwrite} variant="secondary" size="md">
              {t('disconnect')}
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
          <h2 className="font-heading text-lg font-semibold">{t('emergencyContact')}</h2>
        </div>
        <p className="mb-4 text-caption text-text-secondary">{t('emergencyDesc')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label={t('nameLabel')}
            value={settings.emergencyName}
            onChange={(e) => setSettings((s) => ({ ...s, emergencyName: e.target.value }))}
            onBlur={() => setSetting('emergencyName', settings.emergencyName)}
            placeholder="e.g. Amma"
          />
          <Field
            label={t('phoneLabel')}
            value={settings.emergencyPhone}
            onChange={(e) => setSettings((s) => ({ ...s, emergencyPhone: e.target.value }))}
            onBlur={() => setSetting('emergencyPhone', settings.emergencyPhone)}
            placeholder="e.g. 98xxxxxxxx"
          />
        </div>
      </Card>

      {/* Language */}
      <Card ref={sectionRefs.language} className={`mb-6 transition-shadow ${ring('language')}`}>
        <h2 className="mb-4 font-heading text-lg font-semibold">{t('appLanguage')}</h2>
        <select
          value={lang}
          onChange={(e) => {
            const code = e.target.value
            setLang(code) // switch the whole app immediately
            setSetting('language', LANGS.find((l) => l.code === code)?.label || 'English')
          }}
          className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
        >
          {LANGS.map((l) => (
            <option key={l.code} value={l.code} className="bg-bg-card">
              {l.native} — {l.label}
            </option>
          ))}
        </select>
        <p className="mt-3 text-caption text-text-muted">{t('darkDefault')}</p>
      </Card>

      {/* Notifications */}
      <Card ref={sectionRefs.notifications} className={`mb-6 transition-shadow ${ring('notifications')}`}>
        <h2 className="mb-4 font-heading text-lg font-semibold">{t('preferences')}</h2>
        <label className="flex items-center gap-2 text-[0.95rem] text-text-secondary">
          <input
            type="checkbox"
            checked={settings.notifications}
            onChange={(e) => setSetting('notifications', e.target.checked)}
            className="h-4 w-4 accent-accent-primary"
          />
          {t('cycleReminders')}
        </label>
      </Card>

      {/* Privacy & Security / Data */}
      <Card ref={sectionRefs['privacy-security']} className={`mb-6 flex flex-col gap-3 bg-bg-secondary/40 transition-shadow sm:flex-row sm:items-center sm:justify-between ${ring('privacy-security')}`}>
        <div className="flex items-start gap-3">
          <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
          <p className="text-caption text-text-secondary">{t('dataDesc')}</p>
        </div>
        <Button onClick={wipe} variant="secondary" size="md" className="text-danger">
          {t('deleteData')}
        </Button>
      </Card>

      {/* Help & Education */}
      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MoonIcon size={20} className="mt-0.5 shrink-0 text-accent-secondary" />
          <div>
            <h2 className="font-heading text-lg font-semibold">{t('cgSettingsTitle')}</h2>
            <p className="text-caption text-text-secondary">{t('cgSettingsDesc')}</p>
          </div>
        </div>
        <Button onClick={() => setReplayGuide(true)} variant="secondary" size="md">
          {t('cgSettingsBtn')}
        </Button>
      </Card>

      {replayGuide && <CycleGuideIntro forceOpen onClose={() => setReplayGuide(false)} />}
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
