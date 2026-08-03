import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import MiraMark, { MiraWordmark } from '../components/MiraMark'
import SplashLogo from '../components/SplashLogo'
import { armDashboardTour } from '../components/DashboardTour'
import Button from '../components/ui/Button'
import { ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT, LANGS, setOnboarded } from '../lib/i18n'
import { loginWithGoogleCredential, signUp } from '../lib/authStore'
import { saveProfile, saveSettings, addPeriod } from '../lib/localStore'
import { isAppwriteConfigured, account } from '../lib/appwrite'
import GoogleSignInButton from '../components/GoogleSignInButton'
import EduCarousel from '../components/EduCarousel'
import { isGoogleSignInConfigured } from '../lib/googleAuth'

// Dynamic so the range always reaches the current year (never goes stale/outdated).
const THIS_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: THIS_YEAR - 1900 + 1 }, (_, i) => THIS_YEAR - i) // this year → 1900

// Steps that carry the progress bar (the personalisation + cycle-setup wizard).
const TRACKED = ['name', 'birth', 'cycleLen', 'periodLen', 'lastPeriod', 'regularity']
// Order used by the ← back button (splash and the loader are excluded). Account
// creation (signup/credentials/verify) is deliberately LAST — the account is
// never created until every onboarding question has been answered.
const ORDER = ['lang', 'welcome', 'consent', ...TRACKED, 'firstTime', 'edu', 'reminders', 'review', 'signup', 'credentials']

