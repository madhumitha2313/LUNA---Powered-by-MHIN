import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import { ArrowRightIcon, ShieldIcon } from '../components/ui/icons'
import { useT, LANGS } from '../lib/i18n.jsx'
import { signUp, loginWithProvider, loginWithGoogleCredential, passwordStrength } from '../lib/authStore'
import { armDashboardTour } from '../components/DashboardTour'
import GoogleSignInButton from '../components/GoogleSignInButton'
import { isGoogleSignInConfigured } from '../lib/googleAuth'

const GENDERS = ['female', 'male', 'nonbinary', 'preferNot']
const STRENGTH = ['', 'auWeak', 'auFair', 'auGood', 'auStrong']
const STRENGTH_COLOR = ['#3a3a44', '#fb7185', '#fbbf24', '#a78bfa', '#6ee7b7']

export default function Signup() {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', confirm: '', dob: '', gender: '', language: lang, terms: false, privacy: false })
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => { setF((p) => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })); setErrors((x) => ({ ...x, [k]: null })) }
  const strength = passwordStrength(f.password)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    // privacy is validated here (signUp validates terms + the rest)
    const localErr = {}
    if (!f.privacy) localErr.privacy = 'errPrivacyReq'
    const res = await signUp(f)
    const merged = { ...(res.ok ? {} : res.errors), ...localErr }
    if (Object.keys(merged).length) { setErrors(merged); setBusy(false); return }
    armDashboardTour()
    navigate('/home', { replace: true })
  }

  function social(provider) {
    loginWithProvider(provider, { name: f.name })
    armDashboardTour()
    navigate('/home', { replace: true })
  }
  function googleProfile(profile) {
    loginWithGoogleCredential(profile)
    armDashboardTour()
    navigate('/home', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-5 py-10">
      <div className="pointer-events-none fixed left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Link to="/welcome"><Logo withTagline /></Link></div>
        <h1 className="text-center font-heading text-2xl font-semibold">{t('auCreateTitle')}</h1>
        <p className="mt-1 text-center text-caption text-text-secondary">{t('auCreateSub')}</p>

        <form onSubmit={onSubmit} noValidate className="mt-6 space-y-3.5">
          <Field t={t} name="name" autoComplete="name" label="auFullName" value={f.name} onChange={set('name')} placeholder="auFullNamePh" error={errors.name} />
          <Field t={t} name="email" autoComplete="email" label="auEmail" type="email" value={f.email} onChange={set('email')} placeholder="auEmailPh" error={errors.email} />
          <Field t={t} name="phone" autoComplete="tel" label="auPhone" type="tel" value={f.phone} onChange={set('phone')} placeholder="auPhonePh" error={errors.phone} optional />

          <div>
            <Label t={t} label="auPassword" />
            <div className="relative">
              <input type={show ? 'text' : 'password'} name="password" autoComplete="new-password" value={f.password} onChange={set('password')} placeholder="••••••••"
                className={inputCls(errors.password)} />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted hover:text-text-secondary">{show ? t('auHide') : t('auShow')}</button>
            </div>
            {f.password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((i) => <div key={i} className="h-1 flex-1 rounded-pill" style={{ background: i <= strength ? STRENGTH_COLOR[strength] : '#ffffff14' }} />)}</div>
                <span className="text-[0.68rem] text-text-muted">{t(STRENGTH[strength]) || ''}</span>
              </div>
            )}
            <Err t={t} e={errors.password} />
          </div>

          <div>
            <Label t={t} label="auConfirm" />
            <input type={show ? 'text' : 'password'} name="confirm" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} placeholder="••••••••" className={inputCls(errors.confirm)} />
            <Err t={t} e={errors.confirm} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label t={t} label="auDob" />
              <input type="date" name="dob" value={f.dob} onChange={set('dob')} max={new Date().toISOString().slice(0, 10)} className={inputCls(errors.dob) + ' [color-scheme:dark]'} />
              <Err t={t} e={errors.dob} />
            </div>
            <div>
              <Label t={t} label="auGender" />
              <select name="gender" value={f.gender} onChange={set('gender')} className={inputCls(errors.gender)}>
                <option value="" className="bg-bg-card">{t('auSelect')}</option>
                {GENDERS.map((g) => <option key={g} value={g} className="bg-bg-card">{t('gender_' + g)}</option>)}
              </select>
            </div>
          </div>

          <div>
            <Label t={t} label="auLanguage" />
            <select name="language" value={f.language} onChange={set('language')} className={inputCls()}>
              {LANGS.map((l) => <option key={l.code} value={l.code} className="bg-bg-card">{l.native}</option>)}
            </select>
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-caption text-text-secondary">
            <input type="checkbox" name="terms" checked={f.terms} onChange={set('terms')} className="mt-0.5 h-4 w-4 shrink-0 accent-accent-primary" />
            <span>{t('auAgreeTerms')} <Link to="/terms" className="text-accent-secondary hover:underline">{t('auTerms')}</Link></span>
          </label>
          {errors.terms && <Err t={t} e={errors.terms} />}
          <label className="flex cursor-pointer items-start gap-2.5 text-caption text-text-secondary">
            <input type="checkbox" name="privacy" checked={f.privacy} onChange={set('privacy')} className="mt-0.5 h-4 w-4 shrink-0 accent-accent-primary" />
            <span>{t('auAgreePrivacy')} <Link to="/privacy" className="text-accent-secondary hover:underline">{t('auPrivacy')}</Link></span>
          </label>
          {errors.privacy && <Err t={t} e={errors.privacy} />}

          <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
            {busy ? t('auPleaseWait') : t('auCreateBtn')} <ArrowRightIcon size={16} />
          </Button>
        </form>

        <Divider t={t} />
        {isGoogleSignInConfigured && (
          <div className="mb-2">
            <GoogleSignInButton onProfile={googleProfile} />
          </div>
        )}
        <div className={isGoogleSignInConfigured ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-3 gap-2'}>
          {!isGoogleSignInConfigured && <SocialBtn onClick={() => social('google')}>{'🔴'} Google</SocialBtn>}
          <SocialBtn onClick={() => social('apple')}></SocialBtn>
          <SocialBtn onClick={() => social('phone')}>{'📱'}</SocialBtn>
        </div>

        <p className="mt-6 text-center text-caption text-text-muted">
          {t('auHaveAccount')} <Link to="/login" className="text-accent-secondary hover:underline">{t('auSignIn')}</Link>
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[0.72rem] text-text-muted"><ShieldIcon size={13} /> {t('auSecureNote')}</p>
      </div>
    </div>
  )
}

