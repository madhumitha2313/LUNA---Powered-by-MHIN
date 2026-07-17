/**
 * MIRA Research Platform (Part 25) — a privacy-first research ecosystem.
 *
 * Everything here is designed so that NO personally identifiable health
 * information ever leaves the device. Participation is opt-in, granular and
 * revocable; population insights are aggregate + anonymised; and the
 * anonymisation engine is demonstrated live on the user's own profile so they
 * can see exactly what would (and would not) be shared. All on-device in this
 * preview — population figures are illustrative aggregates, never real people.
 */
import { getProfile, getCycleStats, getLogs } from './localStore'
import { moodSummary } from './moodIntel'

const KEY = 'mira.research.v1'
const DAY = 86400000

function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }

// Consent levels — off by default (nothing is shared unless the user opts in).
export const CONSENT_LEVELS = [
  { id: 'l1', emoji: '📊', titleKey: 'rsL1', descKey: 'rsL1Desc' },
  { id: 'l2', emoji: '📈', titleKey: 'rsL2', descKey: 'rsL2Desc' },
  { id: 'l3', emoji: '🔬', titleKey: 'rsL3', descKey: 'rsL3Desc' },
  { id: 'l4', emoji: '🏥', titleKey: 'rsL4', descKey: 'rsL4Desc' },
  { id: 'l5', emoji: '🧠', titleKey: 'rsL5', descKey: 'rsL5Desc' },
]

const DEFAULT = () => ({ levels: { l1: false, l2: false, l3: false, l4: false, l5: false }, joined: [], log: [] })
export function getResearch() { const s = read(); return s ? { ...DEFAULT(), ...s, levels: { ...DEFAULT().levels, ...(s.levels || {}) } } : DEFAULT() }
function save(patch) { const next = { ...getResearch(), ...patch }; write(next); return next }
function logEvent(actionKey, extra = {}) {
  const s = getResearch()
  const entry = { id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), at: new Date().toISOString(), actionKey, ...extra }
  write({ ...s, log: [entry, ...s.log].slice(0, 50) })
  return entry
}
export function setLevel(id, on) {
  const levels = { ...getResearch().levels, [id]: !!on }
  logEvent(on ? 'rlOn' : 'rlOff', { level: id })
  return save({ levels })
}
export function anyConsent() { return Object.values(getResearch().levels).some(Boolean) }
export function consentHistory() { return getResearch().log }

// ── Anonymisation engine (live, on the user's own profile) ───────────────────
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(16) }
export function anonId() {
  const p = getProfile()
  return 'MIRA-' + hash((p.name || 'anon') + (p.birthYear || '') + '-salt').slice(0, 8).toUpperCase()
}
/** Before → after view of what anonymisation removes vs keeps. */
export function anonymize() {
  const p = getProfile(); const stats = getCycleStats()
  const removed = [
    { key: 'anRmName', before: p.name || '—' },
    { key: 'anRmEmail', before: p.email || 'you@email.com' },
    { key: 'anRmPhone', before: p.phone || '+91 •••• ••••' },
    { key: 'anRmLocation', before: p.city || '—' },
    { key: 'anRmDevice', before: 'device-a1b2c3' },
  ]
  const kept = [
    { key: 'anKeepId', value: anonId() },
    { key: 'anKeepAge', value: p.birthYear ? bucketAge(new Date().getFullYear() - p.birthYear) : '—' },
    { key: 'anKeepCycle', value: stats.avgCycleLength ? `~${stats.avgCycleLength}d` : '—' },
    { key: 'anKeepRegion', value: 'South Asia' },
  ]
  return { removed, kept }
}
function bucketAge(a) { if (a < 18) return '<18'; if (a < 25) return '18–24'; if (a < 35) return '25–34'; if (a < 45) return '35–44'; return '45+' }

