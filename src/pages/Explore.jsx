import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import { ArrowRightIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'

// Every page that used to be reachable only through one line of small-print
// footer text now lives here, grouped by what it actually is — same pages,
// same destinations, just organized instead of buried.
const CATEGORIES = [
  {
    key: 'exploreCatVision',
    items: [
      { emoji: '💡', to: '/how-it-works', t: 'exHowItWorksT', d: 'exHowItWorksD' },
      { emoji: '🗺️', to: '/roadmap', t: 'exRoadmapT', d: 'exRoadmapD' },
      { emoji: '🛡️', to: '/trust', t: 'exTrustT', d: 'exTrustD' },
      { emoji: '🏗️', to: '/platform', t: 'exPlatformT', d: 'exPlatformD' },
    ],
  },
  {
    key: 'exploreCatAI',
    items: [
      { emoji: '🫂', to: '/twin', t: 'exTwinT', d: 'exTwinD' },
      { emoji: '⌚', to: '/wearables', t: 'exWearablesT', d: 'exWearablesD' },
      { emoji: '🔬', to: '/research', t: 'exResearchT', d: 'exResearchD' },
    ],
  },
  {
    key: 'exploreCatEcosystem',
    items: [
      { emoji: '🏥', to: '/healthcare', t: 'exHealthcareT', d: 'exHealthcareD' },
      { emoji: '💬', to: '/community', t: 'exCommunityT', d: 'exCommunityD' },
      { emoji: '🛍️', to: '/marketplace', t: 'exMarketplaceT', d: 'exMarketplaceD' },
      { emoji: '✨', to: '/premium', t: 'exPremiumT', d: 'exPremiumD' },
    ],
  },
  {
    key: 'exploreCatDev',
    items: [
      { emoji: '👩‍💻', to: '/developers', t: 'exDevelopersT', d: 'exDevelopersD' },
      { emoji: '🎨', to: '/design', t: 'exDesignT', d: 'exDesignD' },
      { emoji: '⚙️', to: '/admin', t: 'exAdminT', d: 'exAdminD' },
    ],
  },
]

export default function Explore() {
  const { t } = useT()
  return (
    <PageShell max="max-w-5xl">
      <div className="mb-8 max-w-xl">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">{t('exploreTitle')}</h1>
        <p className="mt-2 text-text-secondary">{t('exploreSub')}</p>
      </div>

      <div className="space-y-8">
        {CATEGORIES.map((cat) => (
          <section key={cat.key}>
            <h2 className="mb-3 font-heading text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-accent-secondary">
              {t(cat.key)}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {cat.items.map((it) => (
                <Card key={it.to} as={Link} to={it.to} hover className="flex items-start gap-3.5 p-5">
                  <span className="text-2xl">{it.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-heading font-semibold text-text-primary">{t(it.t)}</h3>
                    <p className="mt-1 text-caption text-text-secondary">{t(it.d)}</p>
                  </div>
                  <ArrowRightIcon size={16} className="mt-1 shrink-0 text-text-muted" />
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  )
}
