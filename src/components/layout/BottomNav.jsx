import { NavLink } from 'react-router-dom'
import { MicIcon, UsersIcon, TrendIcon } from '../ui/icons'
import { useT } from '../../lib/i18n.jsx'

/** Simple inline glyphs where the icon set has no match. */
const HomeGlyph = (p) => (
  <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20h14V9.5" />
  </svg>
)
const ProfileGlyph = (p) => (
  <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.6" />
    <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
  </svg>
)

const ITEMS = [
  { to: '/home', icon: HomeGlyph, key: 'navHome' },
  { to: '/guide', icon: UsersIcon, key: 'navGuide' },
  { to: '/voice', icon: MicIcon, key: 'navTalk', center: true },
  { to: '/journey', icon: TrendIcon, key: 'navJourney' },
  { to: '/profile', icon: ProfileGlyph, key: 'navProfile' },
]

/**
 * Bottom navigation for the app experience. The center "Talk with Mira" button
 * is emphasised as a raised, glowing pink circle. Fixed to the viewport bottom.
 */
export default function BottomNav() {
  const { t } = useT()
  return (
    <nav className="glass-nav fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-lg items-end justify-around px-4 pb-2 pt-2.5">
        {ITEMS.map((it) =>
          it.center ? (
            <NavLink
              key={it.to}
              to={it.to}
              aria-label={t(it.key)}
              className="-mt-8 flex flex-col items-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FF7BB5] to-[#FF2E8A] text-white shadow-[0_0_24px_rgba(255,79,157,0.55)] transition-transform duration-250 ease-luna active:scale-95">
                <it.icon size={24} />
              </span>
              <span className="mt-1 text-[10px] font-medium text-accent-secondary">{t(it.key)}</span>
            </NavLink>
          ) : (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[10px] transition-colors duration-250 ${
                  isActive ? 'text-accent-primary' : 'text-text-muted hover:text-text-secondary'
                }`
              }
            >
              <it.icon size={22} />
              <span>{t(it.key)}</span>
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
