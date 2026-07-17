/**
 * MIRA Wearable & IoT ecosystem (Part 23).
 *
 * A modular, on-device wearable platform. In this offline preview there is no
 * real HealthKit / Google Fit / Oura account — instead each "connected" device
 * generates a stable, deterministic stream of synthetic health signals so the
 * full ecosystem (sync, insights, health score, Digital Twin fusion, privacy
 * controls) is demonstrable end-to-end. Every value is a simulated estimate,
 * clearly framed as such, never a medical measurement.
 *
 * Architecture: a device CATALOG (adapters) + a per-device synthetic sensor
 * engine + a fusion layer that turns raw signals into meaningful AI insights.
 * Adding a new device type = one catalog entry; no page rewrite needed.
 */
import { getCycleStats, getLogs } from './localStore'

const KEY = 'mira.wearables.v1'
const DAY = 86400000

function read() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null }
}
function write(v) {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ }
}

// ── Device catalog (modular adapters) ────────────────────────────────────────
// category: platform | ring | watch | scale.  metrics = what this device feeds.
export const CATALOG = [
  // Aggregator platforms
  { id: 'apple-health', name: 'Apple Health', emoji: '', brand: '🍎', category: 'platform', metrics: ['sleep', 'heart', 'activity', 'stress'] },
  { id: 'google-fit', name: 'Google Fit', emoji: '🟢', category: 'platform', metrics: ['activity', 'heart', 'sleep'] },
  { id: 'health-connect', name: 'Health Connect', emoji: '🩺', category: 'platform', metrics: ['activity', 'heart', 'sleep', 'stress'] },
  { id: 'samsung-health', name: 'Samsung Health', emoji: '💙', category: 'platform', metrics: ['activity', 'heart', 'sleep', 'stress'] },
  { id: 'fitbit', name: 'Fitbit', emoji: '💠', category: 'platform', metrics: ['sleep', 'heart', 'activity', 'stress'] },
  { id: 'garmin', name: 'Garmin', emoji: '🛰️', category: 'platform', metrics: ['activity', 'heart', 'recovery', 'sleep'] },
  // Smart rings
  { id: 'oura', name: 'Oura Ring', emoji: '💍', category: 'ring', metrics: ['sleep', 'heart', 'temperature', 'recovery', 'stress'] },
  { id: 'ultrahuman', name: 'Ultrahuman Ring', emoji: '⚫', category: 'ring', metrics: ['sleep', 'heart', 'temperature', 'recovery'] },
  { id: 'ringconn', name: 'RingConn', emoji: '⭕', category: 'ring', metrics: ['sleep', 'heart', 'temperature', 'stress'] },
  // Smart watches
  { id: 'apple-watch', name: 'Apple Watch', emoji: '⌚', category: 'watch', metrics: ['activity', 'heart', 'sleep', 'recovery'] },
  { id: 'galaxy-watch', name: 'Galaxy Watch', emoji: '⌚', category: 'watch', metrics: ['activity', 'heart', 'sleep', 'stress'] },
  // Smart scale
  { id: 'smart-scale', name: 'Smart Scale', emoji: '⚖️', category: 'scale', metrics: ['body'] },
]

// Metrics that can power AI (privacy toggles). "body" (scale) is informational.
export const METRICS = ['sleep', 'heart', 'temperature', 'stress', 'activity', 'recovery']

const DEFAULT_STATE = () => ({ devices: [], autoLog: true, metrics: Object.fromEntries(METRICS.map((m) => [m, true])) })

export function getState() {
  const s = read()
  if (!s) return DEFAULT_STATE()
  return { ...DEFAULT_STATE(), ...s, metrics: { ...DEFAULT_STATE().metrics, ...(s.metrics || {}) } }
}
function save(patch) {
  const next = { ...getState(), ...patch }
  write(next)
  return next
}

export function catalogItem(id) { return CATALOG.find((c) => c.id === id) }
export function connectedDevices() { return getState().devices }
export function hasWearable() { return getState().devices.some((d) => !d.paused) }
export function isMetricOn(m) { return getState().metrics[m] !== false }

// ── Device management ────────────────────────────────────────────────────────
export function connectDevice(catalogId) {
  const item = catalogItem(catalogId)
  if (!item) return getState()
  const s = getState()
  if (s.devices.some((d) => d.catalogId === catalogId)) return s // already connected
  const device = {
    id: `${catalogId}-${Date.now().toString(36)}`,
    catalogId, name: item.name, category: item.category,
    battery: 60 + Math.floor(Math.random() * 38),
    firmware: `${1 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 9)}.${Math.floor(Math.random() * 9)}`,
    connectedAt: new Date().toISOString(),
    lastSync: new Date().toISOString(),
    paused: false,
  }
  return save({ devices: [...s.devices, device] })
}
export function disconnectDevice(id) {
  return save({ devices: getState().devices.filter((d) => d.id !== id) })
}
export function renameDevice(id, name) {
  return save({ devices: getState().devices.map((d) => (d.id === id ? { ...d, name } : d)) })
}
export function togglePause(id) {
  return save({ devices: getState().devices.map((d) => (d.id === id ? { ...d, paused: !d.paused } : d)) })
}
export function syncNow(id) {
  return save({ devices: getState().devices.map((d) => (d.id === id ? { ...d, lastSync: new Date().toISOString(), battery: Math.max(5, d.battery - 1) } : d)) })
}
export function setAutoLog(on) { return save({ autoLog: !!on }) }
export function setMetric(m, on) { return save({ metrics: { ...getState().metrics, [m]: !!on } }) }
export function disconnectAll() { write(DEFAULT_STATE()); return getState() }

