import { useEffect, useState } from 'react'
import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'

/**
 * Menstrual-products explorer. Six product types, each with the full
 * structured guide from the brief (what it is, how it works, pros, cons,
 * when/how to use, disposal, common mistakes, safety). A gently animated
 * illustration, tap-to-switch, and offline voice narration.
 */

// Tone → design-token classes only (no new colors) — gives each motion card
// a distinct accent while staying inside the existing palette.
const TONE = {
  primary: { border: 'border-accent-primary', bg: 'bg-accent-primary/[0.16]', glow: 'shadow-glow', text: 'text-accent-primary' },
  ai: { border: 'border-accent-ai', bg: 'bg-accent-ai/[0.16]', glow: 'shadow-glow-ai', text: 'text-accent-ai' },
  success: { border: 'border-success', bg: 'bg-success/[0.16]', glow: 'shadow-glow', text: 'text-success' },
  secondary: { border: 'border-accent-secondary', bg: 'bg-accent-secondary/[0.16]', glow: 'shadow-glow', text: 'text-accent-secondary' },
}

const PRODUCTS = [
  {
    id: 'pads', key: 'prod_pads', emoji: '🩹', tone: 'primary', highlight: 'Great for beginners & overnight',
    what: 'A soft absorbent strip that sticks inside your underwear and soaks up flow from the outside.',
    how: 'Absorbent layers lock in fluid; a sticky backing holds it in place. Many have “wings” that fold over the sides for security.',
    adv: 'Easy to start with, nothing goes inside the body, lots of sizes, great for overnight.',
    dis: 'Can feel bulky, may shift when you’re active, not made for swimming.',
    when: 'Perfect for beginners, lighter days, overnight, or after childbirth.',
    use: 'Peel the backing, stick the pad centrally in your underwear, fold the wings under. Change every 4–6 hours.',
    dispose: 'Wrap in the new pad’s wrapper or tissue and bin it. Never flush pads.',
    mistakes: 'Wearing one too long, or picking the wrong absorbency for your flow.',
    safety: 'Change regularly to stay fresh and avoid irritation; switch brands if you get a rash.',
  },
  {
    id: 'tampons', key: 'prod_tampons', emoji: '🧵', tone: 'ai', highlight: 'Invisible under clothes',
    what: 'A small cylinder of absorbent material worn inside the vagina, absorbing flow before it leaves the body.',
    how: 'It expands gently to absorb fluid. A string stays outside for easy removal; some come with an applicator.',
    adv: 'Discreet, nothing shows, brilliant for swimming and sport, comfortable once placed right.',
    dis: 'Takes practice to insert, must be changed on time, not everyone finds them comfy.',
    when: 'Sport, swimming, or when you want something invisible under clothes.',
    use: 'With clean hands, relax and insert with the applicator or finger until comfortable; the string stays outside. Change every 4–6 hours.',
    dispose: 'Wrap and bin it — most brands say do not flush.',
    mistakes: 'Leaving one in too long, forgetting to remove the last one, or using a higher absorbency than you need.',
    safety: 'Use the lowest absorbency for your flow and never leave one in beyond 8 hours — this lowers the small risk of toxic shock syndrome (TSS).',
  },
  {
    id: 'cup', key: 'prod_cup', emoji: '🥤', tone: 'success', highlight: 'Reusable up to 12 hours',
    what: 'A small, flexible silicone cup worn inside the vagina that collects — rather than absorbs — your flow.',
    how: 'You fold and insert it; it springs open to form a light seal that catches fluid. Empty, rinse and reuse.',
    adv: 'Reusable for years, very economical, eco-friendly, wearable up to 12 hours, holds more than a tampon.',
    dis: 'A learning curve to insert and remove, needs washing, higher upfront cost.',
    when: 'Long days out, travel, heavier flow, or when you want a sustainable option.',
    use: 'Fold, insert low in the vagina, let it open and rotate to seal. Empty every 8–12 hours, rinse, reinsert. Sterilise in boiling water between periods.',
    dispose: 'Reusable — nothing to throw away each time. Replace the cup every few years per the maker’s guidance.',
    mistakes: 'Not letting it open fully (which causes leaks), or inserting it too high.',
    safety: 'Wash your hands and the cup, sterilise between cycles, and don’t exceed 12 hours.',
  },
  {
    id: 'liner', key: 'prod_liner', emoji: '🩲', tone: 'secondary', highlight: 'Barely-there daily protection',
    what: 'A very thin, light pad for minimal flow, daily discharge, or backup with a tampon or cup.',
    how: 'Works like a slim pad — sticks in your underwear and absorbs small amounts.',
    adv: 'Barely noticeable, great for spotting, discharge, or the last light days.',
    dis: 'Not enough for a real flow day; still needs changing to stay fresh.',
    when: 'The start or end of a period, everyday discharge, or as backup.',
    use: 'Peel and stick in your underwear; change through the day as needed.',
    dispose: 'Wrap and bin — don’t flush.',
    mistakes: 'Relying on one for a heavy flow.',
    safety: 'Change regularly; choose unscented if your skin is easily irritated.',
  },
  {
    id: 'cloth', key: 'prod_cloth', emoji: '🧺', tone: 'success', highlight: 'Eco-friendly & gentle on skin',
    what: 'A washable fabric pad that works like a disposable pad but is reused for years.',
    how: 'Soft absorbent cloth layers soak up flow; it snaps around your underwear instead of sticking.',
    adv: 'Eco-friendly, economical over time, gentle on skin, no plastic feel.',
    dis: 'Must be washed and dried; a little bulkier; carrying used ones out takes planning.',
    when: 'At home, lighter days, or when you want a sustainable, skin-friendly option.',
    use: 'Snap it around your underwear. Change every few hours. Rinse in cold water, then machine or hand wash.',
    dispose: 'Reusable — wash and reuse. Replace when it wears out.',
    mistakes: 'Using fabric softener (it reduces absorbency) or not rinsing promptly.',
    safety: 'Wash well and dry fully to keep them hygienic.',
  },
  {
    id: 'underwear', key: 'prod_underwear', emoji: '🩳', tone: 'ai', highlight: 'Nothing to insert, just wear',
    what: 'Absorbent underwear with built-in leak-proof layers that soak up flow — no separate product needed.',
    how: 'Special layers absorb and lock in fluid while staying dry against your skin; then you wash and reuse.',
    adv: 'Comfortable, nothing to insert, great overnight or as backup, reusable and eco-friendly.',
    dis: 'Higher upfront cost, must be washed, may not be enough alone on the heaviest days.',
    when: 'Overnight, light-to-medium days, backup with a cup or tampon, or active days.',
    use: 'Wear like normal underwear. Rinse in cold water after use, then wash. Change through the day on a heavy flow.',
    dispose: 'Reusable — wash and reuse. Replace every couple of years.',
    mistakes: 'Assuming one pair lasts all day on a heavy flow.',
    safety: 'Rinse and wash properly; dry fully before wearing again.',
  },
]

