/**
 * MIRA premium & subscriptions (Part 26) — ethical, transparent monetization.
 *
 * Core health features stay free forever; premium adds depth, never gates
 * essentials or emergencies. In this preview no real payment is taken —
 * subscribing simulates the flow so the tiers, management, loyalty and
 * referral systems are demonstrable end-to-end. Loyalty coins and certificates
 * are derived from the user's OWN real activity, so they feel earned.
 */
import { totalXP } from './journeyStory'
import { getProgress } from './learnProgress'
import { wellnessStreak } from './reminders'
import { contribution } from './research'
import { getProfile } from './localStore'

const KEY = 'mira.subscription.v1'
function read() { try { return JSON.parse(localStorage.getItem(KEY)) || null } catch { return null } }
function write(v) { try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ } }
const DEFAULT = () => ({ tier: 'free', cycle: 'yearly', region: 'IN', status: 'free', trialEndsAt: null, since: null, redeemed: [], referrals: 0, unlocked: [] })
export function getSub() { return { ...DEFAULT(), ...(read() || {}) } }
function save(patch) { const next = { ...getSub(), ...patch }; write(next); return next }

// ── Tiers ─────────────────────────────────────────────────────────────────────
export const TIERS = [
  { id: 'free', emoji: '🌱', nameKey: 'tierFree', taglineKey: 'tierFreeTag', priceINR: 0, featureKeys: ['ftChat', 'ftCycle', 'ftMood', 'ftNutriBasic', 'ftJourneyBasic', 'ftConditions', 'ftGuide', 'ftReminders', 'ftEmergency', 'ftFinder', 'ftReportLtd', 'ftDashBasic'] },
  { id: 'plus', emoji: '🌸', nameKey: 'tierPlus', taglineKey: 'tierPlusTag', priceINR: 299, highlight: true,
    featureKeys: ['ftUnlimitedChat', 'ftMemory', 'ftUnlimitedReports', 'ftTwin', 'ftJourneyAdv', 'ftForecasts', 'ftVoice', 'ftThemes', 'ftAnalytics', 'ftPriority', 'ftExport', 'ftTimeline', 'ftCustomNotif', 'ftWidgets'] },
  { id: 'pro', emoji: '✨', nameKey: 'tierPro', taglineKey: 'tierProTag', priceINR: 599,
    featureKeys: ['ftMultiAgent', 'ftDoctor', 'ftPredictive', 'ftFamily', 'ftCloud', 'ftWearables', 'ftCoaching', 'ftExperiments', 'ftResearchInsights', 'ftProReports', 'ftPrioritySupport', 'ftBeta'] },
]
export function tier(id) { return TIERS.find((t) => t.id === id) }

// Full comparison matrix (row → which tiers include it).
export const COMPARE = [
  { key: 'cmpChat', free: 'limited', plus: 'unlimited', pro: 'unlimited' },
  { key: 'cmpMemory', free: false, plus: true, pro: true },
  { key: 'cmpTwin', free: false, plus: true, pro: true },
  { key: 'cmpReports', free: 'limited', plus: 'unlimited', pro: 'unlimited' },
  { key: 'cmpVoice', free: false, plus: true, pro: true },
  { key: 'cmpAnalytics', free: 'basic', plus: 'advanced', pro: 'advanced' },
  { key: 'cmpMultiAgent', free: false, plus: false, pro: true },
  { key: 'cmpDoctor', free: false, plus: false, pro: true },
  { key: 'cmpWearables', free: false, plus: false, pro: true },
  { key: 'cmpFamily', free: false, plus: false, pro: true },
  { key: 'cmpEmergency', free: true, plus: true, pro: true },
  { key: 'cmpSupport', free: 'standard', plus: 'priority', pro: 'priority+' },
]

