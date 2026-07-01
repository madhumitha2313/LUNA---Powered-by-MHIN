import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import TrustBar from '../components/layout/TrustBar'
import { ShieldIcon, ArrowRightIcon } from '../components/ui/icons'
import { ID } from 'appwrite'
import { isAppwriteConfigured, account } from '../lib/appwrite'

/**
 * Basic auth page. When Appwrite is configured it creates a real email/password
 * session; in the keyless preview it simply continues to the dashboard so the
 * app is fully explorable. No fabricated accounts.
 */
export default function Login() {
  const [mode, setMode] = useState('login') // login | signup
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!isAppwriteConfigured) {
      // Preview mode: no backend — continue into the app.
      navigate('/home')
      return
    }
    setBusy(true)
    try {
      if (mode === 'signup') {
        await account.create(ID.unique(), form.email, form.password, form.name || undefined)
      }
      await account.createEmailPasswordSession(form.email, form.password)
      navigate('/home')
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary px-5 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent-primary/10 blur-[120px]"
      />
      <div className="relative w-full max-w-md">
        <Link to="/" className="mb-8 flex justify-center" aria-label="LUNA home">
          <Logo withTagline />
        </Link>

        <div className="card-base p-7 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-heading text-2xl font-semibold">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <Badge tone="ai" icon={<ShieldIcon size={13} />}>
              Private
            </Badge>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Field label="Name" value={form.name} onChange={set('name')} placeholder="Your name" />
            )}
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              required
            />

            {error && <p className="text-caption text-danger">{error}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
              <ArrowRightIcon size={16} />
            </Button>
          </form>

          {!isAppwriteConfigured && (
            <p className="mt-4 rounded-xl border border-accent-ai/20 bg-accent-ai/[0.06] px-3 py-2 text-caption text-text-secondary">
              Preview mode — no backend keys, so this opens the dashboard directly. Real
              sessions activate once Appwrite is configured.
            </p>
          )}

          <p className="mt-6 text-center text-caption text-text-muted">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-accent-secondary hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>

        <TrustBar className="mt-8" />
      </div>
    </div>
  )
}

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-text-secondary">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
      />
    </label>
  )
}
