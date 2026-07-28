import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Button from '../components/ui/Button'
import Logo from '../components/Logo'
import { ArrowRightIcon, StethoscopeIcon, DownloadIcon } from '../components/ui/icons'
import { getLogs, getCycleStats, getSymptoms, getProfile } from '../lib/localStore'
import { useT } from '../lib/i18n.jsx'
import { downloadElementAsPdf, fileDateStamp } from '../lib/pdf'

const SYMPTOM_LABELS = {
  irregular: 'symIrregular', heavy: 'symHeavy', spotting: 'symSpotting',
  pelvic_pain: 'symPelvic', acne: 'symAcne', hirsutism: 'symHirsutism',
  hair_thinning: 'symHairThin', dark_patches: 'symDarkPatch', weight: 'symWeight', cravings: 'symCravings',
  bloating: 'symBloating', mood: 'symMood', fatigue: 'symFatigue', sleep: 'symSleep',
}

/** Derive plain-language risk indicators (never diagnoses); returns translation keys. */
function computeIndicators(logs, symptomKeys, stats) {
  const out = []
  const heavyPain = logs.filter((l) => l.flow === 'heavy' && l.pain != null && l.pain >= 7).length
  const fatigueHeavy = logs.filter((l) => l.fatigue && l.flow === 'heavy').length
  if (heavyPain >= 2) out.push('indHeavyPain')
  if (fatigueHeavy >= 1) out.push('indFatigue')
  if (symptomKeys.length >= 4) out.push('indPcos')
  if (stats.regularity === 'irregular') out.push('indIrregular')
  if (out.length === 0) out.push('indNone')
  return out
}

function fmt(iso) {
  return iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
}

