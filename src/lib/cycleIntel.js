/**
 * MIRA Cycle Intelligence — derives a daily health score, predictions,
 * insights, a calendar model and Health-Journey milestones from the user's
 * OWN logged data (period dates + daily check-ins). Everything here is
 * computed on-device from real entries — no fabricated numbers. The more the
 * user logs, the more confident and personal the output becomes.
 */
import { getLogs, getPeriods, getCycleStats, getProfile } from './localStore'

const DAY = 86400000
const iso = (d) => new Date(d).toISOString().slice(0, 10)

// ── helpers ──────────────────────────────────────────────────────────────────
const SLEEP_SCORE = { good: 1, ok: 0.6, poor: 0.2 }
const STRESS_SCORE = { low: 1, ok: 0.6, high: 0.2 }
const ENERGY_SCORE = { high: 1, ok: 0.6, low: 0.3 }
const MOOD_SCORE = { great: 1, happy: 1, calm: 0.85, ok: 0.6, tired: 0.5, low: 0.35, sad: 0.3, anxious: 0.3, angry: 0.3 }

function recentLogs(days = 14) {
  const cutoff = Date.now() - days * DAY
  return getLogs().filter((l) => new Date(l.date).getTime() >= cutoff)
}

/**
 * Daily AI health score (0–100) with the reasons behind it, suggestions to
 * improve, and the trend vs the previous week. Falls back gracefully when
 * there's little data yet.
 */
export function computeHealthScore() {
  const logs = recentLogs(7)
  const stats = getCycleStats()
  const factors = [] // { label, weight, value 0..1, good }
  const push = (label, value, weight = 1) => factors.push({ label, value, weight })

  // Hydration
  const waters = logs.map((l) => Number(l.water)).filter((n) => !Number.isNaN(n))
  if (waters.length) push('hydration', Math.min(1, avg(waters) / 8), 1.1)
  // Sleep
  const sleeps = logs.map((l) => SLEEP_SCORE[l.sleep]).filter((n) => n != null)
  if (sleeps.length) push('sleep', avg(sleeps), 1.1)
  // Mood
  const moods = logs.map((l) => MOOD_SCORE[l.mood]).filter((n) => n != null)
  if (moods.length) push('mood', avg(moods), 1)
  // Pain (inverse)
  const pains = logs.map((l) => Number(l.pain)).filter((n) => !Number.isNaN(n))
  if (pains.length) push('pain', 1 - Math.min(1, avg(pains) / 10), 1)
  // Stress (inverse via level)
  const stresses = logs.map((l) => STRESS_SCORE[l.stress]).filter((n) => n != null)
  if (stresses.length) push('stress', avg(stresses), 0.9)
  // Energy
  const energies = logs.map((l) => ENERGY_SCORE[l.energy]).filter((n) => n != null)
  if (energies.length) push('energy', avg(energies), 0.8)
  // Cycle regularity
  if (stats.regularity) push('regularity', stats.regularity === 'regular' ? 1 : stats.regularity === 'slightly irregular' ? 0.6 : 0.35, 0.9)
  // Consistency of logging
  push('consistency', Math.min(1, logs.length / 7), 0.7)

  let score, hasData = factors.length > 0
  if (hasData) {
    const wsum = factors.reduce((a, f) => a + f.weight, 0)
    const raw = factors.reduce((a, f) => a + f.value * f.weight, 0) / wsum
    score = Math.round(40 + raw * 60) // map 0..1 → 40..100 so it never feels punishing
  } else {
    score = null
  }

  // Reasons: strongest positives + the weakest factor
  const named = factors.slice().sort((a, b) => b.value - a.value)
  const reasons = []
  if (named[0] && named[0].value >= 0.7) reasons.push({ key: `hsGood_${named[0].label}`, good: true })
  const weakest = factors.slice().sort((a, b) => a.value - b.value)[0]
  if (weakest && weakest.value < 0.6) reasons.push({ key: `hsLow_${weakest.label}`, good: false })

  const suggestions = []
  if (weakest) suggestions.push(`hsTip_${weakest.label}`)
  if (!logs.some((l) => l.water != null)) suggestions.push('hsTip_hydration')

  return {
    score,
    hasData,
    label: score == null ? 'hsNoData' : score >= 80 ? 'hsThriving' : score >= 65 ? 'hsGoodShape' : score >= 50 ? 'hsSteady' : 'hsNeedsCare',
    reasons: reasons.slice(0, 2),
    suggestions: [...new Set(suggestions)].slice(0, 2),
    trend: weekTrend(),
    phase: stats.phase || null,
  }
}

