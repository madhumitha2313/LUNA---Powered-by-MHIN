import { useState } from 'react'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, MicIcon, HeartIcon, LeafIcon } from '../components/ui/icons'
import MiraAvatar from '../components/MiraAvatar'

/**
 * MIRA Design System — a living style guide. One page documenting the design
 * language: tokens (color, type, spacing, radius, motion), and the component
 * library rendered live so it always reflects the real, shipped UI.
 */

const COLORS = {
  Background: [
    ['Primary', '#0d1117'], ['Secondary', '#171c28'], ['Card', '#1e2433'], ['Glass', 'rgba(255,255,255,0.08)'],
  ],
  'Brand · Pink': [
    ['Rose', '#ff5ca8'], ['Premium', '#ff3d8b'], ['Hot', '#ff2e8a'], ['Soft', '#ff8cc5'], ['Light', '#ffd6e7'], ['Accent', '#d97ba8'],
  ],
  Secondary: [
    ['Lavender', '#c084fc'], ['AI Purple', '#a78bfa'], ['Sky', '#60a5fa'], ['Mint', '#4ade80'], ['Gold', '#facc15'],
  ],
  Status: [
    ['Success', '#22c55e'], ['Warning', '#f59e0b'], ['Error', '#ef4444'], ['Info', '#3b82f6'],
  ],
}

const PRINCIPLES = ['Rounded everything', 'Soft motion', 'Premium whitespace', 'Glassmorphism', 'Minimal icons', 'Accessibility first', 'Less text, more visuals']

