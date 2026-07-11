/**
 * MIRA Core Intelligence — the unifying "brain". It reads across every module
 * (cycle, mood, nutrition, learning, journey) and produces one coherent view:
 * a Digital Health Twin that forecasts the days ahead, a memory of what MIRA
 * has learned about the user, gentle proactive nudges, and the privacy
 * controls to view / pause / reset / export that learning. All on-device.
 */
import { getProfile, getCycleStats, getPeriods, getLogs } from './localStore'
import { getLang } from './i18n.jsx'
import { moodSummary } from './moodIntel'
import { getProgress } from './learnProgress'
import { getWaterToday, getMealsToday } from './nutritionIntel'

const DAY = 86400000
const LANG_NAMES = { en: 'English', ta: 'Tamil', hi: 'Hindi', ml: 'Malayalam', te: 'Telugu', kn: 'Kannada', bn: 'Bengali', mr: 'Marathi' }

// Phase from a (possibly future) cycle day. Ovulation ~14 days before the next
// period, so it falls mid-cycle; the luteal phase follows to the next period.
function phaseForDay(cycleDay, avg) {
  const a = avg || 28
  const d = ((cycleDay - 1) % a) + 1
  const ov = Math.max(10, a - 14) // ovulation day
  if (d <= 5) return 'menstrual'
  if (d >= ov - 1 && d <= ov + 1) return 'ovulation'
  if (d < ov - 1) return 'follicular'
  return 'luteal'
}

// Per-phase forecast tendencies used by the Digital Twin.
const PHASE_FORECAST = {
  menstrual: { energy: 'low', mood: 'tender', icon: '🌙', whyKey: 'twWhyMenstrual' },
  follicular: { energy: 'rising', mood: 'bright', icon: '🌱', whyKey: 'twWhyFollicular' },
  ovulation: { energy: 'peak', mood: 'confident', icon: '✨', whyKey: 'twWhyOvulation' },
  luteal: { energy: 'dipping', mood: 'sensitive', icon: '🍂', whyKey: 'twWhyLuteal' },
}

/** Confidence rises with how much history the user has logged. */
function baseConfidence() {
  const periods = getPeriods().length
  const checkins = getLogs().length
  return Math.min(0.96, 0.45 + periods * 0.1 + Math.min(0.2, checkins * 0.01))
}

/**
 * The Digital Health Twin: a short forward forecast (next 4 days) of phase,
 * energy and mood, plus an overall summary and a confidence score.
 */
export function digitalTwin() {
  const stats = getCycleStats()
  const conf = baseConfidence()
  const avg = stats.avgCycleLength || 28
  const startDay = stats.cycleDay || 1
  const days = []
  for (let i = 1; i <= 4; i++) {
    const cd = startDay + i
    const phase = phaseForDay(cd, avg)
    const f = PHASE_FORECAST[phase]
    days.push({
      date: new Date(Date.now() + i * DAY).toISOString(),
      cycleDay: cd,
      phase,
      icon: f.icon,
      energy: f.energy,
      mood: f.mood,
      whyKey: f.whyKey,
      confidence: Math.round(conf * 100),
    })
  }
  // Overall summary: what dominates the window?
  const upcoming = days.map((d) => d.phase)
  let summaryKey = 'twSummarySteady'
  if (upcoming.filter((p) => p === 'luteal').length >= 2) summaryKey = 'twSummaryLuteal'
  else if (upcoming.filter((p) => p === 'menstrual').length >= 2) summaryKey = 'twSummaryMenstrual'
  else if (upcoming.includes('ovulation')) summaryKey = 'twSummaryOvulation'
  else if (upcoming.filter((p) => p === 'follicular').length >= 2) summaryKey = 'twSummaryFollicular'
  return { days, summaryKey, confidence: Math.round(conf * 100), hasData: getPeriods().length > 0 || getLogs().length > 0 }
}

/**
 * What MIRA remembers — a derived, human-readable memory list built from the
 * user's own data. Each item is a template key + variables so it localises.
 */
