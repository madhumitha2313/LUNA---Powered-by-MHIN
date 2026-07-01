import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import VoiceOrb from '../components/voice/VoiceOrb'
import ConfidenceMeter from '../components/voice/ConfidenceMeter'
import ExtractionChip from '../components/voice/ExtractionChip'
import Logo from '../components/Logo'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { ArrowRightIcon, SparklesIcon, MicIcon } from '../components/ui/icons'
import { speechSupported, createRecognizer, speak, stopSpeaking } from '../lib/browserVoice'
import { extractFields, buildReply, glossFields } from '../lib/tamilExtract'
import { addLog } from '../lib/localStore'

/**
 * Phase 2 — Voice screen (LIVE in the browser).
 *
 * Speak Tamil → the Web Speech API transcribes → in-browser extractor pulls
 * structured fields → Luna replies out loud in Tamil. Raw audio is handled by
 * the browser recognizer and never stored by us. A typed fallback runs the same
 * pipeline for browsers without SpeechRecognition.
 */
export default function Voice() {
  const [supported, setSupported] = useState(true)
  const [state, setState] = useState('idle') // idle | listening | thinking | speaking
  const [interim, setInterim] = useState('')
  const [turns, setTurns] = useState([]) // { role: 'user'|'luna', text }
  const [chips, setChips] = useState([])
  const [confidence, setConfidence] = useState(0)
  const [typed, setTyped] = useState('')
  const recRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    setSupported(speechSupported())
    // warm up voices for synthesis
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
    setState('thinking')

    // Extract → chips → reply (small delay so the "understanding" beat is visible)
    setTimeout(() => {
      const result = extractFields(transcript)
      setChips(glossFields(result.fields))
      setConfidence(result.confidence)

      // Persist the check-in (the user's own data) unless it's basically empty
      if (glossFields(result.fields).length > 0) {
        addLog({
          rawTranscript: transcript,
          confidence: Number(result.confidence.toFixed(2)),
          ...result.fields,
        })
      }

      const reply = buildReply(result)
      setTurns((t) => [...t, { role: 'luna', text: reply }])
      setState('speaking')
      speak(reply)
      // return to idle shortly after speaking starts
      setTimeout(() => setState('idle'), 1200)
    }, 650)
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
          ? 'லூனா பதிலளிக்கிறது…'
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
          தமிழில் பேசுங்கள் — நான் கேட்டு, புரிந்து, பதிலளிக்கிறேன்.
        </p>

        <VoiceOrb state={state === 'speaking' ? 'thinking' : state} onClick={startListening} className="my-8" />

        {/* Live interim transcript */}
        {interim && (
          <p className="mb-4 max-w-md text-center text-accent-secondary/90">“{interim}”</p>
        )}

        {/* Extraction chips */}
        {chips.length > 0 && (
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {chips.map(([field, value], i) => (
              <ExtractionChip
                key={field}
                field={field}
                value={value}
                tone={field}
                style={{ animationDelay: `${i * 70}ms` }}
              />
            ))}
          </div>
        )}

        {confidence > 0 && <ConfidenceMeter value={confidence} className="mb-6 max-w-sm" />}

        {/* Conversation */}
        <div ref={scrollRef} className="mb-4 max-h-64 w-full max-w-xl space-y-3 overflow-y-auto">
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

        {/* Not supported → typed fallback note */}
        {!supported && (
          <p className="mb-3 max-w-md text-center text-caption text-warning">
            Live mic needs Chrome or Edge. You can still type a sentence below and Luna will respond.
          </p>
        )}

        {/* Typed fallback (also handy for testing) */}
        <form onSubmit={submitTyped} className="mb-8 flex w-full max-w-xl items-center gap-2">
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="…அல்லது இங்கே தமிழில் தட்டச்சு செய்யுங்கள் (e.g. ரொம்ப வலி, அதிக ரத்தப்போக்கு)"
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
