import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { SparklesIcon, ArrowRightIcon, HeartIcon } from '../components/ui/icons'
import { generateGuide, guideToText } from '../lib/readinessGuide'
import { generateGuideAI, guideApiAvailable } from '../lib/guideApi'
import GuideJourney from '../components/GuideJourney'

const RELATIONSHIPS = [
  { key: 'sister', label: 'Older sister' },
  { key: 'parent', label: 'Parent' },
  { key: 'teacher', label: 'Teacher' },
  { key: 'ngo', label: 'NGO worker' },
]
const LANGUAGES = ['English', 'Tamil', 'Telugu']

/**
 * First Period Readiness Guide (MHIN) — pick age / language / relationship /
 * community insight and generate a warm, age-appropriate guide to print or share.
 */
export default function Guide() {
  const [age, setAge] = useState(12)
  const [language, setLanguage] = useState('English')
  const [relationship, setRelationship] = useState('sister')
  const [insight, setInsight] = useState('')
  const [copied, setCopied] = useState(false)
  const [aiText, setAiText] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiErr, setAiErr] = useState('')

  const guide = useMemo(
    () => generateGuide({ age, language, relationship, insight }),
    [age, language, relationship, insight]
  )

  // Prefer live AI output when present; otherwise the offline template.
  const text = aiText || guideToText(guide)
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`

  async function generateAI() {
    setAiErr('')
    setAiBusy(true)
    try {
      const t = await generateGuideAI({ age, language, relationship, insight })
      setAiText(t)
    } catch {
      setAiErr(
        guideApiAvailable
          ? 'Live generation failed — please retry.'
          : 'Live AI needs the MIRA server (Anthropic) configured. The guide below already follows the same MHIN prompt.'
      )
    } finally {
      setAiBusy(false)
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        {/* Controls */}
        <div className="no-print">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="accent" icon={<HeartIcon size={14} />}>
              MHIN · First Period Readiness
            </Badge>
            <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              First Period Readiness Guide
            </h1>
            <p className="mt-3 text-text-secondary">
              A warm, age-appropriate guide to prepare a young girl — ready to print or share on
              WhatsApp.
            </p>
          </div>

          <div className="mt-8 grid gap-4 rounded-card border border-white/10 bg-bg-card p-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">Age (10–14)</span>
              <select
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
              >
                {[10, 11, 12, 13, 14].map((a) => (
                  <option key={a} value={a} className="bg-bg-card">{a} years</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">Language</span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
              >
                {LANGUAGES.map((l) => (
                  <option key={l} value={l} className="bg-bg-card">{l}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">Prepared by</span>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r.key} value={r.key} className="bg-bg-card">{r.label}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">Community insight (optional)</span>
              <input
                value={insight}
                onChange={(e) => setInsight(e.target.value)}
                placeholder="e.g. 6 in 10 girls here miss school during periods"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={generateAI} variant="ai" size="md" disabled={aiBusy}>
              <SparklesIcon size={16} /> {aiBusy ? 'Generating…' : 'Generate with AI'}
            </Button>
            <Button onClick={() => window.print()} size="md">
              Download / Print PDF <ArrowRightIcon size={16} />
            </Button>
            <Button as="a" href={whatsapp} target="_blank" rel="noopener" variant="secondary" size="md">
              Share on WhatsApp
            </Button>
            <Button onClick={copy} variant="ghost" size="md">
              {copied ? 'Copied ✓' : 'Copy text'}
            </Button>
            {aiText && (
              <Button onClick={() => setAiText('')} variant="ghost" size="md">
                Use instant version
              </Button>
            )}
          </div>
          {aiErr && <p className="mt-3 text-caption text-warning">{aiErr}</p>}
        </div>

        {/* Animated, step-by-step learning experience for a first-time reader */}
        <div className="no-print mt-8">
          <GuideJourney />
        </div>

        {/* The guide sheet (printable) */}
        <div className="report-sheet card-base mt-8 p-8 sm:p-10">
          <div className="flex items-start justify-between border-b border-white/[0.1] pb-6">
            <div>
              <Logo withTagline />
              <p className="mt-3 font-heading text-xl font-semibold text-text-primary">{guide.title}</p>
              <p className="text-caption text-text-secondary">{guide.metaLabel}</p>
            </div>
            <Badge tone="ai" icon={<SparklesIcon size={13} />}>{guide.languageLabel}</Badge>
          </div>

          {aiText ? (
            <div className="mt-6">
              <Badge tone="ai" icon={<SparklesIcon size={13} />}>AI-generated · MHIN prompt</Badge>
              <div className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-text-secondary">
                {aiText}
              </div>
            </div>
          ) : (
            <>
              {guide.sections.map((s) => (
                <section key={s.heading} className="mt-6">
                  <h2 className="report-accent font-heading text-lg font-semibold text-accent-secondary">
                    {s.heading}
                  </h2>
                  <div className="mt-2 space-y-3">
                    {s.blocks.map((b, i) => (
                      <Block key={i} block={b} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Note to requester */}
              <section className="mt-8 rounded-xl border border-accent-primary/20 bg-accent-primary/[0.06] p-5">
                <h2 className="report-accent font-heading text-lg font-semibold text-accent-secondary">
                  {guide.note.heading}
                </h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-text-secondary">{guide.note.text}</p>
              </section>
            </>
          )}

          <p className="mt-6 border-t border-white/[0.1] pt-4 text-caption text-text-muted">
            MIRA · powered by MHIN — shared to support, never to diagnose.
          </p>
        </div>

        <div className="no-print mt-8 flex justify-center">
          <Button as={Link} to="/conditions" variant="secondary" size="lg">
            Explore health conditions <ArrowRightIcon size={16} />
          </Button>
        </div>
      </main>
      <div className="no-print">
        <BottomNav />
      </div>
    </div>
  )
}

function Block({ block: b }) {
  if (b.type === 'p') return <p className="text-[0.95rem] leading-relaxed text-text-secondary">{b.text}</p>
  if (b.type === 'ul')
    return (
      <ul className="space-y-1.5">
        {b.items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-[0.95rem] text-text-secondary">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary/70" />
            {i}
          </li>
        ))}
      </ul>
    )
  if (b.type === 'ol')
    return (
      <ol className="space-y-2">
        {b.items.map((i, n) => (
          <li key={i} className="flex items-start gap-3 text-[0.95rem] text-text-secondary">
            <span className="report-accent font-stat text-caption font-semibold text-accent-secondary">{n + 1}.</span>
            {i}
          </li>
        ))}
      </ol>
    )
  if (b.type === 'kit')
    return (
      <div className="space-y-2.5">
        {b.items.map((i) => (
          <div key={i.t} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="font-medium text-text-primary">{i.t}</p>
            <p className="text-caption text-text-secondary">{i.d}</p>
          </div>
        ))}
      </div>
    )
  if (b.type === 'qa')
    return (
      <div className="space-y-3">
        {b.items.map((i) => (
          <div key={i.q}>
            <p className="font-medium text-text-primary">{i.q}</p>
            <p className="mt-0.5 text-[0.95rem] text-text-secondary">{i.a}</p>
          </div>
        ))}
      </div>
    )
  if (b.type === 'callout')
    return (
      <div className="rounded-xl border border-warning/25 bg-warning/[0.08] p-4">
        <p className="mb-2 font-medium text-warning">{b.label}</p>
        <ul className="space-y-1.5">
          {b.items.map((i) => (
            <li key={i} className="flex items-start gap-2 text-caption text-text-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning/70" />
              {i}
            </li>
          ))}
        </ul>
      </div>
    )
  return null
}
