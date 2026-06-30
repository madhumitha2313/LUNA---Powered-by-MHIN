import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import MoonScene from '../../components/illustrations/MoonScene'
import {
  MicIcon,
  PlayIcon,
  SparklesIcon,
  ShieldIcon,
  StethoscopeIcon,
  UsersIcon,
  LeafIcon,
} from '../../components/ui/icons'

const FEATURE_BADGES = [
  { label: 'Voice First', icon: <MicIcon size={14} /> },
  { label: 'AI Powered', icon: <SparklesIcon size={14} /> },
  { label: 'Privacy First', icon: <ShieldIcon size={14} /> },
  { label: 'Doctor Ready', icon: <StethoscopeIcon size={14} /> },
  { label: 'Community Intelligence', icon: <UsersIcon size={14} /> },
  { label: 'Sustainability Driven', icon: <LeafIcon size={14} /> },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32">
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent-ai/10 blur-[120px]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-6">
        {/* Copy */}
        <div className="order-2 lg:order-1">
          <Badge tone="ai" className="animate-fade-up delay-0" icon={<SparklesIcon size={14} />}>
            Tamil voice-first menstrual health
          </Badge>

          <h1 className="mt-5 font-heading text-[2.5rem] font-semibold leading-[1.05] tracking-tight sm:text-hero animate-fade-up delay-1">
            Your Health. Your Voice.
            <br />
            <span className="text-moonlight">Our Intelligence.</span>
          </h1>

          <p className="mt-5 max-w-md text-[1.05rem] text-text-secondary animate-fade-up delay-2">
            LUNA turns everyday conversations — in your own voice, in Tamil — into
            health intelligence you can understand, trust, and share with a doctor when
            it matters.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up delay-3">
            <Button as={Link} to="/voice" size="lg">
              <MicIcon size={18} />
              Talk to Luna
            </Button>
            <Button variant="secondary" size="lg">
              <PlayIcon size={16} />
              Watch Demo
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-2.5 animate-fade-up delay-4">
            {FEATURE_BADGES.map((b) => (
              <Badge key={b.label} tone="neutral" icon={b.icon}>
                {b.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div className="order-1 lg:order-2">
          <MoonScene className="mx-auto aspect-square w-full max-w-[480px] animate-fade-up delay-2" />
        </div>
      </div>
    </section>
  )
}
