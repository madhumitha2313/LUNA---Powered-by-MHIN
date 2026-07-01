/**
 * In-browser Tamil (and romanized-Tamil) understanding for the preview build.
 *
 * Extracts structured fields, detects what the user is *asking*, and composes a
 * spoken Tamil reply that (a) responds to the actual question, (b) acknowledges
 * what was said, and (c) gives time-appropriate food & activity suggestions.
 *
 * Preview stand-in for the server-side Anthropic reasoning; heuristic, never a
 * diagnosis. Full free-form conversation switches on with the backend + keys.
 */
import { getRecommendations } from './recommendations'

const FLOW = [
  ['heavy', ['அதிக', 'ஜாஸ்தி', 'நிறைய', 'jaasti', 'athigam', 'adhigam', 'heavy', 'niraya']],
  ['light', ['குறைவ', 'கம்மி', 'லேசான', 'kammi', 'kuraiv', 'light', 'less']],
  ['medium', ['சாதாரண', 'நார்மல்', 'normal', 'medium', 'sadharan']],
]
const MOOD = [
  ['happy', ['சந்தோஷ', 'நல்லா இருக', 'மகிழ்', 'santhosh', 'happy', 'nalla iru', 'good']],
  ['low', ['சோக', 'வருத்த', 'மனசு சரியில', 'sogam', 'sad', 'low', 'down']],
  ['anxious', ['கவலை', 'பயம்', 'டென்ஷன்', 'பதற்ற', 'kavalai', 'tension', 'worried', 'anxious']],
  ['irritated', ['எரிச்சல்', 'கோப', 'erichal', 'kobam', 'angry', 'irritat']],
]
const FATIGUE = [
  ['severe', ['ரொம்ப சோர்வ', 'மிகவும் களைப்', 'ரொம்ப களைப்', 'romba sorv', 'very tired', 'exhaust']],
  ['moderate', ['சோர்வ', 'களைப்', 'பலகீன', 'sorv', 'kalaip', 'tired', 'weak']],
]
const SLEEP = [
  ['poor', ['தூக்கம் இல்ல', 'தூக்கமில்ல', 'தூங்கல', 'thookam illa', 'no sleep', 'less sleep', 'poor sleep']],
  ['good', ['நல்லா தூங்', 'நன்றாக தூங்', 'nalla thoong', 'slept well', 'good sleep']],
]
const STRESS = [['high', ['மன அழுத்த', 'அழுத்தம்', 'டென்ஷன்', 'stress', 'tension', 'pressure']]]

function matchCategory(text, table) {
  for (const [value, keys] of table) if (keys.some((k) => text.includes(k))) return value
  return null
}
function extractPain(text) {
  const num = text.match(/\b(10|[0-9])\b/)
  if (num) return Math.min(10, parseInt(num[1], 10))
  if (/(ரொம்ப|தாங்க முடிய|மிகவும்|romba|severe|unbearable|too much)/.test(text) && /(வலி|cramp|pain|vali)/.test(text)) return 8
  if (/(கொஞ்சம்|லேசான|slight|little|konjam|mild)/.test(text) && /(வலி|cramp|pain|vali)/.test(text)) return 3
  if (/(வலி|cramp|pain|vali|வயித்த)/.test(text)) return 5
  return null
}

export function extractFields(transcript) {
  const text = (transcript || '').toLowerCase()
  const fields = {
    flow: matchCategory(text, FLOW),
    pain: extractPain(text),
    mood: matchCategory(text, MOOD),
    fatigue: matchCategory(text, FATIGUE),
    sleep: matchCategory(text, SLEEP),
    stress: matchCategory(text, STRESS),
  }
  const found = Object.values(fields).filter((v) => v !== null && v !== undefined).length
  const confidence = Math.min(0.95, 0.35 + found * 0.16 + Math.min(0.15, text.length / 400))
  const followUpQuestion =
    found === 0 && confidence < 0.6
      ? 'இன்னும் கொஞ்சம் சொல்ல முடியுமா? உங்கள் ரத்தப்போக்கு எப்படி இருக்கிறது, வலி அளவு எவ்வளவு?'
      : null
  return { fields, confidence, followUpQuestion }
}

/** What is the user asking for? */
export function detectIntent(transcript) {
  const t = (transcript || '').toLowerCase()
  if (/(வணக்கம்|hai|hi|hello|ஹலோ)/.test(t)) return 'greeting'
  if (/(சாப்பிட|உணவு|டயட்|eat|food|diet|என்ன சாப்)/.test(t)) return 'food'
  if (/(உடற்பயிற்சி|செய்யலாம்|யோகா|நடக்க|exercise|workout|activity|செய்ய வேண்டும்)/.test(t)) return 'activity'
  if (/(ஏன்|why)/.test(t) && /(சோர்வ|களைப்|tired)/.test(t)) return 'why_tired'
  if (/(ஏன்|why)/.test(t) && /(வலி|pain)/.test(t)) return 'why_pain'
  return 'general'
}

