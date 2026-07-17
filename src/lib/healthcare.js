/**
 * MIRA Healthcare Network (Part 24) — a secure, AI-assisted telemedicine layer.
 *
 * Connects the user to a verified doctor network, prepares consultations from
 * the user's OWN data (cycle, mood, symptoms, nutrition), organises
 * prescriptions / medications / care plans / follow-ups, and keeps every
 * data-sharing action under explicit, revocable consent — all on-device in this
 * preview. MIRA assists licensed professionals; it never diagnoses or changes
 * medication. Doctor profiles here are illustrative sample professionals.
 */
import { getProfile, getCycleStats, getLogs, getSymptoms } from './localStore'
import { insights as cycleInsights } from './cycleIntel'
import { moodSummary, moodInsights } from './moodIntel'
import { getWaterToday, WATER_GOAL } from './nutritionIntel'

const KEY = 'mira.health.v1'
const DAY = 86400000

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }
const DEFAULT = () => ({ appointments: [], meds: [], carePlans: [], consent: [], shared: {} })
export function getStore() { return { ...DEFAULT(), ...(read() || {}) } }
function save(patch) { const next = { ...getStore(), ...patch }; write(next); return next }

// ── Verified doctor network (illustrative sample professionals) ──────────────
export const SPECIALTIES = [
  { id: 'gynecologist', emoji: '🩺' }, { id: 'obstetrician', emoji: '🤰' },
  { id: 'endocrinologist', emoji: '⚗️' }, { id: 'dermatologist', emoji: '✨' },
  { id: 'nutritionist', emoji: '🥗' }, { id: 'mentalHealth', emoji: '🧠' },
  { id: 'physiotherapist', emoji: '🤸‍♀️' }, { id: 'generalPhysician', emoji: '🏥' },
  { id: 'fertility', emoji: '🌸' }, { id: 'wellnessCoach', emoji: '🌿' },
]
export const LANGS = ['en', 'ta', 'hi', 'te', 'ml']

export const DOCTORS = [
  { id: 'd1', avatar: '👩🏽‍⚕️', name: 'Dr. Ananya Rao', spec: 'gynecologist', qual: 'MBBS, MD (OBGYN)', exp: 12, langs: ['en', 'ta', 'hi'], clinic: 'Apollo Women’s Centre', fee: 600, rating: 4.9, reviews: 412, modes: ['video', 'chat', 'clinic'], verified: true, bioKey: 'docBio_d1' },
  { id: 'd2', avatar: '👩🏻‍⚕️', name: 'Dr. Meera Krishnan', spec: 'endocrinologist', qual: 'MBBS, DM (Endocrinology)', exp: 15, langs: ['en', 'ta'], clinic: 'Fortis Endocrine Clinic', fee: 800, rating: 4.8, reviews: 289, modes: ['video', 'chat'], verified: true, bioKey: 'docBio_d2' },
  { id: 'd3', avatar: '👩🏾‍⚕️', name: 'Dr. Fatima Sheikh', spec: 'nutritionist', qual: 'MSc Clinical Nutrition, RD', exp: 9, langs: ['en', 'hi', 'ta'], clinic: 'MIRA Nutrition Studio', fee: 400, rating: 4.9, reviews: 531, modes: ['video', 'chat'], verified: true, bioKey: 'docBio_d3' },
  { id: 'd4', avatar: '👩🏼‍⚕️', name: 'Dr. Sara Thomas', spec: 'mentalHealth', qual: 'MA, MPhil Clinical Psychology', exp: 11, langs: ['en', 'ml'], clinic: 'Calm Minds Practice', fee: 700, rating: 5.0, reviews: 198, modes: ['video', 'chat'], verified: true, bioKey: 'docBio_d4' },
  { id: 'd5', avatar: '👩🏽‍⚕️', name: 'Dr. Priya Menon', spec: 'gynecologist', qual: 'MBBS, DGO', exp: 8, langs: ['en', 'ta', 'ml'], clinic: 'Cloudnine Clinic', fee: 550, rating: 4.7, reviews: 267, modes: ['video', 'clinic'], verified: true, bioKey: 'docBio_d5' },
  { id: 'd6', avatar: '👩🏻‍⚕️', name: 'Dr. Aisha Kapoor', spec: 'dermatologist', qual: 'MBBS, MD (Dermatology)', exp: 10, langs: ['en', 'hi'], clinic: 'SkinGlow Derma', fee: 650, rating: 4.8, reviews: 344, modes: ['video', 'chat', 'clinic'], verified: true, bioKey: 'docBio_d6' },
  { id: 'd7', avatar: '👩🏾‍⚕️', name: 'Dr. Nisha Reddy', spec: 'fertility', qual: 'MBBS, MS, Fellowship (ART)', exp: 14, langs: ['en', 'te', 'hi'], clinic: 'Hope Fertility Centre', fee: 900, rating: 4.9, reviews: 176, modes: ['video', 'clinic'], verified: true, bioKey: 'docBio_d7' },
  { id: 'd8', avatar: '👩🏼‍⚕️', name: 'Dr. Lakshmi Iyer', spec: 'generalPhysician', qual: 'MBBS, MD (Medicine)', exp: 13, langs: ['en', 'ta'], clinic: 'CityCare Family Clinic', fee: 450, rating: 4.7, reviews: 388, modes: ['video', 'chat', 'clinic'], verified: true, bioKey: 'docBio_d8' },
  { id: 'd9', avatar: '🧑🏽‍⚕️', name: 'Coach Divya Nair', spec: 'wellnessCoach', qual: 'Certified Women’s Wellness Coach', exp: 7, langs: ['en', 'ta', 'ml'], clinic: 'MIRA Wellness (educational)', fee: 300, rating: 4.9, reviews: 620, modes: ['video', 'chat'], verified: true, bioKey: 'docBio_d9' },
]

