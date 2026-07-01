import { Link } from 'react-router-dom'
import Logo from '../Logo'
import Button from '../ui/Button'
import { MicIcon } from '../ui/icons'

/**
 * Top navigation. Glass blur is used here and ONLY here per the design rules.
 */
const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#problem' },
  { label: 'Dashboard', href: '/home', route: true },
]

export default function Navbar() {
  return (
    <header className="glass-nav fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to="/" aria-label="LUNA home">
          <Logo withTagline />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) =>
            l.route ? (
              <Link
                key={l.href}
                to={l.href}
                className="text-[0.95rem] text-text-secondary transition-colors duration-250 ease-luna hover:text-text-primary"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                className="text-[0.95rem] text-text-secondary transition-colors duration-250 ease-luna hover:text-text-primary"
              >
                {l.label}
              </a>
            )
          )}
        </div>

        <Button as={Link} to="/voice" size="sm" className="shrink-0">
          <MicIcon size={16} />
          Talk to Luna
        </Button>
      </nav>
    </header>
  )
}
