/**
 * MIRA companion settings — voice personalities and conversation modes for the
 * avatar. Persona choice tunes the speech synthesis (rate + pitch) and is
 * remembered on the device.
 */
export const PERSONAS = [
  { id: 'bestfriend', emoji: '🌸', key: 'perBestFriend', rate: 1.03, pitch: 1.15 },
  { id: 'sister', emoji: '👩', key: 'perSister', rate: 0.98, pitch: 1.05 },
  { id: 'guide', emoji: '👩‍⚕️', key: 'perGuide', rate: 0.95, pitch: 0.98 },
  { id: 'calm', emoji: '💖', key: 'perCalm', rate: 0.9, pitch: 1.0 },
  { id: 'genz', emoji: '✨', key: 'perGenz', rate: 1.12, pitch: 1.22 },
  { id: 'night', emoji: '🌙', key: 'perNight', rate: 0.85, pitch: 0.9 },
]

export const MODES = [
  { id: 'normal', emoji: '💬', key: 'modeNormal', opener: 'modeOpenNormal' },
  { id: 'coach', emoji: '🏃‍♀️', key: 'modeCoach', opener: 'modeOpenCoach' },
  { id: 'relax', emoji: '🧘', key: 'modeRelax', opener: 'modeOpenRelax' },
  { id: 'cycle', emoji: '🩸', key: 'modeCycle', opener: 'modeOpenCycle' },
  { id: 'nutrition', emoji: '🥗', key: 'modeNutrition', opener: 'modeOpenNutrition' },
  { id: 'motivate', emoji: '🌟', key: 'modeMotivate', opener: 'modeOpenMotivate' },
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
