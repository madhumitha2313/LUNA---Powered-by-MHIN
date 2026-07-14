/**
 * MIRA Safety — the emergency + care-circle data layer. Trusted contacts, a
 * user-controlled emergency health card, country emergency numbers, secure
 * live-location sharing (via the device's own share/link — nothing leaves the
 * device until the user sends it), and a safety check-in timer. All local.
 *
 * MIRA never replaces emergency services — every path routes the user to real
 * help (tel:, maps, the people they trust) as fast as possible.
 */
import { getProfile, getSettings } from './localStore'

const CIRCLE_KEY = 'mira.circle.v1'
const CARD_KEY = 'mira.healthcard.v1'
const NUM_KEY = 'mira.emgnum.v1'
const CHECKIN_KEY = 'mira.checkin.v1'

function read(key, fb) { try { return JSON.parse(localStorage.getItem(key)) ?? fb } catch { return fb } }
function write(key, v) { try { localStorage.setItem(key, JSON.stringify(v)) } catch { /* ignore */ } }

// ── Trusted family & care circle ─────────────────────────────────────────────
export const RELATIONSHIPS = ['relMother', 'relFather', 'relSister', 'relBrother', 'relPartner', 'relFriend', 'relDoctor', 'relCaregiver', 'relGuardian']

export function getCircle() {
  const list = read(CIRCLE_KEY, null)
  if (list) return list
  // Seed from the onboarding emergency contact, if any.
  const s = getSettings()
  const seed = s.emergencyPhone ? [{ id: 'c_seed', name: s.emergencyName || 'Emergency contact', rel: 'relGuardian', phone: s.emergencyPhone, method: 'call' }] : []
  write(CIRCLE_KEY, seed)
  return seed
}
export function addContact(c) {
  const list = getCircle()
  const next = [...list, { id: `c_${Date.now()}`, method: 'call', ...c }]
  write(CIRCLE_KEY, next)
  return next
}
export function updateContact(id, patch) {
  const next = getCircle().map((c) => (c.id === id ? { ...c, ...patch } : c))
  write(CIRCLE_KEY, next)
  return next
}
export function removeContact(id) {
  const next = getCircle().filter((c) => c.id !== id)
  write(CIRCLE_KEY, next)
  return next
}
export function primaryContact() {
  return getCircle()[0] || null
}

// ── Emergency health card (user controls what's shared) ───────────────────────
export function getHealthCard() {
  const stored = read(CARD_KEY, null)
  const p = getProfile()
  const base = {
    name: p.name || '', age: p.age || '', blood: '', conditions: p.condition || '',
    allergies: '', meds: '', doctor: '', insurance: '',
  }
  return { ...base, ...(stored || {}) }
}
export function saveHealthCard(patch) {
  const next = { ...getHealthCard(), ...patch }
  write(CARD_KEY, next)
  return next
}

// ── Emergency numbers (India defaults, editable) ─────────────────────────────
const DEFAULT_NUMBERS = [
  { id: 'n_all', key: 'numAll', number: '112', emoji: '🚨' },
  { id: 'n_amb', key: 'numAmbulance', number: '108', emoji: '🚑' },
  { id: 'n_matb', key: 'numMaternity', number: '102', emoji: '🤰' },
  { id: 'n_women', key: 'numWomen', number: '1091', emoji: '👩' },
  { id: 'n_dv', key: 'numDomestic', number: '181', emoji: '💜' },
  { id: 'n_police', key: 'numPolice', number: '100', emoji: '👮‍♀️' },
]
export function getNumbers() {
  return read(NUM_KEY, null) || DEFAULT_NUMBERS
}
export function addNumber(label, number) {
  const next = [...getNumbers(), { id: `n_${Date.now()}`, label, number, emoji: '📞', custom: true }]
  write(NUM_KEY, next)
  return next
}
export function removeNumber(id) {
  const next = getNumbers().filter((n) => n.id !== id)
  write(NUM_KEY, next)
  return next
}

// ── Live location (device-only until the user shares it) ─────────────────────
export function getLocation() {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        resolve({ lat: latitude, lng: longitude, maps: `https://www.google.com/maps?q=${latitude},${longitude}` })
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 60000, enableHighAccuracy: true }
    )
  })
}

/** Build the message a user sends to a trusted contact. */
export function locationMessage(loc, name) {
  const who = name || 'I'
  if (!loc) return `${who} may need help. Please call me. — sent from MIRA`
  return `${who} may need help. My live location: ${loc.maps} (sent ${new Date().toLocaleTimeString()}) — via MIRA`
}

/** Share/open helpers (device chooses the app). */
export function shareVia(method, phone, text) {
  const enc = encodeURIComponent(text)
  if (method === 'whatsapp') return phone ? `https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${enc}` : `https://wa.me/?text=${enc}`
  if (method === 'sms') return `sms:${phone || ''}?&body=${enc}`
  if (method === 'email') return `mailto:${phone || ''}?subject=${encodeURIComponent('I may need help')}&body=${enc}`
  return null
}

/** Hospital finder — opens the map centred on the user (or a plain search). */
export function hospitalSearchUrl(loc, kind = 'hospital') {
  if (loc) return `https://www.google.com/maps/search/${encodeURIComponent(kind)}/@${loc.lat},${loc.lng},14z`
  return `https://www.google.com/maps/search/${encodeURIComponent(kind + ' near me')}`
}
export function osmUrl(loc) {
  if (loc) return `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=15/${loc.lat}/${loc.lng}`
  return 'https://www.openstreetmap.org/search?query=hospital'
}

// ── Safety check-in ──────────────────────────────────────────────────────────
export function getCheckin() {
  return read(CHECKIN_KEY, null)
}
export function startCheckin({ minutes, contactId, message }) {
  const v = { until: Date.now() + minutes * 60000, contactId, message, minutes }
  write(CHECKIN_KEY, v)
  return v
}
export function cancelCheckin() {
  try { localStorage.removeItem(CHECKIN_KEY) } catch { /* ignore */ }
}
