import { Link } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { MicIcon } from '../ui/icons'
import { getProfile } from '../../lib/localStore'

/**
 * Top navigation. Glass blur is used here and ONLY here per the design rules.
 * Right corner carries the user's profile avatar.
 */
const LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Conditions', to: '/conditions' },
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
          <Button as={Link} to="/voice" size="sm" className="shrink-0">
            <MicIcon size={16} />
            <span className="hidden sm:inline">Talk to Mira</span>
          </Button>
          <Link
            to="/profile"
            aria-label="Your profile"
            title={profile.name || 'Your profile'}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary font-heading text-sm font-bold text-bg-primary transition-transform duration-250 ease-luna hover:scale-105"
          >
            {initials}
          </Link>
        </div>
      </nav>
    </header>
  )
}