const SECTIONS = [
  ['what', '📖', 'pWhat'], ['how', '⚙️', 'pHow'], ['adv', '👍', 'pAdv'], ['dis', '👎', 'pDis'],
  ['when', '🕐', 'pWhen'], ['use', '✋', 'pUse'], ['dispose', '🗑️', 'pDispose'], ['mistakes', '⚠️', 'pMistakes'], ['safety', '🛡️', 'pSafety'],
]

export default function ProductsExplorer({ onClose }) {
  const { t, lang } = useT()
  const [sel, setSel] = useState('pads')
  const p = PRODUCTS.find((x) => x.id === sel)

  useEffect(() => () => { try { window.speechSynthesis?.cancel() } catch { /* ignore */ } }, [])

  const SR_LANG = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN' }
  function narrate() {
    try {
      const sy = window.speechSynthesis
      if (!sy) return
      sy.cancel()
      const u = new SpeechSynthesisUtterance(`${t(p.key)}. ${p.what} ${p.how}`)
      u.lang = SR_LANG[lang] || 'en-US'
      u.rate = 0.98
      sy.speak(u)
    } catch { /* ignore */ }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧴</span>
          <h3 className="font-heading text-lg font-semibold">{t('pTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('pSub')}</p>

        {/* Product motion cards — glassmorphism, looping preview (pure CSS,
            silent, GPU-cheap transform/opacity only), hover lift, expand
            state on selection. Mobile-responsive: 2 → 3 → 6 columns. */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PRODUCTS.map((prod) => {
            const tone = TONE[prod.tone]
            const active = sel === prod.id
            return (
              <button
                key={prod.id}
                onClick={() => setSel(prod.id)}
                className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border p-4 text-center backdrop-blur-xl transition-all duration-300 ease-luna ${
                  active
                    ? `${tone.border} scale-[1.04] bg-white/[0.08] ${tone.glow}`
                    : 'border-white/10 bg-white/[0.03] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <span className="relative grid h-14 w-14 place-items-center rounded-2xl">
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${tone.bg} ${
                      active ? 'animate-glow-pulse opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                  />
                  <span className={`relative text-3xl transition-transform duration-500 ${active ? 'animate-float' : 'group-hover:scale-110'}`}>
                    {prod.emoji}
                  </span>
                </span>
                <span className="text-[0.72rem] font-semibold leading-tight text-text-secondary group-hover:text-text-primary">
                  {t(prod.key)}
                </span>
                <span className={`text-[0.62rem] leading-tight ${active ? tone.text : 'text-text-muted'}`}>{prod.highlight}</span>
              </button>
            )
          })}
        </div>

        {/* Hero — remounts (key) on selection so the fade-up/expand plays each time */}
        <div key={p.id} className="animate-fade-up mt-5 flex items-center gap-4 rounded-3xl border border-white/[0.06] bg-gradient-to-r from-[#d97ba8]/[0.14] to-transparent p-5">
          <span className="text-5xl">{p.emoji}</span>
          <div>
            <h4 className="font-heading text-xl font-semibold">{t(p.key)}</h4>
            <p className="mt-1 text-[0.9rem] leading-snug text-text-secondary">{p.what}</p>
          </div>
          <button onClick={narrate} title={t('ceListen')} aria-label={t('ceListen')}
            className="ml-auto grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 text-text-secondary transition hover:border-accent-primary/50 hover:text-accent-primary">🔊</button>
        </div>

        {/* Structured detail */}
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {SECTIONS.map(([field, icon, label]) => (
            <div key={field} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <p className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-secondary">
                <span aria-hidden>{icon}</span> {t(label)}
              </p>
              <p className="mt-1.5 text-[0.88rem] leading-relaxed text-text-secondary">{p[field]}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button size="md" onClick={onClose}>{t('learnDone')}</Button>
        </div>
      </div>
    </div>
  )
}