const FLOW_TA = { heavy: 'அதிக ரத்தப்போக்கு', light: 'குறைவான ரத்தப்போக்கு', medium: 'சாதாரண ரத்தப்போக்கு' }
const MOOD_TA = { happy: 'மனநிலை நன்றாக உள்ளது', low: 'மனநிலை சற்று சோர்வாக உள்ளது', anxious: 'கவலை உள்ளது', irritated: 'எரிச்சல் உள்ளது' }
const FATIGUE_TA = { severe: 'அதிக சோர்வு', moderate: 'சோர்வு' }
const SLEEP_TA = { poor: 'தூக்கம் குறைவு', good: 'நல்ல தூக்கம்' }
const OPENERS = ['சரி.', 'புரிந்தது.', 'நன்றி, சொன்னதற்கு.']

/**
 * Compose the full response for a turn.
 * @returns {{ speech: string, recommendations: object, intent: string }}
 */
export function respond({ transcript, result, phase }) {
  const intent = detectIntent(transcript)
  const { fields, confidence, followUpQuestion } = result
  const recs = getRecommendations({ phase, fields })
  const foodStr = recs.foods.map((f) => f.ta).join(', ')
  const actStr = recs.activities.map((a) => a.ta).join(', ')

  if (intent === 'greeting') {
    return {
      intent,
      recommendations: recs,
      speech: 'வணக்கம்! நான் மீரா. இன்று எப்படி உணர்கிறீர்கள்? உங்கள் ரத்தப்போக்கு, வலி அல்லது மனநிலையைப் பற்றி சொல்லுங்கள்.',
    }
  }

  const parts = []
  const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)]

  // Answer the exact question first when they asked one.
  if (intent === 'food') {
    parts.push(`${opener} இந்த நேரத்தில் சாப்பிட நல்லது: ${foodStr}.`)
  } else if (intent === 'activity') {
    parts.push(`${opener} இப்போது செய்யலாம்: ${actStr}.`)
  } else if (intent === 'why_tired') {
    parts.push('மாதவிடாய் காலத்தில் இரும்புச்சத்து குறைவதால் சோர்வு வரலாம்.')
    parts.push(`உதவும் உணவு: ${foodStr}.`)
  } else if (intent === 'why_pain') {
    parts.push('கருப்பை சுருங்குவதால் வலி ஏற்படலாம். சூடு ஒத்தடமும் இஞ்சி டீயும் நிவாரணம் தரலாம்.')
  } else {
    const noted = []
    if (fields.flow) noted.push(FLOW_TA[fields.flow])
    if (fields.pain != null) noted.push(`வலி அளவு ${fields.pain}`)
    if (fields.mood) noted.push(MOOD_TA[fields.mood])
    if (fields.fatigue) noted.push(FATIGUE_TA[fields.fatigue])
    if (fields.sleep) noted.push(SLEEP_TA[fields.sleep])
    if (fields.stress === 'high') noted.push('மன அழுத்தம்')
    if (noted.length) parts.push(`${opener} ${noted.join(', ')} என்று பதிவு செய்தேன்.`)
    else parts.push(opener)

    if (followUpQuestion) {
      parts.push(followUpQuestion)
      return { intent, recommendations: recs, speech: parts.join(' ') }
    }
    parts.push(`இந்த நேரத்தில் நல்லது: ${foodStr}. செய்யலாம்: ${actStr}.`)
  }

  // Risk indicator when a concerning pattern appears — never a diagnosis.
  if (fields.flow === 'heavy' && fields.pain != null && fields.pain >= 7) {
    parts.push('அதிக ரத்தப்போக்குடன் அதிக வலி தொடர்ந்தால், இது கவனிக்க வேண்டிய அறிகுறி — ஒரு மருத்துவரிடம் பேசுவது நல்லது.')
  } else if (intent !== 'why_pain') {
    parts.push('இது ஒரு அறிகுறி வழிகாட்டுதல் மட்டுமே.')
  }

  return { intent, recommendations: recs, speech: parts.join(' ') }
}

export function glossFields(fields) {
  const map = []
  if (fields.flow) map.push(['flow', fields.flow])
  if (fields.pain != null) map.push(['pain', String(fields.pain)])
  if (fields.mood) map.push(['mood', fields.mood])
  if (fields.fatigue) map.push(['fatigue', fields.fatigue])
  if (fields.sleep) map.push(['sleep', fields.sleep])
  if (fields.stress) map.push(['stress', fields.stress])
  return map
}
