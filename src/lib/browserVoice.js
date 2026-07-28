/**
 * Browser-native voice engine for the offline/preview build.
 *
 * Uses the Web Speech API (SpeechRecognition + SpeechSynthesis) so the voice
 * loop works in a single HTML file with no backend or keys — Tamil in, Tamil
 * out. The production build instead routes through the Sarvam server proxy
 * (src/lib/voice.js); this module is the preview-friendly counterpart.
 *
 * Support: SpeechRecognition works in Chrome/Edge (and needs internet + mic
 * permission). Callers should feature-detect with `speechSupported()` and offer
 * a typed fallback when it's absent.
 */
export function speechSupported() {
  return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

/**
 * Create a one-shot recognizer. Emits interim + final transcripts.
 * @returns the recognition instance (call .start()/.stop()) or null if unsupported.
 */
export function createRecognizer({ lang = 'ta-IN', onResult, onEnd, onError, onStart } = {}) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.lang = lang
  rec.continuous = false
  rec.interimResults = true
  rec.maxAlternatives = 1

  rec.onstart = () => onStart?.()
  rec.onresult = (e) => {
    let interim = ''
    let final = ''
    let confidence = 0
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const res = e.results[i]
      const alt = res[0]
      if (res.isFinal) {
        final += alt.transcript
        confidence = Math.max(confidence, alt.confidence || 0)
      } else {
        interim += alt.transcript
      }
    }
    onResult?.({ interim, final, confidence })
  }
  rec.onerror = (e) => onError?.(e.error || 'recognition-error')
  rec.onend = () => onEnd?.()
  return rec
}

/** Speak Tamil text aloud, preferring a Tamil voice when the OS provides one. */
export function speak(text, { lang = 'ta-IN', rate = 0.97, pitch = 1 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const synth = window.speechSynthesis
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = lang
  utter.rate = rate
  utter.pitch = pitch
  const voices = synth.getVoices()
  const tamil = voices.find((v) => (v.lang || '').toLowerCase().startsWith('ta'))
  if (tamil) utter.voice = tamil
  synth.cancel()
  synth.speak(utter)
  return utter
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
}

// Split on sentence-ending punctuation (English + Tamil/Hindi full stops),
// keeping the punctuation attached — each chunk becomes its own utterance so
// a brief silence can sit between them.
const SENTENCE_SPLIT = /(?<=[.!?।]|[.!?])\s+/

/**
 * Speak text with emotion-aware pacing: pitch/rate/volume come from
 * `style` (see resolveVoiceStyle in voiceStyle.js), and natural pauses
 * between sentences are simulated by queuing one utterance per sentence with
 * a short silence gap — Web Speech has no SSML break tag in most browsers,
 * so this is how "breathing room" becomes audible instead of a flat monotone.
 *
 * @param {string} text
 * @param {{ lang?: string, rate?: number, pitch?: number, volume?: number, pause?: number }} style
 * @returns {() => void} a cancel function
 */
export function speakExpressive(text, { lang = 'en-IN', rate = 1, pitch = 1, volume = 1, pause = 160 } = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return () => {}
  const synth = window.speechSynthesis
  synth.cancel()

  const sentences = text.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean)
  const queue = sentences.length ? sentences : [text]
  const voices = synth.getVoices()
  const voice = voices.find((v) => (v.lang || '').toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))

  let cancelled = false
  let i = 0
  function speakNext() {
    if (cancelled || i >= queue.length) return
    const utter = new SpeechSynthesisUtterance(queue[i])
    utter.lang = lang
    utter.rate = rate
    utter.pitch = pitch
    utter.volume = volume
    if (voice) utter.voice = voice
    utter.onend = () => {
      i += 1
      if (i < queue.length && !cancelled) setTimeout(speakNext, pause)
    }
    synth.speak(utter)
  }
  speakNext()

  return () => {
    cancelled = true
    synth.cancel()
  }
}