// ── Privacy-preserving learning explainers ───────────────────────────────────
export const PRIVACY_TECH = [
  { emoji: '🔗', titleKey: 'ppFederated', descKey: 'ppFederatedDesc' },
  { emoji: '➕', titleKey: 'ppAggregate', descKey: 'ppAggregateDesc' },
  { emoji: '🎲', titleKey: 'ppDiffPriv', descKey: 'ppDiffPrivDesc' },
  { emoji: '📱', titleKey: 'ppOnDevice', descKey: 'ppOnDeviceDesc' },
]

// ── Study catalog (illustrative research collaborations) ──────────────────────
export const STUDIES = [
  { id: 's1', emoji: '🌸', titleKey: 'stPcosTitle', orgKey: 'stPcosOrg', orgType: 'hospital', status: 'active', level: 'l3', topic: 'pcos', durationKey: 'stDur12w', commitmentKey: 'stCommitLow', benefitKey: 'stPcosBenefit', tags: ['irregular', 'acne', 'hirsutism'] },
  { id: 's2', emoji: '🥗', titleKey: 'stNutriTitle', orgKey: 'stNutriOrg', orgType: 'university', status: 'active', level: 'l3', topic: 'nutrition', durationKey: 'stDur8w', commitmentKey: 'stCommitLow', benefitKey: 'stNutriBenefit', tags: ['nutrition'] },
  { id: 's3', emoji: '😴', titleKey: 'stSleepTitle', orgKey: 'stSleepOrg', orgType: 'university', status: 'active', level: 'l3', topic: 'sleep', durationKey: 'stDur6w', commitmentKey: 'stCommitLow', benefitKey: 'stSleepBenefit', tags: ['sleep'] },
  { id: 's4', emoji: '🧠', titleKey: 'stMoodTitle', orgKey: 'stMoodOrg', orgType: 'hospital', status: 'active', level: 'l3', topic: 'mood', durationKey: 'stDur10w', commitmentKey: 'stCommitMed', benefitKey: 'stMoodBenefit', tags: ['mood'] },
  { id: 's5', emoji: '🩸', titleKey: 'stEndoTitle', orgKey: 'stEndoOrg', orgType: 'hospital', status: 'upcoming', level: 'l4', topic: 'endometriosis', durationKey: 'stDur16w', commitmentKey: 'stCommitMed', benefitKey: 'stEndoBenefit', tags: ['pelvic_pain', 'heavy'] },
  { id: 's6', emoji: '📚', titleKey: 'stEduTitle', orgKey: 'stEduOrg', orgType: 'ngo', status: 'completed', level: 'l2', topic: 'education', durationKey: 'stDur4w', commitmentKey: 'stCommitLow', benefitKey: 'stEduBenefit', tags: [] },
]
export function study(id) { return STUDIES.find((s) => s.id === id) }
export function joinedStudies() { return getResearch().joined.map(study).filter(Boolean) }
export function isJoined(id) { return getResearch().joined.includes(id) }
export function joinStudy(id) {
  const s = getResearch()
  if (s.joined.includes(id)) return s
  logEvent('rJoined', { study: id })
  return save({ joined: [...s.joined, id] })
}
export function leaveStudy(id) {
  logEvent('rLeft', { study: id })
  return save({ joined: getResearch().joined.filter((x) => x !== id) })
}

/** AI eligibility matching — suggest studies from the user's own data, with a
 *  plain-language reason for each suggestion. */
export function eligibilityMatches() {
  const stats = getCycleStats(); const logs = getLogs()
  const out = []
  const sym = (() => { try { return JSON.parse(localStorage.getItem('mira.symptoms.v1')) || {} } catch { return {} } })()
  const on = Object.keys(sym).filter((k) => sym[k])
  if (stats.regularity === 'irregular' || on.includes('acne') || on.includes('hirsutism')) out.push({ id: 's1', reasonKey: 'stMatchPcos' })
  if (logs.length >= 3) out.push({ id: 's2', reasonKey: 'stMatchNutri' })
  if (on.includes('sleep') || logs.some((l) => l.sleep)) out.push({ id: 's3', reasonKey: 'stMatchSleep' })
  if (logs.some((l) => l.mood)) out.push({ id: 's4', reasonKey: 'stMatchMood' })
  const seen = new Set()
  return out.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)) && study(m.id)?.status === 'active').slice(0, 3)
}

