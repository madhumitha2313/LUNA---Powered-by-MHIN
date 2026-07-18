/**
 * MIRA Community (Part 27) — a privacy-first, moderated social wellness space.
 *
 * A supportive sisterhood, not another engagement machine: supportive reactions
 * (no like-counts as popularity), anonymous-by-choice identity, AI moderation
 * that flags harm for human review (never silently), and reputation that
 * rewards kindness rather than reach. All on-device in this preview; seed posts
 * and experts are warm, illustrative community content, clearly labelled.
 */
import { detectSentiment } from './sentiment'
import { totalXP } from './journeyStory'

const KEY = 'mira.community.v1'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }
const DEFAULT = () => ({ joined: ['selfcare', 'nutrition'], identity: 'nickname', nickname: '', posts: [], reactions: {}, saved: [], reports: [], challenges: [], buddies: [], events: [] })
export function getCommunity() { return { ...DEFAULT(), ...(read() || {}) } }
function save(patch) { const next = { ...getCommunity(), ...patch }; write(next); return next }

// ── Safe spaces ───────────────────────────────────────────────────────────────
export const SAFE_SPACES = [
  { id: 'firstPeriod', emoji: '🌷', key: 'spFirstPeriod', members: 12840 },
  { id: 'pcos', emoji: '🌸', key: 'spPcos', members: 28510 },
  { id: 'pcod', emoji: '🌺', key: 'spPcod', members: 15230 },
  { id: 'endometriosis', emoji: '🎀', key: 'spEndo', members: 9870 },
  { id: 'fibroids', emoji: '🌼', key: 'spFibroids', members: 6120 },
  { id: 'fertility', emoji: '🌱', key: 'spFertility', members: 18400 },
  { id: 'pregnancy', emoji: '🤰', key: 'spPregnancy', members: 21030 },
  { id: 'menopause', emoji: '🍂', key: 'spMenopause', members: 8760 },
  { id: 'mentalWellness', emoji: '🧠', key: 'spMental', members: 34200 },
  { id: 'nutrition', emoji: '🥗', key: 'spNutrition', members: 41200 },
  { id: 'fitness', emoji: '🤸‍♀️', key: 'spFitness', members: 26700 },
  { id: 'selfcare', emoji: '💗', key: 'spSelfcare', members: 38900 },
  { id: 'students', emoji: '🎓', key: 'spStudents', members: 19800 },
  { id: 'working', emoji: '💼', key: 'spWorking', members: 22400 },
  { id: 'mothers', emoji: '👶', key: 'spMothers', members: 17600 },
]
export function space(id) { return SAFE_SPACES.find((s) => s.id === id) }
export function isJoined(id) { return getCommunity().joined.includes(id) }
export function toggleSpace(id) {
  const j = getCommunity().joined
  return save({ joined: j.includes(id) ? j.filter((x) => x !== id) : [...j, id] })
}

// ── Identity ──────────────────────────────────────────────────────────────────
export const IDENTITY_MODES = [
  { id: 'real', emoji: '🙂', key: 'idReal' }, { id: 'nickname', emoji: '🌸', key: 'idNickname' },
  { id: 'anonymous', emoji: '🕶️', key: 'idAnon' }, { id: 'avatar', emoji: '👩', key: 'idAvatar' },
]
export function setIdentity(id, nickname) { return save({ identity: id, ...(nickname != null ? { nickname } : {}) }) }
export function displayName(t, profileName) {
  const c = getCommunity()
  if (c.identity === 'anonymous') return t('idAnonName')
  if (c.identity === 'avatar') return t('idAvatarName')
  if (c.identity === 'nickname') return c.nickname || t('idNicknameDefault')
  return profileName || t('idNicknameDefault')
}

