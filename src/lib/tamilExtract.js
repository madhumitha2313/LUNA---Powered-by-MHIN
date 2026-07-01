/**
 * Lightweight in-browser Tamil (and romanized-Tamil) health-signal extractor
 * for the preview build. It maps spoken keywords → structured fields and
 * composes a spoken Tamil reply.
 *
 * This is the preview stand-in for the server-side Anthropic extractor
 * (src/lib/anthropic.js). It is heuristic, not a diagnosis engine — replies are
 * always framed as "indicator, talk to a doctor", never a diagnosis.
 */

// Each entry: [canonical value, [match substrings — Tamil + romanized, lowercased]]
const FLOW = [
  ['heavy', ['அதிக', 'ஜாஸ்தி', 'நிறைய', 'jaasti', 'athigam', 'adhigam', 'heavy', 'niraya']],
  ['light', ['குறைவ', 'கம்மி', 'லேசான', 'kammi', 'kuraiv', 'light', 'less']],
  ['medium', ['சாதாரண', 'நார்மல்', 'normal', 'medium', 'sadharan']],
]
const MOOD = [
  ['happy', ['சந்தோஷ', 'நல்லா இருக', 'மகிழ்', 'santhosh', 'happy', 'nalla iru', 'good']],
  ['low', ['சோக', 'வருத்த', 'மனசு சரியில', 'sogam', 'sad', 'low', 'down']],
  ['anxious', ['கவலை', 'பயம்', 'டென்ஷன்', 'பதற்ற', 'kavalai', 'tension', 'worried', 'anxious']],
  ['irritated', ['எரிச்சல்', 'கோப', 'எரிச்ச', 'erichal', 'kobam', 'angry', 'irritat']],
]
const FATIGUE = [
  ['severe', ['ரொம்ப சோர்வ', 'மிகவும் களைப்', 'ரொம்ப களைப்', 'romba sorv', 'very tired', 'exhaust']],
  ['moderate', ['சோர்வ', 'களைப்', 'பலகீன', 'sorv', 'kalaip', 'tired', 'weak']],
]
const SLEEP = [
  ['poor', ['தூக்கம் இல்ல', 'தூக்கமில்ல', 'தூங்கல', 'thookam illa', 'no sleep', 'less sleep', 'poor sleep']],
  ['good', ['நல்லா தூங்', 'நன்றாக தூங்', 'nalla thoong', 'slept well', 'good sleep']],
]
const STRESS = [
  ['high', ['மன அழுத்த', 'அழுத்தம்', 'டென்ஷன்', 'stress', 'tension', 'pressure']],
]

function matchCategory(text, table) {
  for (const [value, keys] of table) {
    if (keys.some((k) => text.includes(k))) return value
  }
  return null
}

function extractPain(text) {
  // explicit number 0..10
  const num = text.match(/\b(10|[0-9])\b/)
  if (num) return Math.min(10, parseInt(num[1], 10))
  // severity words
  if (/(ரொம்ப|தாங்க முடிய|மிகவும்|romba|severe|unbearable|too much)/.test(text) && /(வலி|cramp|pain|vali)/.test(text))
    return 8
  if (/(கொஞ்சம்|லேசான|slight|little|konjam|mild)/.test(text) && /(வலி|cramp|pain|vali)/.test(text)) return 3
  if (/(வலி|cramp|pain|vali|வயித்த)/.test(text)) return 5
  return null
}

/** Returns { fields, confidence, followUpQuestion } from a transcript. */
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
  // crude confidence: more matched fields + longer transcript → higher
  const confidence = Math.min(0.95, 0.35 + found * 0.16 + Math.min(0.15, text.length / 400))
  const followUpQuestion =
    confidence < 0.6
      ? 'இன்னும் கொஞ்சம் சொல்ல முடியுமா? உங்கள் ரத்தப்போக்கு எப்படி இருக்கிறது, வலி அளவு எவ்வளவு?'
      : null
  return { fields, confidence, followUpQuestion }
}

const FLOW_TA = { heavy: 'அதிக ரத்தப்போக்கு', light: 'குறைவான ரத்தப்போக்கு', medium: 'சாதாரண ரத்தப்போக்கு' }
const MOOD_TA = { happy: 'மனநிலை நன்றாக உள்ளது', low: 'மனநிலை சற்று சோர்வாக உள்ளது', anxious: 'கவலை உள்ளது', irritated: 'எரிச்சல் உள்ளது' }
const FATIGUE_TA = { severe: 'அதிக சோர்வு', moderate: 'சோர்வு' }
const SLEEP_TA = { poor: 'தூக்கம் குறைவு', good: 'நல்ல தூக்கம்' }

/** Compose a spoken Tamil reply. Always an indicator, never a diagnosis. */
export function buildReply({ fields, confidence, followUpQuestion }) {
  const parts = ['சரி, நான் அதைப் பதிவு செய்துகொண்டேன்.']
  const noted = []
  if (fields.flow) noted.push(FLOW_TA[fields.flow])
  if (fields.pain != null) noted.push(`வலி அளவு ${fields.pain}`)
  if (fields.mood) noted.push(MOOD_TA[fields.mood])
  if (fields.fatigue) noted.push(FATIGUE_TA[fields.fatigue])
  if (fields.sleep) noted.push(SLEEP_TA[fields.sleep])
  if (fields.stress === 'high') noted.push('மன அழுத்தம் உள்ளது')

  if (noted.length) parts.push(noted.join(', ') + ' என்று குறித்துக்கொண்டேன்.')

  if (followUpQuestion) {
    parts.push(followUpQuestion)
  } else if (fields.flow === 'heavy' && fields.pain != null && fields.pain >= 7) {
    parts.push('அதிக ரத்தப்போக்குடன் அதிக வலி தொடர்ந்தால், இது கவனிக்க வேண்டிய ஒரு அறிகுறி. ஒரு மருத்துவரிடம் பேசுவது நல்லது.')
  } else {
    parts.push('இது ஒரு அறிகுறி மட்டும்தான். தேவைப்பட்டால் ஒரு மருத்துவரிடம் பேசுங்கள். நான் இதை உங்கள் timeline-ல் சேர்த்துவிட்டேன்.')
  }
  return parts.join(' ')
}

/** Short English gloss for the on-screen confirmation (accessibility). */
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
