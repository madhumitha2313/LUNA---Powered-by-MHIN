import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { useT } from '../lib/i18n.jsx'
import { validateEmail, validatePassword } from '../lib/authStore'
import { sendPasswordReset, confirmPasswordReset } from '../lib/auth'

/**
 * Forgot-password flow — also doubles as the landing page for the emailed
 * recovery link. Appwrite redirects here with ?userId&secret after the
 * visitor clicks the link; without those params it's the ordinary
 * "enter your email" request form.
 */
export default function ResetPassword() {
  const { t } = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const userId = params.get('userId')
  const secret = params.get('secret')

  return userId && secret
    ? <ConfirmStep userId={userId} secret={secret} navigate={navigate} t={t} />
    : <RequestStep t={t} />
}

function RequestStep({ t }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!validateEmail(trimmed)) { setError('errEmailInvalid'); return }
    setError('')
    setBusy(true)
    const res = await sendPasswordReset(trimmed)
    setBusy(false)
    if (!res.ok) { setError(res.error === 'not-configured' ? 'errBackendUnavailable' : 'errBackendError'); return }
    setSent(true)
  }

  if (sent) {
    return (
      <Screen>
        <span className="grid h-16 w-16 place-items-center rounded-full bg-accent-primary/15 text-3xl">📧</span>
        <h1 className="mt-5 text-center font-heading text-2xl font-semibold">{t('rpSentTitle')}</h1>
        <p className="mx-auto mt-2 max-w-sm text-center text-text-secondary">{t('rpSentSub').replace('{email}', email)}</p>
        <Link to="/login" className="mt-7 text-caption text-accent-secondary hover:underline">{t('rpBackToLogin')}</Link>
      </Screen>
    )
  }

  return (
    <Screen>
      <h1 className="text-center font-heading text-2xl font-semibold">{t('rpRequestTitle')}</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-text-secondary">{t('rpRequestSub')}</p>
      <form onSubmit={onSubmit} noValidate className="mt-7 w-full max-w-xs space-y-3">
        <div>
          <input
            type="email" autoComplete="email" value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            placeholder={t('auEmailPh')}
            className={`w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${error ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'}`}
          />
          {error && <p className="mt-1 text-left text-[0.72rem] text-danger">{t(error)}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? t('auPleaseWait') : t('rpSendBtn')}
        </Button>
      </form>
      <Link to="/login" className="mt-5 text-caption text-text-muted hover:text-text-secondary">{t('rpBackToLogin')}</Link>
    </Screen>
  )
}

function ConfirmStep({ userId, secret, navigate, t }) {
  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [phase, setPhase] = useState('form') // form | done | error

  async function onSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!validatePassword(pwd)) next.pwd = 'errPwdShort'
    if (pwd !== confirm) next.confirm = 'errPwdMatch'
    if (Object.keys(next).length) { setErrors(next); return }
    setErrors({})
    setBusy(true)
    const res = await confirmPasswordReset(userId, secret, pwd)
    setBusy(false)
    if (!res.ok) { setPhase('error'); return }
    setPhase('done')
    setTimeout(() => navigate('/login', { replace: true }), 1800)
  }

  if (phase === 'done') {
    return (
      <Screen>
        <span className="text-5xl">✅</span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t('rpDoneTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('rpDoneSub')}</p>
      </Screen>
    )
  }

  if (phase === 'error') {
    return (
      <Screen>
        <span className="text-5xl">⚠️</span>
        <h1 className="mt-4 font-heading text-2xl font-semibold">{t('rpErrorTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('rpErrorSub')}</p>
        <Link to="/reset-password" className="mt-6 text-caption text-accent-secondary hover:underline">{t('rpRequestAnother')}</Link>
      </Screen>
    )
  }

  return (
    <Screen>
      <h1 className="text-center font-heading text-2xl font-semibold">{t('rpConfirmTitle')}</h1>
      <p className="mx-auto mt-2 max-w-sm text-center text-text-secondary">{t('rpConfirmSub')}</p>
      <form onSubmit={onSubmit} noValidate className="mt-7 w-full max-w-xs space-y-3">
        <div>
          <input
            type="password" autoComplete="new-password" value={pwd}
            onChange={(e) => { setPwd(e.target.value); setErrors((x) => ({ ...x, pwd: null })) }}
            placeholder={t('rpNewPassword')}
            className={`w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${errors.pwd ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'}`}
          />
          {errors.pwd && <p className="mt-1 text-left text-[0.72rem] text-danger">{t(errors.pwd)}</p>}
        </div>
        <div>
          <input
            type="password" autoComplete="new-password" value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((x) => ({ ...x, confirm: null })) }}
            placeholder={t('rpConfirmPassword')}
            className={`w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${errors.confirm ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'}`}
          />
          {errors.confirm && <p className="mt-1 text-left text-[0.72rem] text-danger">{t(errors.confirm)}</p>}
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? t('auPleaseWait') : t('rpSaveBtn')}
        </Button>
      </form>
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
