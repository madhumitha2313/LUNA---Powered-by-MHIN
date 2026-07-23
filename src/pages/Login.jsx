import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { login, loginWithProvider } from '../lib/authStore'
import { armDashboardTour } from '../components/DashboardTour'

export default function Login() {
  const { t } = useT()
  const navigate = useNavigate()
  const [f, setF] = useState({ email: '', password: '', remember: true })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    const res = await login(f)
    if (!res.ok) { setErrors(res.errors); setBusy(false); return }
    navigate('/home', { replace: true })
  }
  function social(provider) {
    loginWithProvider(provider)
    armDashboardTour()
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-5 py-10">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]" aria-hidden />
      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex justify-center"><Link to="/welcome"><Logo withTagline /></Link></div>
        <h1 className="text-center font-heading text-2xl font-semibold">{t('auWelcomeBack')}</h1>
        <p className="mt-1 text-center text-caption text-text-secondary">{t('auLoginSub')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-caption text-text-secondary">{t('auEmail')}</label>
            <input type="email" name="email" autoComplete="email" value={f.email} onChange={set('email')} placeholder={t('auEmailPh')} className={inputCls(errors.email)} />
            {errors.email && <p className="mt-1 text-[0.72rem] text-danger">{t(errors.email)}</p>}
          </div>
          <div>
            <label className="mb-1 block text-caption text-text-secondary">{t('auPassword')}</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} name="password" autoComplete="current-password" value={f.password} onChange={set('password')} placeholder="••••••••" className={inputCls(errors.password)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted hover:text-text-secondary">{show ? t('auHide') : t('auShow')}</button>
            </div>
            {errors.password && <p className="mt-1 text-[0.72rem] text-danger">{t(errors.password)}</p>}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2 text-caption text-text-secondary">
              <input type="checkbox" checked={f.remember} onChange={set('remember')} className="h-4 w-4 accent-accent-primary" />
              {t('auRemember')}
            </label>
            <button type="button" onClick={() => setForgot((v) => !v)} className="text-caption text-accent-secondary hover:underline">{t('auForgot')}</button>
          </div>
          {forgot && <p className="rounded-xl border border-accent-ai/20 bg-accent-ai/[0.06] px-3 py-2 text-[0.78rem] text-text-secondary">{t('auForgotNote')}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? t('auPleaseWait') : t('auLoginBtn')} <ArrowRightIcon size={16} />
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-caption text-text-muted"><span className="h-px flex-1 bg-white/[0.08]" />{t('auOr')}<span className="h-px flex-1 bg-white/[0.08]" /></div>
        <div className="space-y-2">
          <SocialBtn onClick={() => social('google')}>🔴 {t('auContinueGoogle')}</SocialBtn>
          <SocialBtn onClick={() => social('apple')}> {t('auContinueApple')}</SocialBtn>
          <SocialBtn onClick={() => social('phone')}>📱 {t('auContinuePhone')}</SocialBtn>
        </div>

        <p className="mt-6 text-center text-caption text-text-muted">
          {t('auNoAccount')} <Link to="/signup" className="text-accent-secondary hover:underline">{t('auSignUp')}</Link>
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.72rem] text-text-muted"><ShieldIcon size={13} /> {t('auSecureNote')}</p>
      </div>
    </div>
  )
}

const inputCls = (err) => `w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${err ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'}`
function SocialBtn({ onClick, children }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-[0.88rem] text-text-secondary transition hover:border-white/20 hover:text-text-primary">{children}</button>
}
