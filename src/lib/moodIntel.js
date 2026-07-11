/**
 * MIRA Mood Intelligence — an emotionally-aware layer on top of the daily
 * check-ins. It reads the user's own logged moods, finds gentle patterns,
 * and returns warm, personalised recommendations (wellness activities,
 * entertainment, food), affirmations and challenges. All on-device.
 */
import { getLogs, getCycleStats } from './localStore'

const DAY = 86400000

// The 12 emotions offered at check-in. `bucket` groups them for
// recommendations; `compat` maps to the health-score vocabulary so a mood
// check-in also feeds the Part 06 engine.
export const EMOTIONS = [
  { id: 'happy', emoji: '😊', bucket: 'uplifted', compat: 'happy' },
  { id: 'calm', emoji: '😌', bucket: 'calm', compat: 'calm' },
  { id: 'loved', emoji: '🥰', bucket: 'uplifted', compat: 'happy' },
  { id: 'excited', emoji: '🤩', bucket: 'uplifted', compat: 'great' },
  { id: 'tired', emoji: '😴', bucket: 'tired', compat: 'tired' },
  { id: 'sad', emoji: '😔', bucket: 'low', compat: 'sad' },
  { id: 'anxious', emoji: '😰', bucket: 'anxious', compat: 'anxious' },
  { id: 'irritated', emoji: '😡', bucket: 'irritated', compat: 'angry' },
  { id: 'emotional', emoji: '😭', bucket: 'low', compat: 'low' },
  { id: 'sick', emoji: '🤒', bucket: 'tired', compat: 'low' },
  { id: 'stressed', emoji: '😵', bucket: 'anxious', compat: 'anxious' },
  { id: 'neutral', emoji: '😐', bucket: 'calm', compat: 'ok' },
]
const BY_ID = Object.fromEntries(EMOTIONS.map((e) => [e.id, e]))

/** Reduce a set of selected emotions to a single bucket + a compat mood. */
export function summarizeMood(ids = []) {
  if (!ids.length) return { bucket: 'calm', compat: 'ok' }
  // Priority: distress buckets first so support is offered when needed.
  const order = ['low', 'anxious', 'irritated', 'tired', 'calm', 'uplifted']
  const buckets = ids.map((id) => BY_ID[id]?.bucket).filter(Boolean)
  const bucket = order.find((b) => buckets.includes(b)) || 'calm'
  const compat = BY_ID[ids[0]]?.compat || 'ok'
  return { bucket, compat }
}