export default function Onboarding() {
  const { t, lang, setLang } = useT()
  const navigate = useNavigate()
  const [step, setStep] = useState('splash')
  const [name, setName] = useState('')
  const [year, setYear] = useState(2003)
  const [periodLen, setPeriodLen] = useState(5)
  const [cycleLen, setCycleLen] = useState(28)
  const [lastPeriod, setLastPeriod] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [consent, setConsent] = useState({ tos: false, privacy: false, health: false })
  const [consentErr, setConsentErr] = useState(false)
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [credErrors, setCredErrors] = useState({})
  const [credBusy, setCredBusy] = useState(false)
  const [regularity, setRegularity] = useState('')
  const [firstTime, setFirstTime] = useState(null)
  const [notifPref, setNotifPref] = useState(null)

  // Splash: logo animation (~2.8s), then move to language.
  useEffect(() => {
    if (step !== 'splash') return
    const timer = setTimeout(() => setStep('lang'), 2800)
    return () => clearTimeout(timer)
  }, [step])

  // Persist everything the user entered (called once we reach the loader).
  function persistAll(reminders) {
    if (name.trim()) saveProfile({ name: name.trim() })
    saveProfile({
      birthYear: year,
      periodLength: periodLen,
      cycleLength: cycleLen,
      regularity: regularity || 'unsure',
    })
    addPeriod(lastPeriod.toISOString())
    saveSettings({
      language: LANGS.find((l) => l.code === lang)?.label || 'English',
      notifications: !!reminders,
    })
    setOnboarded(true)
    armDashboardTour() // show the guided tour on the first home visit
  }

  // Personalising loader → straight to the dashboard. By the time we reach
  // this step the account has already been created (Google or email/password
  // — see the credentials step below), so the visitor is always signed in.
  useEffect(() => {
    if (step !== 'personalizing') return
    const timer = setTimeout(() => navigate('/home', { replace: true }), 2400)
    return () => clearTimeout(timer)
  }, [step, navigate])

  function chooseGoogle() {
    if (name.trim()) saveProfile({ name: name.trim() })
    const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:'
    // In an embedded preview (artifact iframe) a top-level OAuth redirect is
    // blocked by the sandbox and shows an error page — so only attempt the real
    // Google redirect on a genuine, top-level http(s) deployment. Everywhere
    // else we simply continue the onboarding flow (no error, flow unchanged).
    let inFrame = false
    try {
      inFrame = window.self !== window.top
    } catch {
      inFrame = true
    }
    if (isAppwriteConfigured && account && !isFile && !inFrame) {
      const base = window.location.origin + window.location.pathname
      try {
        account.createOAuth2Session('google', base + '#/onboarding', base + '#/onboarding')
        return
      } catch {
        /* provider not enabled — fall through to the email sign-in step */
      }
    }
    // No GIS client id and no Appwrite Google provider configured here: fall
    // back to an honest email + password sign-in — never a fabricated
    // "choose an account" list of names that were never actually signed in.
    setEmail('')
    setPass('')
    setConfirmPass('')
    setCredErrors({})
    setStep('credentials')
  }

  // Real Google Identity Services credential (see GoogleSignInButton) — the
  // visitor genuinely picked this account from Google's own chooser. Google
  // accounts are inherently email-verified, so this creates the account and
  // finishes the flow immediately — no separate credentials/verify step.
  function handleGoogleProfile(profile) {
    loginWithGoogleCredential(profile)
    persistAll(notifPref)
    setStep('personalizing')
  }

  // Create the real account — the account is never created before this
  // point, no matter how far through onboarding the visitor got.
  async function submitCredentials(e) {
    e?.preventDefault?.()
    setCredBusy(true)
    const res = await signUp({
      name: name.trim(),
      email: email.trim(),
      phone: '',
      password: pass,
      confirm: confirmPass,
      dob: `${year}-01-01`, // onboarding only asks for birth YEAR; a synthetic dob satisfies signUp's shape
      gender: '',
      language: lang,
      terms: true, // already collected on the consent step
    })
    if (!res.ok) {
      setCredErrors(res.errors)
      setCredBusy(false)
      return
    }
    setCredErrors({})
    setCredBusy(false)
    persistAll(notifPref)
    // Real accounts (Appwrite configured) need email confirmation before the
    // dashboard is reachable — see RequireOnboarding in App.jsx. The check-
    // your-email screen lives at its own route so it's also reachable on a
    // later visit/refresh, not just this once, right after signup.
    navigate('/verify-email', { replace: true })
  }

  // Notification permission choice — captured here, actually persisted once
  // the account exists (see submitCredentials / handleGoogleProfile above).
  async function chooseReminders(allow) {
    if (allow && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        /* ignore — the toggle in Settings still works */
      }
    }
    setNotifPref(allow)
    setStep('review')
  }

  const allConsent = consent.tos && consent.privacy && consent.health
  const trackedIndex = TRACKED.indexOf(step)

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]"
      />

      {/* SPLASH — logo present from frame 1, surrounded by minimal darker-pink
          waves + floating particles; the wordmark & tagline settle in after. */}
      {step === 'splash' && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center">
          <SplashLogo size={82} />
          <h1
            className="mt-4 font-heading text-4xl font-bold tracking-tight opacity-0 animate-fade-up"
            style={{ animationDelay: '600ms' }}
          >
            <MiraWordmark />
          </h1>
          <p className="mt-2 text-text-secondary opacity-0 animate-fade-up" style={{ animationDelay: '900ms' }}>
            {t('splashTagline')}
          </p>
        </div>
      )}

      {/* PERSONALISING LOADER */}
      {step === 'personalizing' && (
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
          <div className="relative flex h-36 w-36 items-center justify-center">
            <div
              aria-hidden
              className="animate-shimmer absolute inset-0 rounded-full opacity-50"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(217,123,168,0.4) 45%, rgba(167,139,250,0.4) 55%, transparent 100%)',
                backgroundSize: '200% 100%',
              }}
            />
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              <circle
                cx="50"
                cy="50"
                r="44"
                fill="none"
                stroke="#D97BA8"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="276"
                strokeDashoffset="70"
                className="animate-spin"
                style={{ transformOrigin: '50% 50%' }}
              />
            </svg>
            <span className="absolute font-stat text-3xl font-bold text-text-primary">{cycleLen}</span>
          </div>
          <h1 className="mt-8 text-center font-heading text-2xl font-semibold tracking-tight">
            {t('personalizing')}
          </h1>
          <p className="mt-2 text-center text-text-secondary">{t('personalizingSub')}</p>
          <p className="mt-5 rounded-pill bg-white/[0.05] px-4 py-1.5 text-caption text-text-secondary">
            {t('avgCycleLabel')}: {cycleLen} {t('daysUnit').toLowerCase()}
          </p>
        </div>
      )}

      {/* Steps share a header + footer */}
      {step !== 'splash' && step !== 'personalizing' && (
        <>
          <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between px-5 py-5">
            <button
              onClick={() => back(step, setStep)}
              className="text-accent-secondary transition-colors hover:text-text-primary"
            >
              ← {t('back')}
            </button>
            <Logo />
          </header>

          {trackedIndex >= 0 && (
            <div className="relative z-10 mx-auto w-full max-w-md px-5">
              <ProgressBar step={trackedIndex + 1} total={TRACKED.length} />
            </div>
          )}

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
                <Footer onNext={() => setStep('welcome')} label={t('cont')} />
              </Step>
            )}

            {/* WELCOME */}
            {step === 'welcome' && (
              <div className="flex flex-1 flex-col items-center pb-8 pt-8 text-center">
                <div className="animate-breathe">
                  <MiraMark size={104} />
                </div>
                <h1 className="mt-8 font-heading text-3xl font-bold tracking-tight">
                  {t('welcomeTitle')} <MiraWordmark />
                </h1>
                <p className="mx-auto mt-3 max-w-sm text-text-secondary">{t('welcomeSub')}</p>
                <div className="mt-auto w-full space-y-3 pt-10">
                  <Button onClick={() => setStep('consent')} size="lg" className="w-full">
                    {t('getStarted')} <ArrowRightIcon size={18} />
                  </Button>
                  <button
                    onClick={() => navigate('/features')}
                    className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('learnMore')}
                  </button>
                </div>
              </div>
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
                  onNext={() => {
                    if (!allConsent) {
                      setConsentErr(true)
                      return
                    }
                    saveSettings({ consent: { ...consent, acceptedAt: new Date().toISOString() } })
                    setStep('name')
                  }}
                  label={t('next')}
                />
              </Step>
            )}

            {/* NAME — 1/5 */}
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

            {/* BIRTH YEAR — 2/5 */}
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
                <Footer onNext={() => setStep('cycleLen')} label={t('next')} />
              </Step>
            )}

            {/* CYCLE LENGTH — 3/5 */}
            {step === 'cycleLen' && (
              <Step title={t('cycleLenTitle')}>
                <NumberPicker min={21} max={40} value={cycleLen} onChange={setCycleLen} unit={t('daysUnit')} />
                <Footer onNext={() => setStep('periodLen')} label={t('next')} />
              </Step>
            )}

            {/* PERIOD LENGTH — 4/5 */}
            {step === 'periodLen' && (
              <Step title={t('periodLenTitle')}>
                <NumberPicker min={1} max={15} value={periodLen} onChange={setPeriodLen} unit={t('daysUnit')} />
                <Footer onNext={() => setStep('lastPeriod')} label={t('next')} />
              </Step>
            )}

            {/* LAST PERIOD */}
            {step === 'lastPeriod' && (
              <Step title={t('lastPeriodTitle')}>
                <MiniCalendar value={lastPeriod} onChange={setLastPeriod} />
                <Footer onNext={() => setStep('regularity')} label={t('next')} />
              </Step>
            )}

            {/* CYCLE REGULARITY */}
            {step === 'regularity' && (
              <Step title={t('regularityTitle')}>
                <div className="mt-8 space-y-3">
                  {[
                    ['regular', t('regRegularOpt')],
                    ['irregular', t('regIrregularOpt')],
                    ['unsure', t('regNotSure')],
                  ].map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setRegularity(val)}
                      className={`flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left text-[1.05rem] transition-all duration-250 ${
                        regularity === val
                          ? 'border-accent-primary/50 bg-accent-primary/10 text-text-primary'
                          : 'border-white/10 bg-white/[0.02] text-text-secondary hover:border-white/20'
                      }`}
                    >
                      {label}
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          regularity === val ? 'border-accent-primary bg-accent-primary text-bg-primary' : 'border-white/25'
                        }`}
                      >
                        {regularity === val && '✓'}
                      </span>
                    </button>
                  ))}
                </div>
                <Footer onNext={() => setStep('firstTime')} label={t('next')} disabled={!regularity} />
              </Step>
            )}

            {/* FIRST TIME TRACKING */}
            {step === 'firstTime' && (
              <Step title={t('firstTimeTitle')} subtitle={t('firstTimeSub')}>
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => {
                      setFirstTime(true)
                      saveProfile({ firstTimeTracking: true })
                      setStep('edu')
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left text-[1.05rem] text-text-secondary transition-all duration-250 hover:border-white/20 hover:text-text-primary"
                  >
                    {t('yesOpt')}
                  </button>
                  <button
                    onClick={() => {
                      setFirstTime(false)
                      saveProfile({ firstTimeTracking: false, cycleGuideSeen: true })
                      setStep('reminders')
                    }}
                    className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 text-left text-[1.05rem] text-text-secondary transition-all duration-250 hover:border-white/20 hover:text-text-primary"
                  >
                    {t('noOpt')}
                  </button>
                </div>
              </Step>
            )}

            {/* GENTLE EDUCATION CAROUSEL — only for first-time trackers */}
            {step === 'edu' && (
              <EduCarousel
                onDone={() => {
                  saveProfile({ cycleGuideSeen: true, cycleGuideChoice: 'yes' })
                  setStep('reminders')
                }}
              />
            )}

            {/* REMINDERS */}
            {step === 'reminders' && (
              <Step icon iconEl={<BellIcon />} title={t('remindersTitle')} subtitle={t('remindersSub')}>
                <div className="mt-auto space-y-3 pt-10">
                  <Button onClick={() => chooseReminders(true)} size="lg" className="w-full">
                    {t('allow')}
                  </Button>
                  <button
                    onClick={() => chooseReminders(false)}
                    className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('notNow')}
                  </button>
                </div>
              </Step>
            )}

            {/* REVIEW & CONFIRM — everything collected so far, before the
                account is created */}
            {step === 'review' && (
              <Step title={t('reviewTitle')} subtitle={t('reviewSub')}>
                <div className="mt-6 space-y-2.5">
                  <ReviewRow label={t('reviewLabelName')} value={name} />
                  <ReviewRow label={t('reviewLabelBirth')} value={String(year)} />
                  <ReviewRow label={t('reviewLabelPeriod')} value={`${periodLen} ${t('daysUnit')}`} />
                  <ReviewRow label={t('reviewLabelCycle')} value={`${cycleLen} ${t('daysUnit')}`} />
                  <ReviewRow label={t('reviewLabelLastPeriod')} value={lastPeriod.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} />
                  <ReviewRow label={t('reviewLabelRegularity')} value={t(REGULARITY_LABEL[regularity] || 'regNotSure')} />
                  <ReviewRow label={t('reviewLabelFirstTime')} value={t(firstTime ? 'yesOpt' : 'noOpt')} />
                  <ReviewRow label={t('reviewLabelNotifications')} value={t(notifPref ? 'allow' : 'notNow')} />
                  <ReviewRow label={t('reviewLabelLanguage')} value={LANGS.find((l) => l.code === lang)?.native || lang} />
                </div>
                <Footer onNext={() => setStep('signup')} label={t('reviewConfirm')} />
              </Step>
            )}

            {/* CREATE ACCOUNT — Google / email / guest chooser (account is
                not created until this step, or the credentials step next) */}
            {step === 'signup' && (
              <Step title={t('signupTitle')} subtitle={t('signupSubtitle')}>
                <div className="mt-10 space-y-3">
                  {isGoogleSignInConfigured ? (
                    <GoogleSignInButton onProfile={handleGoogleProfile} />
                  ) : (
                    <button
                      onClick={chooseGoogle}
                      className="flex w-full items-center justify-center gap-3 rounded-pill border border-white/15 bg-white/[0.04] px-5 py-3.5 font-medium text-text-primary hover:bg-white/[0.08]"
                    >
                      <GoogleG /> {t('signupGoogle')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEmail('')
                      setPass('')
                      setConfirmPass('')
                      setCredErrors({})
                      setStep('credentials')
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-pill border border-accent-primary/40 bg-accent-primary/10 px-5 py-3.5 font-medium text-accent-secondary hover:bg-accent-primary/20"
                  >
                    {t('signupEmail')}
                  </button>
                  <button
                    onClick={() => {
                      setEmail('')
                      setPass('')
                      setConfirmPass('')
                      setCredErrors({})
                      setStep('credentials')
                    }}
                    className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('signupGuest')}
                  </button>
                </div>
                <p className="mt-6 text-center text-caption text-text-muted">
                  {t('signupHave')}{' '}
                  <button
                    onClick={() => {
                      setOnboarded(true)
                      navigate('/login')
                    }}
                    className="text-accent-secondary hover:underline"
                  >
                    {t('signin')}
                  </button>
                </p>
              </Step>
            )}

            {/* CREATE ACCOUNT (EMAIL & PASSWORD) — the account is created
                right here, submitting to authStore.signUp(); this is also
                the fallback when Google sign-in isn't configured. */}
            {step === 'credentials' && (
              <Step title={t('credTitle')} subtitle={t('credSub')}>
                <form onSubmit={submitCredentials} className="mt-8 space-y-3.5" noValidate>
                  <div>
                    <input
                      autoFocus
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setCredErrors((x) => ({ ...x, email: null }))
                      }}
                      placeholder={t('credEmailPh')}
                      className={`w-full rounded-2xl border bg-white/[0.03] px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none ${
                        credErrors.email ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'
                      }`}
                    />
                    {credErrors.email && <p className="mt-1.5 px-1 text-caption text-danger">{t(credErrors.email)}</p>}
                  </div>
                  <div>
                    <input
                      type="password"
                      value={pass}
                      onChange={(e) => {
                        setPass(e.target.value)
                        setCredErrors((x) => ({ ...x, password: null }))
                      }}
                      placeholder={t('credPasswordPh')}
                      className={`w-full rounded-2xl border bg-white/[0.03] px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none ${
                        credErrors.password ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'
                      }`}
                    />
                    {credErrors.password && <p className="mt-1.5 px-1 text-caption text-danger">{t(credErrors.password)}</p>}
                  </div>
                  <div>
                    <input
                      type="password"
                      value={confirmPass}
                      onChange={(e) => {
                        setConfirmPass(e.target.value)
                        setCredErrors((x) => ({ ...x, confirm: null }))
                      }}
                      placeholder={t('credConfirmPh')}
                      className={`w-full rounded-2xl border bg-white/[0.03] px-5 py-4 text-text-primary placeholder:text-text-muted focus:outline-none ${
                        credErrors.confirm ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'
                      }`}
                    />
                    {credErrors.confirm && <p className="mt-1.5 px-1 text-caption text-danger">{t(credErrors.confirm)}</p>}
                  </div>
                  <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full" disabled={credBusy}>
                      {credBusy ? t('auPleaseWait') : t('credSubmit')} <ArrowRightIcon size={18} />
                    </Button>
                  </div>
                </form>
              </Step>
            )}
          </main>
        </>
      )}
    </div>
  )
}

function back(step, setStep) {
  if (step === 'credentials') {
    setStep('signup')
    return
  }
  const i = ORDER.indexOf(step)
  if (i > 0) setStep(ORDER[i - 1])
}

function ProgressBar({ step, total }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 overflow-hidden rounded-pill bg-white/[0.08]">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-500 ease-luna"
          style={{ width: `${(step / total) * 100}%` }}
        />
      </div>
      <span className="font-stat text-caption text-text-muted">
        {step}/{total}
      </span>
    </div>
  )
}

function Step({ title, subtitle, icon, iconEl, children }) {
  return (
    <div className="flex flex-1 flex-col pb-8 pt-4">
      {icon && (
        <div className="mb-4 flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/15 text-accent-secondary">
            {iconEl || <ShieldIcon size={30} />}
          </span>
        </div>
      )}
      <h1 className="text-center font-heading text-3xl font-semibold tracking-tight">{title}</h1>
      {subtitle && <p className="mx-auto mt-3 max-w-sm text-center text-text-secondary">{subtitle}</p>}
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

/** Horizontal wheel-style picker centred on the selected value. */
function NumberPicker({ min, max, value, onChange, unit }) {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      {[-2, -1, 0, 1, 2].map((offset) => {
        const v = value + offset
        if (v < min || v > max) return <span key={offset} className="w-16" />
        const center = offset === 0
        return (
          <button
            key={offset}
            onClick={() => onChange(v)}
            className={`flex flex-col items-center transition-all duration-250 ${
              center ? 'w-24' : 'w-16'
            }`}
          >
            <span
              className={
                center
                  ? 'flex h-24 w-24 items-center justify-center rounded-full border border-accent-primary/50 bg-accent-primary/10 font-stat text-4xl font-bold text-text-primary'
                  : 'font-stat text-2xl text-text-muted'
              }
            >
              {v}
            </span>
            {center && <span className="mt-3 text-caption text-accent-secondary">{unit}</span>}
          </button>
        )
      })}
    </div>
  )
}

/** Compact month calendar; future dates are disabled. */
function MiniCalendar({ value, onChange }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [view, setView] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1))
  const y = view.getFullYear()
  const m = view.getMonth()
  const firstWeekday = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const monthLabel = view.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
  const canNext = new Date(y, m + 1, 1) <= new Date(today.getFullYear(), today.getMonth(), 1)

  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d))

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          onClick={() => setView(new Date(y, m - 1, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-white/5 hover:text-text-primary"
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="font-heading text-lg font-semibold">{monthLabel}</span>
        <button
          onClick={() => canNext && setView(new Date(y, m + 1, 1))}
          disabled={!canNext}
          className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary hover:bg-white/5 hover:text-text-primary disabled:opacity-30"
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-caption text-text-muted">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((w, i) => (
          <span key={i} className="py-1">
            {w}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 pt-1">
        {cells.map((d, i) => {
          if (!d) return <span key={i} />
          const future = d > today
          const selected = d.toDateString() === value.toDateString()
          return (
            <button
              key={i}
              disabled={future}
              onClick={() => onChange(d)}
              className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[0.9rem] transition-colors duration-200 ${
                selected
                  ? 'bg-gradient-to-br from-accent-secondary to-accent-primary font-semibold text-bg-primary'
                  : future
                  ? 'text-text-muted/30'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              }`}
            >
              {d.getDate()}
            </button>
          )
        })}
      </div>
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

function BellIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

/** One label/value row on the Review & Confirm step. */
function ReviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-3.5">
      <span className="text-[0.92rem] text-text-secondary">{label}</span>
      <span className="text-[0.92rem] font-medium text-text-primary">{value}</span>
    </div>
  )
}

const REGULARITY_LABEL = { regular: 'regRegularOpt', irregular: 'regIrregularOpt', unsure: 'regNotSure' }

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