export function memories() {
  const p = getProfile()
  const stats = getCycleStats()
  const mood = moodSummary(14)
  const prog = getProgress()
  const logs = getLogs()
  const out = []

  out.push({ id: 'lang', icon: '🗣️', key: 'memLang', vars: { x: LANG_NAMES[getLang()] || 'English' }, cat: 'profile' })
  if (p.name) out.push({ id: 'name', icon: '🌸', key: 'memName', vars: { x: p.name }, cat: 'profile' })
  if (p.goal) out.push({ id: 'goal', icon: '🎯', key: 'memGoal', vars: { x: p.goal }, cat: 'goal' })
  if (p.condition) out.push({ id: 'cond', icon: '🩺', key: 'memCondition', vars: { x: p.condition }, cat: 'health' })
  if (stats.avgCycleLength) out.push({ id: 'avg', icon: '🔄', key: 'memCycleAvg', vars: { x: stats.avgCycleLength }, cat: 'cycle' })
  if (stats.regularity) out.push({ id: 'reg', icon: '📈', key: 'memRegularity', vars: { x: stats.regularity }, cat: 'cycle' })

  // Top symptom around the period (learned pattern)
  const symCount = {}
  logs.forEach((l) => (l.symptoms || []).forEach((s) => { symCount[s] = (symCount[s] || 0) + 1 }))
  const topSym = Object.entries(symCount).sort((a, b) => b[1] - a[1])[0]
  if (topSym && topSym[1] >= 2) out.push({ id: 'sym', icon: '💗', key: 'memSymptom', vars: { x: `sym_${topSym[0]}` }, translateVar: true, cat: 'pattern' })

  if (mood.top && mood.top.length) out.push({ id: 'mood', icon: '🙂', key: 'memMood', vars: { x: `emo_${mood.top[0]}` }, translateVar: true, cat: 'pattern' })
  if (prog.completed?.length) out.push({ id: 'learn', icon: '📚', key: 'memLearn', vars: { x: prog.completed.length }, cat: 'growth' })
  if (getPeriods().length) out.push({ id: 'first', icon: '🗓️', key: 'memFirstCycle', vars: { x: fmtShort(getPeriods().slice().sort()[0]) }, cat: 'journey' })

  return out
}

/**
 * Gentle proactive nudges — MIRA checking in, not waiting to be asked. Each
 * carries an action route. Capped so it never nags.
 */
export function proactiveNudges() {
  const out = []
  const stats = getCycleStats()
  const hour = new Date().getHours()
  const todayStr = new Date().toISOString().slice(0, 10)
  const loggedMoodToday = getLogs().some((l) => l.date.slice(0, 10) === todayStr && (l.moods || l.mood))

  if (stats.daysUntilNext != null && stats.daysUntilNext >= 0 && stats.daysUntilNext <= 2)
    out.push({ id: 'period', icon: '🌸', key: 'nudgePeriod', vars: { n: stats.daysUntilNext }, to: '/cycle', cta: 'nudgePlan' })
  if (getWaterToday() < 2 && hour >= 12)
    out.push({ id: 'water', icon: '💧', key: 'nudgeWater', to: '/nutrition', cta: 'nudgeLogWater' })
  if (!loggedMoodToday)
    out.push({ id: 'mood', icon: '💗', key: 'nudgeMood', to: '/mood', cta: 'nudgeCheckin' })

  return out.slice(0, 2)
}

// ── Personalization / privacy controls ───────────────────────────────────────
const AI_KEY = 'mira.ai.v1'
export function getAISettings() {
  try { return JSON.parse(localStorage.getItem(AI_KEY)) || { paused: false } } catch { return { paused: false } }
}
export function setAISettings(patch) {
  const next = { ...getAISettings(), ...patch }
  try { localStorage.setItem(AI_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  return next
}

/** Reset behavioural learning (keeps profile + cycle history). */
export function resetLearning() {
  ;['mira.logs.v1', 'mira.learn.v1', 'mira.nutrition.v1', 'mira.gratitude.v1', 'mira.showTour.v1'].forEach((k) => {
    try { localStorage.removeItem(k) } catch { /* ignore */ }
  })
}

/** Export everything MIRA stores locally as a JSON string. */
export function exportData() {
  const data = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith('mira.')) data[k] = safeParse(localStorage.getItem(k))
    }
  } catch { /* ignore */ }
  return JSON.stringify({ exportedAt: new Date().toISOString(), app: 'MIRA', data }, null, 2)
}

function safeParse(v) { try { return JSON.parse(v) } catch { return v } }
function fmtShort(iso) { try { return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) } catch { return '' } }
