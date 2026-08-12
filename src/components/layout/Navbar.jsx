import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { MicIcon } from '../ui/icons'
import { getProfile } from '../../lib/localStore'
import { currentUser, isAuthenticated, logout } from '../../lib/authStore'
import { useT } from '../../lib/i18n.jsx'

/**
 * Top navigation. Glass blur is used here and ONLY here per the design rules.
 * The right corner is authentication-aware: signed-out visitors see Log in /
 * Sign up; signed-in users see their avatar + full profile menu (never a Login
 * button once authenticated).
 */
const LINKS = [
  { key: 'navFeatures', to: '/features' },
  { key: 'navConditions', to: '/conditions' },
  { key: 'navLearn', to: '/guide' },
  { key: 'navDashboard', to: '/home' },
]

export default function Navbar() {
  const { t } = useT()
  const authed = isAuthenticated()
  const session = currentUser()
  const profile = getProfile()
  const name = session?.name || profile.name || ''
  const initials = (name || 'M').trim().slice(0, 1).toUpperCase()
  const picture = session?.picture || profile.picture || ''

  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to={authed ? '/home' : '/welcome'} aria-label="MIRA home">
          <Logo withTagline />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="text-[0.95rem] text-text-secondary transition-colors duration-250 ease-luna hover:text-text-primary">
              {t(l.key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {authed ? (
            <>
              <Button as={Link} to="/voice" size="sm" className="shrink-0">
                <MicIcon size={16} />
                <span className="hidden sm:inline">{t('navTalk')}</span>
              </Button>
              <ProfileMenu initials={initials} name={name} email={session?.email} picture={picture} />
            </>
          ) : (
            <>
              <Button as={Link} to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
                {t('navLogin')}
              </Button>
              <Button as={Link} to="/signup" size="sm" className="shrink-0">
                {t('navSignup')}
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}

const MENU = [
  { key: 'menuMyProfile', to: '/profile' },
  { key: 'navExplore', to: '/explore' },
  { key: 'menuLanguage', to: '/settings?section=language' },
  { key: 'menuNotifications', to: '/settings?section=notifications' },
  { key: 'menuPrivacy', to: '/settings?section=privacy-security' },
]

function ProfileMenu({ initials, name, email, picture }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  async function doLogout() {
    setBusy(true)
    await logout()
    setOpen(false)
    navigate('/welcome', { replace: true })
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label={t('menuAccount')} aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary font-heading text-sm font-bold text-bg-primary transition-transform duration-250 ease-luna hover:scale-105">
        {picture ? <img src={picture} alt="" referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-bg-card p-1.5 shadow-lift">
          <div className="px-3 py-2">
            <p className="text-caption text-text-muted">{t('menuSignedIn')}</p>
            <p className="truncate font-medium text-text-primary">{name || t('menuGuest')}</p>
            {email && <p className="truncate text-[0.72rem] text-text-muted">{email}</p>}
          </div>
          <div className="my-1 h-px bg-white/[0.06]" />
          {MENU.map((m, i) => (
            <MenuLink key={i} to={m.to} onClick={() => setOpen(false)}>{t(m.key)}</MenuLink>
          ))}
          <div className="my-1 h-px bg-white/[0.06]" />
          <button onClick={doLogout} disabled={busy}
            className="block w-full rounded-lg px-3 py-2 text-left text-[0.95rem] text-danger transition-colors duration-250 hover:bg-white/5 disabled:opacity-50">
            {busy ? t('auPleaseWait') : t('menuLogout')}
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} className="block rounded-lg px-3 py-2 text-[0.95rem] text-text-secondary transition-colors duration-250 hover:bg-white/5 hover:text-text-primary">
      {children}
    </Link>
  )
}