const inputCls = (err) => `w-full rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-[0.92rem] text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${err ? 'border-danger/50' : 'border-white/10 focus:border-accent-primary/40'}`
function Label({ t, label }) { return <label className="mb-1 block text-caption text-text-secondary">{t(label)}</label> }
function Err({ t, e }) { return e ? <p className="mt-1 text-[0.72rem] text-danger">{t(e)}</p> : null }
function Field({ t, label, type = 'text', value, onChange, placeholder, error, optional, name, autoComplete }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between"><label className="text-caption text-text-secondary">{t(label)}</label>{optional && <span className="text-[0.68rem] text-text-muted">{t('auOptional')}</span>}</div>
      <input type={type} name={name} autoComplete={autoComplete} value={value} onChange={onChange} placeholder={t(placeholder)} className={inputCls(error)} />
      <Err t={t} e={error} />
    </div>
  )
}
function Divider({ t }) { return <div className="my-5 flex items-center gap-3 text-caption text-text-muted"><span className="h-px flex-1 bg-white/[0.08]" />{t('auOr')}<span className="h-px flex-1 bg-white/[0.08]" /></div> }
function SocialBtn({ onClick, children }) {
  return <button type="button" onClick={onClick} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-[0.82rem] text-text-secondary transition hover:border-white/20 hover:text-text-primary">{children}</button>
}
