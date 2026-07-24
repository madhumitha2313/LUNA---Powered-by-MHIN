import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import BackButton from '../components/ui/BackButton'

/**
 * Terms of Service / Privacy Policy. Health-app appropriate content, adapted for
 * MIRA (MHIN). Plain-language, India-oriented; not legal advice.
 */
const UPDATED = 'July 2026'

const TERMS = [
  ['1. Who we are', 'MIRA is a menstrual-health companion built for the Menstrual Health Intelligence Network (MHIN). MIRA helps you log symptoms by voice, understand patterns, and share summaries with a doctor. It is a wellbeing and educational tool.'],
  ['2. Not medical advice', 'MIRA does not provide medical diagnosis or treatment. Everything it shows is a risk indicator or a pattern worth discussing with a qualified healthcare professional. Always consult a doctor for medical concerns. In an emergency, contact local emergency services.'],
  ['3. Your account & eligibility', 'You may use MIRA with an on-device profile or a MIRA account. You are responsible for keeping your login secure. MIRA is intended for people who menstruate and those supporting them; if you are under 18, please use MIRA with a parent or guardian.'],
  ['4. Acceptable use', 'Use MIRA only for your own health tracking or to support someone who has asked you to. Do not misuse the service, attempt to access other users’ data, or use MIRA to harm anyone.'],
  ['5. Voice & data you provide', 'You choose what to share. Voice is transcribed and the raw audio is discarded immediately — it is never stored. Data you log belongs to you and can be deleted at any time from Settings.'],
  ['6. Community insights', 'Aggregated, population-level insights are protected by a k≥10 suppression threshold — no statistic is shown for any group with fewer than 10 contributors. Your individual data is never exposed in community views.'],
  ['7. Service availability', 'MIRA is offered on an “as is” basis. Features may change, and some (voice, AI summaries) depend on third-party services and connectivity. We are not liable for indirect or incidental loss arising from use of the service.'],
  ['8. Changes', 'We may update these terms. Material changes will be communicated in the app. Continued use after an update means you accept the revised terms.'],
]

const PRIVACY = [
  ['1. Our promise', 'We keep your data safe, secure and private. We do not sell your personal or health data. Ever.'],
  ['2. What we collect', 'Only what you choose to share: your name and preferences; menstrual and symptom logs; period dates; optional profile details (age, city); and — if you enable it — your approximate location to find nearby clinics. Voice audio is used only to create a transcript and is then discarded.'],
  ['3. How we use it', 'To provide the service: show your cycle and trends, generate summaries and reports you request, offer food/activity suggestions, and — with your consent — contribute to anonymised community insights.'],
  ['4. Where it is stored', 'Data is stored on your device by default. If you create a MIRA account, it is stored securely in Appwrite Cloud under permissions that let only you access your own documents.'],
  ['5. Third parties', 'MIRA may use: Appwrite (accounts & storage), Anthropic (AI summaries — text only, never audio), a Tamil speech provider (voice, transcribed then discarded), and OpenStreetMap/Google Maps (finding clinics). We share the minimum needed and never sell data.'],
  ['6. Anonymised insights', 'Community statistics are aggregated and protected by a k≥10 suppression threshold (not differential privacy). Individuals are never identifiable in these views.'],
  ['7. Your rights', 'You can view, edit, export (as a PDF report), and delete your data at any time. “Delete my data” in Settings removes your local records; deleting your account removes your cloud data.'],
  ['8. Security', 'We use secure connections and document-level permissions. No system is perfectly secure, so please protect your login and device.'],
  ['9. Contact', 'For privacy questions, reach the MHIN team through the app. This policy may be updated; the date below shows the latest version.'],
]

export default function Legal({ doc = 'terms' }) {
  const isTerms = doc === 'terms'
  const title = isTerms ? 'Terms of Service' : 'Privacy Policy'
  const sections = isTerms ? TERMS : PRIVACY

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="glass-nav sticky top-0 z-10">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label="Home"><Logo withTagline /></Link>
          <Link to={isTerms ? '/privacy' : '/terms'} className="text-caption text-accent-secondary hover:underline">
            {isTerms ? 'Privacy Policy' : 'Terms of Service'}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 text-caption text-text-muted">Last updated {UPDATED} · MIRA, powered by MHIN</p>

        <div className="mt-8 space-y-6">
          {sections.map(([h, b]) => (
            <section key={h}>
              <h2 className="font-heading text-lg font-semibold text-text-primary">{h}</h2>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{b}</p>
            </section>
          ))}
        </div>

        <p className="mt-10 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-caption text-text-muted">
          This document is written in plain language for clarity and is not legal advice. MIRA is a
          wellbeing tool and does not replace professional medical care.
        </p>

        <div className="mt-8">
          <BackButton fallback="/onboarding" className="text-caption text-accent-secondary hover:underline">← Back</BackButton>
        </div>
      </main>
    </div>
  )
}
