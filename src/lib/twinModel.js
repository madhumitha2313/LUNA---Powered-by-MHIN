/**
 * MIRA Digital Twin model (Part 22). A living, educational representation of
 * the user's wellness — six body indicators, a composite health score, a
 * short forecast, and a "what-if" simulation engine that projects how habit
 * changes MIGHT shift things, based on the user's own trends + general wellness
 * guidance. Everything here is an educational estimate, never a diagnosis, and
 * grows more confident as more data is logged.
 */
import { getLogs, getCycleStats } from './localStore'
import { computeHealthScore, insights as cycleInsights } from './cycleIntel'
import { moodSummary, moodInsights } from './moodIntel'
import { getWaterToday, WATER_GOAL } from './nutritionIntel'
import { twinSignals } from './wearables'

const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null)
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)))
const tone = (v) => (v >= 72 ? 'good' : v >= 52 ? 'ok' : 'low')

const ENERGY = { high: 90, ok: 65, low: 38 }
const SLEEP = { good: 90, ok: 63, poor: 34 }
const STRESS = { low: 88, ok: 60, high: 34 } // higher = calmer (better)

/** Six wellness indicators (0–100) placed on the stylised body avatar. */
export function bodyIndicators() {
  const logs = getLogs().slice(0, 14)
  const stats = getCycleStats()
  const mood = moodSummary(14)

  // Wearable fusion: when a device is connected + allowed, measured signals
  // blend into (and strengthen) the estimates so the twin refreshes automatically.
  const wear = twinSignals()
  const blend = (est, key) => (wear && wear[key] != null ? est == null ? wear[key] : est * 0.45 + wear[key] * 0.55 : est)

  const energyEst = avg(logs.map((l) => ENERGY[l.energy]).filter((n) => n != null)) ?? phaseDefault(stats.phase, 'energy')
  const sleepEst = avg(logs.map((l) => SLEEP[l.sleep]).filter((n) => n != null)) ?? (wear?.sleep != null ? null : 60)
  const stressEst = avg(logs.map((l) => STRESS[l.stress]).filter((n) => n != null)) ?? (wear?.stress != null ? null : 62)
  const energy = blend(energyEst, 'energy')
  const sleep = blend(sleepEst, 'sleep') ?? 60
  const stress = blend(stressEst, 'stress') ?? 62
  const moodV = mood.positivity != null ? mood.positivity : phaseDefault(stats.phase, 'mood')
  const hydration = Math.min(100, (getWaterToday() / WATER_GOAL) * 100) || 40
  const hormonal = stats.regularity === 'regular' ? 84 : stats.regularity === 'slightly irregular' ? 62 : stats.regularity ? 46 : 60

  const list = [
    { id: 'mood', key: 'twMood', emoji: '💗', value: clamp(moodV), x: 100, y: 40 },
    { id: 'stress', key: 'twStress', emoji: '🌊', value: clamp(stress), x: 66, y: 82 },
    { id: 'energy', key: 'twEnergy', emoji: '⚡', value: clamp(energy), x: 100, y: 120 },
    { id: 'hydration', key: 'twHydration', emoji: '💧', value: clamp(hydration), x: 134, y: 150 },
    { id: 'sleep', key: 'twSleep', emoji: '😴', value: clamp(sleep), x: 66, y: 150 },
    { id: 'hormonal', key: 'twHormonal', emoji: '🌙', value: clamp(hormonal), x: 100, y: 186 },
  ]
  return list.map((i) => ({ ...i, tone: tone(i.value) }))
}

function phaseDefault(phase, metric) {
  const table = {
    menstrual: { energy: 45, mood: 55 }, follicular: { energy: 75, mood: 72 },
    ovulation: { energy: 85, mood: 78 }, luteal: { energy: 55, mood: 52 },
  }
  return table[phase]?.[metric] ?? 60
}

/** Composite digital health score + confidence from data volume. */
export function composite() {
  const ind = bodyIndicators()
  const score = clamp(avg(ind.map((i) => i.value)))
  const wear = twinSignals()
  // Continuous wearable data adds a lot of confidence (many daily data points).
  const dataPoints = getLogs().length + (getCycleStats().avgCycleLength ? 3 : 0) + (wear ? 14 : 0)
  return { score, indicators: ind, wearable: !!wear, ...confidence(dataPoints) }
}

