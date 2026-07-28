/**
 * MIRA companion settings — voice personalities and conversation modes for the
 * avatar. Persona choice tunes the speech synthesis (rate + pitch) AND, via
 * `styleHint`, the words MIRA reaches for when the LLM-backed chat is
 * configured — so switching personas is meant to be clearly noticeable in
 * both how she sounds and how she talks, not just speech rate. Remembered on
 * the device.
 */
export const PERSONAS = [
  { id: 'bestfriend', emoji: '🌸', key: 'perBestFriend', rate: 1.03, pitch: 1.15, styleHint: 'like a warm, upbeat best friend — casual, affectionate, uses light emoji-toned warmth' },
  { id: 'sister', emoji: '👩', key: 'perSister', rate: 0.98, pitch: 1.05, styleHint: 'like a caring older sister — direct, protective, practical advice with warmth' },
  { id: 'guide', emoji: '👩‍⚕️', key: 'perGuide', rate: 0.95, pitch: 0.98, styleHint: 'like a knowledgeable, calm health guide — clear, informative, still warm, a little more measured' },
  { id: 'calm', emoji: '💖', key: 'perCalm', rate: 0.9, pitch: 1.0, styleHint: 'slow, gentle, softly reassuring, few words, lots of space to breathe' },
  { id: 'genz', emoji: '✨', key: 'perGenz', rate: 1.12, pitch: 1.22, styleHint: 'upbeat and casual, light and modern in tone, still respectful and clear' },
  { id: 'night', emoji: '🌙', key: 'perNight', rate: 0.85, pitch: 0.9, styleHint: 'quiet, soothing, late-night-conversation gentle, unhurried' },
]

export const MODES = [
  { id: 'normal', emoji: '💬', key: 'modeNormal', opener: 'modeOpenNormal', styleHint: '' },
  { id: 'coach', emoji: '🏃‍♀️', key: 'modeCoach', opener: 'modeOpenCoach', styleHint: 'fitness and movement, encouraging and energizing' },
  { id: 'relax', emoji: '🧘', key: 'modeRelax', opener: 'modeOpenRelax', styleHint: 'relaxation and stress relief, calm and unhurried' },
  { id: 'cycle', emoji: '🩸', key: 'modeCycle', opener: 'modeOpenCycle', styleHint: 'cycle tracking and menstrual health' },
  { id: 'nutrition', emoji: '🥗', key: 'modeNutrition', opener: 'modeOpenNutrition', styleHint: 'food and nutrition' },
  { id: 'motivate', emoji: '🌟', key: 'modeMotivate', opener: 'modeOpenMotivate', styleHint: 'motivation and encouragement, uplifting' },
]

const KEY = 'mira.voice.v1'
export function getPersona() {
  try {
    const id = JSON.parse(localStorage.getItem(KEY))?.persona
    return PERSONAS.find((p) => p.id === id) || PERSONAS[0]
  } catch {
    return PERSONAS[0]
  }
}
export function setPersona(id) {
  try { localStorage.setItem(KEY, JSON.stringify({ persona: id })) } catch { /* ignore */ }
  return getPersona()
}