/** Compare this week's average mood/pain against last week for a trend arrow. */
function weekTrend() {
  const logs = getLogs()
  const now = Date.now()
  const thisWeek = logs.filter((l) => now - new Date(l.date) < 7 * DAY)
  const lastWeek = logs.filter((l) => { const g = now - new Date(l.date); return g >= 7 * DAY && g < 14 * DAY })
  const moodA = avg(thisWeek.map((l) => MOOD_SCORE[l.mood]).filter((n) => n != null))
  const moodB = avg(lastWeek.map((l) => MOOD_SCORE[l.mood]).filter((n) => n != null))
  if (moodA == null || moodB == null) return null
  if (moodA > moodB + 0.05) return 'up'
  if (moodA < moodB - 0.05) return 'down'
  return 'flat'
}

/**
 * AI predictions with a confidence score each. Confidence rises with the
 * amount of logged history.
 */
export function predictions() {
  const stats = getCycleStats()
  const periods = getPeriods()
  const out = []
  const baseConf = Math.min(0.95, 0.4 + periods.length * 0.12) // more logged periods → higher confidence

  if (stats.predictedNext) {
    out.push({ key: 'nextPeriod', date: stats.predictedNext, days: stats.daysUntilNext, confidence: round2(baseConf) })
    // Ovulation ≈ 14 days before next period
    const ov = new Date(new Date(stats.predictedNext).getTime() - 14 * DAY)
    out.push({ key: 'ovulation', date: ov.toISOString(), confidence: round2(baseConf * 0.9) })
    out.push({ key: 'fertile', dateStart: new Date(ov.getTime() - 4 * DAY).toISOString(), dateEnd: new Date(ov.getTime() + 1 * DAY).toISOString(), confidence: round2(baseConf * 0.85) })
  }

  // Pain probability around the current phase, learned from past pain logs.
  const pains = getLogs().map((l) => Number(l.pain)).filter((n) => !Number.isNaN(n))
  if (pains.length >= 3) {
    const high = pains.filter((p) => p >= 6).length / pains.length
    out.push({ key: 'pain', level: high >= 0.5 ? 'high' : high >= 0.25 ? 'medium' : 'low', confidence: round2(Math.min(0.9, 0.5 + pains.length * 0.05)) })
  }

  // Mood trend prediction
  const t = weekTrend()
  if (t) out.push({ key: 'mood', level: t, confidence: 0.6 })

  return out
}

/**
 * One or two meaningful, data-derived insights. Never more — the brief is
 * explicit about not overwhelming the user.
 */
export function insights() {
  const logs = getLogs()
  const out = []

  // Pattern: a cycle day that repeatedly shows headaches / high pain
  const painByDay = {}
  const stats0 = getCycleStats()
  logs.forEach((l) => {
    if (Number(l.pain) >= 6 && stats0.lastPeriodStart) {
      const cd = Math.floor((new Date(l.date) - new Date(stats0.lastPeriodStart)) / DAY) + 1
      if (cd > 0 && cd < 40) painByDay[cd] = (painByDay[cd] || 0) + 1
    }
  })
  const painDay = Object.entries(painByDay).sort((a, b) => b[1] - a[1])[0]
  if (painDay && painDay[1] >= 2) out.push({ key: 'insPainDay', n: painDay[0] })

  // Pattern: hydration lower in luteal phase
  const luteal = logs.filter((l) => l.phase === 'luteal' && l.water != null)
  const other = logs.filter((l) => l.phase && l.phase !== 'luteal' && l.water != null)
  if (luteal.length >= 2 && other.length >= 2 && avg(luteal.map((l) => +l.water)) < avg(other.map((l) => +l.water)) - 1) {
    out.push({ key: 'insHydrationLuteal' })
  }

  // Positive: mood improving across recent entries
  if (weekTrend() === 'up') out.push({ key: 'insMoodUp' })

  // Fallbacks so there's always something warm & phase-relevant
  if (out.length === 0 && stats0.phase) out.push({ key: `insPhase_${stats0.phase}` })

  return out.slice(0, 2)
}

/**
 * Month calendar model: for the given year/month returns a map keyed by
 * YYYY-MM-DD with the markers to render (period, predicted period, ovulation,
 * fertile window, symptom day, mood day).
 */
