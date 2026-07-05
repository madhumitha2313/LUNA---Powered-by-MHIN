import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import {
  MicIcon,
  BrainIcon,
  FileIcon,
  TrendIcon,
  StethoscopeIcon,
  UsersIcon,
  ShieldIcon,
  LeafIcon,
  HeartIcon,
  SparklesIcon,
  ArrowRightIcon,
} from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'

// title/body/points are translation KEYS resolved with t() at render.
const FEATURES = [
  { icon: MicIcon, tone: 'text-accent-secondary', title: 'ftVoiceT', body: 'ftVoiceB', points: ['ftVoiceP1', 'ftVoiceP2', 'ftVoiceP3'] },
  { icon: BrainIcon, tone: 'text-accent-ai', title: 'ftMemT', body: 'ftMemB', points: ['ftMemP1', 'ftMemP2', 'ftMemP3'] },
  { icon: FileIcon, tone: 'text-accent-secondary', title: 'ftDocT', body: 'ftDocB', points: ['ftDocP1', 'ftDocP2', 'ftDocP3'] },
  { icon: HeartIcon, tone: 'text-accent-secondary', title: 'ftCycleT', body: 'ftCycleB', points: ['ftCycleP1', 'ftCycleP2', 'ftCycleP3'] },
  { icon: SparklesIcon, tone: 'text-accent-ai', title: 'ftPcosT', body: 'ftPcosB', points: ['ftPcosP1', 'ftPcosP2', 'ftPcosP3'] },
  { icon: TrendIcon, tone: 'text-success', title: 'ftTrendT', body: 'ftTrendB', points: ['ftTrendP1', 'ftTrendP2', 'ftTrendP3'] },
  { icon: StethoscopeIcon, tone: 'text-accent-secondary', title: 'ftDocSumT', body: 'ftDocSumB', points: ['ftDocSumP1', 'ftDocSumP2', 'ftDocSumP3'] },
  { icon: UsersIcon, tone: 'text-accent-ai', title: 'ftCommT', body: 'ftCommB', points: ['ftCommP1', 'ftCommP2', 'ftCommP3'] },
  { icon: LeafIcon, tone: 'text-success', title: 'ftSustT', body: 'ftSustB', points: ['ftSustP1', 'ftSustP2', 'ftSustP3'] },
]

export default function Features() {
  const { t } = useT()
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>
          {t('ftBadge')}
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          {t('ftTitle')}
        </h1>
        <p className="mt-4 text-text-secondary">{t('ftSub')}</p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Card key={f.title} hover>
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] ${f.tone}`}
            >
              <f.icon size={24} />
            </span>
            <h3 className="mt-5 font-heading text-lg font-semibold">{t(f.title)}</h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-text-secondary">{t(f.body)}</p>
            <ul className="mt-4 space-y-2">
              {f.points.map((p) => (
                <li key={p} className="flex items-start gap-2 text-caption text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary/70" />
                  {t(p)}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-4 text-center">
        <ShieldIcon size={28} className="text-success" />
        <h2 className="font-heading text-2xl font-semibold">{t('ftPrivateT')}</h2>
        <p className="max-w-lg text-text-secondary">{t('ftPrivateB')}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button as={Link} to="/voice" size="lg">
            <MicIcon size={18} /> {t('navTalk')}
          </Button>
          <Button as={Link} to="/how-it-works" variant="secondary" size="lg">
            {t('ftHowItWorks')} <ArrowRightIcon size={16} />
          </Button>
        </div>
      </div>
    </PageShell>
  )
}