// ── Billing cycles & regional pricing ─────────────────────────────────────────
// multiplier = months charged; save = % off vs monthly.
export const CYCLES = [
  { id: 'monthly', labelKey: 'cyMonthly', months: 1, save: 0 },
  { id: 'quarterly', labelKey: 'cyQuarterly', months: 3, factor: 2.7, save: 10 },
  { id: 'yearly', labelKey: 'cyYearly', months: 12, factor: 10, save: 17 },
  { id: 'lifetime', labelKey: 'cyLifetime', months: 0, flatINR: { plus: 7999, pro: 14999 }, save: null },
]
export const REGIONS = [
  { id: 'IN', symbol: '₹', rate: 1, perKey: 'perMo' },
  { id: 'US', symbol: '$', rate: 1 / 83, perKey: 'perMo' },
  { id: 'EU', symbol: '€', rate: 1 / 90, perKey: 'perMo' },
  { id: 'UK', symbol: '£', rate: 1 / 105, perKey: 'perMo' },
]
export function region(id = getSub().region) { return REGIONS.find((r) => r.id === id) || REGIONS[0] }
function fmt(inr, rId) {
  const r = region(rId); const v = inr * r.rate
  const rounded = r.id === 'IN' ? Math.round(v) : Math.round(v) - 0.01
  return r.id === 'IN' ? `${r.symbol}${rounded}` : `${r.symbol}${Math.max(0, rounded).toFixed(2)}`
}
/** Price for a tier under a cycle, in the chosen region, plus the /month equivalent. */
export function priceOf(tierId, cycleId = getSub().cycle, rId = getSub().region) {
  const tr = tier(tierId); if (!tr || tr.priceINR === 0) return { total: fmt(0, rId), perMonth: fmt(0, rId), raw: 0, save: 0 }
  const cy = CYCLES.find((c) => c.id === cycleId) || CYCLES[0]
  if (cy.id === 'lifetime') { const flat = cy.flatINR[tierId]; return { total: fmt(flat, rId), perMonth: null, raw: flat, save: null, lifetime: true } }
  const factor = cy.factor || cy.months
  const totalINR = tr.priceINR * factor
  return { total: fmt(totalINR, rId), perMonth: fmt(totalINR / cy.months, rId), raw: totalINR, save: cy.save }
}
export const FAMILY_INR = 499 // /month, up to 4 profiles
export const STUDENT_DISCOUNT = 50 // %
export function familyPrice(rId) { return fmt(FAMILY_INR, rId) }
export function studentPrice(tierId, rId) { return fmt(tier(tierId).priceINR * (1 - STUDENT_DISCOUNT / 100), rId) }

// ── Subscription management (simulated) ──────────────────────────────────────
export function subscribe(tierId, cycleId) {
  return save({ tier: tierId, cycle: cycleId || getSub().cycle, status: tierId === 'free' ? 'free' : 'active', since: new Date().toISOString(), trialEndsAt: null })
}
export function startTrial(tierId = 'plus') {
  return save({ tier: tierId, status: 'trial', trialEndsAt: new Date(Date.now() + 7 * 86400000).toISOString(), since: new Date().toISOString() })
}
export function cancelPlan() { return save({ tier: 'free', status: 'free', trialEndsAt: null }) }
export function pausePlan() { return save({ status: 'paused' }) }
export function resumePlan() { return save({ status: getSub().tier === 'free' ? 'free' : 'active' }) }
export function setCycle(id) { return save({ cycle: id }) }
export function setRegion(id) { return save({ region: id }) }
export function isPremium() { const s = getSub(); return s.tier !== 'free' && s.status !== 'paused' }
export function trialDaysLeft() { const s = getSub(); if (!s.trialEndsAt) return 0; return Math.max(0, Math.ceil((new Date(s.trialEndsAt) - Date.now()) / 86400000)) }

