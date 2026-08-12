import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import BottomNav from '../components/layout/BottomNav'
import Logo from '../components/Logo'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { SparklesIcon, ArrowRightIcon, FileIcon } from '../components/ui/icons'
import { computeImpactData, generateImpactReport, impactToText } from '../lib/impactSummary'
import { generateImpactAI } from '../lib/impactApi'
import { getProfile } from '../lib/localStore'

/**
 * Health Impact Summary — a formal report for menstrual-leave advocacy.
 * Auto-filled from the user's own logs; fields are editable (pain day-1/2 are
 * estimates until per-day cycle data exists). AI mode uses the exact MHIN prompt.
 */
export default function Impact() {
  const seed = useMemo(() => computeImpactData({ anonymized: true }), [])
  const [anonymized, setAnonymized] = useState(true)
  const [userName, setUserName] = useState(getProfile().name || '')
  const [f, setF] = useState({
    cycles_logged: seed.cycles_logged,
    avg_cycle_length: seed.avg_cycle_length,
    avg_pain_day1: seed.avg_pain_day1,
    avg_pain_day2: seed.avg_pain_day2,
    avg_high_pain_days_per_cycle: seed.avg_high_pain_days_per_cycle,
    top_symptoms: seed.top_symptoms.join(', '),
  })
  const [aiText, setAiText] = useState('')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiErr, setAiErr] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }))

  const data = {
    cycles_logged: Number(f.cycles_logged) || 0,
    avg_cycle_length: Number(f.avg_cycle_length) || 28,
    avg_pain_day1: Number(f.avg_pain_day1) || 0,
    avg_pain_day2: Number(f.avg_pain_day2) || 0,
    avg_high_pain_days_per_cycle: Number(f.avg_high_pain_days_per_cycle) || 0,
    top_symptoms: f.top_symptoms.split(',').map((s) => s.trim()).filter(Boolean),
    anonymized,
    user_name: anonymized ? null : userName || null,
  }
  const report = generateImpactReport(data)
  const text = aiText || impactToText(report)

  async function generateAI() {
    setAiErr('')
    setAiBusy(true)
    try {
      setAiText(await generateImpactAI(data))
    } catch {
      setAiErr('Live AI needs the MIRA server (Anthropic) configured. The report below already follows the same MHIN prompt.')
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
      /* blocked */
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="mx-auto max-w-3xl px-5 pb-24 pt-28 sm:px-8">
        <div className="no-print">
          <div className="mx-auto max-w-2xl text-center">
            <Badge tone="accent" icon={<FileIcon size={14} />}>
              Advocacy
            </Badge>
            <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              Health Impact Summary
            </h1>
            <p className="mt-3 text-text-secondary">
              A formal, factual one-pager from your logged data — to request menstrual leave at your
              college or workplace. Numbers are pre-filled from your logs; edit if needed.
            </p>
          </div>

          <div className="mt-8 grid gap-4 rounded-card border border-white/10 bg-bg-card p-5 sm:grid-cols-2">
            <Num label="Cycles logged" v={f.cycles_logged} onChange={set('cycles_logged')} />
            <Num label="Average cycle length (days)" v={f.avg_cycle_length} onChange={set('avg_cycle_length')} />
            <Num label="Avg pain — Day 1 (1–10)" v={f.avg_pain_day1} onChange={set('avg_pain_day1')} />
            <Num label="Avg pain — Day 2 (1–10)" v={f.avg_pain_day2} onChange={set('avg_pain_day2')} />
            <Num label="Avg high-pain days / cycle (≥7)" v={f.avg_high_pain_days_per_cycle} onChange={set('avg_high_pain_days_per_cycle')} step="0.1" />
            <label className="block">
              <span className="mb-1.5 block text-caption text-text-muted">Top symptoms (comma-separated)</span>
              <input
                value={f.top_symptoms}
                onChange={set('top_symptoms')}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-[0.95rem] text-text-secondary">
              <input type="checkbox" checked={anonymized} onChange={(e) => setAnonymized(e.target.checked)} className="h-4 w-4 accent-accent-primary" />
              Anonymized report
            </label>
            {!anonymized && (
              <label className="block">
                <span className="mb-1.5 block text-caption text-text-muted">Your name</span>
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
                />
              </label>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={generateAI} variant="ai" size="md" disabled={aiBusy}>
              <SparklesIcon size={16} /> {aiBusy ? 'Generating…' : 'Generate with AI'}
            </Button>
            <Button onClick={() => window.print()} size="md">
              Download / Print PDF <ArrowRightIcon size={16} />
            </Button>
            <Button onClick={copy} variant="ghost" size="md">
              {copied ? 'Copied ✓' : 'Copy text'}
            </Button>
            {aiText && (
              <Button onClick={() => setAiText('')} variant="ghost" size="md">
                Use computed version
              </Button>
            )}
          </div>
          {aiErr && <p className="mt-3 text-caption text-warning">{aiErr}</p>}
        </div>

        {/* Printable report */}
        <div className="report-sheet card-base mt-8 p-8 sm:p-10">
          <div className="flex items-start justify-between border-b border-white/[0.1] pb-6">
            <div>
              <Logo withTagline />
              <p className="mt-3 font-heading text-lg font-semibold text-text-primary">{report.title}</p>
            </div>
            <div className="text-right text-caption text-text-secondary">
              <p>{report.date}</p>
              <p className="report-accent font-medium text-accent-secondary">{report.label}</p>
            </div>
          </div>

          {aiText ? (
            <div className="mt-6">
              <Badge tone="ai" icon={<SparklesIcon size={13} />}>AI-generated · MHIN prompt</Badge>
              <div className="mt-3 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-text-secondary">{aiText}</div>
            </div>
          ) : (
            report.sections.map((s) => (
              <section key={s.heading} className="mt-6">
                <h2 className="report-accent font-heading text-[0.95rem] font-semibold uppercase tracking-wide text-accent-secondary">
                  {s.heading}
                </h2>
                <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-text-secondary">{s.body}</p>
              </section>
            ))
          )}

          <p className="mt-8 border-t border-white/[0.1] pt-4 text-caption text-text-muted">
            Generated by MIRA · powered by MHIN — from self-reported data. Not a clinical diagnosis.
          </p>
        </div>

        <div className="no-print mt-8 flex justify-center">
          <Button as={Link} to="/report" variant="secondary" size="lg">
            See my clinical summary <ArrowRightIcon size={16} />
          </Button>
        </div>
      </main>
      <div className="no-print">
        <BottomNav />
      </div>
    </div>
  )
}

function Num({ label, v, onChange, step }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-caption text-text-muted">{label}</span>
      <input
        type="number"
        step={step || '1'}
        value={v}
        onChange={onChange}
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
      />
    </label>
  )
}
