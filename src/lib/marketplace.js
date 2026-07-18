/**
 * MIRA Marketplace (Part 28) — a secure, permission-based plugin & AI-agent
 * ecosystem. Verified partners extend MIRA through skills, health tools,
 * hospital/university/lab modules, wearable connectors and installable AI
 * agents — each with a clear verification badge, minimal scoped permissions,
 * an explicit consent step, and full user control (disable / uninstall /
 * revoke). All on-device in this preview; plugins and partners are illustrative
 * catalog entries, clearly labelled, and nothing executes real third-party code.
 */
const KEY = 'mira.marketplace.v1'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }
const DEFAULT = () => ({ installed: [], dataLog: [] })
export function getMarket() { return { ...DEFAULT(), ...(read() || {}) } }
function save(patch) { const next = { ...getMarket(), ...patch }; write(next); return next }

// ── Categories ────────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'ai', emoji: '🤖', key: 'catAi' }, { id: 'nutrition', emoji: '🥗', key: 'catNutrition' },
  { id: 'fitness', emoji: '🤸‍♀️', key: 'catFitness' }, { id: 'meditation', emoji: '🧘‍♀️', key: 'catMeditation' },
  { id: 'sleep', emoji: '😴', key: 'catSleep' }, { id: 'mental', emoji: '🧠', key: 'catMental' },
  { id: 'womens', emoji: '🌸', key: 'catWomens' }, { id: 'hospital', emoji: '🏥', key: 'catHospital' },
  { id: 'lab', emoji: '🧪', key: 'catLab' }, { id: 'research', emoji: '🔬', key: 'catResearch' },
  { id: 'wearable', emoji: '⌚', key: 'catWearable' }, { id: 'education', emoji: '📚', key: 'catEducation' },
]
export function category(id) { return CATEGORIES.find((c) => c.id === id) }

// ── Verification badges ───────────────────────────────────────────────────────
export const BADGES = {
  mira: { key: 'vbMira', tone: 'ai', emoji: '✔' },
  healthcare: { key: 'vbHealthcare', tone: 'success', emoji: '🩺' },
  university: { key: 'vbUniversity', tone: 'accent', emoji: '🎓' },
  hospital: { key: 'vbHospital', tone: 'success', emoji: '🏥' },
  research: { key: 'vbResearch', tone: 'ai', emoji: '🔬' },
  developer: { key: 'vbDeveloper', tone: 'neutral', emoji: '👩‍💻' },
  beta: { key: 'vbBeta', tone: 'warning', emoji: '🧪' },
  experimental: { key: 'vbExperimental', tone: 'warning', emoji: '⚗️' },
}

// ── Permission scopes (minimal, explicit) ─────────────────────────────────────
export const PERMISSIONS = {
  read_cycle: { emoji: '🌙', key: 'permReadCycle', sensitive: true },
  read_mood: { emoji: '💗', key: 'permReadMood', sensitive: true },
  read_nutrition: { emoji: '🥗', key: 'permReadNutrition', sensitive: false },
  write_nutrition: { emoji: '✍️', key: 'permWriteNutrition', sensitive: false },
  read_hydration: { emoji: '💧', key: 'permReadHydration', sensitive: false },
  read_reports: { emoji: '📄', key: 'permReadReports', sensitive: true },
  read_wearable: { emoji: '⌚', key: 'permReadWearable', sensitive: false },
  read_journey: { emoji: '🌸', key: 'permReadJourney', sensitive: false },
  notifications: { emoji: '🔔', key: 'permNotifications', sensitive: false },
  voice: { emoji: '🎙️', key: 'permVoice', sensitive: true },
  calendar: { emoji: '📅', key: 'permCalendar', sensitive: false },
}

