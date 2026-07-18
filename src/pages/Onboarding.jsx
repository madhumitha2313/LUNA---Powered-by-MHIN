import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import MiraMark, { MiraWordmark } from '../components/MiraMark'
import SplashLogo from '../components/SplashLogo'
import { armDashboardTour } from '../components/DashboardTour'
import Button from '../components/ui/Button'
import { ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT, LANGS, setOnboarded } from '../lib/i18n'
import { saveProfile, saveSettings, addPeriod } from '../lib/localStore'
import { isAppwriteConfigured, account } from '../lib/appwrite'

const YEARS = Array.from({ length: 2015 - 1955 + 1 }, (_, i) => 2015 - i) // 2015 → 1955

// Sample Google accounts shown in the "choose an account" chooser (preview mock —
// a browser can't read your real Google sessions, so we show representative ones).
const SEEDED_ACCOUNTS = [
  { name: 'Madhumitha', email: 'madhumitha231332@gmail.com', initial: 'M', color: '#1a73e8' },
  { name: 'Kishore Raam', email: 'kishoreraammskj@gmail.com', initial: 'K', color: '#34a853' },
]

// Short, friendly primer shown to first-time trackers (title/body are i18n keys).
const EDU_SLIDES = [
  { emoji: '🌙', t: 'edu1T', b: 'edu1B' },
  { emoji: '🌸', t: 'edu2T', b: 'edu2B' },
  { emoji: '💗', t: 'edu3T', b: 'edu3B' },
  { emoji: '🤝', t: 'edu4T', b: 'edu4B' },
]

