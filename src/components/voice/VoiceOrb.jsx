import { cn } from '../../lib/cn'
import { MicIcon } from '../ui/icons'

/**
 * The voice button — the single highest-visibility polish moment in the demo.
 *
 * States:
 *   idle      → slow "breathing" pulse with concentric ripple rings
 *   listening → active waveform bars
 *   thinking  → soft AI-tinted shimmer while extraction runs
 *
 * Pure CSS/SVG animation; no backend dependency. The live STT capture is wired
 * on top of this in Phase 2 once the Tamil voice provider is configured.
 */
export default function VoiceOrb({ state = 'idle', onClick, className }) {
  const isListening = state === 'listening'
  const isThinking = state === 'thinking'

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Ripple rings (idle only) */}
      {state === 'idle' && (
        <>
          <span className="absolute h-40 w-40 rounded-full border border-accent-primary/30 animate-ripple" />
          <span
            className="absolute h-40 w-40 rounded-full border border-accent-primary/20 animate-ripple"
            style={{ animationDelay: '1.5s' }}
          />
        </>
      )}

      {/* Glow halo */}
      <span
        aria-hidden
        className={cn(
          'absolute h-48 w-48 rounded-full blur-2xl transition-colors duration-250',
          isThinking ? 'bg-accent-ai/25' : 'bg-accent-primary/20'
        )}
      />

      <button
        type="button"
        onClick={onClick}
        aria-label={isListening ? 'Stop listening' : 'Start talking to Luna'}
        aria-pressed={isListening}
        className={cn(
          'relative flex h-36 w-36 items-center justify-center rounded-full',
          'transition-all duration-250 ease-luna active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-secondary/60',
          'focus-visible:ring-offset-4 focus-visible:ring-offset-bg-primary',
          state === 'idle' && 'animate-breathe',
          isThinking
            ? 'bg-gradient-to-br from-accent-ai to-accent-primary shadow-glow-ai'
            : 'bg-gradient-to-br from-accent-secondary to-accent-primary shadow-glow'
        )}
      >
        {isListening ? <Waveform /> : <MicIcon size={40} className="text-bg-primary" />}
      </button>
    </div>
  )
}

function Waveform() {
  const bars = [0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8]
  return (
    <div className="flex h-12 items-center gap-1.5" aria-hidden>
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-1.5 rounded-full bg-bg-primary/90"
          style={{
            height: `${h * 100}%`,
            animation: `breathe ${0.7 + (i % 3) * 0.25}s ease-in-out ${i * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
