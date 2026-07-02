import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import VoiceOrb from '../components/voice/VoiceOrb'
import ConfidenceMeter from '../components/voice/ConfidenceMeter'
import ExtractionChip from '../components/voice/ExtractionChip'
import Logo from '../components/Logo'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ArrowRightIcon, SparklesIcon, MicIcon, LeafIcon, HeartIcon } from '../components/ui/icons'
import { speechSupported, createRecognizer, speak, stopSpeaking } from '../lib/browserVoice'
import { extractFields, respond, glossFields } from '../lib/tamilExtract'
import { addLog, getCycleStats } from '../lib/localStore'
import { detectSentiment, crisisResponse, comfortOpener } from '../lib/sentiment'

/**
 * Voice screen — LIVE in the browser.
 *
 * Speak Tamil → Web Speech transcribes → the extractor pulls structured fields
 * and detects what you're asking → Mira replies out loud in Tamil with
 * time-appropriate food & activity tips. Raw audio is handled by the browser
 * recognizer and never stored by us. A typed fallback runs the same pipeline.
 */
export default function Voice() {
  const [supported, setSupported] = useState(true)
  const [state, setState] = useState('idle') // idle | listening | thinking | speaking
  const [interim, setInterim] = useState('')
  const [turns, setTurns] = useState([])
  const [chips, setChips] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [recs, setRecs] = useState(null)
  const [crisis, setCrisis] = useState(null)
  const [typed, setTyped] = useState('')
  const recRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    setSupported(speechSupported())
    if (window.speechSynthesis) window.speechSynthesis.getVoices()
    return () => stopSpeaking()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, interim])

  function process(transcript) {
    if (!transcript.trim()) return
    setTurns((t) => [...t, { role: 'user', text: transcript }])
    setInterim('')

    const sentiment = detectSentiment(transcript)

    // Safety first: any sign of self-harm → comfort + real helplines, nothing else.
    if (sentiment === 'crisis') {
      const c = crisisResponse()
      setCrisis(c)
      setChips([])
      setRecs(null)
      setConfidence(0)
      setTurns((t) => [...t, { role: 'mira', text: c.message }])
      setState('speaking')
      stopSpeaking()
      speak(c.speech)
      setTimeout(() => setState('idle'), 1400)
      return // never log or "extract" from crisis speech
    }

    setState('thinking')
    setTimeout(() => {
      const result = extractFields(transcript)
      const gloss = glossFields(result.fields)
      setChips(gloss)
      setConfidence(result.confidence)

      if (gloss.length > 0) {
        addLog({ rawTranscript: transcript, confidence: Number(result.confidence.toFixed(2)), ...result.fields })
      }

      const phase = getCycleStats().phase || null
      let { speech, recommendations } = respond({ transcript, result, phase })
      if (sentiment === 'low') speech = comfortOpener() + ' ' + speech // acknowledge feelings first
      setRecs(recommendations)
      setTurns((t) => [...t, { role: 'mira', text: speech }])
      setState('speaking')
      speak(speech)
      setTimeout(() => setState('idle'), 1200)
    }, 600)
  }

  function startListening() {
    if (state === 'listening') {
      recRef.current?.stop()
      return
    }
    stopSpeaking()
    setChips([])
    const rec = createRecognizer({
      lang: 'ta-IN',
      onStart: () => setState('listening'),
      onResult: ({ interim, final }) => {
        if (interim) setInterim(interim)
        if (final) process(final)
      },
      onError: () => setState('idle'),
      onEnd: () => setState((s) => (s === 'listening' ? 'idle' : s)),
    })
    if (!rec) {
      setSupported(false)
      return
    }
    recRef.current = rec
    rec.start()
  }

  function submitTyped(e) {
    e.preventDefault()
    const text = typed.trim()
    if (!text) return
    setTyped('')
    process(text)
  }

  const prompt =
    state === 'listening'
      ? 'கேட்டுக்கொண்டிருக்கிறேன்…'
      : state === 'thinking'
        ? 'புரிந்துகொள்கிறேன்…'
        : state === 'speaking'
          ? 'மீரா பதிலளிக்கிறது…'
          : 'இன்று எப்படி உணர்கிறீர்கள்?'

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-primary/[0.07] blur-[140px]"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-5">
        <Link to="/" aria-label="Back home">
          <Logo />
        </Link>
        <Badge tone="ai" icon={<SparklesIcon size={14} />}>
          Tamil · Live voice
        </Badge>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5">
        <p className="mt-2 text-center font-heading text-2xl font-semibold sm:text-3xl">{prompt}</p>
        <p className="mt-2 text-center text-text-secondary">
          தமிழில் பேசுங்கள் — “என்ன சாப்பிடலாம்?”, “ரொம்ப வலி” … எதையும் கேளுங்கள்.
        </p>

        {/* Crisis support — shown when distress is detected. Calm, not alarming. */}
        {crisis && (
          <div className="mt-6 w-full max-w-xl rounded-card border border-accent-primary/40 bg-accent-primary/[0.08] p-5 shadow-glow">
            <div className="flex items-center gap-2">
              <HeartIcon size={20} className="text-accent-secondary" />
              <h2 className="font-heading text-lg font-semibold">{crisis.title}</h2>
            </div>
            <p className="mt-2 text-left text-[0.95rem] leading-relaxed text-text-secondary">
              {crisis.message}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {crisis.helplines.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-left transition-colors duration-250 hover:bg-white/[0.09]"
                >
                  <span className="text-caption text-text-secondary">{h.name}</span>
                  <span className="font-stat font-semibold text-accent-secondary">📞 {h.display}</span>
                </a>
              ))}
            </div>
            <button
              onClick={() => setCrisis(null)}
              className="mt-4 text-caption text-text-muted hover:text-text-primary"
            >
              I'm safe for now — close
            </button>
          </div>
        )}

        <VoiceOrb state={state === 'speaking' ? 'thinking' : state} onClick={startListening} className="my-8" />

        {interim && <p className="mb-4 max-w-md text-center text-accent-secondary/90">“{interim}”</p>}

        {chips.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {chips.map(([field, value], i) => (
              <ExtractionChip key={field} field={field} value={value} tone={field} style={{ animationDelay: `${i * 70}ms` }} />
            ))}
          </div>
        )}

        {confidence > 0 && <ConfidenceMeter value={confidence} className="mb-6 max-w-sm" />}

        {/* Conversation */}
        <div ref={scrollRef} className="mb-5 max-h-56 w-full max-w-xl space-y-3 overflow-y-auto">
          {turns.map((t, i) => (
            <div key={i} className={t.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div
                className={
                  t.role === 'user'
                    ? 'max-w-[80%] rounded-2xl rounded-br-md bg-accent-primary/15 px-4 py-2.5 text-[0.95rem] text-text-primary'
                    : 'max-w-[80%] rounded-2xl rounded-bl-md border border-accent-ai/20 bg-accent-ai/[0.06] px-4 py-2.5 text-[0.95rem] text-text-secondary'
                }
              >
                {t.text}
              </div>
            </div>
          ))}
        </div>

        {/* Food + activity recommendations */}
        {recs && (recs.foods.length > 0 || recs.activities.length > 0) && (
          <div className="mb-6 grid w-full max-w-xl gap-3 sm:grid-cols-2">
            <RecCard icon={LeafIcon} tone="text-success" title="Foods for now" items={recs.foods} />
            <RecCard icon={HeartIcon} tone="text-accent-secondary" title="Activities for now" items={recs.activities} />
          </div>
        )}

        {!supported && (
          <p className="mb-3 max-w-md text-center text-caption text-warning">
            Live mic needs Chrome or Edge. You can still type a sentence below and Mira will respond.
          </p>
        )}

        <form onSubmit={submitTyped} className="mb-8 flex w-full max-w-xl items-center gap-2">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="…தமிழில் தட்டச்சு: “என்ன சாப்பிடலாம்?” / “ரொம்ப வலி, அதிக ரத்தப்போக்கு”"
            className="flex-1 rounded-pill border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
          />
          <Button type="submit" size="md" variant="secondary">
            <ArrowRightIcon size={16} />
          </Button>
        </form>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-3xl items-center justify-center gap-2 px-5 py-5 text-caption text-text-muted">
        <MicIcon size={14} className="text-accent-secondary/70" />
        <span>Your voice is transcribed in your browser and never stored.</span>
        <Link to="/home" className="inline-flex items-center gap-1 text-accent-secondary hover:underline">
          Dashboard <ArrowRightIcon size={13} />
        </Link>
      </footer>
    </div>
  )
}

function RecCard({ icon: Icon, tone, title, items }) {
  return (
    <div className="card-base p-4 text-left">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} className={tone} />
        <span className="font-heading text-[0.95rem] font-semibold">{title}</span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.en} className="text-caption">
            <span className="text-text-primary">{it.ta}</span>
            <span className="text-text-muted"> · {it.en}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