// ── Supportive reactions (no popularity ranking) ─────────────────────────────
export const REACTIONS = [
  { id: 'support', emoji: '❤️', key: 'rxSupport' }, { id: 'thanks', emoji: '🌸', key: 'rxThanks' },
  { id: 'notAlone', emoji: '🤗', key: 'rxNotAlone' }, { id: 'helpful', emoji: '💖', key: 'rxHelpful' },
  { id: 'inspiring', emoji: '✨', key: 'rxInspiring' }, { id: 'appreciated', emoji: '🙏', key: 'rxAppreciated' },
]
export function react(postId, reactionId) {
  const r = { ...getCommunity().reactions }
  r[postId] = r[postId] === reactionId ? null : reactionId
  return save({ reactions: r })
}
export function myReaction(postId) { return getCommunity().reactions[postId] || null }

// ── Seed discussion posts (illustrative community content) ────────────────────
const SEED_POSTS = [
  { id: 'p1', space: 'pcos', avatar: '🌸', nameKey: 'seedName1', anon: false, bodyKey: 'seedPost1', reacts: 234, comments: 41, tag: 'question' },
  { id: 'p2', space: 'selfcare', avatar: '💗', nameKey: 'seedName2', anon: false, bodyKey: 'seedPost2', reacts: 512, comments: 88, tag: 'milestone' },
  { id: 'p3', space: 'firstPeriod', avatar: '🕶️', nameKey: 'idAnonName', anon: true, bodyKey: 'seedPost3', reacts: 176, comments: 62, tag: 'question' },
  { id: 'p4', space: 'nutrition', avatar: '🥗', nameKey: 'seedName4', anon: false, bodyKey: 'seedPost4', reacts: 298, comments: 33, tag: 'resource' },
  { id: 'p5', space: 'mentalWellness', avatar: '🧠', nameKey: 'seedName5', anon: false, bodyKey: 'seedPost5', reacts: 401, comments: 74, tag: 'experience' },
  { id: 'p6', space: 'fitness', avatar: '🤸‍♀️', nameKey: 'seedName6', anon: false, bodyKey: 'seedPost6', reacts: 187, comments: 29, tag: 'milestone' },
]
export const POST_TAGS = { question: '❓', milestone: '🎉', resource: '📚', experience: '💬', story: '🌟' }

/** Feed for the joined spaces (or all if none), most-supported first, user posts on top. */
export function feed(spaceId) {
  const c = getCommunity()
  const mine = c.posts.map((p) => ({ ...p, mine: true }))
  let seeds = SEED_POSTS
  if (spaceId) seeds = seeds.filter((p) => p.space === spaceId)
  else if (c.joined.length) seeds = seeds.filter((p) => c.joined.includes(p.space))
  return [...mine.filter((p) => !spaceId || p.space === spaceId), ...seeds]
}

export function createPost({ space, body, tag, anon }) {
  const mod = moderate(body)
  if (mod.status === 'block') return { ok: false, mod }
  const post = { id: 'u' + Date.now().toString(36), space, bodyKey: null, body, tag: tag || 'experience', anon: !!anon, avatar: anon ? '🕶️' : '🌸', reacts: 0, comments: 0, at: new Date().toISOString() }
  save({ posts: [post, ...getCommunity().posts] })
  return { ok: true, mod, post }
}