/** Which metrics are actually available from currently-connected, active devices. */
export function activeMetrics() {
  const set = new Set()
  connectedDevices().filter((d) => !d.paused).forEach((d) => (catalogItem(d.catalogId)?.metrics || []).forEach((m) => set.add(m)))
  return set
}
export function hasMetric(m) { return activeMetrics().has(m) && isMetricOn(m) }

// ── Deterministic synthetic sensor engine ────────────────────────────────────
// Stable per-day values so the demo doesn't flicker between renders, but varies
// day-to-day and bends with the user's cycle phase + their own logged history.
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function rng(seed) { let a = hash(seed); return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const isoDay = (d) => new Date(d).toISOString().slice(0, 10)
const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)))

/** Full synthetic signal set for a given date (default: today). */
export function daySignals(date = new Date()) {
  const day = isoDay(date)
  const r = rng('mira-wear-' + day)
  const stats = getCycleStats()
  const phase = stats.phase || 'follicular'
  // cycle-phase modifiers (educational tendencies)
  const lut = phase === 'luteal', men = phase === 'menstrual', foll = phase === 'follicular', ov = phase === 'ovulation'

  const sleepH = +(6.4 + r() * 1.9 + (men ? -0.2 : 0)).toFixed(1)
  const deep = clamp((sleepH * 60) * (0.16 + r() * 0.05))
  const rem = clamp((sleepH * 60) * (0.19 + r() * 0.05))
  const light = clamp(sleepH * 60 - deep - rem)
  const awakenings = Math.floor(r() * 3) + (lut ? 1 : 0)
  const sleepScore = clamp(58 + (sleepH - 6.5) * 22 - awakenings * 4 + r() * 8)

  const restingHR = Math.round(60 + (lut ? 3 : 0) + (men ? 2 : 0) + r() * 6)
  const hrv = Math.round(58 - (lut ? 6 : 0) - (men ? 4 : 0) + r() * 18)
  const recovery = clamp(55 + (hrv - 55) * 1.1 + (sleepScore - 65) * 0.4 + r() * 8)

  // biphasic body-temperature deviation (°C from baseline) — supports ovulation
  const tempDev = +(((lut ? 0.28 : foll ? -0.12 : ov ? 0.05 : 0) + (r() - 0.5) * 0.14)).toFixed(2)

  const steps = Math.round(3600 + r() * 7200 + (foll || ov ? 900 : 0))
  const distance = +((steps / 1350).toFixed(1))
  const calories = Math.round(steps * 0.045 + 1300 + r() * 250)
  const activeMin = Math.round(steps / 130)
  const standHours = Math.min(12, 5 + Math.floor(r() * 8))

  const stress = clamp(46 - (recovery - 60) * 0.5 + (lut ? 10 : 0) + r() * 16) // higher = more stress
  const readiness = clamp(recovery * 0.5 + sleepScore * 0.35 + (100 - stress) * 0.15)

  return {
    day, phase,
    sleep: { hours: sleepH, deep, rem, light, awakenings, score: sleepScore },
    heart: { restingHR, hrv, recovery },
    temperature: { deviation: tempDev },
    activity: { steps, distance, calories, activeMin, standHours },
    stress: { level: stress, calm: clamp(100 - stress) },
    readiness,
  }
}

/** Recent history (most-recent first) for trend maths. */
export function history(days = 14) {
  const out = []
  for (let i = 0; i < days; i++) out.push(daySignals(new Date(Date.now() - i * DAY)))
  return out
}

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0)

// ── Wearable health score ────────────────────────────────────────────────────
export function wearableScore() {
  const t = daySignals()
  const parts = []
  if (hasMetric('sleep')) parts.push({ k: 'sleep', v: t.sleep.score, w: 0.28 })
  if (hasMetric('activity')) parts.push({ k: 'activity', v: clamp(Math.min(100, (t.activity.steps / 9000) * 100)), w: 0.24 })
  if (hasMetric('recovery')) parts.push({ k: 'recovery', v: t.heart.recovery, w: 0.22 })
  if (hasMetric('stress')) parts.push({ k: 'stress', v: t.stress.calm, w: 0.14 })
  if (hasMetric('heart')) parts.push({ k: 'heart', v: clamp(t.heart.hrv + 30), w: 0.12 })
  const wsum = parts.reduce((s, p) => s + p.w, 0) || 1
  const score = clamp(parts.reduce((s, p) => s + p.v * p.w, 0) / wsum)
  // weakest contributing area → improvement suggestion
  const weakest = parts.slice().sort((a, b) => a.v - b.v)[0]
  const band = score >= 75 ? 'high' : score >= 55 ? 'mid' : 'care'
  return {
    score, band,
    explainKey: `wsExplain_${band}`,
    suggestKey: weakest ? `wsSuggest_${weakest.k}` : 'wsSuggest_general',
    hasData: parts.length > 0,
  }
}

