import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT, LANGS, setOnboarded } from '../lib/i18n'
import { saveProfile, saveSettings } from '../lib/localStore'
import { isAppwriteConfigured, account } from '../lib/appwrite'

const YEARS = Array.from({ length: 2015 - 1955 + 1 }, (_, i) => 2015 - i) // 2015 → 1955

export default function Onboarding() {
  const { t, lang, setLang } = useT()
  const navigate = useNavigate()
  const [step, setStep] = useState('splash')
  const [name, setName] = useState('')
  const [year, setYear] = useState(2003)
  const [consent, setConsent] = useState({ tos: false, privacy: false, health: false })
  const [consentErr, setConsentErr] = useState(false)

  // Splash: logo animation, then move to language.
  useEffect(() => {
    if (step !== 'splash') return
    const timer = setTimeout(() => setStep('lang'), 2200)
    return () => clearTimeout(timer)
  }, [step])

  function finish(dest = '/home') {
    if (name.trim()) saveProfile({ name: name.trim() })
    saveProfile({ birthYear: year })
    saveSettings({ language: LANGS.find((l) => l.code === lang)?.label || 'English' })
    setOnboarded(true)
    navigate(dest)
  }

  function chooseGoogle() {
    setOnboarded(true)
    if (name.trim()) saveProfile({ name: name.trim() })
    const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:'
    if (isAppwriteConfigured && account && !isFile) {
      const base = window.location.origin + window.location.pathname
      try {
        account.createOAuth2Session('google', base + '#/home', base + '#/login')
        return
      } catch {
        /* provider not enabled — fall through */
      }
    }
    finish('/home')
  }

  const allConsent = consent.tos && consent.privacy && consent.health

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]"
      />

      {/* SPLASH */}
      {step === 'splash' && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <div className="animate-breathe">
            <span className="relative inline-flex h-28 w-28 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-accent-primary/25 blur-2xl" />
              <svg viewBox="0 0 24 24" className="relative h-24 w-24">
                <defs>
                  <radialGradient id="obMoon" cx="38%" cy="36%" r="72%">
                    <stop offset="0%" stopColor="#F5C6D6" />
                    <stop offset="55%" stopColor="#D97BA8" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </radialGradient>
                </defs>
                <path d="M15 2a10 10 0 1 0 5.5 18.4A12 12 0 0 1 15 2Z" fill="url(#obMoon)" />
              </svg>
            </span>
          </div>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight animate-fade-up delay-1">MIRA</h1>
          <p className="mt-2 text-text-secondary animate-fade-up delay-2">{t('splashTagline')}</p>
        </div>
      )}

      {/* Steps share a header + footer */}
      {step !== 'splash' && (
        <>
          <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-5 py-5">
            <button onClick={() => back(step, setStep)} className="text-accent-secondary hover:text-text-primary">
              ← {t('back')}
            </button>
            <Logo />
          </header>

          <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5">
            {/* LANGUAGE */}
            {step === 'lang' && (
              <Step title={t('langTitle')} subtitle={t('langSubtitle')}>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition-all duration-250 ${
                        lang === l.code
                          ? 'border-accent-primary/50 bg-accent-primary/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <span>
                        <span className="block font-heading text-lg font-semibold">{l.native}</span>
                        <span className="block text-caption text-text-muted">{l.label}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          lang === l.code ? 'border-accent-primary bg-accent-primary text-bg-primary' : 'border-white/25'
                        }`}
                      >
                        {lang === l.code && '✓'}
                      </span>
                    </button>
                  ))}
                </div>
                <Footer onNext={() => setStep('name')} label={t('cont')} />
              </Step>
            )}

            {/* NAME */}
            {step === 'name' && (
              <Step title={t('nameTitle')} subtitle={t('nameSubtitle')}>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="mt-8 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-xl text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
                />
                <Footer onNext={() => setStep('birth')} label={t('next')} disabled={!name.trim()} />
              </Step>
            )}

            {/* BIRTH YEAR */}
            {step === 'birth' && (
              <Step title={t('birthTitle')} subtitle={t('birthSubtitle')}>
                <div className="mt-6 h-64 overflow-y-auto rounded-2xl border border-white/[0.06] bg-white/[0.02] py-24 [scrollbar-width:none]">
                  {YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => setYear(y)}
                      className={`block w-full py-3 text-center transition-all duration-250 ${
                        y === year
                          ? 'text-2xl font-semibold text-text-primary'
                          : 'text-lg text-text-muted hover:text-text-secondary'
                      }`}
                    >
                      {y === year ? (
                        <span className="mx-auto inline-block rounded-pill bg-white/[0.06] px-8 py-1.5">{y}</span>
                      ) : (
                        y
                      )}
                    </button>
                  ))}
                </div>
                <Footer onNext={() => setStep('consent')} label={t('next')} />
              </Step>
            )}

            {/* CONSENT */}
            {step === 'consent' && (
              <Step icon title={t('consentTitle')} subtitle={t('consentSubtitle')}>
                {consentErr && !allConsent && (
                  <div className="mt-4 rounded-xl bg-danger/90 px-4 py-3 text-caption font-medium text-white">
                    {t('consentError')}
                  </div>
                )}
                <div className="mt-6 space-y-4">
                  <ConsentRow checked={consent.tos} onToggle={() => setConsent((c) => ({ ...c, tos: !c.tos }))}>
                    {t('consentTos').split('Terms of Service')[0]}
                    <Link to="/terms" className="text-accent-secondary underline">Terms of Service</Link>.
                  </ConsentRow>
                  <ConsentRow checked={consent.privacy} onToggle={() => setConsent((c) => ({ ...c, privacy: !c.privacy }))}>
                    {t('consentPrivacy').split('Privacy Policy')[0]}
                    <Link to="/privacy" className="text-accent-secondary underline">Privacy Policy</Link>.
                  </ConsentRow>
                  <ConsentRow checked={consent.health} onToggle={() => setConsent((c) => ({ ...c, health: !c.health }))}>
                    {t('consentHealth')}
                  </ConsentRow>
                </div>
                <Footer
                  onNext={() => (allConsent ? setStep('signup') : setConsentErr(true))}
                  label={t('next')}
                />
              </Step>
            )}

            {/* SIGN UP */}
            {step === 'signup' && (
              <Step title={t('signupTitle')} subtitle={t('signupSubtitle')}>
                <div className="mt-10 space-y-3">
                  <button
                    onClick={chooseGoogle}
                    className="flex w-full items-center justify-center gap-3 rounded-pill border border-white/15 bg-white/[0.04] px-5 py-3.5 font-medium text-text-primary hover:bg-white/[0.08]"
                  >
                    <GoogleG /> {t('signupGoogle')}
                  </button>
                  <button
                    onClick={() => finish('/login')}
                    className="flex w-full items-center justify-center gap-2 rounded-pill border border-accent-primary/40 bg-accent-primary/10 px-5 py-3.5 font-medium text-accent-secondary hover:bg-accent-primary/20"
                  >
                    {t('signupEmail')}
                  </button>
                  <button
                    onClick={() => finish('/home')}
                    className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('signupGuest')}
                  </button>
                </div>
                <p className="mt-6 text-center text-caption text-text-muted">
                  {t('signupHave')}{' '}
                  <button onClick={() => finish('/login')} className="text-accent-secondary hover:underline">
                    {t('signin')}
                  </button>
                </p>
              </Step>
            )}
          </main>
        </>
      )}
    </div>
  )
}

function back(step, setStep) {
  const order = ['lang', 'name', 'birth', 'consent', 'signup']
  const i = order.indexOf(step)
  if (i > 0) setStep(order[i - 1])
}

function Step({ title, subtitle, icon, children }) {
  return (
    <div className="flex flex-1 flex-col pb-8 pt-4">
      {icon && (
        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/15 text-accent-secondary">
            <ShieldIcon size={30} />
          </span>
        </div>
      )}
      <h1 className="text-center font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-sm text-center text-text-secondary">{subtitle}</p>
      {children}
    </div>
  )
}

function Footer({ onNext, label, disabled }) {
  return (
    <div className="mt-auto pt-8">
      <Button onClick={onNext} size="lg" className="w-full" disabled={disabled}>
        {label} <ArrowRightIcon size={18} />
      </Button>
    </div>
  )
}

function ConsentRow({ checked, onToggle, children }) {
  return (
    <button onClick={onToggle} className="flex w-full items-start gap-3 text-left">
      <span
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
          checked ? 'border-accent-primary bg-accent-primary text-bg-primary' : 'border-white/25'
        }`}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      <span className="text-[0.95rem] leading-relaxed text-text-secondary">{children}</span>
    </button>
  )
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9.1h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" />
      <path fill="#FBBC05" d="M10.4 28.6a14.5 14.5 0 0 1 0-9.2l-7.8-6.1a24 24 0 0 0 0 21.4l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.2 2.2-6.4 0-11.8-3.7-13.6-9.9l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}