// ── AI moderation (flags for review — never a silent black box) ───────────────
const ABUSE = /\b(hate|kill you|stupid bitch|slut|whore|ugly loser|shut up idiot)\b/i
const SPAM = /(https?:\/\/|www\.|buy now|free money|click here|crypto|investment opportunity|whatsapp me)/i
const MEDICAL = /\b(cure(s|d)? (pcos|cancer|endometriosis)|guaranteed cure|miracle (cure|pill)|stop taking your|detox tea)\b/i
const PII = /(\+?\d[\d\s-]{8,}\d|\b[\w.+-]+@[\w-]+\.[a-z]{2,}\b)/i
/** Returns {status:'ok'|'warn'|'block'|'crisis', key}. */
export function moderate(text) {
  const t = text || ''
  if (detectSentiment(t) === 'crisis') return { status: 'crisis', key: 'modCrisis' }
  if (ABUSE.test(t)) return { status: 'block', key: 'modAbuse' }
  if (SPAM.test(t)) return { status: 'block', key: 'modSpam' }
  if (MEDICAL.test(t)) return { status: 'warn', key: 'modMedical' }
  if (PII.test(t)) return { status: 'warn', key: 'modPII' }
  return { status: 'ok', key: 'modOk' }
}
export const MOD_STATES = ['mstPending', 'mstReview', 'mstApproved', 'mstRemoved', 'mstAppealed', 'mstResolved']
export const GUIDELINES = ['glKind', 'glEducational', 'glPrivacy', 'glNoHarass', 'glNoMisinfo', 'glNoSpam', 'glReport']
export const REPORT_REASONS = ['rpHarass', 'rpBully', 'rpHate', 'rpMisinfo', 'rpSpam', 'rpScam', 'rpUnsafe', 'rpPrivacy']
export function reportContent(targetId, reasonKey, note) {
  const entry = { id: 'r' + Date.now().toString(36), targetId, reasonKey, note: note || '', at: new Date().toISOString(), state: 'mstPending' }
  return save({ reports: [entry, ...getCommunity().reports] })
}

// ── Ask an Expert ─────────────────────────────────────────────────────────────
export const EXPERTS = [
  { id: 'e1', avatar: '👩🏽‍⚕️', nameKey: 'exp1Name', roleKey: 'exp1Role', topicKey: 'exp1Topic', whenKey: 'expWhenTue', live: false },
  { id: 'e2', avatar: '🥗', nameKey: 'exp2Name', roleKey: 'exp2Role', topicKey: 'exp2Topic', whenKey: 'expWhenThu', live: true },
  { id: 'e3', avatar: '🧠', nameKey: 'exp3Name', roleKey: 'exp3Role', topicKey: 'exp3Topic', whenKey: 'expWhenSat', live: false },
]

// ── Community challenges ──────────────────────────────────────────────────────
export const CHALLENGES = [
  { id: 'hydration', emoji: '💧', key: 'cchHydration', descKey: 'cchHydrationDesc', days: 7, xp: 70, participants: 8240 },
  { id: 'sleep', emoji: '😴', key: 'cchSleep', descKey: 'cchSleepDesc', days: 14, xp: 140, participants: 5610 },
  { id: 'walk', emoji: '🚶‍♀️', key: 'cchWalk', descKey: 'cchWalkDesc', days: 21, xp: 210, participants: 11300 },
  { id: 'mood', emoji: '📔', key: 'cchMood', descKey: 'cchMoodDesc', days: 30, xp: 300, participants: 7180 },
  { id: 'meditation', emoji: '🧘‍♀️', key: 'cchMeditation', descKey: 'cchMeditationDesc', days: 30, xp: 300, participants: 4920 },
]
export function joinedChallenge(id) { return getCommunity().challenges.includes(id) }
export function toggleChallenge(id) {
  const ch = getCommunity().challenges
  return save({ challenges: ch.includes(id) ? ch.filter((x) => x !== id) : [...ch, id] })
}

// ── Wellness buddies ──────────────────────────────────────────────────────────
export const SUGGESTED_BUDDIES = [
  { id: 'b1', avatar: '🌷', nameKey: 'bud1Name', goalKey: 'bud1Goal', matchKey: 'bud1Match' },
  { id: 'b2', avatar: '🌸', nameKey: 'bud2Name', goalKey: 'bud2Goal', matchKey: 'bud2Match' },
  { id: 'b3', avatar: '🌻', nameKey: 'bud3Name', goalKey: 'bud3Goal', matchKey: 'bud3Match' },
]
export function isBuddy(id) { return getCommunity().buddies.includes(id) }
export function toggleBuddy(id) {
  const b = getCommunity().buddies
  return save({ buddies: b.includes(id) ? b.filter((x) => x !== id) : [...b, id] })
}