// Map symptom storage keys → their i18n label keys (mirrors the Symptoms page).
const SYM_LABEL = {
  irregular: 'symIrregular', heavy: 'symHeavy', spotting: 'symSpotting', pelvic_pain: 'symPelvic',
  acne: 'symAcne', hirsutism: 'symHirsutism', hair_thinning: 'symHairThin', dark_patches: 'symDarkPatch',
  weight: 'symWeight', cravings: 'symCravings', bloating: 'symBloating',
  mood: 'symMood', fatigue: 'symFatigue', sleep: 'symSleep',
}

export function doctor(id) { return DOCTORS.find((d) => d.id === id) }
export function filterDoctors({ spec, lang, mode, maxFee } = {}) {
  return DOCTORS.filter((d) =>
    (!spec || d.spec === spec) && (!lang || d.langs.includes(lang)) &&
    (!mode || d.modes.includes(mode)) && (!maxFee || d.fee <= maxFee))
}

/** AI-suggested specialty from the user's active symptoms/data. */
export function suggestedSpecialty() {
  const s = getSymptoms(); const on = Object.keys(s).filter((k) => s[k])
  if (['hirsutism', 'acne', 'weight', 'dark_patches'].filter((k) => on.includes(k)).length >= 2) return 'endocrinologist'
  if (getCycleStats().regularity === 'irregular') return 'gynecologist'
  return 'gynecologist'
}

// Next few available slots for a doctor (deterministic, upcoming days).
export function slotsFor(id, days = 4) {
  const out = []
  const times = ['09:30', '11:00', '14:30', '17:00']
  for (let d = 1; d <= days; d++) {
    const date = new Date(Date.now() + d * DAY)
    const n = (id.charCodeAt(1) + d) % times.length
    out.push({ date: date.toISOString().slice(0, 10), time: times[n] })
    if (d % 2 === 0) out.push({ date: date.toISOString().slice(0, 10), time: times[(n + 2) % times.length] })
  }
  return out
}

// ── Appointments ─────────────────────────────────────────────────────────────
export function bookAppointment(docId, { date, time, mode }) {
  const s = getStore()
  const appt = { id: 'a' + Date.now().toString(36), docId, date, time, mode, status: 'upcoming', createdAt: new Date().toISOString() }
  logConsent('apptBooked', docId)
  save({ appointments: [appt, ...s.appointments] })
  return appt
}
export function rescheduleAppointment(id, { date, time }) {
  return save({ appointments: getStore().appointments.map((a) => (a.id === id ? { ...a, date, time } : a)) })
}
export function cancelAppointment(id) {
  return save({ appointments: getStore().appointments.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)) })
}
export function upcomingAppointments() {
  return getStore().appointments.filter((a) => a.status === 'upcoming')
    .sort((x, y) => new Date(x.date + 'T' + x.time) - new Date(y.date + 'T' + y.time))
}
export function pastAppointments() {
  return getStore().appointments.filter((a) => a.status === 'completed' || a.status === 'cancelled')
}

/** Complete a consultation → attach a SAMPLE post-consult summary, seed a care
 *  plan + a medication + follow-ups. Clearly illustrative, not a real doctor. */
