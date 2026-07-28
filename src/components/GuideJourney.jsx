import { useState } from 'react'
import Button from './ui/Button'
import { ArrowRightIcon } from './ui/icons'

/**
 * A friendly, animated, step-by-step "First Period 101" walkthrough for
 * girls experiencing menstruation for the first time. Fixed, age-appropriate
 * content (not the age/language/relationship-personalized AI guide above it
 * on the page) — soft illustrations, one idea per screen, Next/Previous/Skip.
 */
const STEPS = [
  {
    emoji: '🌸',
    glow: ['#FF8FC0', '#FFD3E0'],
    title: 'Welcome, friend!',
    body: "Getting your first period is a normal, healthy part of growing up. Every girl and woman goes through this — you're not alone, and there's nothing to be scared of. Let's walk through everything together, one gentle step at a time.",
  },
  {
    emoji: '🩸',
    glow: ['#D81B60', '#F48FB1'],
    title: 'What is menstruation?',
    body: "Every month, your body builds a soft, cushiony lining inside your uterus — just in case a baby might grow there one day. If that doesn't happen, your body gently lets that lining leave through your vagina. That's your period! It's simply your body doing exactly what it's meant to do.",
  },
  {
    emoji: '⏳',
    glow: ['#A855F7', '#E0C3FC'],
    title: 'Why periods happen',
    body: "Periods happen because of hormones — tiny messengers inside your body. They rise and fall in a repeating rhythm roughly every month, telling your body when to build that lining and when to release it. This repeating rhythm is called your menstrual cycle, and it will continue for many years to come.",
  },
  {
    emoji: '🌙',
    glow: ['#7C3AED', '#C4B5FD'],
    title: 'The four phases of your cycle',
    list: [
      '🌙 Menstrual — your period days, when the lining leaves your body.',
      '🌱 Follicular — your body starts preparing again, energy often rises.',
      '✨ Ovulation — the halfway point of your cycle.',
      '🍂 Luteal — the days before your next period, when you might feel a little more tired.',
    ],
    body: "It's a cycle, not a straight line — it keeps gently going around, month after month.",
  },
  {
    emoji: '🧷',
    glow: ['#EC4899', '#FBCFE8'],
    title: 'How to use a sanitary pad',
    list: [
      'Wash your hands first.',
      'Unwrap the pad and peel off the sticky strip.',
      'Press it onto the inside of your underwear, sticky-side down.',
      'If it has wings, fold them around the edges of your underwear.',
      'Change it every 4–6 hours, even if it feels light — this keeps you fresh.',
      'Wrap the used pad and put it in a bin — never flush it.',
    ],
  },
  {
    emoji: '🛁',
    glow: ['#22D3EE', '#A5F3FC'],
    title: 'Personal hygiene tips',
    list: [
      'Wash gently with warm water once or twice a day — soap isn’t needed there.',
      'Always wipe front to back.',
      'Change your pad regularly, even on lighter days.',
      'Wash your hands before and after.',
      'Wear clean, breathable cotton underwear.',
      'A warm bath can feel really soothing during your period.',
    ],
  },
  {
    emoji: '🤗',
    glow: ['#FB923C', '#FED7AA'],
    title: 'Common symptoms',
    body: "It's common to feel mild cramps in your tummy or lower back, a little more tired than usual, moodier, bloated, or slightly headachy. These are all normal and usually mild — a warm compress, rest, and gentle movement can help a lot.",
  },
  {
    emoji: '🩺',
    glow: ['#F43F5E', '#FDA4AF'],
    title: 'When to seek medical help',
    body: "Most period symptoms are totally normal, but talk to a trusted adult or doctor if: the pain stops you from going about your day, your period lasts longer than 7 days, you're soaking a pad in under an hour, or you haven't started your period by age 15. Asking for help is always the right thing to do.",
  },
  {
    emoji: '💗',
    glow: ['#F472B6', '#FBCFE8'],
    title: "It's okay to feel all the feelings",
    body: "Surprised, a little worried, maybe even proud — every feeling is completely normal. This doesn't change who you are. Millions of girls and women go through this every single day; it's simply your body growing and taking care of itself. You've got this.",
  },
  {
    emoji: '🌟',
    glow: ['#FBBF24', '#FDE68A'],
    title: 'Healthy self-care tips',
    list: [
      'Keep a small pad kit in your bag, just in case.',
      'Track your period so you know roughly when to expect the next one.',
      'Eat nourishing foods and drink plenty of water.',
      'Rest when your body asks for it.',
      'Talk to someone you trust — there’s no such thing as a silly question.',
      'Be kind to yourself, always.',
    ],
  },
]

export default function GuideJourney() {
  const [step, setStep] = useState(0)
  const s = STEPS[step]
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-bg-card">
      {/* Illustration */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden sm:h-48">
        <span
          className="animate-float absolute h-40 w-40 rounded-full opacity-40 blur-3xl"
          style={{ background: s.glow[0] }}
        />
        <span
          className="animate-breathe absolute h-28 w-28 rounded-full opacity-30 blur-2xl"
          style={{ background: s.glow[1] }}
        />
        <span key={step} className="animate-fade-up relative text-6xl sm:text-7xl">{s.emoji}</span>
      </div>

      {/* Content */}
      <div key={step} className="animate-fade-up px-6 py-6 sm:px-8">
        <h3 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">{s.title}</h3>
        {s.body && <p className="mt-3 text-[0.98rem] leading-relaxed text-text-secondary">{s.body}</p>}
        {s.list && (
          <ul className="mt-3 space-y-2">
            {s.list.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-text-secondary">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-primary/70" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Progress dots */}
        <div className="mt-6 flex justify-center gap-1.5">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              aria-label={`Step ${i + 1}`}
              className={`h-1.5 rounded-pill transition-all duration-250 ${i === step ? 'w-6 bg-accent-primary' : 'w-1.5 bg-white/20 hover:bg-white/35'}`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setStep((v) => Math.max(0, v - 1))}
            disabled={isFirst}
            className="rounded-pill px-4 py-2.5 text-caption text-text-muted transition hover:text-text-secondary disabled:opacity-30"
          >
            ← Previous
          </button>
          {!isLast && (
            <button
              onClick={() => setStep(STEPS.length - 1)}
              className="rounded-pill px-4 py-2.5 text-caption text-text-muted transition hover:text-text-secondary"
            >
              Skip
            </button>
          )}
          <Button onClick={() => setStep((v) => Math.min(STEPS.length - 1, v + 1))} size="md" disabled={isLast}>
            {isLast ? "That's everything 🌸" : 'Next'} {!isLast && <ArrowRightIcon size={15} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