export default function Report() {
  const { t } = useT()
  const logs = getLogs()
  const stats = getCycleStats()
  const symptoms = getSymptoms()
  const profile = getProfile()
  const symptomKeys = Object.keys(symptoms).filter((k) => symptoms[k])
  const indicators = computeIndicators(logs, symptomKeys, stats)
  const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
  const sheetRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [downloadErr, setDownloadErr] = useState(false)

  async function download() {
    setDownloading(true)
    setDownloadErr(false)
    try {
      await downloadElementAsPdf(sheetRef.current, `Health_Summary_Report_${fileDateStamp()}.pdf`)
    } catch {
      setDownloadErr(true)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        {/* Controls */}
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-semibold">{t('rptTitle')}</h1>
            <p className="text-caption text-text-secondary">{t('rptSub')}</p>
          </div>
          <div className="flex gap-2">
            <Button as={Link} to="/home" variant="secondary" size="md">
              {t('back')}
            </Button>
            <Button onClick={download} size="md" disabled={downloading}>
              <DownloadIcon size={16} /> {downloading ? t('rptDownloading') : t('rptDownload')}
            </Button>
          </div>
        </div>
        {downloadErr && <p className="no-print -mt-3 mb-4 text-caption text-danger">{t('pdfError')}</p>}

        {/* The printable sheet */}
        <div ref={sheetRef} className="report-sheet card-base p-8 sm:p-10">
          {/* Letterhead */}
          <div className="flex items-start justify-between border-b border-white/[0.1] pb-6">
            <div>
              <Logo withTagline />
              <p className="mt-3 font-heading text-xl font-semibold text-text-primary">
                {t('rptLetterhead')}
              </p>
              <p className="text-caption text-text-secondary">{t('rptPrepared')}</p>
            </div>
            <div className="text-right text-caption text-text-secondary">
              <p>{t('rptGenerated')}</p>
              <p className="font-medium text-text-primary">{today}</p>
            </div>
          </div>

          {/* Patient */}
          <Section title={t('rptPatient')}>
            <Grid>
              <KV k={t('nameLabel')} v={profile.name || '—'} />
              <KV k={t('rptAge')} v={profile.age || '—'} />
              <KV k={t('rptCity')} v={profile.city || '—'} />
              <KV k={t('rptConcern')} v={profile.condition || '—'} />
            </Grid>
          </Section>

          {/* Cycle */}
          <Section title={t('rptCycleSummary')}>
            <Grid>
              <KV k={t('avgCycleLabel')} v={stats.avgCycleLength ? `${stats.avgCycleLength} ${t('daysLower')}` : '—'} />
              <KV k={t('rptRegularity')} v={stats.regularity ? t(regKey(stats.regularity)) : t('rptInsufficient')} />
              <KV k={t('rptLastStart')} v={fmt(stats.lastPeriodStart)} />
              <KV k={t('rptPredicted')} v={fmt(stats.predictedNext)} />
              <KV k={t('rptCycleDay')} v={stats.cycleDay ?? '—'} />
              <KV k={t('rptPhase')} v={stats.phase ? t(phaseKey(stats.phase)) : '—'} />
            </Grid>
          </Section>

          {/* Symptoms */}
          <Section title={t('rptTrackedSym')}>
            {symptomKeys.length === 0 ? (
              <p className="text-caption text-text-secondary">{t('rptNoneRecorded')}</p>
            ) : (
              <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {symptomKeys.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-[0.95rem] text-text-secondary">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary/70" />
                    {SYMPTOM_LABELS[k] ? t(SYMPTOM_LABELS[k]) : k}
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {/* Recent check-ins */}
          <Section title={`${t('rptRecentCheckins')} (${logs.length})`}>
            {logs.length === 0 ? (
              <p className="text-caption text-text-secondary">{t('rptNoCheckins')}</p>
            ) : (
              <table className="w-full border-collapse text-left text-caption">
                <thead>
                  <tr className="border-b border-white/[0.1] text-text-muted">
                    <th className="py-2 pr-3 font-medium">{t('rptDate')}</th>
                    <th className="py-2 pr-3 font-medium">{t('rptFlow')}</th>
                    <th className="py-2 pr-3 font-medium">{t('rptPain')}</th>
                    <th className="py-2 pr-3 font-medium">{t('rptMood')}</th>
                    <th className="py-2 pr-3 font-medium">{t('rptFatigue')}</th>
                    <th className="py-2 font-medium">{t('rptSleep')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 12).map((l) => (
                    <tr key={l.id || l.$id} className="border-b border-white/[0.05] text-text-secondary">
                      <td className="py-2 pr-3">{fmt(l.date)}</td>
                      <td className="py-2 pr-3">{l.flow || '—'}</td>
                      <td className="py-2 pr-3">{l.pain != null ? l.pain : '—'}</td>
                      <td className="py-2 pr-3">{l.mood || '—'}</td>
                      <td className="py-2 pr-3">{l.fatigue || '—'}</td>
                      <td className="py-2">{l.sleep || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Indicators */}
          <Section title={t('rptIndicators')}>
            <ul className="space-y-2">
              {indicators.map((key, i) => (
                <li key={i} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
                  <span className="report-accent mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary" />
                  {t(key)}
                </li>
              ))}
            </ul>
          </Section>

          <p className="mt-6 border-t border-white/[0.1] pt-4 text-caption text-text-muted">{t('rptDisclaimer')}</p>
        </div>

        <div className="no-print mt-8 flex justify-center">
          <Button as={Link} to="/doctors" size="lg">
            <StethoscopeIcon size={16} /> {t('rptFindSpecialist')} <ArrowRightIcon size={16} />
          </Button>
        </div>
      </main>
    </div>
  )
}

function regKey(r) {
  if (r === 'regular') return 'regRegular'
  if (r === 'slightly irregular') return 'regSlightly'
  return 'regIrregular'
}
function phaseKey(p) {
  return { menstrual: 'phaseMenstrual', follicular: 'phaseFollicular', ovulation: 'phaseOvulation', luteal: 'phaseLuteal' }[p] || p
}

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="report-accent mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
        {title}
      </h2>
      {children}
    </section>
  )
}
function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">{children}</div>
}
function KV({ k, v }) {
  return (
    <div>
      <p className="text-caption text-text-muted">{k}</p>
      <p className="text-[0.95rem] font-medium text-text-primary">{v}</p>
    </div>
  )
}
