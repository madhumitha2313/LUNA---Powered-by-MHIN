import { Link } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { MicIcon } from '../ui/icons'

/**
 * Top navigation. Glass blur is used here and ONLY here per the design rules.
 * Every item routes to a real page.
 */
const LINKS = [
  { label: 'Features', to: '/features' },
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Dashboard', to: '/home' },
]

export default function Navbar() {
  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="LUNA home">
          <Logo withTagline />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-2">
          <Button as={Link} to="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button as={Link} to="/voice" size="sm" className="shrink-0">
            <MicIcon size={16} />
            Talk to Luna
          </Button>
        </div>
      </nav>
    </header>
  )
}
