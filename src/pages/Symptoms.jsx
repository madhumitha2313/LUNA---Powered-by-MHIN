import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, StethoscopeIcon, ShieldIcon, ArrowRightIcon } from '../components/ui/icons'
import { getSymptoms, saveSymptoms } from '../lib/localStore'
import { useT } from '../lib/i18n.jsx'

// Common PCOS/PCOD symptoms, grouped. Educational — never diagnostic.
// title/label are translation KEYS resolved with t() at render.
const GROUPS = [
  {
    title: 'grpCycle',
    items: [
      ['irregular', 'symIrregular'],
      ['heavy', 'symHeavy'],
      ['spotting', 'symSpotting'],
      ['pelvic_pain', 'symPelvic'],
    ],
  },
  {
    title: 'grpSkin',
    items: [
      ['acne', 'symAcne'],
      ['hirsutism', 'symHirsutism'],
      ['hair_thinning', 'symHairThin'],
      ['dark_patches', 'symDarkPatch'],
    ],
  },
  {
    title: 'grpMetabolic',
    items: [
      ['weight', 'symWeight'],
      ['cravings', 'symCravings'],
      ['bloating', 'symBloating'],
    ],
  },
  {
    title: 'grpMood',
    items: [
      ['mood', 'symMood'],
      ['fatigue', 'symFatigue'],
      ['sleep', 'symSleep'],
    ],
  },
]

export default function Symptoms() {
  const { t } = useT()
  const [selected, setSelected] = useState(() => getSymptoms())

  function toggle(key) {
    setSelected((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (!next[key]) delete next[key]
      saveSymptoms(next)
      return next
    })
  }

  const count = Object.values(selected).filter(Boolean).length

  return (
    <PageShell max="max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>
          PCOS / PCOD
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
          {t('symTitle')}
        </h1>
        <p className="mt-4 text-text-secondary">{t('symIntro')}</p>
      </div>

      {/* Summary */}
      <Card className="mt-10 flex flex-wrap items-center justify-between gap-4 bg-bg-secondary/50">
        <div>
          <p className="font-stat text-3xl font-bold text-text-primary">{count}</p>
          <p className="text-caption text-text-secondary">{t('symTracked')}</p>
        </div>
        <p className="max-w-sm text-caption text-text-secondary">
          {count === 0 ? t('symSummary0') : count >= 4 ? t('symSummaryMany') : t('symSummaryFew')}
        </p>
      </Card>

      {/* Groups */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.title}>
            <h2 className="mb-4 font-heading text-lg font-semibold">{t(g.title)}</h2>
            <div className="space-y-2.5">
              {g.items.map(([key, label]) => {
                const on = !!selected[key]
                return (
                  <button
                    key={key}
                    onClick={() => toggle(key)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-all duration-250 ease-luna ${
                      on
                        ? 'border-accent-primary/40 bg-accent-primary/10 text-text-primary'
                        : 'border-white/[0.08] bg-white/[0.02] text-text-secondary hover:border-white/20'
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        on ? 'border-accent-primary bg-accent-primary text-bg-primary' : 'border-white/20'
                      }`}
                    >
                      {on && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </span>
                    {t(label)}
                  </button>
                )
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Safety note */}
      <Card className="mt-6 flex items-start gap-3 bg-bg-secondary/40">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <p className="text-caption text-text-secondary">{t('symSafety')}</p>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/tracker" variant="secondary" size="lg">
          {t('trackerTitle')}
        </Button>
        <Button as={Link} to="/voice" size="lg">
          <StethoscopeIcon size={16} /> {t('logByVoice')} <ArrowRightIcon size={16} />
        </Button>
      </div>
    </PageShell>
  )
}