// Steps that carry the progress bar (the personalisation + cycle-setup wizard).
const TRACKED = ['name', 'birth', 'periodLen', 'cycleLen', 'lastPeriod', 'regularity']
// Order used by the ← back button (splash and the loader are excluded).
const ORDER = ['lang', 'welcome', 'consent', 'signup', ...TRACKED, 'firstTime', 'education', 'reminders']

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
  const [emailErr, setEmailErr] = useState(false)
  const [googleView, setGoogleView] = useState('chooser') // 'chooser' | 'signin'
  const [regularity, setRegularity] = useState('')
  const [firstTime, setFirstTime] = useState(null)
  const [eduSlide, setEduSlide] = useState(0)

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
      firstTime: !!firstTime,
    })
    addPeriod(lastPeriod.toISOString())
    saveSettings({
      language: LANGS.find((l) => l.code === lang)?.label || 'English',
      notifications: !!reminders,
    })
    setOnboarded(true)
    armDashboardTour() // show the guided tour on the first home visit
  }

  // Personalising loader → persist, then into the app.
  useEffect(() => {
    if (step !== 'personalizing') return
    const timer = setTimeout(() => navigate('/home'), 2400)
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
    // Preview / no real OAuth: show the Google "choose an account" screen,
    // then continue the flow.
    setGoogleView('chooser')
    setEmail('')
    setPass('')
    setEmailErr(false)
    setStep('google')
  }

  // Pick one of the accounts already on the device.
  function pickAccount(acc) {
    saveProfile({ email: acc.email })
    setStep('name')
  }

  // "Use another account" → sign in / create with email + password.
  function submitGoogleSignin() {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk || pass.trim().length < 4) {
      setEmailErr(true)
      return
    }
    saveProfile({ email: email.trim() })
    setStep('name')
  }

  async function askReminders(allow) {
    if (allow && typeof Notification !== 'undefined' && Notification.permission === 'default') {
      try {
        await Notification.requestPermission()
      } catch {
        /* ignore — the toggle in Settings still works */
      }
    }
    persistAll(allow)
    setStep('personalizing')
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
          <SplashLogo size={132} />
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
                    onClick={() => setStep('name')}
                    className="flex w-full items-center justify-center gap-2 rounded-pill border border-accent-primary/40 bg-accent-primary/10 px-5 py-3.5 font-medium text-accent-secondary hover:bg-accent-primary/20"
                  >
                    {t('signupEmail')}
                  </button>
                  <button
                    onClick={() => setStep('name')}
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

            {/* GOOGLE — account chooser + "use another account" (email + password) */}
            {step === 'google' && (
              <div className="flex flex-1 flex-col pb-8 pt-6">
                <div className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white text-[#202124] shadow-lift">
                  {googleView === 'chooser' ? (
                    <div className="p-8">
                      <GoogleFullLogo />
                      <h2 className="mt-6 font-heading text-[1.55rem] font-normal text-[#202124]">{t('gChooseAccount')}</h2>
                      <p className="mt-1 text-[0.95rem] text-[#5f6368]">{t('gSignInSub')}</p>
                      <div className="mt-6 divide-y divide-[#e8eaed] border-y border-[#e8eaed]">
                        {SEEDED_ACCOUNTS.map((a) => (
                          <button
                            key={a.email}
                            onClick={() => pickAccount(a)}
                            className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[#f7f8f8]"
                          >
                            <span
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[0.95rem] font-medium text-white"
                              style={{ background: a.color }}
                            >
                              {a.initial}
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[0.95rem] font-medium text-[#202124]">{a.name}</span>
                              <span className="block truncate text-caption text-[#5f6368]">{a.email}</span>
                            </span>
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setGoogleView('signin')
                            setEmail('')
                            setPass('')
                            setEmailErr(false)
                          }}
                          className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-[#f7f8f8]"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dadce0] text-[#5f6368]">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </span>
                          <span className="text-[0.95rem] font-medium text-[#202124]">{t('gUseAnother')}</span>
                        </button>
                      </div>
                      <p className="mt-5 text-caption text-[#5f6368]">{t('gGuestNote')}</p>
                    </div>
                  ) : (
                    <div className="p-8">
                      <GoogleFullLogo />
                      <h2 className="mt-6 font-heading text-[1.55rem] font-normal text-[#202124]">{t('gSignInTitle')}</h2>
                      <p className="mt-1 text-[0.95rem] text-[#5f6368]">{t('gSignInSub')}</p>
                      <input
                        autoFocus
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value)
                          setEmailErr(false)
                        }}
                        placeholder={t('gEmailPlaceholder')}
                        className={`mt-6 w-full rounded-lg border bg-white px-4 py-3.5 text-[1rem] text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] ${
                          emailErr ? 'border-[#d93025]' : 'border-[#dadce0]'
                        }`}
                      />
                      <input
                        type="password"
                        value={pass}
                        onChange={(e) => {
                          setPass(e.target.value)
                          setEmailErr(false)
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && submitGoogleSignin()}
                        placeholder={t('gPassPlaceholder')}
                        className={`mt-3 w-full rounded-lg border bg-white px-4 py-3.5 text-[1rem] text-[#202124] outline-none focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] ${
                          emailErr ? 'border-[#d93025]' : 'border-[#dadce0]'
                        }`}
                      />
                      {emailErr && <p className="mt-1.5 text-caption text-[#d93025]">{t('gEmailErr')}</p>}
                      <div className="mt-7 flex items-center justify-between">
                        <button
                          onClick={() => setGoogleView('chooser')}
                          className="text-[0.95rem] font-medium text-[#1a73e8] hover:underline"
                        >
                          {t('back')}
                        </button>
                        <button
                          onClick={submitGoogleSignin}
                          className="rounded-lg bg-[#1a73e8] px-6 py-2.5 text-[0.95rem] font-medium text-white hover:bg-[#1765cc]"
                        >
                          {t('gNext')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
                <Footer onNext={() => setStep('periodLen')} label={t('next')} />
              </Step>
            )}

            {/* PERIOD LENGTH — 3/5 */}
            {step === 'periodLen' && (
              <Step title={t('periodLenTitle')}>
                <NumberPicker min={2} max={10} value={periodLen} onChange={setPeriodLen} unit={t('daysUnit')} />
                <Footer onNext={() => setStep('cycleLen')} label={t('next')} />
              </Step>
            )}

            {/* CYCLE LENGTH — 4/5 */}
            {step === 'cycleLen' && (
              <Step title={t('cycleLenTitle')}>
                <NumberPicker min={21} max={40} value={cycleLen} onChange={setCycleLen} unit={t('daysUnit')} />
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

            {/* FIRST-TIME DETECTION */}
            {step === 'firstTime' && (
              <Step title={t('firstTimeTitle')} subtitle={t('firstTimeSub')}>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setFirstTime(true)
                      setEduSlide(0)
                      setStep('education')
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] py-8 text-lg font-medium text-text-primary transition-all duration-250 hover:border-accent-primary/40 hover:bg-accent-primary/[0.06]"
                  >
                    🌸 {t('yesOpt')}
                  </button>
                  <button
                    onClick={() => {
                      setFirstTime(false)
                      setStep('reminders')
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.02] py-8 text-lg font-medium text-text-primary transition-all duration-250 hover:border-accent-primary/40 hover:bg-accent-primary/[0.06]"
                  >
                    🌸 {t('noOpt')}
                  </button>
                </div>
              </Step>
            )}

            {/* AI EDUCATION (first-time users) — a short, friendly primer */}
            {step === 'education' && (
              <Step title={t('eduTitle')} subtitle={t('eduSub')}>
                <div className="mt-6 rounded-2xl border border-accent-primary/20 bg-accent-primary/[0.05] p-6">
                  <div className="text-4xl">{EDU_SLIDES[eduSlide].emoji}</div>
                  <h3 className="mt-4 font-heading text-xl font-semibold">{t(EDU_SLIDES[eduSlide].t)}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{t(EDU_SLIDES[eduSlide].b)}</p>
                  <div className="mt-5 flex justify-center gap-1.5">
                    {EDU_SLIDES.map((_, i) => (
                      <span
                        key={i}
                        className={`h-1.5 rounded-pill transition-all ${i === eduSlide ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between pt-8">
                  <button
                    onClick={() => setStep('reminders')}
                    className="rounded-pill px-4 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('skip')}
                  </button>
                  <Button
                    onClick={() =>
                      eduSlide < EDU_SLIDES.length - 1 ? setEduSlide((s) => s + 1) : setStep('reminders')
                    }
                    size="lg"
                  >
                    {eduSlide < EDU_SLIDES.length - 1 ? t('cont') : t('eduDone')} <ArrowRightIcon size={18} />
                  </Button>
                </div>
              </Step>
            )}

            {/* REMINDERS */}
            {step === 'reminders' && (
              <Step icon iconEl={<BellIcon />} title={t('remindersTitle')} subtitle={t('remindersSub')}>
                <div className="mt-auto space-y-3 pt-10">
                  <Button onClick={() => askReminders(true)} size="lg" className="w-full">
                    {t('allow')}
                  </Button>
                  <button
                    onClick={() => askReminders(false)}
                    className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary"
                  >
                    {t('notNow')}
                  </button>
                </div>
              </Step>
            )}
          </main>
        </>
      )}
    </div>
  )
}

function back(step, setStep) {
  if (step === 'google') {
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

function GoogleFullLogo() {
  const colors = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335']
  return (
    <div className="flex items-center gap-2">
      <GoogleG />
      <span className="font-heading text-2xl font-medium tracking-tight">
        {'Google'.split('').map((ch, i) => (
          <span key={i} style={{ color: colors[i] }}>
            {ch}
          </span>
        ))}
      </span>
    </div>
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