// ── Plugin catalog (illustrative partner entries) ─────────────────────────────
export const PLUGINS = [
  { id: 'iron', name: 'Iron Intake Coach', dev: 'NutriHealth Labs', cat: 'nutrition', badge: 'healthcare', ver: '2.1.0', rating: 4.8, installs: 42100, langs: ['en', 'ta', 'hi'], perms: ['read_cycle', 'read_nutrition', 'write_nutrition', 'notifications'], descKey: 'mkPlIron', privacyKey: 'mkPrivMinimal', shots: ['🥬', '📊', '🔔'], featured: true },
  { id: 'yoga', name: 'Gentle Yoga Studio', dev: 'FlowWell', cat: 'fitness', badge: 'developer', ver: '1.4.2', rating: 4.7, installs: 31500, langs: ['en', 'ta'], perms: ['notifications'], descKey: 'mkPlYoga', privacyKey: 'mkPrivNone', shots: ['🧘‍♀️', '🎥', '📅'], featured: true },
  { id: 'breathe', name: 'Calm Breathing Coach', dev: 'Serene AI', cat: 'meditation', badge: 'mira', ver: '3.0.1', rating: 4.9, installs: 58800, langs: ['en', 'ta', 'hi', 'ml'], perms: ['notifications', 'voice'], descKey: 'mkPlBreathe', privacyKey: 'mkPrivVoice', shots: ['🌬️', '🎙️', '✨'], featured: true, skill: true },
  { id: 'sleep', name: 'Sleep Optimizer', dev: 'RestLab', cat: 'sleep', badge: 'developer', ver: '2.3.0', rating: 4.6, installs: 27400, langs: ['en'], perms: ['read_wearable', 'notifications'], descKey: 'mkPlSleep', privacyKey: 'mkPrivWearable', shots: ['😴', '📈', '🔔'] },
  { id: 'pcos', name: 'PCOS Companion', dev: 'Apollo Women’s', cat: 'womens', badge: 'healthcare', ver: '1.8.0', rating: 4.9, installs: 39200, langs: ['en', 'ta', 'hi'], perms: ['read_cycle', 'read_reports', 'read_journey'], descKey: 'mkPlPcos', privacyKey: 'mkPrivHealth', shots: ['🌸', '📄', '💡'], featured: true },
  { id: 'hormone', name: 'Hormone Education', dev: 'MedU Faculty', cat: 'education', badge: 'university', ver: '1.2.0', rating: 4.8, installs: 18600, langs: ['en', 'ta'], perms: ['read_journey'], descKey: 'mkPlHormone', privacyKey: 'mkPrivMinimal', shots: ['📚', '🎓', '🧬'] },
  { id: 'apollo', name: 'Apollo Care Connect', dev: 'Apollo Hospitals', cat: 'hospital', badge: 'hospital', ver: '4.0.0', rating: 4.7, installs: 51000, langs: ['en', 'ta', 'hi'], perms: ['read_reports', 'calendar', 'notifications'], descKey: 'mkPlApollo', privacyKey: 'mkPrivHealth', shots: ['🏥', '📅', '📄'] },
  { id: 'lab', name: 'LabConnect Diagnostics', dev: 'PathCare', cat: 'lab', badge: 'healthcare', ver: '2.0.3', rating: 4.5, installs: 22800, langs: ['en', 'ta'], perms: ['read_reports'], descKey: 'mkPlLab', privacyKey: 'mkPrivReports', shots: ['🧪', '📊', '📄'] },
  { id: 'oura', name: 'Oura Ring Connector', dev: 'Oura Health', cat: 'wearable', badge: 'developer', ver: '5.2.1', rating: 4.6, installs: 34700, langs: ['en'], perms: ['read_wearable'], descKey: 'mkPlOura', privacyKey: 'mkPrivWearable', shots: ['💍', '📈', '⌚'] },
  { id: 'mindful', name: 'Mindful Minutes', dev: 'CalmSpace', cat: 'mental', badge: 'mira', ver: '2.5.0', rating: 4.8, installs: 46300, langs: ['en', 'ta', 'hi'], perms: ['notifications'], descKey: 'mkPlMindful', privacyKey: 'mkPrivNone', shots: ['🧠', '🌿', '🔔'] },
  { id: 'meal', name: 'Meal Plan Studio', dev: 'GreenPlate', cat: 'nutrition', badge: 'developer', ver: '3.1.4', rating: 4.7, installs: 29900, langs: ['en', 'ta'], perms: ['read_nutrition', 'write_nutrition'], descKey: 'mkPlMeal', privacyKey: 'mkPrivMinimal', shots: ['🍲', '🛒', '📋'] },
  { id: 'cyclestudy', name: 'Cycle Research Study', dev: 'National Uni', cat: 'research', badge: 'research', ver: '1.0.0', rating: 4.9, installs: 12400, langs: ['en', 'ta'], perms: ['read_cycle'], descKey: 'mkPlCycleStudy', privacyKey: 'mkPrivAnon', shots: ['🔬', '📊', '🌙'] },
  { id: 'stress', name: 'Stress Relief Guide', dev: 'Indie Dev', cat: 'mental', badge: 'experimental', ver: '0.9.1', rating: 4.3, installs: 5200, langs: ['en'], perms: ['read_mood', 'voice'], descKey: 'mkPlStress', privacyKey: 'mkPrivVoice', shots: ['🌊', '🎙️', '💆‍♀️'] },
]

