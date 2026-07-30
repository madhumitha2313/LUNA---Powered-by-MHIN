import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { useT } from '../lib/i18n.jsx'
import {
  currentUser,
  isEmailVerified,
  markEmailVerified,
  resendVerification,
  abandonUnverifiedAccount,
  verificationEmailWasSent,
  resendCooldownSeconds,
} from '../lib/authStore'
import { confirmEmailVerification } from '../lib/auth'

// Common providers' webmail — "Open Email App" deep-links straight to the
// inbox when we can recognise the domain, otherwise falls back to mailto:.
const WEBMAIL = {
  'gmail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'googlemail.com': 'https://mail.google.com/mail/u/0/#inbox',
  'outlook.com': 'https://outlook.live.com/mail/0/inbox',
  'hotmail.com': 'https://outlook.live.com/mail/0/inbox',
  'live.com': 'https://outlook.live.com/mail/0/inbox',
  'yahoo.com': 'https://mail.yahoo.com',
  'icloud.com': 'https://www.icloud.com/mail',
}

/**
 * "Check your email" screen — also doubles as the landing page for the
 * verification link itself. Appwrite redirects here with ?userId&secret
 * after the visitor clicks the emailed link; without those params it's the
 * ordinary waiting screen (Open Email App / Resend / Change Email).
 */
export default function VerifyEmail() {
  const { t } = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const session = currentUser()
  const [phase, setPhase] = useState('checking') // checking | waiting | confirming | confirmed | error
  const [resendState, setResendState] = useState('idle') // idle | sending | sent | failed
  // Whether a real email is confirmed sent — NOT the same as "Appwrite has a
  // project id configured" (see needsEmailVerification in authStore.js for why).
  const [emailSent, setEmailSent] = useState(() => verificationEmailWasSent())
  const [cooldown, setCooldown] = useState(() => resendCooldownSeconds())

  const params = new URLSearchParams(location.search)
  const userId = params.get('userId')
  const secret = params.get('secret')

  useEffect(() => {
    let alive = true
    ;(async () => {
      if (userId && secret) {
        setPhase('confirming')
        const res = await confirmEmailVerification(userId, secret)
        if (!alive) return
        if (res.ok) {
          markEmailVerified(session?.email)
          setPhase('confirmed')
          setTimeout(() => navigate('/home', { replace: true }), 1800)
        } else {
          setPhase('error')
        }
        return
      }
      if (!session) {
        navigate('/welcome', { replace: true })
        return
      }
      if (isEmailVerified()) {
        navigate('/home', { replace: true })
        return
      }
      setPhase('waiting')
    })()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tick the 60s resend cooldown down once a second while it's active.
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setInterval(() => setCooldown(resendCooldownSeconds()), 1000)
    return () => clearInterval(id)
  }, [cooldown])

  async function handleResend() {
    if (cooldown > 0) return
    setResendState('sending')
    const res = await resendVerification()
    if (res.ok) setEmailSent(true)
    setResendState(res.ok ? 'sent' : 'failed')
    setCooldown(resendCooldownSeconds())
    setTimeout(() => setResendState('idle'), 3000)
  }

  function openEmailApp() {
    const domain = (session?.email || '').split('@')[1]?.toLowerCase()
    const url = domain && WEBMAIL[domain]
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else window.location.href = 'mailto:'
  }

  async function changeEmail() {
    await abandonUnverifiedAccount(session?.email)
    navigate('/signup', { replace: true })
  }

  if (phase === 'checking' || phase === 'confirming') {
    return (
      <Screen>
        <Spinner />
        <p className="mt-4 text-text-secondary">{t('veChecking')}</p>
      </Screen>
    )
  }

  if (phase === 'confirmed') {
    return (
      <Screen>
        <span className="text-5xl">✅</span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t('veConfirmedTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('veConfirmedSub')}</p>
      </Screen>
    )
  }

  if (phase === 'error') {
    return (
      <Screen>
        <span className="text-5xl">⚠️</span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t('veErrorTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('veErrorSub')}</p>
        <Button onClick={() => navigate('/login')} size="lg" className="mt-6 w-full max-w-xs">
          {t('signin')}
        </Button>
      </Screen>
    )
  }

  return (
    <Screen>
      <span className="grid h-16 w-16 place-items-center rounded-full bg-accent-primary/15 text-3xl">📧</span>
      <h1 className="mt-5 text-center font-heading text-2xl font-semibold">{t('verifyTitle')}</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-text-secondary">
        {t('verifySub').replace('{email}', session?.email || '')}
      </p>
      {!emailSent && (
        <p className="mx-auto mt-3 max-w-sm rounded-xl border border-danger/20 bg-danger/[0.06] px-3.5 py-2.5 text-center text-[0.78rem] leading-relaxed text-text-secondary">
          {t('veSendFailedNote')}
        </p>
      )}
      <div className="mt-7 w-full max-w-xs space-y-2.5">
        <Button onClick={openEmailApp} size="lg" className="w-full">
          {t('veOpenApp')}
        </Button>
        <button
          onClick={handleResend}
          disabled={resendState === 'sending' || cooldown > 0}
          className="w-full rounded-pill border border-white/12 px-5 py-3 text-[0.92rem] text-text-secondary transition hover:border-accent-primary/40 hover:text-text-primary disabled:opacity-50"
        >
          {resendState === 'sending'
            ? t('auPleaseWait')
            : resendState === 'sent'
              ? t('veResendSent')
              : resendState === 'failed'
                ? t('veResendFailed')
                : cooldown > 0
                  ? t('veResendWait').replace('{s}', String(cooldown))
                  : t('veResend')}
        </button>
        <button onClick={changeEmail} className="w-full rounded-pill px-5 py-3 text-caption text-text-muted hover:text-text-secondary">
          {t('veChangeEmail')}
        </button>
      </div>
    </Screen>
  )
}

function Screen({ children }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-primary px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/4 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]"
      />
      <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center animate-fade-up">
        <Logo withTagline />
        <div className="mt-8 flex w-full flex-col items-center">{children}</div>
      </div>
    </div>
  )
}

function Spinner() {
  return <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-accent-primary" />
}