// ── Success stories & events ──────────────────────────────────────────────────
export const SUCCESS_STORIES = [
  { id: 's1', emoji: '💧', titleKey: 'story1Title', bodyKey: 'story1Body' },
  { id: 's2', emoji: '😴', titleKey: 'story2Title', bodyKey: 'story2Body' },
  { id: 's3', emoji: '🌸', titleKey: 'story3Title', bodyKey: 'story3Body' },
]
export const EVENTS = [
  { id: 'ev1', emoji: '🎥', titleKey: 'ev1Title', typeKey: 'evLive', whenKey: 'expWhenThu' },
  { id: 'ev2', emoji: '💬', titleKey: 'ev2Title', typeKey: 'evAma', whenKey: 'expWhenSat' },
  { id: 'ev3', emoji: '📚', titleKey: 'ev3Title', typeKey: 'evWorkshop', whenKey: 'expWhenTue' },
]
export function isRegistered(id) { return getCommunity().events.includes(id) }
export function toggleEvent(id) {
  const e = getCommunity().events
  return save({ events: e.includes(id) ? e.filter((x) => x !== id) : [...e, id] })
}

// ── Community reputation (kindness, not popularity) ──────────────────────────
export const REP_BADGES = [
  { id: 'helpful', emoji: '💖', key: 'repHelpful', need: (s) => s.reactionsGiven >= 3 },
  { id: 'kind', emoji: '🤗', key: 'repKind', need: (s) => s.reactionsGiven >= 8 },
  { id: 'learner', emoji: '📚', key: 'repLearner', need: (s) => s.joined >= 4 },
  { id: 'mentor', emoji: '🌟', key: 'repMentor', need: (s) => s.posts >= 3 },
  { id: 'respectful', emoji: '🕊️', key: 'repRespectful', need: (s) => s.reports === 0 && (s.posts > 0 || s.reactionsGiven > 0) },
]
export function reputation() {
  const c = getCommunity()
  const s = {
    posts: c.posts.length,
    reactionsGiven: Object.values(c.reactions).filter(Boolean).length,
    joined: c.joined.length,
    reports: c.posts.filter((p) => p.removed).length,
  }
  return { ...s, badges: REP_BADGES.map((b) => ({ ...b, earned: b.need(s) })) }
}

// ── AI wellness digest (personalised, on-device) ─────────────────────────────
export function digest(t) {
  const c = getCommunity()
  const out = []
  const notJoined = SAFE_SPACES.filter((s) => !c.joined.includes(s.id))
  if (notJoined.length) out.push({ icon: '🌸', key: 'digSpace', vars: { space: t(notJoined[0].key) } })
  const liveExp = EXPERTS.find((e) => e.live)
  if (liveExp) out.push({ icon: '👩‍⚕️', key: 'digExpert', vars: { name: t(liveExp.nameKey) } })
  out.push({ icon: '🎥', key: 'digEvent', vars: { title: t(EVENTS[0].titleKey) } })
  if (!c.challenges.length) out.push({ icon: '💧', key: 'digChallenge', vars: { challenge: t(CHALLENGES[0].key) } })
  else out.push({ icon: '🌟', key: 'digStory', vars: {} })
  return out.slice(0, 4)
}

// ── AI community recommendations (from the user's own data/interests) ─────────
export function recommendedSpaces() {
  let sym = {}
  try { sym = JSON.parse(localStorage.getItem('mira.symptoms.v1')) || {} } catch { /* ignore */ }
  const on = Object.keys(sym).filter((k) => sym[k])
  const recs = []
  if (on.includes('acne') || on.includes('hirsutism') || on.includes('irregular')) recs.push({ id: 'pcos', reasonKey: 'recPcos' })
  if (totalXP() > 100) recs.push({ id: 'mentalWellness', reasonKey: 'recMental' })
  recs.push({ id: 'nutrition', reasonKey: 'recNutrition' })
  const seen = new Set(); const c = getCommunity()
  return recs.filter((r) => !c.joined.includes(r.id) && (seen.has(r.id) ? false : (seen.add(r.id), true))).slice(0, 3)
}
