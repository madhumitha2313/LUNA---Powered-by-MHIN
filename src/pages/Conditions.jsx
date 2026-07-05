import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { FileIcon, ShieldIcon, ArrowRightIcon, StethoscopeIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'

// Educational reference only — patterns to recognise and discuss, not a diagnosis.
// Every field is a translation KEY resolved with t() at render.
const CONDITIONS = [
  { name: 'cnd1n', menstrual: 'cnd1m', other: 'cnd1o', specialist: 'cnd1s' },
  { name: 'cnd2n', menstrual: 'cnd2m', other: 'cnd2o', specialist: 'cnd2s' },
  { name: 'cnd3n', menstrual: 'cnd3m', other: 'cnd3o', specialist: 'cnd3s' },
  { name: 'cnd4n', menstrual: 'cnd4m', other: 'cnd4o', specialist: 'cnd4s' },
  { name: 'cnd5n', menstrual: 'cnd5m', other: 'cnd5o', specialist: 'cnd5s' },
  { name: 'cnd6n', menstrual: 'cnd6m', other: 'cnd6o', specialist: 'cnd6s' },
  { name: 'cnd7n', menstrual: 'cnd7m', other: 'cnd7o', specialist: 'cnd7s' },
  { name: 'cnd8n', menstrual: 'cnd8m', other: 'cnd8o', specialist: 'cnd8s' },
  { name: 'cnd9n', menstrual: 'cnd9m', other: 'cnd9o', specialist: 'cnd9s' },
]

export default function Conditions() {
  const { t } = useT()
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent" icon={<FileIcon size={14} />}>
          {t('cndBadge')}
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          {t('cndTitle')}
        </h1>
        <p className="mt-4 text-text-secondary">{t('cndSub')}</p>
      </div>

      {/* Desktop table */}
      <Card className="mt-12 hidden overflow-hidden p-0 md:block">
        <table className="w-full border-collapse text-left text-[0.95rem]">
          <thead>
            <tr className="border-b border-white/[0.08] text-caption uppercase tracking-wide text-text-muted">
              <th className="px-6 py-4 font-medium">{t('cndThCondition')}</th>
              <th className="px-6 py-4 font-medium">{t('cndThMenstrual')}</th>
              <th className="px-6 py-4 font-medium">{t('cndThOther')}</th>
              <th className="px-6 py-4 font-medium">{t('cndThSpecialist')}</th>
            </tr>
          </thead>
          <tbody>
            {CONDITIONS.map((c) => (
              <tr key={c.name} className="border-b border-white/[0.05] transition-colors duration-250 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-text-primary">{t(c.name)}</td>
                <td className="px-6 py-4 text-text-secondary">{t(c.menstrual)}</td>
                <td className="px-6 py-4 text-text-secondary">{t(c.other)}</td>
                <td className="px-6 py-4 text-caption text-accent-secondary">{t(c.specialist)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="mt-10 grid gap-4 md:hidden">
        {CONDITIONS.map((c) => (
          <Card key={c.name}>
            <h3 className="font-heading text-lg font-semibold">{t(c.name)}</h3>
            <dl className="mt-3 space-y-2 text-caption">
              <Row k={t('cndThMenstrual')} v={t(c.menstrual)} />
              <Row k={t('cndThOther')} v={t(c.other)} />
              <Row k={t('cndThSpecialist')} v={t(c.specialist)} accent />
            </dl>
          </Card>
        ))}
      </div>

      <Card className="mt-8 flex items-start gap-3 bg-bg-secondary/40">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <p className="text-caption text-text-secondary">{t('cndSafety')}</p>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/symptoms" variant="secondary" size="lg">
          {t('cndTrackBtn')}
        </Button>
        <Button as={Link} to="/doctors" size="lg">
          <StethoscopeIcon size={16} /> {t('cndFindBtn')} <ArrowRightIcon size={16} />
        </Button>
      </div>
    </PageShell>
  )
}

function Row({ k, v, accent }) {
  return (
    <div className="flex flex-col">
      <dt className="text-text-muted">{k}</dt>
      <dd className={accent ? 'text-accent-secondary' : 'text-text-secondary'}>{v}</dd>
    </div>
  )
}