export function completeConsult(id) {
  const s = getStore()
  const appt = s.appointments.find((a) => a.id === id)
  if (!appt) return s
  const doc = doctor(appt.docId)
  const summary = {
    recommendKeys: ['pcRec1', 'pcRec2', 'pcRec3'],
    lifestyleKeys: ['pcLife1', 'pcLife2'],
    followUpDate: new Date(Date.now() + 28 * DAY).toISOString().slice(0, 10),
  }
  const rx = { id: 'rx' + Date.now().toString(36), docId: appt.docId, date: appt.date, medKeys: ['rxMed1', 'rxMed2'], instructionsKey: 'rxInstr', signed: true }
  const med = { id: 'm' + Date.now().toString(36), nameKey: 'rxMed1', dose: '1', freq: 'daily', times: ['09:00'], startedAt: new Date().toISOString(), doses: {}, sideEffects: [], fromRx: rx.id }
  const plan = { id: 'cp' + Date.now().toString(36), docId: appt.docId, createdAt: new Date().toISOString(),
    goals: [{ key: 'goalHydration', target: '8 glasses' }, { key: 'goalSleep', target: '7–8 hrs' }, { key: 'goalIron', target: 'iron-rich meals' }],
    followUpDate: summary.followUpDate }
  const appointments = s.appointments.map((a) => (a.id === id ? { ...a, status: 'completed', summary, rxId: rx.id } : a))
  logConsent('consultDone', appt.docId)
  return save({ appointments, prescriptions: [rx, ...(s.prescriptions || [])], meds: [med, ...s.meds], carePlans: [plan, ...s.carePlans] })
}
export function getPrescriptions() { return getStore().prescriptions || [] }

// ── AI pre-consultation assistant (built from the user's real data) ──────────
export function preConsult() {
  const p = getProfile(); const stats = getCycleStats(); const mood = moodSummary(14)
  const sym = getSymptoms(); const onSym = Object.keys(sym).filter((k) => sym[k])
  const water = getWaterToday()
  const obs = [...cycleInsights(), ...moodInsights()]
  const seen = new Set(); const observations = obs.filter((o) => (seen.has(o.key) ? false : (seen.add(o.key), true))).slice(0, 3)

  const sections = [
    { id: 'summary', icon: '📋', titleKey: 'pcSummary', share: true, lines: [
      { key: 'pcLineName', vars: { name: p.name || '—' } },
      stats.phase ? { key: 'pcLinePhase', vars: { phase: stats.phase } } : null,
      stats.avgCycleLength ? { key: 'pcLineCycle', vars: { n: stats.avgCycleLength } } : null,
    ].filter(Boolean) },
    { id: 'symptoms', icon: '🩹', titleKey: 'pcSymptoms', share: true, lines: onSym.length ? onSym.slice(0, 6).filter((k) => SYM_LABEL[k]).map((k) => ({ key: SYM_LABEL[k], plain: true })) : [{ key: 'pcNone' }] },
    { id: 'cycle', icon: '🌙', titleKey: 'pcCycle', share: true, lines: [
      stats.regularity ? { key: 'pcLineReg', vars: { r: stats.regularity } } : { key: 'pcNoData' },
      stats.daysUntilNext != null ? { key: 'pcLineNext', vars: { n: stats.daysUntilNext } } : null,
    ].filter(Boolean) },
    { id: 'mood', icon: '💗', titleKey: 'pcMood', share: true, lines: mood.positivity != null ? [{ key: 'pcLineMood', vars: { n: Math.round(mood.positivity) } }] : [{ key: 'pcNoData' }] },
    { id: 'nutrition', icon: '🥗', titleKey: 'pcNutrition', share: false, lines: [{ key: 'pcLineWater', vars: { n: water, g: WATER_GOAL } }] },
    { id: 'meds', icon: '💊', titleKey: 'pcMeds', share: true, lines: getStore().meds.length ? getStore().meds.map((m) => ({ key: m.nameKey, plain: true })) : [{ key: 'pcNone' }] },
    { id: 'observations', icon: '🔍', titleKey: 'pcObservations', share: true, lines: observations.length ? observations.map((o) => ({ key: o.key, vars: o })) : [{ key: 'pcNone' }] },
    { id: 'questions', icon: '❓', titleKey: 'pcQuestions', share: true, lines: suggestQuestions(stats, onSym).map((k) => ({ key: k })) },
  ]
  return sections
}
function suggestQuestions(stats, onSym) {
  const q = []
  if (stats.regularity === 'irregular') q.push('pcQ_irregular')
  if (onSym.includes('acne') || onSym.includes('hirsutism')) q.push('pcQ_hormonal')
  if (onSym.includes('cramps') || onSym.includes('pain')) q.push('pcQ_pain')
  q.push('pcQ_tests'); q.push('pcQ_lifestyle')
  return q.slice(0, 4)
}

