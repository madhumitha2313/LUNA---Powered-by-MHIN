import { useState } from 'react'
import Button from './ui/Button'
import { ArrowRightIcon } from './ui/icons'
import { useT } from '../lib/i18n.jsx'

// Five gentle cards: what the cycle is, its phases, why tracking helps, how
// MIRA predicts, and a privacy assurance — the first-time-tracking intro.
const CARDS = [
  { emoji: '🌙', name: 'edu1T', body: 'edu1B' },
  { emoji: '🌗', name: 'edu2T', body: 'edu2B' },
  { emoji: '💗', name: 'edu3T', body: 'edu3B' },
  { emoji: '✨', name: 'edu4T', body: 'edu4B' },
  { emoji: '🔒', name: 'edu5T', body: 'edu5B' },
]

/** Skippable, swipe-feeling (animated, dot-paginated) intro carousel used as an onboarding step. */
export default function EduCarousel({ onDone }) {
  const { t } = useT()
  const [slide, setSlide] = useState(0)
  const card = CARDS[slide]
  const isLast = slide === CARDS.length - 1

  return (
    <div className="flex flex-1 flex-col pb-8 pt-4">
      <div key={'icon' + slide} className="mx-auto flex h-24 w-24 animate-fade-up items-center justify-center rounded-full bg-accent-primary/10 text-5xl">
        {card.emoji}
      </div>
      <div key={'txt' + slide} className="animate-fade-up">
        <h3 className="mt-6 text-center font-heading text-2xl font-semibold tracking-tight">{t(card.name)}</h3>
        <p className="mx-auto mt-3 max-w-sm text-center text-[0.98rem] leading-relaxed text-text-secondary">{t(card.body)}</p>
      </div>

      <div className="mt-6 flex justify-center gap-1.5">
        {CARDS.map((_, i) => (
          <button
            key={i}
            onClick={() => setSlide(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-pill transition-all duration-250 ${i === slide ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20 hover:bg-white/35'}`}
          />
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-8">
        <button onClick={onDone} className="rounded-pill px-4 py-2.5 text-caption text-text-muted hover:text-text-secondary">
          {t('skip')}
        </button>
        <Button onClick={() => (isLast ? onDone() : setSlide((s) => s + 1))} size="lg">
          {isLast ? t('eduDone') : t('cont')} <ArrowRightIcon size={16} />
        </Button>
      </div>
    </div>
  )
}
