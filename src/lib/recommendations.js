/**
 * Phase- and symptom-aware food & activity recommendations (Tamil + English).
 *
 * A rules-based "what should I eat / do right now" engine for the preview. It
 * takes the current cycle phase and the symptoms just extracted, and returns
 * concrete, time-appropriate suggestions. Educational wellbeing guidance — not
 * medical or nutritional prescription.
 */

const PHASE_FOODS = {
  menstrual: [
    { ta: 'இரும்புச்சத்து கீரை', en: 'Iron-rich spinach / greens' },
    { ta: 'பேரிச்சம்பழம் & வெல்லம்', en: 'Dates & jaggery' },
    { ta: 'வெந்நீர் & சூப்', en: 'Warm water & soups' },
  ],
  follicular: [
    { ta: 'முளைகட்டிய பயறு', en: 'Sprouted legumes' },
    { ta: 'முட்டை & புரதம்', en: 'Eggs & protein' },
    { ta: 'புதிய பழங்கள்', en: 'Fresh citrus fruit' },
  ],
  ovulation: [
    { ta: 'இலை காய்கறிகள்', en: 'Leafy vegetables' },
    { ta: 'நார்ச்சத்து உணவு', en: 'High-fibre foods' },
    { ta: 'நட்ஸ் & விதைகள்', en: 'Nuts & seeds' },
  ],
  luteal: [
    { ta: 'வாழைப்பழம் & பாதாம்', en: 'Banana & almonds (magnesium)' },
    { ta: 'சிக்கலான கார்போ (கம்பு/கேழ்வரகு)', en: 'Complex carbs (millets)' },
    { ta: 'டார்க் சாக்லேட் (சிறிதளவு)', en: 'A little dark chocolate' },
  ],
}

const PHASE_ACTIVITIES = {
  menstrual: [
    { ta: 'மெதுவான யோகா & நீட்சி', en: 'Gentle yoga & stretching' },
    { ta: 'நடைப்பயிற்சி', en: 'Light walking' },
    { ta: 'போதுமான ஓய்வு', en: 'Extra rest' },
  ],
  follicular: [
    { ta: 'கார்டியோ / ஓட்டம்', en: 'Cardio / running' },
    { ta: 'புதிய பயிற்சிகள்', en: 'Try a new workout' },
  ],
  ovulation: [
    { ta: 'அதிக தீவிர பயிற்சி', en: 'Higher-intensity workout' },
    { ta: 'நண்பர்களுடன் நேரம்', en: 'Social / active time' },
  ],
  luteal: [
    { ta: 'பைலேட்ஸ் / மிதமான பயிற்சி', en: 'Pilates / moderate exercise' },
    { ta: 'மூச்சுப்பயிற்சி & தியானம்', en: 'Breathing & meditation' },
  ],
}

// Symptom-specific tips take priority when present.
const SYMPTOM_TIPS = {
  painHigh: {
    foods: [{ ta: 'இஞ்சி டீ', en: 'Ginger tea' }, { ta: 'மஞ்சள் பால்', en: 'Turmeric milk' }],
    activities: [{ ta: 'சூடு ஒத்தடம் (heat pad)', en: 'Warm compress' }, { ta: 'மெல்லிய நீட்சி', en: 'Light stretching' }],
  },
  fatigue: {
    foods: [{ ta: 'இரும்புச்சத்து + வைட்டமின் C', en: 'Iron + vitamin C' }, { ta: 'பேரிச்சை & நட்ஸ்', en: 'Dates & nuts' }],
    activities: [{ ta: 'குறுகிய நடை & ஓய்வு', en: 'Short walk + rest' }],
  },
  stress: {
    foods: [{ ta: 'சாமந்தி/கெமோமில் டீ', en: 'Chamomile tea' }, { ta: 'காஃபின் குறைக்கவும்', en: 'Reduce caffeine' }],
    activities: [{ ta: '4-7-8 மூச்சுப்பயிற்சி', en: '4-7-8 breathing' }, { ta: 'தியானம் 5 நிமிடம்', en: '5-min meditation' }],
  },
  poorSleep: {
    foods: [{ ta: 'வெதுவெதுப்பான பால்', en: 'Warm milk' }],
    activities: [{ ta: 'படுக்கைக்கு முன் திரை வேண்டாம்', en: 'No screens before bed' }, { ta: 'நிலையான தூக்க நேரம்', en: 'Consistent sleep time' }],
  },
  heavyFlow: {
    foods: [{ ta: 'இரும்புச்சத்து அதிகம்', en: 'Extra iron-rich food' }, { ta: 'நீர்ச்சத்து', en: 'Stay hydrated' }],
    activities: [{ ta: 'கடுமையான பயிற்சி தவிர்க்கவும்', en: 'Avoid intense workouts today' }],
  },
}

/**
 * @param {object} opts
 * @param {string|null} opts.phase   cycle phase, if known
 * @param {object} opts.fields       extracted fields
 * @returns {{ foods: Array, activities: Array, phase: string|null }}
 */
export function getRecommendations({ phase, fields = {} }) {
  const foods = []
  const activities = []

  // Symptom-driven tips first (most relevant to how they feel right now).
  if (fields.flow === 'heavy') merge(foods, activities, SYMPTOM_TIPS.heavyFlow)
  if (fields.pain != null && fields.pain >= 6) merge(foods, activities, SYMPTOM_TIPS.painHigh)
  if (fields.fatigue) merge(foods, activities, SYMPTOM_TIPS.fatigue)
  if (fields.stress === 'high' || fields.mood === 'anxious') merge(foods, activities, SYMPTOM_TIPS.stress)
  if (fields.sleep === 'poor') merge(foods, activities, SYMPTOM_TIPS.poorSleep)

  // Fill the rest from the current phase (or a sensible default).
  const p = phase && PHASE_FOODS[phase] ? phase : 'follicular'
  PHASE_FOODS[p].forEach((f) => pushUnique(foods, f))
  PHASE_ACTIVITIES[p].forEach((a) => pushUnique(activities, a))

  return { foods: foods.slice(0, 3), activities: activities.slice(0, 3), phase: phase || null }
}

function merge(foods, activities, tip) {
  tip.foods?.forEach((f) => pushUnique(foods, f))
  tip.activities?.forEach((a) => pushUnique(activities, a))
}
function pushUnique(arr, item) {
  if (!arr.some((x) => x.en === item.en)) arr.push(item)
}
