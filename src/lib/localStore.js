/**
 * Browser-local persistence for the preview build (localStorage).
 *
 * Stores the user's OWN entries (voice check-ins, period dates, symptom logs)
 * on their device — real data they created, not fabricated demo content. In the
 * production build these same shapes are written to Appwrite instead
 * (src/lib/logs.js); the app reads whichever backing store is available.
 */
const LOGS_KEY = 'mira.logs.v1'
const PERIODS_KEY = 'mira.periods.v1'
const SYMPTOMS_KEY = 'mira.symptoms.v1'
const PROFILE_KEY = 'mira.profile.v1'

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage full / unavailable — non-fatal in preview */
  }
}

// ── Check-in logs ────────────────────────────────────────────────────────────
export function getLogs() {
  return read(LOGS_KEY, []).sort((a, b) => new Date(b.date) - new Date(a.date))
}
export function addLog(log) {
  const logs = read(LOGS_KEY, [])
  const entry = { id: `l_${Date.now()}`, date: new Date().toISOString(), ...log }
  logs.push(entry)
  write(LOGS_KEY, logs)
  return entry
}
export function clearLogs() {
  write(LOGS_KEY, [])
}

// ── Period start dates (ISO strings) ─────────────────────────────────────────
export function getPeriods() {
  return read(PERIODS_KEY, []).sort((a, b) => new Date(b) - new Date(a))
}
export function addPeriod(dateIso) {
  const set = new Set(read(PERIODS_KEY, []))
  set.add(new Date(dateIso).toISOString().slice(0, 10))
  write(PERIODS_KEY, [...set])
  return getPeriods()
}
export function removePeriod(dateIso) {
  const day = new Date(dateIso).toISOString().slice(0, 10)
  write(PERIODS_KEY, read(PERIODS_KEY, []).filter((d) => d.slice(0, 10) !== day))
  return getPeriods()
}

/**
 * Derive cycle stats from the logged period start dates.
 * Returns { avgCycleLength, lastPeriodStart, predictedNext, daysUntilNext,
 *           phase, cycleDay } — all computed, none hardcoded.
 */
export function getCycleStats() {
  const dates = getPeriods()
    .map((d) => new Date(d))
    .sort((a, b) => a - b)
  if (dates.length === 0) return { avgCycleLength: null, lastPeriodStart: null, predictedNext: null }

  const gaps = []
  for (let i = 1; i < dates.length; i++) {
    gaps.push(Math.round((dates[i] - dates[i - 1]) / 86400000))
  }
  const avg = gaps.length ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : 28
  const last = dates[dates.length - 1]
  const predictedNext = new Date(last.getTime() + avg * 86400000)
  const today = new Date()
  const cycleDay = Math.floor((today - last) / 86400000) + 1
  const daysUntilNext = Math.ceil((predictedNext - today) / 86400000)

  let phase = 'follicular'
  if (cycleDay <= 5) phase = 'menstrual'
  else if (cycleDay >= avg - 3 && cycleDay <= avg + 1) phase = 'ovulation'
  else if (cycleDay > avg + 1) phase = 'luteal'
  else if (cycleDay > 5) phase = 'follicular'

  return {
    avgCycleLength: avg,
    lastPeriodStart: last.toISOString(),
    predictedNext: predictedNext.toISOString(),
    daysUntilNext,
    cycleDay: cycleDay > 0 ? cycleDay : null,
    phase,
    regularity: gaps.length >= 2 ? spread(gaps) : null,
  }
}

function spread(gaps) {
  const min = Math.min(...gaps)
  const max = Math.max(...gaps)
  return max - min <= 4 ? 'regular' : max - min <= 9 ? 'slightly irregular' : 'irregular'
}

// ── PCOS/PCOD symptom log ────────────────────────────────────────────────────
export function getSymptoms() {
  return read(SYMPTOMS_KEY, {})
}
export function saveSymptoms(map) {
  write(SYMPTOMS_KEY, map)
  return map
}

// ── User profile ─────────────────────────────────────────────────────────────
export function getProfile() {
  return read(PROFILE_KEY, { name: '', age: '', condition: '', city: '' })
}
export function saveProfile(patch) {
  const next = { ...getProfile(), ...patch }
  write(PROFILE_KEY, next)
  return next
}

/** Wipe every locally-stored MIRA record (used by the profile's delete action). */
export function clearAllData() {
  ;[LOGS_KEY, PERIODS_KEY, SYMPTOMS_KEY, PROFILE_KEY].forEach((k) => {
    try {
      localStorage.removeItem(k)
    } catch {
      /* ignore */
    }
  })
}