export function calendarModel(year, month) {
  const marks = {}
  const set = (day, key) => { marks[day] = { ...(marks[day] || {}), [key]: true } }

  const periods = getPeriods() // ISO date strings (YYYY-MM-DD)
  const profile = getProfile()
  const periodLen = Number(profile.periodLength) || 5
  periods.forEach((d) => {
    for (let i = 0; i < periodLen; i++) set(iso(new Date(new Date(d).getTime() + i * DAY)), 'period')
  })

  // Predicted next period + ovulation + fertile window
  const stats = getCycleStats()
  if (stats.predictedNext) {
    for (let i = 0; i < periodLen; i++) set(iso(new Date(new Date(stats.predictedNext).getTime() + i * DAY)), 'predicted')
    const ov = new Date(new Date(stats.predictedNext).getTime() - 14 * DAY)
    set(iso(ov), 'ovulation')
    for (let i = -4; i <= 1; i++) set(iso(new Date(ov.getTime() + i * DAY)), 'fertile')
  }

  // Logged check-ins → symptom / mood markers
  getLogs().forEach((l) => {
    const d = iso(l.date)
    if ((l.symptoms && l.symptoms.length) || Number(l.pain) >= 4) set(d, 'symptom')
    if (l.mood) set(d, 'mood')
  })

  return marks
}

/**
 * Health-Journey milestones, auto-derived from the user's real activity.
 * Returns achieved milestones (most recent first) plus the next locked one to
 * aim for. Each carries an emoji, title/message keys and a badge.
 */
export function journeyMilestones() {
  const logs = getLogs().slice().reverse() // oldest first
  const periods = getPeriods().slice().sort()
  const done = []
  const firstLogDate = logs[0]?.date
  const spanDays = firstLogDate ? Math.floor((Date.now() - new Date(firstLogDate)) / DAY) : 0
  const checkins = logs.length

  const add = (id, emoji, badge, date, extra = {}) => done.push({ id, emoji, badge, date, ...extra })

  if (periods.length >= 1) add('firstCycle', '🌸', 'First Cycle Logged', periods[0])
  if (checkins >= 1) add('firstCheckin', '😊', 'First Check-in', logs[0].date)
  if (logs.some((l) => Number(l.water) >= 8)) add('hydration', '💧', 'Hydration Hero', logs.find((l) => Number(l.water) >= 8).date)
  if (logs.some((l) => l.meditated || l.activity === 'meditation')) add('meditation', '🧘', 'First Meditation', logs.find((l) => l.meditated || l.activity === 'meditation').date)
  const streak = bestStreak(logs)
  if (streak >= 7) add('streak7', '🔥', '7-Day Streak', logs[logs.length - 1].date, { n: streak })
  if (weekTrend() === 'up') add('moodUp', '💖', 'Mood Improving', new Date().toISOString())
  if (periods.length >= 3 && getCycleStats().regularity === 'regular') add('regular', '📈', 'Cycle Regular', new Date().toISOString())
  if (checkins >= 30) add('healthy30', '🏆', '30 Healthy Days', logs[29].date)
  if (spanDays >= 100) add('journey100', '🎉', '100-Day Journey', new Date().toISOString())

  // Next milestone to aim for
  let next = null
  if (checkins < 1) next = { id: 'firstCheckin', emoji: '😊', badge: 'First Check-in', progress: 0, goal: 1 }
  else if (streak < 7) next = { id: 'streak7', emoji: '🔥', badge: '7-Day Streak', progress: streak, goal: 7 }
  else if (checkins < 30) next = { id: 'healthy30', emoji: '🏆', badge: '30 Healthy Days', progress: checkins, goal: 30 }
  else if (spanDays < 100) next = { id: 'journey100', emoji: '🎉', badge: '100-Day Journey', progress: spanDays, goal: 100 }

  return { done: done.reverse(), next, stats: { checkins, streak, spanDays, periods: periods.length } }
}

/** Longest run of consecutive calendar days with at least one check-in. */
function bestStreak(logsOldestFirst) {
  const days = [...new Set(logsOldestFirst.map((l) => iso(l.date)))].sort()
  let best = 0, cur = 0, prev = null
  days.forEach((d) => {
    if (prev && (new Date(d) - new Date(prev)) === DAY) cur += 1
    else cur = 1
    best = Math.max(best, cur)
    prev = d
  })
  return best
}

// ── tiny utils ───────────────────────────────────────────────────────────────
function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null }
function round2(n) { return Math.round(n * 100) / 100 }
