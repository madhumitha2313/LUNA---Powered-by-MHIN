import { useState } from 'react'
import { Link } from 'react-router-dom'
import BackButton from '../components/ui/BackButton'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useT } from '../lib/i18n.jsx'

/**
 * MIRA Product Roadmap & Launch (Part 20). A presentation-worthy strategy
 * surface: the phased journey from MVP to a global ecosystem, mapping what's
 * already built in this app to the roadmap, a clickable <10-min investor demo
 * flow, KPIs/OKRs, QA + security readiness, risks, and the future vision.
 */

const JOURNEY = ['Idea', 'Prototype', 'MVP', 'Beta', 'Public launch', 'Premium', 'Global ecosystem']

// done ✓ | partial ◐ | planned ○  (honest status of THIS build)
const PHASES = [
  { n: 1, title: 'Foundation', items: [
    ['Brand identity', 'done'], ['Authentication', 'done'], ['Onboarding', 'done'], ['Dashboard', 'done'],
    ['AI companion', 'done'], ['Cycle tracker', 'done'], ['AI memory', 'done'], ['Profile & settings', 'done'],
  ] },
  { n: 2, title: 'Health Intelligence', items: [
    ['Mood tracker', 'done'], ['Nutrition AI', 'done'], ['Learning Hub', 'done'], ['Health conditions', 'done'],
    ['Reminders', 'done'], ['Notifications', 'partial'], ['Health reports', 'partial'], ['Document intelligence', 'partial'],
  ] },
  { n: 3, title: 'Advanced AI', items: [
    ['Voice AI', 'done'], ['Health Journey', 'done'], ['AI predictions', 'done'], ['Digital Twin', 'done'],
    ['Recommendation engine', 'done'], ['AI memory expansion', 'done'], ['Multilingual', 'done'], ['RAG knowledge', 'done'],
  ] },
  { n: 4, title: 'Premium Experience', items: [
    ['AI avatar', 'done'], ['Interactive 3D-style models', 'done'], ['Gamification', 'done'], ['Achievements', 'done'],
    ['Emergency mode', 'done'], ['Care circle', 'done'], ['Advanced analytics', 'done'], ['Wearable integration', 'planned'],
  ] },
  { n: 5, title: 'Enterprise & Ecosystem', items: [
    ['Doctor portal', 'done'], ['Nutritionist portal', 'done'], ['CMS', 'done'], ['Admin panel', 'done'],
    ['Analytics dashboard', 'done'], ['Developer platform', 'done'], ['Telemedicine', 'planned'], ['Insurance / research APIs', 'planned'],
  ] },
]

const DEMO = [
  ['🌸', 'Splash & onboarding', '/onboarding'], ['🏠', 'Dashboard', '/home'], ['🎙️', 'AI conversation', '/voice'],
  ['🩸', 'Cycle intelligence', '/cycle'], ['🥗', 'Nutrition + food AI', '/nutrition'], ['🌟', 'Health Journey', '/journey'],
  ['🧠', 'MIRA Core (Digital Twin)', '/mira'], ['🛰️', 'Admin dashboard', '/admin'], ['🧩', 'Developer platform', '/developers'],
]

const KPIS = [
  ['DAU / MAU', 'Engagement'], ['Retention', '30-day'], ['Onboarding completion', 'Target 95%'],
  ['AI conversation rate', 'Trust'], ['Weekly logging', 'Target 70%'], ['Crash-free sessions', '>99.5%'],
  ['CSAT', 'Satisfaction'], ['NPS', 'Advocacy'],
]

const OKRS = [
  ['Deliver a delightful onboarding', '95% completion rate'],
  ['Increase daily engagement', 'Avg session > 10 min'],
  ['Improve tracking consistency', '70% weekly logging'],
  ['Build trust in AI', 'High AI-conversation satisfaction'],
]

const PERF = [
  ['App launch', '< 2s'], ['Dashboard', '< 2s'], ['AI response', '< 3s'], ['Voice', '< 2s'], ['Frame rate', '60 FPS'], ['Crash rate', '< 0.5%'],
]

const SECURITY = ['Encryption', 'Authentication', 'Authorization', 'Input validation', 'Rate limiting', 'Privacy controls', 'Consent management', 'Audit logs', 'API protection']

const RISKS = [
  ['AI inaccuracy / misinformation', 'Safety guardrails · human-reviewed content · "not a diagnosis"'],
  ['Low engagement', 'Health Journey · gentle reminders · gamification'],
  ['Performance issues', 'Caching · lazy loading · monitoring'],
  ['Security vulnerabilities', 'Reviews · least-privilege · audit trails'],
  ['Model cost', 'Model routing · caching · fallbacks'],
]

const RELEASE = ['Development', 'Internal QA', 'Closed beta', 'Open beta', 'Soft launch', 'Regional launch', 'Global launch']

const VISION = ['Telemedicine', 'Remote monitoring', 'Clinical research', 'AI health coaching', 'Wearables & smart rings', 'Insurance partnerships', 'Hospital systems', 'Wellness community', 'Developer marketplace']

const DOT = { done: 'text-success', partial: 'text-warning', planned: 'text-text-muted' }
const MARK = { done: '✓', partial: '◐', planned: '○' }