export default function DesignSystem() {
  const [tab, setTab] = useState('foundations')
  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>Design System</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">MIRA Design Language</h1>
        <p className="mt-2 text-text-secondary">The tokens, components and motion that make every screen feel like MIRA.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {PRINCIPLES.map((p) => <span key={p} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1 text-caption text-text-secondary">{p}</span>)}
        </div>
      </div>

      {/* section tabs */}
      <div className="sticky top-2 z-10 mx-auto mt-6 flex w-fit gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {['foundations', 'components'].map((s) => (
          <button key={s} onClick={() => setTab(s)} className={`rounded-pill px-4 py-1.5 text-caption font-medium capitalize transition ${tab === s ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>{s}</button>
        ))}
      </div>

      {tab === 'foundations' ? <Foundations /> : <Components />}

      <div className="h-16" />
    </PageShell>
  )
}

function Section({ title, sub, children }) {
  return (
    <section className="mt-10">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      {sub && <p className="mt-1 text-caption text-text-muted">{sub}</p>}
      <div className="mt-4">{children}</div>
    </section>
  )
}

function Foundations() {
  return (
    <>
      <Section title="Color" sub="CSS-variable tokens — the single source of truth.">
        <div className="space-y-5">
          {Object.entries(COLORS).map(([group, list]) => (
            <div key={group}>
              <p className="mb-2 text-caption text-text-secondary">{group}</p>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-6">
                {list.map(([name, hex]) => (
                  <div key={name} className="overflow-hidden rounded-2xl border border-white/[0.06]">
                    <div className="h-14" style={{ background: hex }} />
                    <div className="bg-white/[0.02] p-2">
                      <p className="text-[0.72rem] font-medium text-text-primary">{name}</p>
                      <p className="text-[0.62rem] text-text-muted">{hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" sub="General Sans headings · Inter body · Manrope stats.">
        <Card className="space-y-3">
          <p className="font-heading text-4xl font-semibold">Display 48</p>
          <p className="font-heading text-2xl font-semibold">Heading 32</p>
          <p className="font-heading text-lg font-semibold">Subhead 18</p>
          <p className="text-[0.95rem] text-text-secondary">Body — readable, calm and warm. Comfortable line height for long reads.</p>
          <p className="text-caption text-text-muted">Caption 13 — supporting detail.</p>
          <p className="font-stat text-3xl font-bold">128<span className="text-base text-text-muted"> stat</span></p>
        </Card>
      </Section>

      <Section title="Spacing" sub="8px base grid.">
        <div className="flex flex-wrap items-end gap-3">
          {[4, 8, 12, 16, 24, 32, 48, 64].map((n) => (
            <div key={n} className="text-center">
              <div className="rounded-lg bg-accent-primary/40" style={{ width: n, height: n }} />
              <p className="mt-1 text-[0.62rem] text-text-muted">{n}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radius" sub="Chips 100px · inputs 18px · buttons 20px · cards 28px · dialogs 32px.">
        <div className="flex flex-wrap gap-3">
          {[['input', 18], ['button', 20], ['card', 28], ['dialog', 32], ['chip', 100]].map(([n, r]) => (
            <div key={n} className="grid h-20 w-20 place-items-center border border-white/10 bg-white/[0.03] text-[0.62rem] text-text-muted" style={{ borderRadius: r }}>{n}</div>
          ))}
        </div>
      </Section>

      <Section title="Elevation" sub="Soft, diffuse, never harsh.">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-bg-card p-5 shadow-soft"><p className="text-caption text-text-secondary">shadow-soft</p></div>
          <div className="rounded-3xl bg-bg-card p-5 shadow-lift"><p className="text-caption text-text-secondary">shadow-lift</p></div>
          <div className="rounded-3xl bg-bg-card p-5 shadow-glow"><p className="text-caption text-text-secondary">shadow-glow</p></div>
        </div>
      </Section>

      <Section title="Motion" sub="Spring + standard easing, 150 / 250 / 400ms.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[['Spring', 'var(--ease-spring)'], ['Standard', 'var(--ease-standard)'], ['Glow pulse', '']].map(([n], i) => (
            <div key={n} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-accent-secondary to-accent-primary ${i === 2 ? 'animate-glow-pulse' : 'animate-float'}`} />
              <p className="mt-2 text-caption text-text-secondary">{n}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}

function Components() {
  const [val, setVal] = useState('')
  return (
    <>
      <Section title="Buttons" sub="Primary · secondary · AI · ghost · danger, with states.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ai"><SparklesIcon size={16} /> AI</Button>
          <Button variant="ghost">Ghost</Button>
          <button className="rounded-pill bg-danger/90 px-5 py-2.5 text-[0.95rem] font-semibold text-white transition active:scale-[0.97]">Danger</button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary"><span className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-accent-secondary" style={{ animationDelay: `${i * 150}ms` }} />)}</span> Loading</Button>
        </div>
      </Section>

      <Section title="Chips & badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="ai" icon={<SparklesIcon size={12} />}>AI</Badge>
          <Badge tone="success">Success</Badge>
          <Badge tone="warning">Warning</Badge>
          <Badge tone="danger">Danger</Badge>
          <Badge tone="accent">Accent</Badge>
          <span className="rounded-pill border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-caption text-text-secondary">Selectable chip</span>
          <span className="rounded-pill bg-accent-primary px-3.5 py-1.5 text-caption text-bg-primary">Selected</span>
        </div>
      </Section>

      <Section title="Input" sub="Rounded 18px, glow on focus.">
        <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Type something…"
          className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:shadow-glow focus:outline-none" />
      </Section>

      <Section title="Cards" sub="Floating, glass, interactive.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card hover><div className="flex items-center gap-2"><HeartIcon size={18} className="text-accent-secondary" /><p className="font-heading font-semibold">Mood</p></div><p className="mt-2 text-caption text-text-secondary">Happy · calm</p></Card>
          <Card hover><div className="flex items-center gap-2"><LeafIcon size={18} className="text-success" /><p className="font-heading font-semibold">Nutrition</p></div><p className="mt-2 text-caption text-text-secondary">Iron-rich lunch</p></Card>
          <Card hover><div className="flex items-center gap-2"><MicIcon size={18} className="text-accent-ai" /><p className="font-heading font-semibold">Talk</p></div><p className="mt-2 text-caption text-text-secondary">Ask MIRA anything</p></Card>
        </div>
      </Section>

      <Section title="Progress ring & AI avatar">
        <div className="flex flex-wrap items-center gap-8">
          <Ring pct={72} />
          <MiraAvatar state="idle" emotion="happy" size={90} level={4} />
          <MiraAvatar state="thinking" emotion="neutral" size={90} />
        </div>
      </Section>

      <Section title="Loading" sub="Never a spinner — thinking dots + gradient pulse.">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 animate-bounce rounded-full bg-accent-secondary" style={{ animationDelay: `${i * 150}ms` }} />)}</div>
          <div className="h-2 w-40 overflow-hidden rounded-pill bg-white/[0.06]"><div className="h-full w-1/2 animate-glow-pulse rounded-pill bg-gradient-to-r from-accent-secondary to-accent-primary" /></div>
        </div>
      </Section>

      <Section title="States" sub="Empty · error · success — always warm, never technical.">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="text-center"><div className="text-3xl">🌸</div><p className="mt-2 text-caption text-text-secondary">Nothing here yet — let's begin your story.</p></Card>
          <Card className="border-danger/25 bg-danger/[0.06] text-center"><div className="text-3xl">🌧️</div><p className="mt-2 text-caption text-text-secondary">Something didn't go as planned. Let's try that again.</p></Card>
          <Card className="border-success/25 bg-success/[0.06] text-center"><div className="text-3xl">🎉</div><p className="mt-2 text-caption text-text-secondary">Beautifully done — that's saved.</p></Card>
        </div>
      </Section>

      <Section title="Component library" sub="Reusable, token-driven — used across every screen.">
        <div className="flex flex-wrap gap-2">
          {['Button', 'Glass Card', 'Mood Card', 'Cycle Card', 'Journey Card', 'Progress Ring', 'AI Avatar', 'Chart', 'Calendar', 'Timeline', 'Chip', 'Badge', 'Input', 'Search', 'Dialog', 'Bottom Sheet', 'Toast', 'Bottom Nav', 'SOS Button'].map((c) => (
            <span key={c} className="rounded-pill border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-caption text-text-secondary">{c}</span>
          ))}
        </div>
      </Section>
    </>
  )
}

function Ring({ pct }) {
  const R = 34, C = 2 * Math.PI * R
  return (
    <svg width="86" height="86" viewBox="0 0 86 86">
      <circle cx="43" cy="43" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
      <circle cx="43" cy="43" r={R} fill="none" stroke="url(#dsg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} transform="rotate(-90 43 43)" />
      <defs><linearGradient id="dsg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#f5c6d6" /><stop offset="100%" stopColor="#d97ba8" /></linearGradient></defs>
      <text x="43" y="49" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700">{pct}</text>
    </svg>
  )
}