// ── Medication manager ───────────────────────────────────────────────────────
export function addMedication(med) {
  const m = { id: 'm' + Date.now().toString(36), doses: {}, sideEffects: [], startedAt: new Date().toISOString(), ...med }
  return save({ meds: [m, ...getStore().meds] })
}
export function removeMedication(id) { return save({ meds: getStore().meds.filter((m) => m.id !== id) }) }
export function markDose(id, day = new Date().toISOString().slice(0, 10)) {
  return save({ meds: getStore().meds.map((m) => (m.id === id ? { ...m, doses: { ...m.doses, [day]: !m.doses[day] } } : m)) })
}
export function logSideEffect(id, text) {
  return save({ meds: getStore().meds.map((m) => (m.id === id ? { ...m, sideEffects: [{ at: new Date().toISOString(), text }, ...m.sideEffects] } : m)) })
}
/** Adherence over the last `days` (0–100). */
export function adherence(days = 7) {
  const meds = getStore().meds
  if (!meds.length) return null
  let taken = 0, total = 0
  for (let i = 0; i < days; i++) {
    const day = new Date(Date.now() - i * DAY).toISOString().slice(0, 10)
    meds.forEach((m) => { if (new Date(m.startedAt) <= new Date(day + 'T23:59')) { total++; if (m.doses[day]) taken++ } })
  }
  return total ? Math.round((taken / total) * 100) : null
}

// ── Care plans ───────────────────────────────────────────────────────────────
export function getCarePlans() { return getStore().carePlans }

// ── Follow-up tasks (derived) ────────────────────────────────────────────────
export function followUpTasks() {
  const s = getStore(); const out = []
  upcomingAppointments().slice(0, 2).forEach((a) => out.push({ icon: '📅', key: 'fuAppt', vars: { name: doctor(a.docId)?.name || '', date: a.date } }))
  const today = new Date().toISOString().slice(0, 10)
  s.meds.forEach((m) => { if (!m.doses[today]) out.push({ icon: '💊', key: 'fuMed', vars: { name: '' }, medNameKey: m.nameKey }) })
  s.carePlans.slice(0, 1).forEach((p) => out.push({ icon: '🎯', key: 'fuFollowUp', vars: { date: p.followUpDate } }))
  return out.slice(0, 5)
}

// ── Consent & sharing log ────────────────────────────────────────────────────
export function logConsent(actionKey, docId, extra = {}) {
  const s = getStore()
  const entry = { id: 'c' + Date.now().toString(36), at: new Date().toISOString(), actionKey, docId, ...extra }
  write({ ...s, consent: [entry, ...s.consent].slice(0, 40) })
  return entry
}
export function consentLog() { return getStore().consent }
export function shareWithDoctor(docId, sectionIds, expiryDays = 30) {
  const shared = { ...getStore().shared, [docId]: { sections: sectionIds, at: new Date().toISOString(), expires: new Date(Date.now() + expiryDays * DAY).toISOString() } }
  logConsent('shared', docId, { count: sectionIds.length })
  return save({ shared })
}
export function revokeShare(docId) {
  const shared = { ...getStore().shared }; delete shared[docId]
  logConsent('revoked', docId)
  return save({ shared })
}

// ── Unified health-record timeline ───────────────────────────────────────────
export function recordTimeline() {
  const s = getStore(); const rows = []
  s.appointments.forEach((a) => rows.push({ at: a.date, icon: '🩺', key: a.status === 'completed' ? 'rtConsult' : 'rtAppt', vars: { name: doctor(a.docId)?.name || '', spec: a.docId } }))
  ;(s.prescriptions || []).forEach((r) => rows.push({ at: r.date, icon: '💊', key: 'rtRx', vars: {} }))
  s.carePlans.forEach((p) => rows.push({ at: p.createdAt.slice(0, 10), icon: '🎯', key: 'rtPlan', vars: {} }))
  getLogs().slice(0, 3).forEach((l) => rows.push({ at: (l.date || '').slice(0, 10), icon: '📝', key: 'rtLog', vars: { mood: l.mood || '' } }))
  return rows.sort((x, y) => new Date(y.at) - new Date(x.at)).slice(0, 8)
}
