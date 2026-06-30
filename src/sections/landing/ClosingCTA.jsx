import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { MicIcon } from '../../components/ui/icons'

export default function ClosingCTA() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-4xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-card border border-white/10 bg-gradient-to-br from-bg-card to-bg-secondary px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent-primary/15 blur-[100px]"
          />
          <h2 className="relative font-heading text-3xl font-semibold tracking-tight sm:text-section">
            Start your health story tonight.
          </h2>
          <p className="relative mx-auto mt-4 max-w-md text-text-secondary">
            One short conversation. Luna takes it from there.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button as={Link} to="/voice" size="lg">
              <MicIcon size={18} />
              Talk to Luna
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
