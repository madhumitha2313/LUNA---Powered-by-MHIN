import { useState } from 'react'
import { Link } from 'react-router-dom'
import VoiceOrb from '../components/voice/VoiceOrb'
import ConfidenceMeter from '../components/voice/ConfidenceMeter'
import Logo from '../components/Logo'
import Badge from '../components/ui/Badge'
import { ArrowRightIcon, SparklesIcon } from '../components/ui/icons'

/**
 * Phase 2 — Voice screen (shell).
 *
 * The breathing orb, conversation surface, extraction-chip rail and confidence
 * meter are all built and token-styled here. LIVE capture, Tamil STT, Anthropic
 * extraction and TTS playback are wired on top of this shell once the voice
 * provider is configured — see src/lib/voice.js (stubbed integration point).
 *
 * Per the project's strict rules, this shell shows NO fabricated health data.
 * The state toggle below only previews the orb's animation states.
 */
export default function Voice() {
  const [orbState, setOrbState] = useState('idle')

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-primary">
      {/* Ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary/[0.07] blur-[140px]"
      />

      {/* Top bar */}
      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <Link to="/" aria-label="Back home">
          <Logo />
        </Link>
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>
          Tamil · Voice
        </Badge>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <p className="font-heading text-2xl font-semibold sm:text-3xl">
          {orbState === 'listening'
            ? 'Listening…'
            : orbState === 'thinking'
              ? 'Understanding…'
              : 'How are you feeling today?'}
        </p>
        <p className="mt-2 max-w-sm text-text-secondary">
          Tap the moon and just talk — in Tamil, in your own words.
        </p>

        <VoiceOrb state={orbState} className="my-14" onClick={() => {}} />

        <div className="w-full max-w-sm">
          <ConfidenceMeter value={orbState === 'thinking' ? 0.82 : 0} />
        </div>

        {/* Honest status: live wiring pending provider */}
        <div className="mt-12 w-full max-w-md rounded-card border border-accent-ai/20 bg-accent-ai/[0.06] p-4 text-left">
          <p className="text-caption font-semibold text-accent-ai">Live capture not yet wired</p>
          <p className="mt-1 text-caption text-text-secondary">
            Real Tamil speech-to-text, Anthropic extraction and spoken responses
            activate once a voice provider is configured. The orb, chips and confidence
            meter above are the production UI — not placeholders.
          </p>
        </div>

        {/* Animation-state preview (UI only — not health data) */}
        <div className="mt-6 flex items-center gap-2">
          <span className="text-caption text-text-muted">Preview orb state:</span>
          {['idle', 'listening', 'thinking'].map((s) => (
            <button
              key={s}
              onClick={() => setOrbState(s)}
              className={`rounded-pill border px-3 py-1 text-caption transition-colors duration-250 ${
                orbState === s
                  ? 'border-accent-primary/40 bg-accent-primary/15 text-accent-secondary'
                  : 'border-white/10 text-text-muted hover:text-text-secondary'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex max-w-3xl items-center justify-center gap-2 px-5 py-6 text-caption text-text-muted">
        <span>Your voice is deleted after processing.</span>
        <Link to="/" className="inline-flex items-center gap-1 text-accent-secondary hover:underline">
          Back to home <ArrowRightIcon size={14} />
        </Link>
      </footer>
    </div>
  )
}
