import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ID } from 'appwrite'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import {
  BrainIcon,
  MicIcon,
  ShieldIcon,
  ArrowRightIcon,
  HeartIcon,
} from '../components/ui/icons'
import { isAppwriteConfigured, account } from '../lib/appwrite'
import { saveProfile } from '../lib/localStore'

/**
 * Split sign-in: brand + value panel on the left, form on the right.
 * Real Appwrite email/password session when configured; in the keyless preview
 * it saves the name locally and continues into the app.
 */
const HIGHLIGHTS = [
  { icon: BrainIcon, title: 'Explainable insights', body: 'Every indicator is backed by your own trends — nothing you can’t question.' },
  { icon: MicIcon, title: 'Instant Tamil voice', body: 'Speak naturally; Mira understands, replies and logs in seconds.' },
  { icon: ShieldIcon, title: 'Private by design', body: 'Your voice is discarded after processing; your data stays yours.' },
]

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.name) saveProfile({ name: form.name })
    // Real Appwrite auth needs an http(s) origin; the file:// preview stays local.
    const isFile = typeof window !== 'undefined' && window.location.protocol === 'file:'
    if (!isAppwriteConfigured || isFile) {
      navigate('/home')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') await account.create(ID.unique(), form.email, form.password, form.name || undefined)
      await account.createEmailPasswordSession(form.email, form.password)
      navigate('/home')
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand & value */}
      <aside className="relative hidden overflow-hidden bg-bg-secondary p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(217,123,168,0.28), rgba(167,139,250,0.12) 45%, transparent 80%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-96 w-96 rounded-full bg-accent-ai/20 blur-[120px]"
        />

        <Link to="/" className="relative">
          <Logo withTagline />
        </Link>

        <div className="relative">
          {/* Floating health card */}
          <div
            className="mb-10 w-full max-w-sm rotate-[-4deg] rounded-card border border-white/15 p-6 shadow-lift"
            style={{ background: 'linear-gradient(135deg, #F5C6D6, #D97BA8 55%, #A78BFA)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-lg font-semibold text-bg-primary">MIRA</span>
              <HeartIcon size={22} className="text-bg-primary/80" />
            </div>
            <div className="mt-8 font-stat text-2xl font-bold tracking-widest text-bg-primary">
              CYCLE · DAY 14
            </div>
            <div className="mt-6 flex items-end justify-between text-bg-primary/90">
              <div>
                <p className="text-[10px] uppercase tracking-wider">Phase</p>
                <p className="font-semibold">Follicular</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider">Next period</p>
                <p className="font-semibold">in 14 days</p>
              </div>
            </div>
          </div>

          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-text-primary">
            Smarter health,
            <br />
            <span className="text-moonlight">fully understood.</span>
          </h1>
          <p className="mt-4 max-w-md text-text-secondary">
            Mira turns everyday conversations into transparent, doctor-ready health
            intelligence — voice-first, in Tamil.
          </p>

          <div className="mt-8 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <div key={h.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-accent-secondary">
                  <h.icon size={20} />
                </span>
                <div>
                  <p className="font-medium text-text-primary">{h.title}</p>
                  <p className="text-caption text-text-secondary">{h.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-caption text-text-muted">
          © {new Date().getFullYear()} MIRA · powered by MHIN
        </p>
      </aside>

      {/* Right — form */}
      <div className="relative flex items-center justify-center bg-bg-primary px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo withTagline />
          </div>

          <h2 className="font-heading text-3xl font-semibold">
            {mode === 'login' ? 'Sign in to Mira' : 'Create your account'}
          </h2>
          <p className="mt-1.5 text-text-secondary">
            {mode === 'login' ? 'Welcome back. Please enter your details.' : 'A minute to set up, yours forever.'}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {mode === 'signup' && (
              <Field label="Name" value={form.name} onChange={set('name')} placeholder="Your name" />
            )}
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
              icon="mail"
            />

            <div>
              <label className="mb-1.5 block text-caption text-text-secondary">Password</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <ShieldIcon size={17} />
                </span>
                <input
                  type={show ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-10 py-3 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-caption text-text-muted hover:text-text-secondary"
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-caption text-text-secondary">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 accent-accent-primary"
                />
                Remember me
              </label>
              <button type="button" className="text-caption text-accent-secondary hover:underline">
                Forgot password?
              </button>
            </div>

            {error && <p className="text-caption text-danger">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRightIcon size={16} />
            </Button>
          </form>

          {isAppwriteConfigured && typeof window !== 'undefined' && window.location.protocol === 'file:' ? (
            <p className="mt-4 rounded-xl border border-warning/20 bg-warning/[0.06] px-3 py-2 text-caption text-text-secondary">
              Connected to Appwrite — but this double-click <code>file://</code> preview can't reach it. Run{' '}
              <code>npm run dev</code> or open the deployed site to create a real account.
            </p>
          ) : (
            !isAppwriteConfigured && (
              <p className="mt-4 rounded-xl border border-accent-ai/20 bg-accent-ai/[0.06] px-3 py-2 text-caption text-text-secondary">
                Preview mode — this opens the dashboard directly.
              </p>
            )
          )}

          <p className="mt-6 text-center text-caption text-text-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-accent-secondary hover:underline"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required, icon }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-text-secondary">{label}</span>
      <div className="relative">
        {icon === 'mail' && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2.5" />
              <path d="M4 7l8 6 8-6" />
            </svg>
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 ${
            icon ? 'px-10' : 'px-4'
          }`}
        />
      </div>
    </label>
  )
}
