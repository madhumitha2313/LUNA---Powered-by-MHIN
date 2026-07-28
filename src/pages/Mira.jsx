import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Logo from '../components/Logo'
import { SparklesIcon, ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { digitalTwin, memories, proactiveNudges, getAISettings, setAISettings, resetLearning } from '../lib/miraCore'
import { insights as cycleInsights } from '../lib/cycleIntel'
import { moodInsights } from '../lib/moodIntel'
import { getProfile } from '../lib/localStore'
import { downloadElementAsPdf, fileDateStamp } from '../lib/pdf'

function fmtDay(iso, lang) {
  try { return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { weekday: 'short', day: 'numeric' }) }
  catch { return '' }
}

/** Fill {x}/{n} placeholders in a template, optionally translating the value. */
function fill(t, key, vars = {}, translateVar = false) {
  let s = t(key)
  Object.entries(vars).forEach(([k, v]) => {
    const val = translateVar && k === 'x' ? t(String(v)) : v
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), val)
  })
  return s
}

const PHASE_TONE = { menstrual: 'danger', follicular: 'success', ovulation: 'warning', luteal: 'ai' }

export default function Mira() {
  const { t, lang } = useT()
  const [tick, setTick] = useState(0)
  const [ai, setAi] = useState(getAISettings())
  const [confirmReset, setConfirmReset] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadErr, setDownloadErr] = useState(false)
  const reportRef = useRef(null)
  const profile = getProfile()
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const twin = useMemo(() => digitalTwin(), [tick])
  const mem = useMemo(() => memories(), [tick])
  const nudges = useMemo(() => (ai.paused ? [] : proactiveNudges()), [tick, ai.paused])
  const allInsights = useMemo(() => {
    const seen = new Set()
    return [...cycleInsights(), ...moodInsights()].filter((i) => {
      if (seen.has(i.key)) return false
      seen.add(i.key)
      return true
    }).slice(0, 3)
  }, [tick])

  function togglePause() {
    const next = setAISettings({ paused: !ai.paused })
    setAi(next)
  }
  function doReset() {
    resetLearning()
    setConfirmReset(false)
    setTick((v) => v + 1)
  }
  async function doExport() {
    setDownloading(true)
    setDownloadErr(false)
    try {
      await downloadElementAsPdf(reportRef.current, `MIRA_Core_Report_${fileDateStamp()}.pdf`)
    } catch {
      setDownloadErr(true)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageShell max="max-w-4xl">
      {/* Header with animated AI orb */}
      <div className="flex items-center gap-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center">
          <span className="absolute inset-0 animate-glow-pulse rounded-full bg-gradient-to-br from-[#d97ba8] to-[#a78bfa] opacity-70 blur-md" />
          <span className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#d97ba8] to-[#a78bfa] text-2xl shadow-glow">🧠</span>
        </div>
        <div>
          <Badge tone="ai" icon={<SparklesIcon size={14} />}>{t('coEngine')}</Badge>
          <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('coHeading')}</h1>
        </div>
      </div>
      <p className="mt-3 max-w-lg text-text-secondary">{t('coTagline')}</p>

      {/* Proactive nudges */}
      {nudges.length > 0 && (
        <div className="mt-6 space-y-3">
          {nudges.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-3xl border border-accent-primary/25 bg-accent-primary/[0.07] p-4">
              <span className="text-2xl">{n.icon}</span>
              <p className="flex-1 text-[0.92rem] text-text-secondary">{fill(t, n.key, n.vars)}</p>
              <Button as={Link} to={n.to} size="sm">{t(n.cta)} <ArrowRightIcon size={14} /></Button>
            </div>
          ))}
        </div>
      )}

      {/* Digital Health Twin */}
      <div className="mt-6 flex items-center gap-2">
        <span className="text-lg">🧬</span>
        <h2 className="font-heading text-lg font-semibold">{t('coTwin')}</h2>
        <Badge tone="ai" className="ml-auto">{twin.confidence}% {t('ciConfidence')}</Badge>
      </div>
      <Card className="mt-3 bg-gradient-to-br from-[#a78bfa]/[0.12] via-[#d97ba8]/[0.06] to-transparent">
        {twin.hasData ? (
          <>
            <p className="text-[1.02rem] leading-relaxed text-text-secondary">{t(twin.summaryKey)}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {twin.days.map((d) => (
                <div key={d.date} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                  <p className="text-caption text-text-muted">{fmtDay(d.date, lang)}</p>
                  <div className="my-2 text-3xl">{d.icon}</div>
                  <Badge tone={PHASE_TONE[d.phase]}>{t(`phase_${d.phase}`)}</Badge>
                  <p className="mt-2 text-[0.72rem] text-text-secondary">⚡ {t(`twEnergy_${d.energy}`)}</p>
                  <p className="text-[0.72rem] text-text-muted">{d.confidence}%</p>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-2xl border border-accent-ai/20 bg-accent-ai/[0.06] p-3 text-[0.85rem] text-text-secondary">
              <span>💡</span> {t(twin.days[0].whyKey)} {t('coEstimateNote')}
            </p>
          </>
        ) : (
          <p className="text-[0.92rem] text-text-secondary">{t('coTwinEmpty')}</p>
        )}
        <div className="mt-4 flex justify-end">
          <Button as={Link} to="/twin" size="sm" variant="secondary">{t('coTwinExplore')} <ArrowRightIcon size={14} /></Button>
        </div>
      </Card>

      {/* Predictive insights */}
      {allInsights.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">✨ {t('coInsights')}</h2>
          <div className="space-y-2.5">
            {allInsights.map((i, n) => (
              <Card key={n} className="bg-accent-ai/[0.05]">
                <p className="text-[0.92rem] leading-relaxed text-text-secondary">{fill(t, i.key, i)}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* What MIRA remembers */}
      <div className="mb-3 mt-8 flex items-center gap-2">
        <span className="text-lg">🧠</span><h2 className="font-heading text-lg font-semibold">{t('coRemembers')}</h2>
      </div>
      {ai.paused ? (
        <Card><p className="text-[0.9rem] text-text-secondary">⏸️ {t('coPausedNote')}</p></Card>
      ) : mem.length > 0 ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {mem.map((m) => (
            <div key={m.id} className="flex items-start gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <span className="text-xl">{m.icon}</span>
              <p className="text-[0.88rem] leading-snug text-text-secondary">{fill(t, m.key, m.vars, m.translateVar)}</p>
            </div>
          ))}
        </div>
      ) : (
        <Card><p className="text-[0.9rem] text-text-secondary">{t('coRemembersEmpty')}</p></Card>
      )}

      {/* Privacy & control */}
      <h2 className="mb-3 mt-8 font-heading text-lg font-semibold">🔒 {t('coPrivacy')}</h2>
      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div>
            <p className="font-heading font-semibold">{t('coPause')}</p>
            <p className="text-caption text-text-secondary">{t('coPauseSub')}</p>
          </div>
          <button onClick={togglePause} aria-pressed={ai.paused}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${ai.paused ? 'bg-white/15' : 'bg-accent-primary'}`}>
            <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${ai.paused ? 'left-1' : 'left-6'}`} />
          </button>
        </div>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading font-semibold">{t('coYourData')}</p>
            <p className="text-caption text-text-secondary">{t('coYourDataSub')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="md" onClick={doExport} disabled={downloading}>⬇️ {downloading ? t('rptDownloading') : t('coExport')}</Button>
            <Button variant="secondary" size="md" onClick={() => setConfirmReset(true)}>♻️ {t('coReset')}</Button>
          </div>
        </div>
        {downloadErr && <p className="mt-3 text-caption text-danger">{t('pdfError')}</p>}
        <p className="mt-4 text-[0.8rem] leading-relaxed text-text-muted">🛡️ {t('coEthics')}</p>
      </Card>

      <div className="h-24" />

      {/* Hidden printable sheet — rendered off-screen (real layout, invisible
          to the user) purely so the Download button can rasterize it to PDF. */}
      <div style={{ position: 'absolute', top: 0, left: -10000, width: 800 }} aria-hidden="true">
        <div ref={reportRef} className="report-sheet card-base p-8 sm:p-10">
          <div className="flex items-start justify-between border-b border-white/[0.1] pb-6">
            <div>
              <Logo withTagline />
              <p className="mt-3 font-heading text-xl font-semibold text-text-primary">{t('coHeading')}</p>
              <p className="text-caption text-text-secondary">{profile.name || t('menuGuest')}</p>
            </div>
            <div className="text-right text-caption text-text-secondary">
              <p>{t('rptGenerated')}</p>
              <p className="font-medium text-text-primary">{today}</p>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
              {t('coTwin')} · {twin.confidence}% {t('ciConfidence')}
            </h2>
            <p className="text-[0.95rem] leading-relaxed text-text-secondary">
              {twin.hasData ? t(twin.summaryKey) : t('coTwinEmpty')}
            </p>
            {twin.hasData && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {twin.days.map((d) => (
                  <div key={d.date} className="rounded-xl border border-white/[0.08] p-3 text-center">
                    <p className="text-caption text-text-muted">{fmtDay(d.date, lang)}</p>
                    <p className="mt-1 text-[0.9rem] font-medium text-text-primary">{t(`phase_${d.phase}`)}</p>
                    <p className="text-caption text-text-secondary">{t(`twEnergy_${d.energy}`)} · {d.confidence}%</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {allInsights.length > 0 && (
            <section className="mt-6">
              <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
                {t('coInsights')}
              </h2>
              <ul className="space-y-2">
                {allInsights.map((i, n) => (
                  <li key={n} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                    <span className="report-accent mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                    {fill(t, i.key, i)}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6">
            <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
              {t('coRemembers')}
            </h2>
            {ai.paused ? (
              <p className="text-caption text-text-secondary">{t('coPausedNote')}</p>
            ) : mem.length > 0 ? (
              <ul className="space-y-2">
                {mem.map((m) => (
                  <li key={m.id} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                    <span className="report-accent mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                    {fill(t, m.key, m.vars, m.translateVar)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-caption text-text-secondary">{t('coRemembersEmpty')}</p>
            )}
          </section>

          {nudges.length > 0 && (
            <section className="mt-6">
              <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
                {t('coRecommendations')}
              </h2>
              <ul className="space-y-2">
                {nudges.map((n) => (
                  <li key={n.id} className="text-[0.95rem] text-text-secondary">{fill(t, n.key, n.vars)}</li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-6 border-t border-white/[0.1] pt-4 text-caption text-text-muted">{t('coEthics')}</p>
        </div>
      </div>

      {confirmReset && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setConfirmReset(false)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold">{t('coResetTitle')}</h3>
            <p className="mt-2 text-[0.9rem] text-text-secondary">{t('coResetBody')}</p>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={() => setConfirmReset(false)}>{t('ciCancel')}</Button>
              <Button size="md" onClick={doReset}>{t('coReset')}</Button>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </PageShell>
  )
}