// ── AI agent marketplace (integrate with the multi-agent orchestrator) ────────
export const AGENTS = [
  { id: 'pregnancy', emoji: '🤰', name: 'Pregnancy Agent', dev: 'MIRA Labs', badge: 'beta', ver: '0.8.0', rating: 4.7, installs: 8900, perms: ['read_cycle', 'read_journey'], descKey: 'mkAgPregnancy' },
  { id: 'menopause', emoji: '🍂', name: 'Menopause Agent', dev: 'MIRA Labs', badge: 'beta', ver: '0.7.2', rating: 4.6, installs: 6400, perms: ['read_cycle', 'read_journey'], descKey: 'mkAgMenopause' },
  { id: 'skin', emoji: '✨', name: 'Skin Health Agent', dev: 'DermAI', badge: 'developer', ver: '1.1.0', rating: 4.5, installs: 14200, perms: ['read_journey'], descKey: 'mkAgSkin' },
  { id: 'sleepcoach', emoji: '🌙', name: 'Sleep Coach Agent', dev: 'RestLab', badge: 'developer', ver: '1.3.0', rating: 4.7, installs: 19800, perms: ['read_wearable'], descKey: 'mkAgSleep' },
  { id: 'medcoach', emoji: '💊', name: 'Medication Coach', dev: 'MIRA Labs', badge: 'mira', ver: '1.0.0', rating: 4.8, installs: 23100, perms: ['notifications'], descKey: 'mkAgMed' },
  { id: 'fitcoach', emoji: '🏃‍♀️', name: 'Fitness Coach Agent', dev: 'FlowWell', badge: 'developer', ver: '2.0.0', rating: 4.6, installs: 27600, perms: ['read_wearable', 'notifications'], descKey: 'mkAgFit' },
]

export function allItems() { return [...PLUGINS.map((p) => ({ ...p, isAgent: false })), ...AGENTS.map((a) => ({ ...a, isAgent: true, cat: 'ai' }))] }
export function item(id) { return allItems().find((x) => x.id === id) }

// ── Featured collections ──────────────────────────────────────────────────────
export const COLLECTIONS = [
  { id: 'pcosEss', emoji: '🌸', key: 'colPcos', items: ['pcos', 'iron', 'hormone'] },
  { id: 'mental', emoji: '🧠', key: 'colMental', items: ['mindful', 'breathe', 'stress'] },
  { id: 'sleepBetter', emoji: '😴', key: 'colSleep', items: ['sleep', 'sleepcoach', 'breathe'] },
  { id: 'eating', emoji: '🥗', key: 'colEating', items: ['meal', 'iron'] },
  { id: 'editor', emoji: '⭐', key: 'colEditor', items: ['pcos', 'breathe', 'apollo'] },
]

// ── Install / manage ──────────────────────────────────────────────────────────
export function isInstalled(id) { return getMarket().installed.some((i) => i.id === id) }
export function isEnabled(id) { const i = getMarket().installed.find((x) => x.id === id); return i ? i.enabled : false }
export function install(id) {
  if (isInstalled(id)) return getMarket()
  const it = item(id)
  const entry = { id, at: new Date().toISOString(), enabled: true }
  const dataLog = [{ id: 'd' + Date.now().toString(36), at: entry.at, actionKey: 'mkLogInstall', plugin: id, perms: it?.perms || [] }, ...getMarket().dataLog].slice(0, 40)
  return save({ installed: [entry, ...getMarket().installed], dataLog })
}
export function uninstall(id) {
  const dataLog = [{ id: 'd' + Date.now().toString(36), at: new Date().toISOString(), actionKey: 'mkLogUninstall', plugin: id }, ...getMarket().dataLog].slice(0, 40)
  return save({ installed: getMarket().installed.filter((i) => i.id !== id), dataLog })
}
export function toggleEnable(id) {
  return save({ installed: getMarket().installed.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)) })
}
export function installedItems() { return getMarket().installed.map((e) => ({ ...item(e.id), ...e })).filter((x) => x.id) }
export function dataLog() { return getMarket().dataLog }

// ── Recommendation engine (transparent, from the user's own data) ─────────────
export function recommendations() {
  let sym = {}
  try { sym = JSON.parse(localStorage.getItem('mira.symptoms.v1')) || {} } catch { /* ignore */ }
  const on = Object.keys(sym).filter((k) => sym[k])
  let wear = false
  try { wear = (JSON.parse(localStorage.getItem('mira.wearables.v1')) || {}).devices?.length > 0 } catch { /* ignore */ }
  const out = []
  if (on.includes('acne') || on.includes('hirsutism') || on.includes('irregular')) out.push({ id: 'pcos', reasonKey: 'mkRecPcos' })
  out.push({ id: 'iron', reasonKey: 'mkRecIron' })
  if (wear) out.push({ id: 'sleep', reasonKey: 'mkRecWearable' })
  else out.push({ id: 'breathe', reasonKey: 'mkRecCalm' })
  const seen = new Set()
  return out.filter((r) => !isInstalled(r.id) && (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, 3)
}

// ── Plugin review pipeline (transparency content) ────────────────────────────
export const REVIEW_STEPS = ['revSecurity', 'revPrivacy', 'revPerformance', 'revMedical', 'revAccessibility', 'revUx', 'revApproval']
export const SANDBOX = ['sbNoDb', 'sbNoFile', 'sbNoNetwork', 'sbControlled']
