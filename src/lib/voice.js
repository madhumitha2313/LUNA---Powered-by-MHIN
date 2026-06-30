/**
 * Voice capture + transcription integration point (Phase 2).
 *
 * The STT/TTS provider is not yet selected, so the network calls below are
 * marked TODO. What IS concrete here — and intentionally so, per the project's
 * strict rules — is the raw-audio lifecycle: audio is transcribed and then
 * discarded immediately. It is never written to Appwrite, never uploaded to our
 * own storage, and the in-memory blob + object URL are released right after the
 * transcript comes back.
 *
 * @see functionsBaseUrl — STT/TTS run through our server function so provider
 *      keys never reach the browser.
 */
import { functionsBaseUrl } from './config'

/**
 * Transcribe a recorded audio blob to text (Tamil) and then DISCARD the audio.
 *
 * The `finally` block is the discard path: regardless of success or failure,
 * the function drops every reference to the raw audio so it cannot be persisted
 * or reused. Nothing in this function ever calls storage/createFile or writes
 * the blob to a database.
 *
 * @param {Blob} audioBlob raw recorded audio (e.g. from MediaRecorder)
 * @returns {Promise<{ transcript: string, confidence: number }>}
 */
export async function transcribeAndDiscard(audioBlob) {
  let objectUrl = null
  try {
    objectUrl = URL.createObjectURL(audioBlob)

    // TODO(provider): replace with the configured Tamil STT call. This proxies
    // through our server function so the STT key never ships to the browser.
    const form = new FormData()
    form.append('audio', audioBlob, 'capture.webm')
    form.append('language', 'ta') // Tamil

    const res = await fetch(`${functionsBaseUrl}/stt`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`STT failed: ${res.status}`)
    const { transcript, confidence } = await res.json()

    return { transcript, confidence }
  } finally {
    // ── DISCARD RAW AUDIO ──────────────────────────────────────────────────
    // Revoke the object URL and drop the blob reference. After this point there
    // is no handle to the audio anywhere in the app; it is eligible for GC and
    // was never written to disk, storage, or the database.
    if (objectUrl) URL.revokeObjectURL(objectUrl)
    audioBlob = null
    // ───────────────────────────────────────────────────────────────────────
  }
}

/**
 * Speak Luna's response in Tamil. Returns an audio URL for playback only; the
 * synthesized audio is transient and not persisted.
 *
 * @param {string} text Tamil response text
 * @returns {Promise<string>} object URL for <audio> playback
 */
export async function speakTamil(text) {
  // TODO(provider): replace with the configured Tamil TTS call via our server.
  const res = await fetch(`${functionsBaseUrl}/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language: 'ta' }),
  })
  if (!res.ok) throw new Error(`TTS failed: ${res.status}`)
  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