export default function Roadmap() {
  const { t } = useT()
  const [tab, setTab] = useState('roadmap')
  const built = PHASES.flatMap((p) => p.items).filter(([, s]) => s === 'done').length
  const total = PHASES.flatMap((p) => p.items).length

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="text-center">
          <Badge tone="ai">{t('rmBadge')}</Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('rmTitle')}</h1>
          <p className="mt-2 text-text-secondary">{t('rmSub')}</p>
          {/* Journey rail */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {JOURNEY.map((j, i) => (
              <div key={j} className="flex items-center gap-2">
                <span className={`rounded-pill px-3 py-1.5 text-caption font-medium ${i <= 4 ? 'bg-accent-primary/15 text-accent-secondary' : 'border border-white/10 text-text-muted'}`}>{j}</span>
                {i < JOURNEY.length - 1 && <span className="text-text-muted">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-caption text-text-muted">{built}/{total} {t('rmBuilt')}</p>
        </div>

        {/* tabs */}
        <div className="mx-auto mt-8 flex w-fit flex-wrap justify-center gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1">
          {[['roadmap', t('rmTabRoadmap')], ['demo', t('rmTabDemo')], ['metrics', t('rmTabMetrics')], ['readiness', t('rmTabReadiness')]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`rounded-pill px-4 py-1.5 text-caption font-medium transition ${tab === k ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>{label}</button>
          ))}
        </div>

        <div className="mt-8">
          {tab === 'roadmap' && <RoadmapTab t={t} />}
          {tab === 'demo' && <DemoTab t={t} />}
          {tab === 'metrics' && <MetricsTab t={t} />}
          {tab === 'readiness' && <ReadinessTab t={t} />}
        </div>

        <p className="mt-10 text-center text-[0.75rem] text-text-muted">
          <BackButton fallback="/home" className="hover:text-accent-secondary">← {t('admBackApp')}</BackButton>
        </p>
      </div>
    </div>
  )
}

function RoadmapTab() {
  return (
    <div className="space-y-4">
      {PHASES.map((p) => {
        const done = p.items.filter(([, s]) => s === 'done').length
        return (
          <Card key={p.n}>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-primary/15 font-stat font-bold text-accent-secondary">{p.n}</span>
              <h3 className="font-heading text-lg font-semibold">{p.title}</h3>
              <Badge tone={done === p.items.length ? 'success' : 'warning'} className="ml-auto">{done}/{p.items.length}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {p.items.map(([name, status]) => (
                <div key={name} className="flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5">
                  <span className={`${DOT[status]} shrink-0`}>{MARK[status]}</span>
                  <span className="text-[0.8rem] leading-snug text-text-secondary">{name}</span>
                </div>
              ))}
            </div>
          </Card>
        )
      })}
      <p className="text-center text-caption text-text-muted">✓ built · ◐ partial · ○ planned</p>
    </div>
  )
}

function DemoTab({ t }) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-[#d97ba8]/[0.12] to-transparent text-center">
        <h3 className="font-heading text-lg font-semibold">🎬 {t('rmDemoTitle')}</h3>
        <p className="mt-1 text-caption text-text-secondary">{t('rmDemoSub')}</p>
      </Card>
      <ol className="space-y-2">
        {DEMO.map(([e, label, to], i) => (
          <li key={label}>
            <Link to={to} className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition hover:border-accent-primary/40 hover:bg-white/[0.04]">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-primary/15 text-caption font-bold text-accent-secondary">{i + 1}</span>
              <span className="text-xl">{e}</span>
              <span className="font-heading font-medium text-text-primary">{label}</span>
              <span className="ml-auto text-accent-primary transition group-hover:translate-x-1">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

function MetricsTab({ t }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-heading font-semibold">📊 {t('rmKpis')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {KPIS.map(([k, sub]) => <Card key={k} className="p-4"><p className="font-heading text-[0.9rem] font-semibold">{k}</p><p className="mt-0.5 text-caption text-text-muted">{sub}</p></Card>)}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-heading font-semibold">🎯 {t('rmOkrs')}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {OKRS.map(([o, kr]) => (
            <Card key={o}><p className="font-heading font-medium text-text-primary">{o}</p><p className="mt-2 flex items-center gap-2 text-caption text-accent-secondary"><span className="text-success">▸</span> {kr}</p></Card>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-heading font-semibold">🚀 {t('rmRelease')}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {RELEASE.map((r, i) => (
            <div key={r} className="flex items-center gap-2">
              <span className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-caption text-text-secondary">{r}</span>
              {i < RELEASE.length - 1 && <span className="text-text-muted">→</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReadinessTab({ t }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 font-heading font-semibold">⚡ {t('rmPerf')}</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PERF.map(([k, v]) => <Card key={k} className="p-4 text-center"><p className="font-stat text-lg font-bold text-success">{v}</p><p className="text-caption text-text-muted">{k}</p></Card>)}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-heading font-semibold">🔒 {t('rmSecurity')}</h3>
        <div className="flex flex-wrap gap-2">
          {SECURITY.map((s) => <span key={s} className="rounded-pill bg-success/10 px-3 py-1.5 text-caption text-success">✓ {s}</span>)}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-heading font-semibold">⚠️ {t('rmRisks')}</h3>
        <div className="space-y-2">
          {RISKS.map(([r, m]) => (
            <Card key={r} className="flex flex-col gap-1 sm:flex-row sm:items-center">
              <p className="text-[0.88rem] text-text-primary sm:w-1/3">{r}</p>
              <p className="flex items-start gap-2 text-caption text-text-secondary sm:flex-1"><span className="text-success">→</span> {m}</p>
            </Card>
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 font-heading font-semibold">🌏 {t('rmVision')}</h3>
        <div className="flex flex-wrap gap-2">
          {VISION.map((v) => <span key={v} className="rounded-pill border border-accent-ai/20 bg-accent-ai/[0.06] px-3 py-1.5 text-caption text-text-secondary">{v}</span>)}
        </div>
      </div>
    </div>
  )
}
