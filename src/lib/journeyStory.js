/**
 * MIRA Health Journey — the storytelling + gamification engine. Aggregates the
 * user's real activity across every module into Wellness XP, a named wellness
 * level, achievement badges, personalised AI reflections + letters, and a
 * Spotify-Wrapped-style monthly story. All computed on-device.
 */
import { getLogs, getPeriods, getProfile, getCycleStats } from './localStore'
import { getProgress } from './learnProgress'
import { moodSummary } from './moodIntel'

const DAY = 86400000
const monthKey = (d) => new Date(d).toISOString().slice(0, 7)

function readStore(key) {
  try { return JSON.parse(localStorage.getItem(key)) || {} } catch { return {} }
}

// ── Aggregate the raw signals used everywhere below ──────────────────────────
export function stats() {
  const logs = getLogs()
  const moodLogs = logs.filter((l) => l.moods || l.mood)
  const nutrition = readStore('mira.nutrition.v1')
  const plan = readStore('mira.plan.v1')
  const gratitude = (() => { try { return JSON.parse(localStorage.getItem('mira.gratitude.v1')) || [] } catch { return [] } })()
  const prog = getProgress()

  const waterTotal = Object.values(nutrition.water || {}).reduce((a, b) => a + Number(b || 0), 0)
  const waterGoalDays = Object.values(nutrition.water || {}).filter((n) => Number(n) >= 8).length
  const meals = (nutrition.meals || []).length
  const habitCompletions = Object.values(plan.habits || {}).reduce((a, arr) => a + (arr?.length || 0), 0)
  const meditated = Object.values(plan.habits || {}).some((arr) => (arr || []).includes('meditate'))
  const lessons = prog.completed?.length || 0
  const firstLog = logs.length ? logs[logs.length - 1].date : null
  const spanDays = firstLog ? Math.floor((Date.now() - new Date(firstLog)) / DAY) : 0

  return {
    moodLogs: moodLogs.length,
    waterTotal, waterGoalDays, meals, habitCompletions, meditated,
    lessons, gratitude: gratitude.length,
    periods: getPeriods().length,
    spanDays,
    firstLog,
  }
}

/** Total Wellness XP earned from real activity. */
export function totalXP() {
  const s = stats()
  return (
    s.moodLogs * 10 +
    Math.min(s.waterTotal, 500) * 5 +
    s.meals * 15 +
    s.lessons * 30 +
    s.gratitude * 10 +
    s.habitCompletions * 5 +
    s.periods * 20
  )
}

// ── Wellness levels ──────────────────────────────────────────────────────────
const LEVELS = [
  { n: 1, key: 'lvBloom', emoji: '🌱', at: 0 },
  { n: 2, key: 'lvLeaf', emoji: '🍃', at: 200 },
  { n: 3, key: 'lvBlossom', emoji: '🌸', at: 500 },
  { n: 4, key: 'lvMoon', emoji: '🌙', at: 1000 },
  { n: 5, key: 'lvAura', emoji: '✨', at: 2000 },
  { n: 6, key: 'lvHarmony', emoji: '💖', at: 3500 },
]
export function wellnessLevel(xp = totalXP()) {
  let cur = LEVELS[0]
  for (const l of LEVELS) if (xp >= l.at) cur = l
  const next = LEVELS.find((l) => l.at > cur.at && xp < l.at)
  const base = cur.at
  const span = next ? next.at - base : 1
  const pct = next ? Math.round(((xp - base) / span) * 100) : 100
  return { ...cur, xp, next, pct, toNext: next ? next.at - xp : 0 }
}

// ── Achievement badges (earned / locked) ─────────────────────────────────────
export function badges() {
  const s = stats()
  const cycleReg = getCycleStats().regularity === 'regular'
  const defs = [
    { id: 'firstStep', emoji: '🌸', key: 'bgFirstStep', earned: s.moodLogs > 0 || s.periods > 0 },
    { id: 'hydration', emoji: '💧', key: 'bgHydration', earned: s.waterGoalDays >= 1 },
    { id: 'moodGuardian', emoji: '😊', key: 'bgMood', earned: s.moodLogs >= 7 },
    { id: 'nutrition', emoji: '🥗', key: 'bgNutrition', earned: s.meals >= 1 },
    { id: 'learning', emoji: '📚', key: 'bgLearning', earned: s.lessons >= 5 },
    { id: 'meditation', emoji: '🧘', key: 'bgMeditation', earned: s.meditated },
    { id: 'cycle', emoji: '🌙', key: 'bgCycle', earned: s.periods >= 3 },
    { id: 'selfcare', emoji: '💖', key: 'bgSelfcare', earned: s.gratitude >= 3 },
    { id: 'regular', emoji: '📈', key: 'bgRegular', earned: cycleReg && s.periods >= 3 },
    { id: 'year', emoji: '🏆', key: 'bgYear', earned: s.spanDays >= 365 },
  ]
  return defs
}

// ── AI reflection + encouragement (personalised, varied by day) ──────────────
export function aiReflection() {
  const s = stats()
  const name = getProfile().name || ''
  if (s.moodLogs === 0 && s.periods === 0) return { key: 'refStart' }
  const parts = []
  if (s.spanDays >= 1) parts.push(`refSpan`)
  if (s.lessons >= 1) parts.push('refLearn')
  if (s.waterGoalDays >= 1) parts.push('refHydrate')
  if (s.moodLogs >= 3) parts.push('refMood')
  const pick = parts[new Date().getDate() % parts.length] || 'refKeepGoing'
  return { key: pick, vars: { name, days: s.spanDays, lessons: s.lessons, checkins: s.moodLogs } }
}

const ENCOURAGE = ['encMain1', 'encMain2', 'encMain3', 'encMain4', 'encMain5']
export function todaysEncouragement() {
  return ENCOURAGE[Math.floor(Date.now() / DAY) % ENCOURAGE.length]
}

/** A heartfelt AI letter unlocked at meaningful moments. */
export function aiLetter() {
  const s = stats()
  const name = getProfile().name || ''
  const unlocked = s.spanDays >= 3 || s.moodLogs >= 5
  return { unlocked, vars: { name, days: s.spanDays, checkins: s.moodLogs, lessons: s.lessons } }
}

/** Spotify-Wrapped-style story for the current month. */
export function monthlyStory() {
  const mk = monthKey(Date.now())
  const logs = getLogs().filter((l) => monthKey(l.date) === mk)
  const nutrition = readStore('mira.nutrition.v1')
  const waterThisMonth = Object.entries(nutrition.water || {}).filter(([d]) => d.startsWith(mk)).reduce((a, [, n]) => a + Number(n || 0), 0)
  const mealsThisMonth = (nutrition.meals || []).filter((m) => monthKey(m.date) === mk).length
  const mood = moodSummary(31)
  const prog = getProgress()
  const monthName = new Date().toLocaleDateString('en-GB', { month: 'long' })
  return {
    monthName,
    checkins: logs.length,
    topMood: mood.top?.[0] || null,
    positivity: mood.positivity,
    water: waterThisMonth,
    meals: mealsThisMonth,
    lessons: prog.completed?.length || 0,
    badges: badges().filter((b) => b.earned).length,
    hasData: logs.length > 0 || waterThisMonth > 0,
  }
}