// ── Real-time AI insights (the "what does this mean for me?" layer) ───────────
export function insights() {
  if (!hasWearable()) return []
  const out = []
  const hist = history(14)
  const today = hist[0]
  const prevWeek = hist.slice(7, 14)
  const lastWeek = hist.slice(0, 7)

  if (hasMetric('sleep')) {
    const base = avg(prevWeek.map((d) => d.sleep.hours)) || today.sleep.hours
    const diffMin = Math.round((today.sleep.hours - base) * 60)
    if (diffMin >= 25) out.push({ icon: '😴', key: 'wiSleepMore', vars: { n: diffMin } })
    else if (diffMin <= -25) out.push({ icon: '😴', key: 'wiSleepLess', vars: { n: Math.abs(diffMin) } })
  }
  if (hasMetric('activity')) {
    const a = avg(lastWeek.map((d) => d.activity.steps)), b = avg(prevWeek.map((d) => d.activity.steps)) || a
    const pct = b ? Math.round(((a - b) / b) * 100) : 0
    if (pct >= 12) out.push({ icon: '🚶‍♀️', key: 'wiActiveUp', vars: { n: pct } })
    else if (pct <= -12) out.push({ icon: '🌿', key: 'wiActiveDown', vars: { n: Math.abs(pct) } })
  }
  if (hasMetric('recovery') && today.heart.recovery >= 72) out.push({ icon: '🔋', key: 'wiRecoveryHigh', vars: { n: today.heart.recovery } })
  if (hasMetric('recovery') && today.heart.recovery < 50) out.push({ icon: '🫧', key: 'wiRecoveryLow', vars: { n: today.heart.recovery } })
  if (hasMetric('temperature') && today.temperature.deviation >= 0.25) out.push({ icon: '🌡️', key: 'wiTempUp', vars: {} })
  if (hasMetric('stress') && today.stress.level >= 65) out.push({ icon: '🌊', key: 'wiStressHigh', vars: {} })
  return out.slice(0, 4)
}

/** Educational heart-health note — flags a persistent pattern for a clinician,
 *  never a diagnosis. */
export function heartNote() {
  if (!hasMetric('heart')) return null
  const hist = history(10)
  const highResting = hist.filter((d) => d.heart.restingHR >= 72).length
  if (highResting >= 6) return { key: 'whHeartWatch', tone: 'warning' }
  return { key: 'whHeartOk', tone: 'ai' }
}

/** Temperature-based cycle confidence signal (educational). */
export function tempSignal() {
  if (!hasMetric('temperature')) return null
  const t = daySignals()
  const rising = t.temperature.deviation >= 0.2
  return { deviation: t.temperature.deviation, rising, key: rising ? 'wtRising' : 'wtStable', confPct: 68 }
}

// ── Data fusion → signals the Digital Twin consumes ──────────────────────────
/** Normalised 0–100 wellness signals for the Digital Twin, only for metrics the
 *  user has actively connected AND allowed. Returns null when nothing's on. */
export function twinSignals() {
  if (!hasWearable()) return null
  const t = daySignals()
  const sig = {}
  if (hasMetric('sleep')) sig.sleep = t.sleep.score
  if (hasMetric('recovery') || hasMetric('activity')) sig.energy = clamp((t.readiness + Math.min(100, (t.activity.steps / 9000) * 100)) / 2)
  if (hasMetric('stress')) sig.stress = t.stress.calm
  return Object.keys(sig).length ? sig : null
}

// ── Unified health timeline (wearable + app events, most-recent first) ────────
export function healthTimeline(days = 5) {
  if (!hasWearable()) return []
  const rows = []
  const hist = history(days)
  const logs = getLogs()
  hist.forEach((d) => {
    const items = []
    if (hasMetric('sleep')) items.push({ icon: '😴', key: 'tlSleep', vars: { h: d.sleep.hours } })
    if (hasMetric('activity')) items.push({ icon: '🚶‍♀️', key: 'tlSteps', vars: { n: d.activity.steps.toLocaleString() } })
    if (hasMetric('heart')) items.push({ icon: '❤️', key: 'tlHeart', vars: { n: d.heart.restingHR } })
    const log = logs.find((l) => isoDay(l.date) === d.day)
    if (log?.mood) items.push({ icon: '💗', key: 'tlMood', vars: { m: log.mood } })
    rows.push({ day: d.day, phase: d.phase, items })
  })
  return rows
}