/** Plain-language explainer MIRA shows before joining any study. */
export function studyExplainer(id) {
  const s = study(id); if (!s) return null
  return {
    study: s,
    rows: [
      { icon: '🎯', labelKey: 'exPurpose', valueKey: `${s.topic}_exPurpose` },
      { icon: '🛡️', labelKey: 'exPrivacy', valueKey: 'exPrivacyVal' },
      { icon: '⏱️', labelKey: 'exTime', valueKey: s.commitmentKey },
      { icon: '📦', labelKey: 'exData', valueKey: 'exDataVal' },
      { icon: '💝', labelKey: 'exBenefit', valueKey: s.benefitKey },
      { icon: '⚖️', labelKey: 'exRisks', valueKey: 'exRisksVal' },
      { icon: '💰', labelKey: 'exComp', valueKey: 'exCompVal' },
    ],
    levelKey: CONSENT_LEVELS.find((l) => l.id === s.level)?.titleKey,
  }
}

// ── Population health analytics (anonymised, illustrative aggregates) ─────────
export function populationStats() {
  return {
    participants: 48213,
    studies: STUDIES.length,
    cycleLength: [ // distribution buckets
      { label: '24–26', v: 18 }, { label: '27–29', v: 41 }, { label: '30–32', v: 27 }, { label: '33–35', v: 10 }, { label: '36+', v: 4 },
    ],
    hydration: [52, 58, 61, 57, 64, 70, 66], // % of daily goal, last 7 days
    mood: [58, 60, 57, 63, 66, 64, 68], // avg positivity, weekly
    topSymptoms: [ { label: 'sym_cramps', v: 62 }, { label: 'sym_bloating', v: 48 }, { label: 'sym_fatigue', v: 44 }, { label: 'sym_headache', v: 31 } ],
    learningCompletion: 73,
  }
}

/** AI fairness — aggregate performance parity across cohorts (all equitable). */
export function fairnessMetrics() {
  return [
    { key: 'fairLang', groups: [ { g: 'English', v: 94 }, { g: 'தமிழ்', v: 92 }, { g: 'हिन्दी', v: 91 } ] },
    { key: 'fairAge', groups: [ { g: '18–24', v: 93 }, { g: '25–34', v: 94 }, { g: '35–44', v: 92 } ] },
    { key: 'fairDevice', groups: [ { g: 'Mobile', v: 93 }, { g: 'Desktop', v: 94 } ] },
  ]
}

// ── Contribution & badges ─────────────────────────────────────────────────────
export const BADGES = [
  { id: 'first', emoji: '🌱', titleKey: 'bgFirst', need: (c) => c.joinedCount >= 1 },
  { id: 'triple', emoji: '🌿', titleKey: 'bgTriple', need: (c) => c.joinedCount >= 3 },
  { id: 'privacy', emoji: '🛡️', titleKey: 'bgPrivacy', need: (c) => c.levelsOn >= 1 },
  { id: 'champion', emoji: '🏆', titleKey: 'bgChampion', need: (c) => c.joinedCount >= 5 },
]
export function contribution() {
  const r = getResearch()
  const levelsOn = Object.values(r.levels).filter(Boolean).length
  const joinedCount = r.joined.length
  // anonymous data points "contributed" grows with logs + participation
  const dataPoints = anyConsent() ? getLogs().length * levelsOn + joinedCount * 12 : 0
  const c = { joinedCount, levelsOn, dataPoints }
  return { ...c, badges: BADGES.map((b) => ({ ...b, earned: b.need(c) })) }
}
