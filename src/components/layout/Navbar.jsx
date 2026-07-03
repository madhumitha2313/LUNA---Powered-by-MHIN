import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { MicIcon } from '../ui/icons'
import { getProfile } from '../../lib/localStore'
import { logout } from '../../lib/auth'

/**
 * Top navigation. Glass blur is used here and ONLY here per the design rules.
 * The right corner carries a profile menu (log in / profile).
 */
const LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'Conditions', to: '/conditions' },
  { label: 'Community', to: '/community' },
  { label: 'Guide', to: '/guide' },
  { label: 'Dashboard', to: '/home' },
]

export default function Navbar() {
  const profile = getProfile()
  const initials = (profile.name || 'M').trim().slice(0, 1).toUpperCase()

  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="MIRA home">
          <Logo withTagline />
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-[0.95rem] text-text-secondary transition-colors duration-250 ease-luna hover:text-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Button as={Link} to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button as={Link} to="/voice" size="sm" className="shrink-0">
            <MicIcon size={16} />
            <span className="hidden sm:inline">Talk to Mira</span>
          </Button>
          <ProfileMenu initials={initials} name={profile.name} />
        </div>
      </nav>
    </header>
  )
}

function ProfileMenu({ initials, name }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary font-heading text-sm font-bold text-bg-primary transition-transform duration-250 ease-luna hover:scale-105"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-bg-card p-1.5 shadow-lift">
          <div className="px-3 py-2">
            <p className="text-caption text-text-muted">Signed in as</p>
            <p className="truncate font-medium text-text-primary">{name || 'Guest'}</p>
          </div>
          <div className="my-1 h-px bg-white/[0.06]" />
          <MenuLink to="/login" onClick={() => setOpen(false)}>
            Log in / Sign up
          </MenuLink>
          <MenuLink to="/profile" onClick={() => setOpen(false)}>
            Your profile
          </MenuLink>
          <MenuLink to="/home" onClick={() => setOpen(false)}>
            Dashboard
          </MenuLink>
          <MenuLink to="/timeline" onClick={() => setOpen(false)}>
            Timeline
          </MenuLink>
          <MenuLink to="/settings" onClick={() => setOpen(false)}>
            Settings
          </MenuLink>
          <div className="my-1 h-px bg-white/[0.06]" />
          <button
            onClick={async () => {
              await logout()
              setOpen(false)
              window.location.assign(import.meta.env.BASE_URL || '/')
            }}
            className="block w-full rounded-lg px-3 py-2 text-left text-[0.95rem] text-danger transition-colors duration-250 hover:bg-white/5"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-[0.95rem] text-text-secondary transition-colors duration-250 hover:bg-white/5 hover:text-text-primary"
    >
      {children}
    </Link>
  )
}