// ── Recommendation content (warm, curated; English like other content) ───────
const RECO = {
  uplifted: {
    tone: 'ride the good energy',
    wellness: [
      { emoji: '📓', key: 'actJournalJoy', mins: 5, level: 'easy' },
      { emoji: '💃', key: 'actDance', mins: 10, level: 'easy' },
      { emoji: '📞', key: 'actCallLoved', mins: 10, level: 'easy' },
    ],
    ent: [
      { type: 'music', emoji: '🎵', title: 'Feel-Good Pop', genre: 'Playlist', mins: '45m', whyKey: 'entKeepVibe' },
      { type: 'movie', emoji: '🎬', title: 'A feel-good comedy', genre: 'Comedy', mins: '1h 40m', whyKey: 'entCelebrate' },
      { type: 'book', emoji: '📖', title: 'An uplifting memoir', genre: 'Non-fiction', mins: '20m', whyKey: 'entInspire' },
    ],
    food: [
      { emoji: '🥗', key: 'foodColourful', benefitKey: 'benSteady' },
      { emoji: '🍓', key: 'foodBerries', benefitKey: 'benAntiox' },
    ],
  },
  calm: {
    tone: 'keep your calm',
    wellness: [
      { emoji: '🧘', key: 'actMeditate', mins: 8, level: 'easy' },
      { emoji: '🚶‍♀️', key: 'actWalk', mins: 15, level: 'easy' },
      { emoji: '📖', key: 'actRead', mins: 20, level: 'easy' },
    ],
    ent: [
      { type: 'music', emoji: '🎧', title: 'Lo-fi & Chill', genre: 'Playlist', mins: '1h', whyKey: 'entMaintain' },
      { type: 'podcast', emoji: '🎙️', title: 'A calm wellness podcast', genre: 'Podcast', mins: '30m', whyKey: 'entReflect' },
      { type: 'book', emoji: '📚', title: 'Gentle fiction', genre: 'Fiction', mins: '20m', whyKey: 'entUnwind' },
    ],
    food: [
      { emoji: '🍵', key: 'foodHerbalTea', benefitKey: 'benSoothe' },
      { emoji: '🥑', key: 'foodWholesome', benefitKey: 'benSteady' },
    ],
  },
  low: {
    tone: 'be gentle and lift slowly',
    wellness: [
      { emoji: '🫁', key: 'actBreathe', mins: 3, level: 'easy' },
      { emoji: '📞', key: 'actCallLoved', mins: 10, level: 'easy' },
      { emoji: '☀️', key: 'actSunlight', mins: 10, level: 'easy' },
    ],
    ent: [
      { type: 'movie', emoji: '🎬', title: 'A comforting favourite', genre: 'Comfort watch', mins: '1h 50m', whyKey: 'entComfort' },
      { type: 'music', emoji: '🎵', title: 'Warm & Cosy', genre: 'Playlist', mins: '40m', whyKey: 'entHold' },
      { type: 'talk', emoji: '🌟', title: 'A short inspiring talk', genre: 'Talk', mins: '12m', whyKey: 'entHope' },
    ],
    food: [
      { emoji: '🍫', key: 'foodDarkChoc', benefitKey: 'benMood' },
      { emoji: '🍵', key: 'foodHerbalTea', benefitKey: 'benSoothe' },
      { emoji: '🍌', key: 'foodBanana', benefitKey: 'benMood' },
    ],
  },
  anxious: {
    tone: 'soothe and ground',
    wellness: [
      { emoji: '🫁', key: 'actBreathe', mins: 3, level: 'easy' },
      { emoji: '🧘', key: 'actMeditate', mins: 8, level: 'easy' },
      { emoji: '📓', key: 'actBrainDump', mins: 5, level: 'easy' },
    ],
    ent: [
      { type: 'music', emoji: '🎧', title: 'Calm Piano', genre: 'Playlist', mins: '1h', whyKey: 'entSlow' },
      { type: 'meditation', emoji: '🧘', title: 'A guided body-scan', genre: 'Meditation', mins: '10m', whyKey: 'entGround' },
      { type: 'podcast', emoji: '🎙️', title: 'Sleep stories', genre: 'Podcast', mins: '25m', whyKey: 'entReflect' },
    ],
    food: [
      { emoji: '🍵', key: 'foodChamomile', benefitKey: 'benSoothe' },
      { emoji: '🥜', key: 'foodMagnesium', benefitKey: 'benCalm' },
    ],
  },
  tired: {
    tone: 'rest and restore',
    wellness: [
      { emoji: '💧', key: 'actHydrate', mins: 1, level: 'easy' },
      { emoji: '🛁', key: 'actWarmBath', mins: 15, level: 'easy' },
      { emoji: '😴', key: 'actRest', mins: 20, level: 'easy' },
    ],
    ent: [
      { type: 'music', emoji: '🎵', title: 'Soft Acoustic', genre: 'Playlist', mins: '45m', whyKey: 'entUnwind' },
      { type: 'movie', emoji: '🎬', title: 'Something light & easy', genre: 'Easy watch', mins: '1h 30m', whyKey: 'entLowEffort' },
      { type: 'audiobook', emoji: '🎧', title: 'A cosy audiobook', genre: 'Audiobook', mins: '30m', whyKey: 'entRest' },
    ],
    food: [
      { emoji: '🍲', key: 'foodWarmSoup', benefitKey: 'benRestore' },
      { emoji: '🥬', key: 'foodIron', benefitKey: 'benIron' },
    ],
  },
  irritated: {
    tone: 'release and reset',
    wellness: [
      { emoji: '🚶‍♀️', key: 'actWalk', mins: 15, level: 'easy' },
      { emoji: '🫁', key: 'actBreathe', mins: 3, level: 'easy' },
      { emoji: '📓', key: 'actBrainDump', mins: 5, level: 'easy' },
    ],
    ent: [
      { type: 'music', emoji: '🎵', title: 'Mood-Reset Beats', genre: 'Playlist', mins: '30m', whyKey: 'entShift' },
      { type: 'comedy', emoji: '😂', title: 'A short comedy clip', genre: 'Comedy', mins: '10m', whyKey: 'entLaugh' },
      { type: 'movie', emoji: '🎬', title: 'An absorbing thriller', genre: 'Thriller', mins: '2h', whyKey: 'entDistract' },
    ],
    food: [
      { emoji: '🍵', key: 'foodHerbalTea', benefitKey: 'benSoothe' },
      { emoji: '🍫', key: 'foodDarkChoc', benefitKey: 'benMood' },
    ],
  },
}

export function recommendationsFor(bucket) {
  return RECO[bucket] || RECO.calm
}

