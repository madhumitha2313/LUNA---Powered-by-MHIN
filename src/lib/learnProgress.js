/**
 * Learning progress + gamification, stored locally. XP, completed lessons,
 * badges and a day-streak — the user's own record, persisted on their device.
 */
const KEY = 'mira.learn.v1'
const XP_PER_LESSON = 50

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {}
  } catch {
    return {}
  }
}
function write(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v))
  } catch {
    /* ignore */
  }
}

export function getProgress() {
  const p = read()
  return {
    xp: p.xp || 0,
    completed: p.completed || [],
    badges: p.badges || [],
    streak: p.streak || 0,
    lastDay: p.lastDay || null,
    mythBest: p.mythBest || 0,
  }
}

export function isDone(topicId) {
  return getProgress().completed.includes(topicId)
}

export function level(xp) {
  return Math.floor(xp / 200) + 1 // 200 XP per level
}

/** Mark a lesson complete: award XP, update streak, unlock badges. Idempotent. */
export function completeLesson(topicId, badgeName) {
  const p = getProgress()
  if (!p.completed.includes(topicId)) {
    p.completed.push(topicId)
    p.xp += XP_PER_LESSON
    if (badgeName && !p.badges.includes(badgeName)) p.badges.push(badgeName)
    if (p.completed.length >= 5 && !p.badges.includes('Curious Mind')) p.badges.push('Curious Mind')
  }
  // Day streak
  const today = new Date().toISOString().slice(0, 10)
  if (p.lastDay !== today) {
    const yday = new Date(Date.now() - 864e5).toISOString().slice(0, 10)
    p.streak = p.lastDay === yday ? (p.streak || 0) + 1 : 1
    p.lastDay = today
  }
  write(p)
  return getProgress()
}

export function recordMythScore(score) {
  const p = getProgress()
  if (score > (p.mythBest || 0)) {
    p.mythBest = score
    if (!p.badges.includes('Myth Buster')) p.badges.push('Myth Buster')
    write(p)
  }
  return getProgress()
}
