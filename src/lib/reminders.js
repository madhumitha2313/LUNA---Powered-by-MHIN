/**
 * MIRA Smart Reminder & Habit engine. A gentle, context-aware planner: a daily
 * AI wellness plan that adapts to cycle phase and goal, habit streaks, smart
 * reminders the user fully controls, and a period-preparation mode. All local.
 */
import { getCycleStats, getProfile } from './localStore'

const DAY = 86400000
const iso = (d) => new Date(d).toISOString().slice(0, 10)
const today = () => iso(Date.now())

const KEY = 'mira.plan.v1'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }

// ── Habits ───────────────────────────────────────────────────────────────────
export const HABITS = {
  water: { emoji: '💧', key: 'habWater' },
  move: { emoji: '🚶', key: 'habMove' },
  mood: { emoji: '😊', key: 'habMood' },
  meal: { emoji: '🥗', key: 'habMeal' },
  sleep: { emoji: '😴', key: 'habSleep' },
  meditate: { emoji: '🧘', key: 'habMeditate' },
  journal: { emoji: '📓', key: 'habJournal' },
  lesson: { emoji: '📖', key: 'habLesson' },
}

/** The AI habit coach: today's 5-part wellness plan, adapted to phase + goal. */
export function todaysPlan() {
  const phase = getCycleStats().phase || 'follicular'
  const base = ['water', 'mood', 'sleep']
  const byPhase = {
    menstrual: ['meditate', 'meal'],
    follicular: ['move', 'lesson'],
    ovulation: ['move', 'meal'],
    luteal: ['meditate', 'journal'],
  }
  const goal = (getProfile().goal || '').toLowerCase()
  let extra = byPhase[phase] || ['move', 'meal']
  if (goal.includes('sleep')) extra = ['meditate', extra[1]]
  if (goal.includes('energy')) extra = ['move', 'meal']
  return [...base.slice(0, 3), ...extra].slice(0, 5)
}

export function doneToday() {
  const d = read()
  return (d.habits && d.habits[today()]) || []
}
export function toggleHabit(id) {
  const d = read()
  d.habits = d.habits || {}
  const day = today()
  const set = new Set(d.habits[day] || [])
  set.has(id) ? set.delete(id) : set.add(id)
  d.habits[day] = [...set]
  write(d)
  return d.habits[day]
}

/** Consecutive-day streak for one habit (counting today if done). */
export function habitStreak(id) {
  const d = read().habits || {}
  let streak = 0
  for (let i = 0; i < 400; i++) {
    const day = iso(Date.now() - i * DAY)
    if ((d[day] || []).includes(id)) streak++
    else if (i === 0) continue // today not done yet — keep counting from yesterday
    else break
  }
  return streak
}

/** Overall wellness streak: consecutive days with >= 3 habits completed. */
export function wellnessStreak() {
  const d = read().habits || {}
  let streak = 0
  for (let i = 0; i < 400; i++) {
    const day = iso(Date.now() - i * DAY)
    const n = (d[day] || []).length
    if (n >= 3) streak++
    else if (i === 0) continue
    else break
  }
  return streak
}

const MILESTONES = [3, 7, 15, 30, 100, 365]
/** Returns a milestone number if today's completion just reached one, else null. */
export function reachedMilestone() {
  const s = wellnessStreak()
  return MILESTONES.includes(s) ? s : null
}

// ── Reminders (user-controlled) ──────────────────────────────────────────────
const DEFAULTS = [
  { id: 'r_water', emoji: '💧', key: 'remWater', time: '10:00', type: 'hydration', enabled: true },
  { id: 'r_mood', emoji: '💗', key: 'remMood', time: '20:00', type: 'mood', enabled: true },
  { id: 'r_move', emoji: '🚶', key: 'remMove', time: '17:00', type: 'exercise', enabled: true },
  { id: 'r_sleep', emoji: '😴', key: 'remSleep', time: '22:30', type: 'sleep', enabled: true },
  { id: 'r_lesson', emoji: '📖', key: 'remLesson', time: '19:00', type: 'learning', enabled: false },
]

export function getReminders() {
  const d = read()
  if (!d.reminders) { d.reminders = DEFAULTS; write(d) }
  return d.reminders
}
export function toggleReminder(id) {
  const d = read()
  d.reminders = (d.reminders || DEFAULTS).map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
  write(d)
  return d.reminders
}
export function deleteReminder(id) {
  const d = read()
  d.reminders = (d.reminders || DEFAULTS).filter((r) => r.id !== id)
  write(d)
  return d.reminders
}
export function addReminder(r) {
  const d = read()
  d.reminders = [...(d.reminders || DEFAULTS), { id: `r_${Date.now()}`, enabled: true, custom: true, ...r }]
  write(d)
  return d.reminders
}

/** Context-aware reminder suggestions for the current phase, not yet added. */
export function suggestedReminders() {
  const phase = getCycleStats().phase || 'follicular'
  const existing = new Set(getReminders().map((r) => r.key))
  const byPhase = {
    menstrual: [{ emoji: '🥬', key: 'remIron', time: '13:00', type: 'nutrition' }, { emoji: '🫖', key: 'remWarmth', time: '16:00', type: 'selfcare' }],
    follicular: [{ emoji: '💪', key: 'remProtein', time: '13:00', type: 'nutrition' }, { emoji: '📖', key: 'remLearn', time: '18:00', type: 'learning' }],
    ovulation: [{ emoji: '🥥', key: 'remHydrate', time: '11:00', type: 'hydration' }, { emoji: '🥦', key: 'remAntiox', time: '13:00', type: 'nutrition' }],
    luteal: [{ emoji: '🥜', key: 'remMagnesium', time: '16:00', type: 'nutrition' }, { emoji: '🧘', key: 'remBreathe', time: '20:00', type: 'selfcare' }],
  }
  return (byPhase[phase] || []).filter((s) => !existing.has(s.key))
}

// ── Period preparation mode (auto ≤3 days before predicted period) ────────────
export const PREP_ITEMS = [
  { id: 'p_pads', emoji: '🧴', key: 'prepPads' },
  { id: 'p_iron', emoji: '🥬', key: 'prepIron' },
  { id: 'p_hydrate', emoji: '💧', key: 'prepHydrate' },
  { id: 'p_warm', emoji: '🔥', key: 'prepWarmth' },
  { id: 'p_gentle', emoji: '🧘', key: 'prepGentle' },
  { id: 'p_rest', emoji: '😴', key: 'prepRest' },
]
export function periodPrep() {
  const stats = getCycleStats()
  const active = stats.daysUntilNext != null && stats.daysUntilNext >= 0 && stats.daysUntilNext <= 3
  return { active, days: stats.daysUntilNext }
}
export function prepDone() {
  const d = read()
  return d.prep || []
}
export function togglePrep(id) {
  const d = read()
  const set = new Set(d.prep || [])
  set.has(id) ? set.delete(id) : set.add(id)
  d.prep = [...set]
  write(d)
  return d.prep
}