/** Symptom-aware food nudges layered on top of mood food (e.g. headache → ginger). */
export function symptomFood() {
  const recent = getLogs().slice(0, 3)
  const syms = new Set(recent.flatMap((l) => l.symptoms || []))
  const out = []
  if (syms.has('headache')) out.push({ emoji: '🫚', key: 'foodGinger', benefitKey: 'benHeadache' })
  if (syms.has('bloating')) out.push({ emoji: '🍲', key: 'foodWarmSoup', benefitKey: 'benBloat' })
  if (syms.has('fatigue') || syms.has('hairFall')) out.push({ emoji: '🥬', key: 'foodIron', benefitKey: 'benIron' })
  if (syms.has('cramps')) out.push({ emoji: '🍫', key: 'foodDarkChoc', benefitKey: 'benCramp' })
  return out
}

// ── Mood insights, streak & summary ──────────────────────────────────────────
const POS = new Set(['happy', 'calm', 'loved', 'excited', 'neutral', 'great', 'ok'])

export function moodSummary(days = 7) {
  const cutoff = Date.now() - days * DAY
  const logs = getLogs().filter((l) => new Date(l.date).getTime() >= cutoff && (l.moods || l.mood))
  const counts = {}
  logs.forEach((l) => (l.moods || [l.mood]).forEach((m) => { if (m) counts[m] = (counts[m] || 0) + 1 }))
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id)
  const positives = logs.filter((l) => (l.moods || [l.mood]).some((m) => POS.has(m))).length
  const positivity = logs.length ? Math.round((positives / logs.length) * 100) : null
  return { count: logs.length, top, positivity }
}

/** Longest run of consecutive days with a mood logged. */
export function moodStreak() {
  const days = [...new Set(getLogs().filter((l) => l.moods || l.mood).map((l) => new Date(l.date).toISOString().slice(0, 10)))].sort()
  let best = 0, cur = 0, prev = null
  days.forEach((d) => { if (prev && new Date(d) - new Date(prev) === DAY) cur += 1; else cur = 1; best = Math.max(best, cur); prev = d })
  return best
}

export function moodInsights() {
  const logs = getLogs().filter((l) => l.moods || l.mood)
  const out = []

  // Mood by cycle phase
  const byPhase = {}
  logs.forEach((l) => {
    if (!l.phase) return
    const pos = (l.moods || [l.mood]).some((m) => POS.has(m))
    byPhase[l.phase] = byPhase[l.phase] || { pos: 0, n: 0 }
    byPhase[l.phase].n += 1
    if (pos) byPhase[l.phase].pos += 1
  })
  if ((byPhase.follicular?.n || 0) >= 2 && byPhase.follicular.pos / byPhase.follicular.n >= 0.6) out.push({ key: 'moInsFollicular' })
  if ((byPhase.luteal?.n || 0) >= 2 && byPhase.luteal.pos / byPhase.luteal.n < 0.5) out.push({ key: 'moInsLuteal' })

  // Activity → mood (walking / meditation improve mood, if logged)
  const walked = logs.filter((l) => l.activity === 'walk' || l.symptoms?.includes('walk'))
  if (walked.length >= 2 && walked.filter((l) => (l.moods || [l.mood]).some((m) => POS.has(m))).length / walked.length >= 0.6) out.push({ key: 'moInsWalk' })

  if (out.length === 0) {
    const phase = getCycleStats().phase
    if (phase) out.push({ key: `insPhase_${phase}` })
  }
  return out.slice(0, 2)
}

// ── Affirmations & challenges (rotate by day so they rarely repeat) ───────────
const AFFIRMATIONS = ['affirm1', 'affirm2', 'affirm3', 'affirm4', 'affirm5', 'affirm6', 'affirm7', 'affirm8', 'affirm9', 'affirm10']
const CHALLENGES = [
  { key: 'chWater', emoji: '💧' }, { key: 'chWalk', emoji: '🚶‍♀️' }, { key: 'chBreathe', emoji: '🫁' },
  { key: 'chSleep', emoji: '😴' }, { key: 'chMeal', emoji: '🥗' }, { key: 'chGratitude', emoji: '🙏' }, { key: 'chScreen', emoji: '🌙' },
]
export function affirmationOfDay() {
  const d = Math.floor(Date.now() / DAY)
  return AFFIRMATIONS[d % AFFIRMATIONS.length]
}
export function challengeOfDay() {
  const d = Math.floor(Date.now() / DAY)
  return CHALLENGES[d % CHALLENGES.length]
}

// ── Gratitude journal (own store) ────────────────────────────────────────────
const GRAT_KEY = 'mira.gratitude.v1'
export function getGratitude() {
  try { return JSON.parse(localStorage.getItem(GRAT_KEY)) || [] } catch { return [] }
}
export function addGratitude(entry) {
  const all = getGratitude()
  all.unshift({ date: new Date().toISOString(), ...entry })
  try { localStorage.setItem(GRAT_KEY, JSON.stringify(all.slice(0, 60))) } catch { /* ignore */ }
  return all
}
