/**
 * Community Intelligence with k-anonymity (MHIN).
 *
 * Population-level menstrual-health insights aggregated by school + month. The
 * ONLY synthetic data in the app lives here (a seeded generator), per the
 * project's rules — everything else is the user's real data.
 *
 * Privacy is enforced by a hard k≥10 SUPPRESSION THRESHOLD: any group with
 * fewer than 10 contributing logs is suppressed. This is named exactly that —
 * k≥10 suppression — and is NOT differential privacy.
 */

export const K_THRESHOLD = 10

// Deterministic RNG so the demo data is stable across reloads.
function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SCHOOLS = [
  { tag: 'Govt Girls HSS, Salem', n: 58 },
  { tag: "St. Mary's, Chennai", n: 47 },
  { tag: 'KV Madurai', n: 71 },
  { tag: 'ZP School, Erode', n: 12 },
  { tag: 'Panchayat Union, Trichy', n: 9 }, // < k → will be suppressed (demonstrates it)
]
const MONTHS = ['2026-04', '2026-05', '2026-06']
const SYMPTOMS = ['painful periods', 'heavy bleeding', 'fatigue', 'irregular cycles', 'missed school']

/**
 * Generate the synthetic community dataset (~197 logs across 5 schools).
 * Clearly labelled SYNTHETIC — the single seeded exception to "no mocked data".
 */
export function seedCommunityData() {
  const rand = mulberry32(20260701)
  const logs = []
  for (const s of SCHOOLS) {
    for (let i = 0; i < s.n; i++) {
      const pain = Math.floor(rand() * 11)
      logs.push({
        schoolTag: s.tag,
        month: MONTHS[Math.floor(rand() * MONTHS.length)],
        pain,
        flow: rand() > 0.5 ? 'heavy' : rand() > 0.4 ? 'medium' : 'light',
        symptom: SYMPTOMS[Math.floor(rand() * SYMPTOMS.length)],
        missedSchool: rand() > 0.6,
      })
    }
  }
  return logs
}

/**
 * Aggregate logs by school, applying k≥10 suppression.
 * @returns {{ visible: Array, suppressed: Array, k: number }}
 */
export function aggregateByGroup(logs, { minK = K_THRESHOLD } = {}) {
  const byTag = new Map()
  for (const l of logs) {
    if (!byTag.has(l.schoolTag)) byTag.set(l.schoolTag, [])
    byTag.get(l.schoolTag).push(l)
  }

  const visible = []
  const suppressed = []
  for (const [tag, rows] of byTag) {
    if (rows.length < minK) {
      // Suppressed: expose NO stats, only that the group is protected.
      suppressed.push({ tag, count: rows.length })
      continue
    }
    const pains = rows.map((r) => r.pain)
    const avgPain = pains.reduce((a, b) => a + b, 0) / pains.length
    const highPainPct = Math.round((pains.filter((p) => p >= 7).length / pains.length) * 100)
    const missedPct = Math.round((rows.filter((r) => r.missedSchool).length / rows.length) * 100)
    const symCounts = {}
    rows.forEach((r) => (symCounts[r.symptom] = (symCounts[r.symptom] || 0) + 1))
    const topSymptom = Object.entries(symCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    visible.push({
      tag,
      count: rows.length,
      avgPain: Math.round(avgPain * 10) / 10,
      highPainPct,
      missedPct,
      topSymptom,
    })
  }
  visible.sort((a, b) => b.count - a.count)
  return { visible, suppressed, k: minK }
}

/**
 * Live, demonstrable k-anonymity test: a group of 9 must be suppressed and a
 * group of 10 must be shown. Returns pass/fail + the two cases for the UI.
 */
export function kAnonymityTest() {
  const make = (tag, n) =>
    Array.from({ length: n }, () => ({ schoolTag: tag, month: '2026-06', pain: 6, symptom: 'fatigue' }))
  const nine = aggregateByGroup(make('Test-9', 9))
  const ten = aggregateByGroup(make('Test-10', 10))

  const nineSuppressed = nine.visible.length === 0 && nine.suppressed.length === 1
  const tenVisible = ten.visible.length === 1 && ten.suppressed.length === 0
  return {
    pass: nineSuppressed && tenVisible,
    k: K_THRESHOLD,
    cases: [
      { n: 9, expected: 'suppressed', actual: nineSuppressed ? 'suppressed' : 'shown', ok: nineSuppressed },
      { n: 10, expected: 'shown', actual: tenVisible ? 'shown' : 'suppressed', ok: tenVisible },
    ],
  }
}