const CONF_LEVELS = [
  { at: 24, key: 'confVeryHigh', pct: 92 }, { at: 12, key: 'confHigh', pct: 80 },
  { at: 5, key: 'confMedium', pct: 64 }, { at: 1, key: 'confLow', pct: 45 }, { at: 0, key: 'confUnknown', pct: 20 },
]
export function confidence(dataPoints) {
  const lvl = CONF_LEVELS.find((l) => dataPoints >= l.at) || CONF_LEVELS[CONF_LEVELS.length - 1]
  return { confKey: lvl.key, confPct: lvl.pct, dataPoints }
}

/** Short educational forecast per metric (reuses the cycle health engine). */
export function forecast() {
  const hs = computeHealthScore()
  const stats = getCycleStats()
  const phase = stats.phase || 'follicular'
  const F = {
    menstrual: [['energy', 'lower', 'fcEnergyMenstrual', 'fcActRest'], ['pain', 'higher', 'fcPainMenstrual', 'fcActWarm'], ['mood', 'tender', 'fcMoodMenstrual', 'fcActGentle']],
    follicular: [['energy', 'rising', 'fcEnergyFollicular', 'fcActStart'], ['mood', 'bright', 'fcMoodFollicular', 'fcActConnect'], ['cravings', 'low', 'fcCravingsLow', 'fcActEnjoy']],
    ovulation: [['energy', 'peak', 'fcEnergyOvulation', 'fcActBig'], ['mood', 'confident', 'fcMoodOvulation', 'fcActSocial'], ['hydration', 'watch', 'fcHydrationWatch', 'fcActWater']],
    luteal: [['energy', 'dipping', 'fcEnergyLuteal', 'fcActSlow'], ['cravings', 'higher', 'fcCravingsHigh', 'fcActMagnesium'], ['mood', 'sensitive', 'fcMoodLuteal', 'fcActKind']],
  }
  return (F[phase] || F.follicular).map(([metric, level, explanationKey, actionKey]) => ({
    metric, level, explanationKey, actionKey, ...confidence(getLogs().length + 3),
  })).concat(hs.trend ? [{ metric: 'wellness', level: hs.trend, explanationKey: `fcWellness_${hs.trend}`, actionKey: 'fcActKeep', confKey: 'confMedium', confPct: 64 }] : [])
}

// ── "What if?" simulation engine ─────────────────────────────────────────────
export const SCENARIOS = [
  { id: 'sleep8', emoji: '😴', key: 'scSleep', effects: { sleep: 28, energy: 16, stress: 16, mood: 10 } },
  { id: 'water', emoji: '💧', key: 'scWater', effects: { hydration: 34, energy: 10, mood: 8 } },
  { id: 'sugar', emoji: '🍫', key: 'scSugar', effects: { energy: 12, mood: 8, hormonal: 8 } },
  { id: 'walk', emoji: '🚶‍♀️', key: 'scWalk', effects: { mood: 16, energy: 12, stress: 18, sleep: 10 } },
  { id: 'iron', emoji: '🥬', key: 'scIron', effects: { energy: 16, hormonal: 10 } },
]

/** Project the indicators under a scenario. Returns affected metrics with
 *  baseline → projected + an educational note. */
export function simulate(scenarioId) {
  const sc = SCENARIOS.find((s) => s.id === scenarioId)
  if (!sc) return null
  const ind = Object.fromEntries(bodyIndicators().map((i) => [i.id, i.value]))
  const rows = Object.entries(sc.effects).map(([metric, delta]) => {
    const base = ind[metric] ?? 60
    return { metric, base, projected: clamp(base + delta), delta }
  })
  return { scenario: sc, rows }
}

export function compare(aId, bId) {
  return { a: simulate(aId), b: simulate(bId) }
}

// ── Trend discovery + areas to watch (educational) ───────────────────────────
export function trends() {
  const out = [...cycleInsights(), ...moodInsights()]
  const seen = new Set()
  return out.filter((t) => (seen.has(t.key) ? false : (seen.add(t.key), true))).slice(0, 3)
}

export function areasToWatch() {
  const stats = getCycleStats()
  const out = []
  if (stats.regularity === 'irregular') out.push({ key: 'watchIrregular' })
  const pains = getLogs().map((l) => Number(l.pain)).filter((n) => !Number.isNaN(n))
  if (pains.length >= 4 && pains.filter((p) => p >= 7).length / pains.length >= 0.4) out.push({ key: 'watchPain' })
  if (getWaterToday() < 3) out.push({ key: 'watchHydration' })
  return out.slice(0, 2)
}
