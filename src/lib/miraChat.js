/**
 * Mira's local conversational brain — a rule-based, empathy-first engine used by
 * the "Talk with Mira" screen. It runs fully offline (no LLM needed) so the
 * companion works in the single-file preview: it detects health intent across
 * English + code-mixed Indian languages, replies warmly, asks a clarifying
 * question before advising, and returns food/wellness recommendations. Crisis
 * detection is handled separately (src/lib/sentiment.js).
 *
 * Every user-facing string is an i18n KEY resolved by the component with t(),
 * so Mira speaks in the user's chosen language.
 */

// Order matters: the most urgent / specific patterns first.
const RULES = [
  { id: 'heavy', re: /(heavy|lot of|too much|excess).{0,12}(bleed|blood|flow)|clots?|soak|flooding|அதிக\s*ரத்த|நிறைய\s*ரத்த|भारी\s*रक्त|ज्यादा\s*खून|అధిక\s*రక్త/i },
  { id: 'headache', re: /head\s?ache|migraine|my head|head hurts|தலைவலி|तलैवली|सिरदर्द|सिर\s*दर्द|తలనొప్പి|തലവേദന|ತಲೆನೋವು/i },
  { id: 'cramps', re: /cramp|period pain|menstrual pain|stomach\s?ache|belly|tummy|வயிற்று\s*வலி|மாதவிடாய்\s*வலி|पेट\s*दर्द|ऐंठन|కడుపు\s*నొప్పి|വയറുവേദന/i },
  { id: 'late', re: /late period|missed period|period.{0,6}(late|delay)|delay(ed)?|irregular|தாமத|மாதவிடாய்\s*வர|देर|अनियमित|ఆలస్య|ക്രമരഹിത/i },
  { id: 'nausea', re: /nausea|vomit|feel sick|throw up|queasy|குமட்டல்|மயக்கம்|मतली|उल्टी|వాంతి|ഛർദ്ദി/i },
  { id: 'acne', re: /acne|pimple|breakout|முகப்பரு|मुँहासे|మొటిమ|മുഖക്കുരു/i },
  { id: 'pcos', re: /pcos|pcod|polycystic|hormonal imbalance/i },
  { id: 'sad', re: /\bsad\b|feel low|feeling down|crying|cry|depress|unhappy|சோகம|மனச்சோர்வு|அழு|उदास|रो\s*रही|दुखी|విచారం|സങ്കടം/i },
  { id: 'stress', re: /stress|anxious|anxiety|worried|worry|panic|overwhelm|tension|பதற்றம|கவலை|மன\s*அழுத்தம|तनाव|चिंता|घबरा|ఒత్తిడి|ആശങ്ക/i },
  { id: 'tired', re: /tired|exhaust|fatigue|no energy|sleepy|can'?t sleep|insomnia|சோர்வு|களைப்பு|थका|थकान|नींद|అలసట|ക്ഷീണം/i },
  { id: 'food', re: /what.{0,8}(eat|food)|recommend.{0,6}food|feeling hungry|என்ன\s*சாப்பிட|क्या\s*खा|तिनडी|తినడానికి|എന്ത്\s*കഴിക്ക/i },
  { id: 'thanks', re: /thank|thanks|nandri|நன்றி|धन्यवाद|shukriya|ధన్యవాద|നന്ദി/i },
  { id: 'greeting', re: /^\s*(hi+|hey+|hello|hai|vanakkam|வணக்கம்|नमस्ते|namaste|హాయ్|ഹായ്)\b/i },
]

// Symptoms where Mira asks a clarifying question before advising.
export const SYMPTOMS = ['heavy', 'headache', 'cramps', 'late', 'nausea', 'acne', 'pcos', 'tired']

export function detectIntent(text) {
  for (const r of RULES) if (r.re.test(text)) return r.id
  return 'general'
}

// Per-intent i18n keys: ask (clarifying), advice (guidance), and recommendations.
export const INTENT = {
  heavy: { ask: 'askHeavy', advice: 'adviceHeavy', foods: ['recWater', 'recLeafyGreens', 'recDates'], wellness: ['recDoctor', 'recRestNap'], urgent: true },
  headache: { ask: 'askHeadache', advice: 'adviceHeadache', foods: ['recGingerTea', 'recBanana', 'recWater'], wellness: ['recRestNap', 'recShortWalk', 'recBreathing'] },
  cramps: { ask: 'askCramps', advice: 'adviceCramps', foods: ['recWarmSoup', 'recDates', 'recDarkChoc'], wellness: ['recWarmCompress', 'recStretch', 'recBreathing'] },
  late: { ask: 'askLate', advice: 'adviceLate', foods: ['recLeafyGreens'], wellness: ['recBreathing', 'recDoctor'] },
  nausea: { ask: 'askNausea', advice: 'adviceNausea', foods: ['recGingerTea', 'recBanana'], wellness: ['recRestNap'] },
  acne: { ask: 'askAcne', advice: 'adviceAcne', foods: ['recWater', 'recLeafyGreens'], wellness: ['recBreathing'] },
  pcos: { ask: 'askPcos', advice: 'advicePcos', foods: ['recLeafyGreens', 'recWater'], wellness: ['recShortWalk', 'recDoctor'] },
  tired: { ask: 'askTired', advice: 'adviceTired', foods: ['recDates', 'recLeafyGreens', 'recWater'], wellness: ['recShortWalk', 'recRestNap'] },
  sad: { advice: 'replySad', foods: ['recDarkChoc'], wellness: ['recBreathing', 'recMeditate', 'recShortWalk'] },
  stress: { advice: 'replyStress', foods: [], wellness: ['recBreathing', 'recMeditate', 'recShortWalk'] },
  food: { advice: 'replyFood', foods: ['recLeafyGreens', 'recBanana', 'recDates'], wellness: [] },
  thanks: { advice: 'replyThanks' },
  greeting: { advice: 'replyGreeting' },
  general: { advice: 'replyGeneral' },
}

/** Rotating opening greeting keys — the component picks one by day so it varies. */
export const GREET_KEYS = ['chatGreet1', 'chatGreet2', 'chatGreet3', 'chatGreet4']
/** Suggestion chip keys shown under the greeting. */
export const CHIP_KEYS = ['chip1', 'chip2', 'chip3', 'chip4']
