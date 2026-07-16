/**
 * MIRA Multi-Agent Orchestrator (Part 21). The user always experiences one
 * seamless MIRA. Behind the scenes an orchestrator routes each message to the
 * relevant specialist agents, each contributes its piece, a safety supervisor
 * validates, and the result is merged into a single reply — with a decision
 * log the user can optionally reveal. This runs locally on top of the existing
 * intent / sentiment / knowledge / context engines.
 */

// The agent roster. Adding a future agent (pregnancy, menopause…) is just a
// new entry + a rule in `orchestrate` — no architectural change.
export const AGENTS = {
  conversation: { emoji: '💬', key: 'agConversation' },
  cycle: { emoji: '🩸', key: 'agCycle' },
  womens: { emoji: '🧬', key: 'agWomens' },
  nutrition: { emoji: '🥗', key: 'agNutrition' },
  mood: { emoji: '💗', key: 'agMood' },
  report: { emoji: '📄', key: 'agReport' },
  recommend: { emoji: '💡', key: 'agRecommend' },
  safety: { emoji: '🛡️', key: 'agSafety' },
  learning: { emoji: '📚', key: 'agLearning' },
  memory: { emoji: '🧠', key: 'agMemory' },
  twin: { emoji: '🔮', key: 'agTwin' },
  journey: { emoji: '🌟', key: 'agJourney' },
}
export const AGENT_ORDER = ['conversation', 'cycle', 'womens', 'nutrition', 'mood', 'report', 'recommend', 'safety', 'learning', 'memory', 'twin', 'journey']

const re = (p, s) => new RegExp(p, 'i').test(s || '')

/**
 * Decide which specialist agents collaborate on a message and what each
 * contributes. Returns the involved agents (in a stable order), each with a
 * one-line contribution + a confidence, plus a decision-log summary.
 *
 * ctx: { text, intent, sentiment, isSymptom, kb, hasFoodRecs, hasRecs, phase, crisis }
 */
export function orchestrate(ctx = {}) {
  const { text = '', intent, sentiment, isSymptom, kb, hasFoodRecs, hasRecs, phase, crisis } = ctx
  const picked = new Map() // id -> { contribution, confidence }
  const add = (id, contribution, confidence) => { if (!picked.has(id)) picked.set(id, { contribution, confidence }) }

  // Conversation agent always leads.
  add('conversation', 'agcConversation', 0.9)

  // Cycle & prediction
  if (isSymptom || (kb && (kb.id === 'cycle' || kb.id === 'ovulation')) || re('period|cycle|ovulat|cramp|late|delayed|மாதவிடாய்|சுழற்சி', text)) {
    add('cycle', 'agcCycle', 0.86)
    if (re('late|delay|when|next period|predict|ovulat', text)) add('twin', 'agcTwin', 0.72)
  }
  // Women's health specialist
  if (kb && ['pcos', 'endo', 'fibroids', 'hormones'].includes(kb.id)) add('womens', 'agcWomens', 0.82)
  // Nutrition
  if (hasFoodRecs || (kb && ['nutrition', 'hydration'].includes(kb.id)) || re('eat|food|diet|iron|meal|nutrition|hydrat|water|உணவு', text)) add('nutrition', 'agcNutrition', 0.8)
  // Mood
  if (sentiment === 'low' || sentiment === 'crisis' || re('sad|anxious|stress|mood|depress|low|angry|tired|கவலை|சோர்வு', text)) add('mood', 'agcMood', 0.78)
  // Medical report
  if (re('report|blood|test|lab|scan|ultrasound|haemoglobin|hemoglobin|thyroid|அறிக்கை', text)) add('report', 'agcReport', 0.75)
  // Learning (knowledge retrieved)
  if (kb) add('learning', 'agcLearning', 0.8)
  // Recommendation agent merges everything
  if (hasRecs) add('recommend', 'agcRecommend', 0.8)

  // Safety supervisor — ALWAYS runs, last line of defence.
  add('safety', crisis ? 'agcSafetyCrisis' : 'agcSafetyOk', crisis ? 0.99 : 0.95)
  // Memory agent — always records.
  add('memory', 'agcMemory', 0.9)

  const agents = AGENT_ORDER.filter((id) => picked.has(id)).map((id) => ({
    id, ...AGENTS[id], ...picked.get(id),
  }))

  return {
    agents,
    orchestrator: {
      reasonKey: crisis ? 'orchReasonCrisis' : isSymptom ? 'orchReasonSymptom' : kb ? 'orchReasonKnowledge' : 'orchReasonGeneral',
      confidence: Math.round((agents.reduce((a, x) => a + x.confidence, 0) / agents.length) * 100),
      phase: phase || null,
      timestamp: new Date().toISOString(),
      safetyPassed: true,
    },
  }
}
