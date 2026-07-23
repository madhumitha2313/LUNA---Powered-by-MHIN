import { Link } from 'react-router-dom'
import SplashLogo from '../components/SplashLogo'
import Button from '../components/ui/Button'
import { MiraWordmark } from '../components/MiraMark'
import { ArrowRightIcon, ShieldIcon, HeartIcon, SparklesIcon } from '../components/ui/icons'
import { useT, LANGS } from '../lib/i18n.jsx'

const POINTS = [
  { icon: SparklesIcon, key: 'auPoint1' },
  { icon: HeartIcon, key: 'auPoint2' },
  { icon: ShieldIcon, key: 'auPoint3' },
]

export default function Welcome() {
  const { t, lang, setLang } = useT()
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-bg-primary px-6 py-8">
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]" aria-hidden />

      {/* language selector */}
      <div className="relative z-10 flex w-full max-w-md justify-end">
        <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('auLanguage')}
          className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-caption text-text-secondary outline-none">
          {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-bg-card">{l.native}</option>)}
        </select>
      </div>

      {/* hero */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <SplashLogo size={120} />
        <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight"><MiraWordmark /></h1>
        <p className="mt-2 max-w-xs text-text-secondary">{t('auWelcomeTagline')}</p>

        <div className="mt-8 w-full max-w-xs space-y-3 text-left">
          {POINTS.map((p) => (
            <div key={p.key} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-secondary"><p.icon size={17} /></span>
              <p className="text-[0.88rem] text-text-secondary">{t(p.key)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="relative z-10 w-full max-w-xs space-y-3">
        <Button as={Link} to="/signup" size="lg" className="w-full">{t('auGetStarted')} <ArrowRightIcon size={16} /></Button>
        <Button as={Link} to="/login" variant="secondary" size="lg" className="w-full">{t('auHaveAccountBtn')}</Button>
        <p className="pt-1 text-center text-[0.74rem] text-text-muted">
          <Link to="/onboarding" className="text-accent-secondary hover:underline">{t('auHowItWorks')}</Link>
        </p>
      </div>
    </div>
  )
}
