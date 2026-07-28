/**
 * Emotion → voice-synthesis style. Layered on top of the chosen persona's
 * base rate/pitch (src/lib/companion.js): persona is the personality the
 * user picked, emotion is the real-time read of how THIS message feels — the
 * two multiply together so a "Calm" persona reading an anxious message still
 * sounds distinctly more soothing than the same persona on a happy one.
 *
 * `pause` is the gap (ms) inserted between sentences — Web Speech has no SSML
 * break tag in most browsers, so natural pacing/breathing room is simulated
 * by chunking the utterance and queuing it with silence between chunks (see
 * speakExpressive in browserVoice.js).
 */
export const EMOTION_VOICE = {
  happy: { rate: 1.1, pitch: 1.1, volume: 1, pause: 110, styleHint: 'warm, energetic, and encouraging' },
  excited: { rate: 1.15, pitch: 1.14, volume: 1, pause: 90, styleHint: 'enthusiastic and upbeat, share in their excitement' },
  hopeful: { rate: 1.04, pitch: 1.06, volume: 1, pause: 150, styleHint: 'encouraging and optimistic' },
  calm: { rate: 0.93, pitch: 0.99, volume: 0.95, pause: 260, styleHint: 'slow, gentle, and reassuring' },
  neutral: { rate: 1, pitch: 1, volume: 1, pause: 160, styleHint: 'warm and clear' },
  sad: { rate: 0.85, pitch: 0.93, volume: 0.9, pause: 320, styleHint: 'soft, comforting language with slower pacing' },
  lonely: { rate: 0.86, pitch: 0.94, volume: 0.9, pause: 300, styleHint: 'warm and close, like sitting beside them' },
  worried: { rate: 0.9, pitch: 0.98, volume: 0.95, pause: 260, styleHint: 'patient and reassuring, steady' },
  anxious: { rate: 0.85, pitch: 0.97, volume: 0.9, pause: 340, styleHint: 'patient, unhurried, reduce urgency, reassure without overwhelming' },
  fearful: { rate: 0.84, pitch: 0.96, volume: 0.9, pause: 340, styleHint: 'gentle and steady, safety-focused reassurance' },
  overwhelmed: { rate: 0.84, pitch: 0.96, volume: 0.9, pause: 360, styleHint: 'break things into simple, one-step-at-a-time explanations' },
  frustrated: { rate: 0.92, pitch: 0.97, volume: 0.95, pause: 240, styleHint: 'patient and validating, never defensive' },
  angry: { rate: 0.9, pitch: 0.96, volume: 0.92, pause: 260, styleHint: 'calm and validating, gently de-escalating' },
  confused: { rate: 0.86, pitch: 0.98, volume: 0.95, pause: 320, styleHint: 'break information into simple step-by-step explanations' },
}

/** Combine a persona's base rate/pitch with the message's detected emotion. */
export function resolveVoiceStyle(persona, emotion) {
  const e = EMOTION_VOICE[emotion] || EMOTION_VOICE.neutral
  const baseRate = persona?.rate ?? 1
  const basePitch = persona?.pitch ?? 1
  return {
    rate: clamp(baseRate * e.rate, 0.6, 1.6),
    pitch: clamp(basePitch * e.pitch, 0.6, 1.6),
    volume: e.volume,
    pause: e.pause,
    styleHint: e.styleHint,
  }
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}
