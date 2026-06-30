import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../sections/landing/Hero'
import ProblemSection from '../sections/landing/ProblemSection'
import FeaturesSection from '../sections/landing/FeaturesSection'
import ClosingCTA from '../sections/landing/ClosingCTA'

/**
 * Phase 1 — Landing page. Full design treatment, no backend wiring.
 * This is the first thing judges see, so it carries the premium first impression.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <ClosingCTA />
      </main>
      <Footer />
    </div>
  )
}