// ── Loyalty (coins derived from real activity) ───────────────────────────────
export function coinsEarned() {
  const xp = totalXP()
  const learn = getProgress().completed.length * 20
  const streak = wellnessStreak() * 5
  const refBonus = getSub().referrals * 100
  return Math.floor(xp / 5) + learn + streak + refBonus + 50 // +50 welcome
}
export function coinsSpent() { return getSub().redeemed.reduce((s, r) => s + (r.cost || 0), 0) }
export function coinBalance() { return Math.max(0, coinsEarned() - coinsSpent()) }
export const COIN_STORE = [
  { id: 'themeAurora', emoji: '🎨', nameKey: 'csTheme', cost: 300, kind: 'theme' },
  { id: 'voicePack', emoji: '🎙️', nameKey: 'csVoice', cost: 400, kind: 'voice' },
  { id: 'avatarSkin', emoji: '👗', nameKey: 'csAvatar', cost: 250, kind: 'avatar' },
  { id: 'trial7', emoji: '🎁', nameKey: 'csTrial', cost: 500, kind: 'trial' },
  { id: 'animation', emoji: '✨', nameKey: 'csAnimation', cost: 200, kind: 'cosmetic' },
]
export function redeem(itemId) {
  const item = COIN_STORE.find((i) => i.id === itemId)
  if (!item || coinBalance() < item.cost || getSub().redeemed.some((r) => r.id === itemId)) return getSub()
  const next = save({ redeemed: [...getSub().redeemed, { id: itemId, cost: item.cost, at: new Date().toISOString() }], unlocked: [...getSub().unlocked, itemId] })
  if (item.kind === 'trial') startTrial('plus')
  return next
}
export function isRedeemed(id) { return getSub().redeemed.some((r) => r.id === id) }

// ── Referrals ─────────────────────────────────────────────────────────────────
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return (h >>> 0).toString(36) }
export function referralCode() { const p = getProfile(); return 'MIRA-' + hash((p.name || 'friend') + (p.birthYear || '')).slice(0, 6).toUpperCase() }
export function addReferral() { return save({ referrals: getSub().referrals + 1 }) }

// ── Digital certificates (from real milestones) ──────────────────────────────
export function certificates() {
  const prog = getProgress(); const xp = totalXP(); const streak = wellnessStreak(); const con = contribution()
  return [
    { id: 'journey', emoji: '🌸', titleKey: 'certJourney', earned: xp >= 200, reqKey: 'certJourneyReq' },
    { id: 'learning', emoji: '📚', titleKey: 'certLearning', earned: prog.completed.length >= 5, reqKey: 'certLearningReq' },
    { id: 'challenge', emoji: '🏆', titleKey: 'certChallenge', earned: streak >= 7, reqKey: 'certChallengeReq' },
    { id: 'research', emoji: '🔬', titleKey: 'certResearch', earned: con.joinedCount >= 1, reqKey: 'certResearchReq' },
    { id: 'annual', emoji: '📅', titleKey: 'certAnnual', earned: true, reqKey: 'certAnnualReq' },
  ]
}

// ── Ethics, partnerships, roadmap (transparency content) ─────────────────────
export const ETHICS = [
  { emoji: '🔒', titleKey: 'ethNoSell', descKey: 'ethNoSellDesc' },
  { emoji: '🚫', titleKey: 'ethNoAds', descKey: 'ethNoAdsDesc' },
  { emoji: '🆘', titleKey: 'ethEmergency', descKey: 'ethEmergencyDesc' },
  { emoji: '💗', titleKey: 'ethNoFear', descKey: 'ethNoFearDesc' },
]
export const NEVER_MONETIZE = ['nmRecords', 'nmReports', 'nmChats', 'nmCycle', 'nmMood', 'nmVoice']
export const PROGRAMS = [
  { emoji: '🏢', titleKey: 'prgCorporate', descKey: 'prgCorporateDesc' },
  { emoji: '🏥', titleKey: 'prgHospital', descKey: 'prgHospitalDesc' },
  { emoji: '🤝', titleKey: 'prgNgo', descKey: 'prgNgoDesc' },
]
export const PAY_METHODS = [['📱', 'UPI'], ['💳', 'Cards'], ['🏦', 'Net Banking'], ['🟢', 'Google Play'], ['🍎', 'App Store'], ['🅿️', 'PayPal']]
export const ROADMAP = ['rmCoachMkt', 'rmDoctorMkt', 'rmNutriMkt', 'rmInsurance', 'rmCorporate', 'rmTelemed', 'rmGlobal', 'rmApis']
