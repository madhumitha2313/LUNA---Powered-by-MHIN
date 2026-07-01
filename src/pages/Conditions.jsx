import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { FileIcon, ShieldIcon, ArrowRightIcon, StethoscopeIcon } from '../components/ui/icons'

// Educational reference only — patterns to recognise and discuss, not a diagnosis.
const CONDITIONS = [
  { name: 'Polycystic Ovary Syndrome (PCOS)', menstrual: 'Irregular or missed periods', other: 'Acne, weight gain, excess facial hair, infertility', specialist: 'Gynaecologist / Endocrinologist' },
  { name: 'Polycystic Ovarian Disease (PCOD)', menstrual: 'Irregular periods', other: 'Weight gain, acne, ovarian cysts', specialist: 'Gynaecologist' },
  { name: 'Endometriosis', menstrual: 'Very painful periods', other: 'Pelvic pain, pain during intercourse, infertility', specialist: 'Gynaecologist' },
  { name: 'Uterine Fibroids', menstrual: 'Heavy bleeding', other: 'Pelvic pressure, prolonged periods', specialist: 'Gynaecologist' },
  { name: 'Adenomyosis', menstrual: 'Heavy, painful periods', other: 'Enlarged uterus, severe cramps', specialist: 'Gynaecologist' },
  { name: 'Iron Deficiency Anemia', menstrual: 'Heavy periods may lead to anemia', other: 'Fatigue, dizziness, weakness', specialist: 'Physician / Haematologist' },
  { name: 'Hypothyroidism', menstrual: 'Heavy or irregular periods', other: 'Weight gain, cold intolerance, fatigue', specialist: 'Endocrinologist' },
  { name: 'Hyperthyroidism', menstrual: 'Light or infrequent periods', other: 'Weight loss, palpitations, anxiety', specialist: 'Endocrinologist' },
  { name: 'PMDD (severe PMS)', menstrual: 'Severe symptoms before periods', other: 'Mood swings, low mood, irritability', specialist: 'Gynaecologist / Psychiatrist' },
]

export default function Conditions() {
  return (
    <PageShell>
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent" icon={<FileIcon size={14} />}>
          Reference
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          Conditions & menstrual changes
        </h1>
        <p className="mt-4 text-text-secondary">
          Common conditions linked to menstrual changes, the signs they often show, and the kind of
          specialist who treats them. This is a guide to recognise patterns — never a diagnosis.
        </p>
      </div>

      {/* Desktop table */}
      <Card className="mt-12 hidden overflow-hidden p-0 md:block">
        <table className="w-full border-collapse text-left text-[0.95rem]">
          <thead>
            <tr className="border-b border-white/[0.08] text-caption uppercase tracking-wide text-text-muted">
              <th className="px-6 py-4 font-medium">Condition</th>
              <th className="px-6 py-4 font-medium">Common menstrual changes</th>
              <th className="px-6 py-4 font-medium">Other symptoms</th>
              <th className="px-6 py-4 font-medium">Specialist</th>
            </tr>
          </thead>
          <tbody>
            {CONDITIONS.map((c) => (
              <tr key={c.name} className="border-b border-white/[0.05] transition-colors duration-250 hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-text-primary">{c.name}</td>
                <td className="px-6 py-4 text-text-secondary">{c.menstrual}</td>
                <td className="px-6 py-4 text-text-secondary">{c.other}</td>
                <td className="px-6 py-4 text-caption text-accent-secondary">{c.specialist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="mt-10 grid gap-4 md:hidden">
        {CONDITIONS.map((c) => (
          <Card key={c.name}>
            <h3 className="font-heading text-lg font-semibold">{c.name}</h3>
            <dl className="mt-3 space-y-2 text-caption">
              <Row k="Menstrual changes" v={c.menstrual} />
              <Row k="Other symptoms" v={c.other} />
              <Row k="Specialist" v={c.specialist} accent />
            </dl>
          </Card>
        ))}
      </div>

      <Card className="mt-8 flex items-start gap-3 bg-bg-secondary/40">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <p className="text-caption text-text-secondary">
          Many symptoms overlap between conditions, so only a clinician can diagnose. Use Mira to
          track your pattern, then take it to the right specialist.
        </p>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/symptoms" variant="secondary" size="lg">
          Track my symptoms
        </Button>
        <Button as={Link} to="/doctors" size="lg">
          <StethoscopeIcon size={16} /> Find a specialist <ArrowRightIcon size={16} />
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
