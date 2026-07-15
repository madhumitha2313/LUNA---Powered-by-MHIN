/**
 * MIRA Knowledge Base — a small, curated, offline retrieval layer (the app's
 * "RAG" without a server). Each entry is plain-language, non-fear-based
 * women's-health education with a clear source label. `retrieve()` scores the
 * user's message against entry keywords and returns the best match so the chat
 * can surface an accurate, cited "learn more" card — never a diagnosis.
 *
 * Content is intentionally educational and general. It's summarised in simple
 * language and always paired with "talk to a clinician" for anything personal.
 */
export const KB = [
  {
    id: 'cycle', emoji: '🩸', title: 'The menstrual cycle', source: 'WHO educational guidance',
    keywords: ['cycle', 'period', 'periods', 'menstrual', 'menstruation', 'phase', 'phases', 'cramp', 'cramps', 'period pain', 'மாதவிடாய்', 'சுழற்சி'],
    summary: 'Your cycle is the whole month — counted from the first day of one period to the first day of the next. Around 21–35 days is typical, and it moves through four phases: menstrual, follicular, ovulation and luteal, each bringing different energy and moods.',
    why: 'Knowing your phase helps you plan rest, movement and food around how your body naturally feels.',
  },
  {
    id: 'ovulation', emoji: '✨', title: 'Ovulation & fertile window', source: 'ACOG educational resources',
    keywords: ['ovulation', 'ovulate', 'fertile', 'egg', 'conceive', 'trying', 'அண்டவிடுப்பு'],
    summary: 'Ovulation is when an ovary releases an egg, usually about 14 days before your next period (not always “day 14”). The few days leading up to it are your most fertile window.',
    why: 'Tracking it helps with understanding fertility and reading your body’s mid-cycle energy peak.',
  },
  {
    id: 'pcos', emoji: '🧬', title: 'PCOS / PCOD', source: 'ACOG educational resources',
    keywords: ['pcos', 'pcod', 'polycystic', 'irregular', 'acne', 'hair growth', 'insulin', 'hormonal'],
    summary: 'PCOS is a common hormonal condition that can cause irregular periods, acne, extra hair growth or weight changes. It varies a lot between people, and it’s manageable.',
    why: 'Balanced, lower-GI meals, regular gentle movement and good sleep genuinely help. A doctor can confirm it with an ultrasound and blood tests.',
  },
  {
    id: 'endo', emoji: '🧫', title: 'Endometriosis', source: 'NICE guideline (educational)',
    keywords: ['endometriosis', 'endo', 'severe pain', 'painful sex', 'pelvic pain', 'very painful'],
    summary: 'Endometriosis is when tissue similar to the uterus lining grows outside it, which can cause very painful periods and pelvic pain. It’s often under-recognised.',
    why: 'Pain that stops you doing normal things, or that painkillers barely touch, is worth investigating with a gynaecologist — it’s not something you have to accept.',
  },
  {
    id: 'fibroids', emoji: '🌰', title: 'Uterine fibroids', source: 'WHO educational guidance',
    keywords: ['fibroid', 'fibroids', 'heavy bleeding', 'heavy period', 'clots'],
    summary: 'Fibroids are common, usually non-cancerous growths in or on the uterus. They can cause heavy or long periods and pelvic pressure, though many cause no symptoms at all.',
    why: 'Heavy bleeding that soaks through protection quickly, or that leaves you very tired, is worth checking with a doctor.',
  },
  {
    id: 'hormones', emoji: '🌙', title: 'Hormonal changes', source: 'Curated women’s-health education',
    keywords: ['hormone', 'hormones', 'estrogen', 'oestrogen', 'progesterone', 'mood swings', 'pms'],
    summary: 'Estrogen rises in the first half of your cycle and lifts energy and mood; progesterone rises after ovulation and can feel calming or tiring. Mood and appetite shifts across the month are biology, not a flaw.',
    why: 'Working with these rhythms — demanding tasks on high-energy days, rest before your period — helps you feel more in control.',
  },
  {
    id: 'nutrition', emoji: '🥗', title: 'Cycle nutrition', source: 'Verified nutrition information',
    keywords: ['nutrition', 'food', 'eat', 'iron', 'diet', 'anaemia', 'anemia', 'cravings', 'உணவு'],
    summary: 'Iron-rich foods (leafy greens, lentils, dates) help replenish what your period uses; pairing them with vitamin C helps absorption. Steady, whole-food meals ease mood and cravings.',
    why: 'Small, consistent food choices support energy, skin and mood across your cycle more than any single “superfood”.',
  },
  {
    id: 'mental', emoji: '💙', title: 'Mood & mental wellness', source: 'Mental-wellness resources',
    keywords: ['anxiety', 'anxious', 'depressed', 'depression', 'low mood', 'stress', 'stressed', 'pmdd', 'sad'],
    summary: 'Feeling low, irritable or tearful before your period is common and linked to hormone changes. Slow breathing, gentle movement, rest and talking to someone you trust all help.',
    why: 'If low mood is severe, lasts most of the month or affects daily life, that’s worth talking to a doctor or counsellor about — you deserve support.',
  },
  {
    id: 'sleep', emoji: '😴', title: 'Sleep & your cycle', source: 'Curated women’s-health education',
    keywords: ['sleep', 'insomnia', 'tired', 'fatigue', 'cant sleep', 'restless'],
    summary: 'Sleep can shift across your cycle — often lighter in the luteal phase before your period. Consistent bed times, a cool dark room and winding down from screens all help.',
    why: 'Good sleep steadies mood, energy and even period pain, so it’s one of the highest-impact habits to protect.',
  },
  {
    id: 'hydration', emoji: '💧', title: 'Hydration', source: 'Verified nutrition information',
    keywords: ['water', 'hydration', 'dehydrated', 'bloating', 'bloated', 'thirsty', 'headache', 'head ache'],
    summary: 'Staying hydrated eases bloating and headaches and supports energy. Warm drinks like ginger tea can also soothe cramps.',
    why: 'Even mild dehydration can worsen fatigue and headaches, so regular sips through the day genuinely help.',
  },
  {
    id: 'exercise', emoji: '🏃‍♀️', title: 'Movement & exercise', source: 'Exercise guidance',
    keywords: ['exercise', 'workout', 'gym', 'walk', 'walking', 'yoga', 'movement', 'run'],
    summary: 'Gentle movement can ease cramps and lift mood. Higher-energy workouts often feel best around ovulation; gentler yoga or walks suit your period and the days before it.',
    why: 'Listening to your body — moving with your energy rather than against it — makes exercise sustainable and kind.',
  },
  {
    id: 'emergency', emoji: '🚨', title: 'When to seek urgent care', source: 'Emergency guidance',
    keywords: ['emergency', 'severe pain', 'fainting', 'heavy bleeding fast', 'cant breathe', 'chest pain', 'unbearable'],
    summary: 'Some signs need prompt medical care: bleeding that soaks a pad every hour, fainting, severe or sudden pain, a high fever with pelvic pain, or pain during pregnancy.',
    why: 'If something feels seriously wrong, please contact emergency services or go to the nearest hospital — it’s always okay to get checked.',
    urgent: true,
  },
]

const norm = (s) => (s || '').toLowerCase()

/**
 * Retrieve the single most relevant knowledge entry for a message, or null if
 * nothing scores above a small threshold (so we don't surface irrelevant cards).
 */
export function retrieve(text) {
  const q = norm(text)
  if (!q) return null
  let best = null
  let bestScore = 0
  for (const e of KB) {
    let score = 0
    for (const k of e.keywords) {
      if (q.includes(norm(k))) score += k.length >= 4 ? 2 : 1
    }
    if (score > bestScore) { bestScore = score; best = e }
  }
  return bestScore >= 2 ? best : null
}
