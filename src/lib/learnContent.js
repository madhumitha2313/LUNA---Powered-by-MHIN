/**
 * MIRA Guide — curated, medically-sound micro-lessons for the learning hub.
 * Content is warm, plain-language and non-fear-based. Each topic is a short
 * swipeable "reel" of cards ending in a one-question quiz. (Offline-friendly:
 * no external video needed — the app animates these cards.)
 */

export const TOPICS = [
  {
    id: 'firstperiod',
    emoji: '🌸',
    title: 'First Period Guide',
    level: 'Beginner',
    mins: 3,
    accent: 'text-accent-primary',
    cards: [
      { h: 'What is a period?', b: 'A period is when the lining your body built up inside the uterus leaves through the vagina as blood, over a few days. It’s a normal, healthy sign your body is growing up.' },
      { h: 'Why does it happen?', b: 'Each month your body prepares in case of pregnancy. When that doesn’t happen, the lining is no longer needed and gently sheds — that’s your period.' },
      { h: 'How to feel ready', b: 'Keep a pad or two and a spare underwear in your bag. Periods usually last 3–7 days. Rest, water and warmth help if you feel crampy.' },
    ],
    quiz: { q: 'About how many days does a period usually last?', options: ['A few hours', '3–7 days', '2–3 weeks'], answer: 1 },
  },
  {
    id: 'cycle',
    emoji: '🩸',
    title: 'The Menstrual Cycle',
    level: 'Beginner',
    mins: 4,
    accent: 'text-accent-secondary',
    cards: [
      { h: 'It’s a monthly rhythm', b: 'The cycle is the whole month, not just your period. It’s counted from the first day of one period to the first day of the next — around 28 days on average, but 21–35 is normal.' },
      { h: 'Four phases', b: 'Menstrual (your period), follicular (energy builds), ovulation (an egg is released), and luteal (before your next period). Each brings different energy and moods.' },
      { h: 'Why track it?', b: 'Tracking helps you predict your period, understand your moods and energy, and spot anything unusual to talk to a doctor about.' },
    ],
    quiz: { q: 'The menstrual cycle is counted from…', options: ['The last day of a period', 'The first day of one period to the next', 'Ovulation day'], answer: 1 },
  },
  {
    id: 'hormones',
    emoji: '🌙',
    title: 'Hormonal Changes',
    level: 'Intermediate',
    mins: 3,
    accent: 'text-accent-ai',
    cards: [
      { h: 'Two key hormones', b: 'Estrogen rises in the first half of your cycle and lifts energy and mood. Progesterone rises after ovulation and can make you feel calmer or more tired.' },
      { h: 'Why moods shift', b: 'As these hormones rise and fall, your energy, appetite, sleep and emotions naturally change. It’s biology — not you “being difficult”.' },
      { h: 'Working with them', b: 'Plan demanding things for your higher-energy days, and give yourself rest and comfort in the days before your period.' },
    ],
    quiz: { q: 'Which hormone rises after ovulation?', options: ['Progesterone', 'Insulin', 'Vitamin D'], answer: 0 },
  },
  {
    id: 'products',
    emoji: '🧴',
    title: 'Menstrual Products',
    level: 'Beginner',
    mins: 4,
    accent: 'text-success',
    cards: [
      { h: 'Pads', b: 'Stick to your underwear and absorb flow. Easy to start with. Change every 4–6 hours (sooner if heavy) to stay fresh and safe.' },
      { h: 'Tampons & cups', b: 'Tampons absorb inside; menstrual cups collect flow and are reusable and eco-friendly. Both need clean hands and regular changing/emptying.' },
      { h: 'There’s no “best”', b: 'Period underwear, reusable pads, liners — the right choice is what feels comfortable and practical for you. You can mix and match.' },
    ],
    quiz: { q: 'Roughly how often should a pad be changed?', options: ['Once a day', 'Every 4–6 hours', 'Only when full'], answer: 1 },
  },
  {
    id: 'nutrition',
    emoji: '🥗',
    title: 'Nutrition',
    level: 'Beginner',
    mins: 3,
    accent: 'text-success',
    cards: [
      { h: 'Iron matters', b: 'You lose a little iron during your period. Leafy greens, dates, lentils, beans and (if you eat it) meat help replenish it and fight tiredness.' },
      { h: 'Steady energy', b: 'Whole grains, fruit and protein keep blood sugar steady, which helps mood and cravings. Pair iron foods with vitamin C (like lemon) to absorb more.' },
      { h: 'Hydrate', b: 'Water eases bloating and headaches. Warm drinks like ginger tea can also soothe cramps.' },
    ],
    quiz: { q: 'Which helps your body absorb more iron?', options: ['Vitamin C (e.g. lemon)', 'Coffee', 'Skipping meals'], answer: 0 },
  },
  {
    id: 'selfcare',
    emoji: '🧘',
    title: 'Self Care',
    level: 'Beginner',
    mins: 2,
    accent: 'text-accent-secondary',
    cards: [
      { h: 'Ease the cramps', b: 'A warm compress on your lower belly, gentle stretching and a short walk all help relax the muscles that cause cramps.' },
      { h: 'Rest is productive', b: 'It’s okay to slow down before and during your period. Early nights and gentle days are a form of looking after yourself.' },
      { h: 'Small rituals', b: 'A warm bath, your favourite tea, comfy clothes — tiny comforts genuinely help your body and mood.' },
    ],
    quiz: { q: 'What can help relax cramp muscles?', options: ['A warm compress', 'Holding your breath', 'Ignoring it'], answer: 0 },
  },
  {
    id: 'mental',
    emoji: '💙',
    title: 'Mental Wellness',
    level: 'Intermediate',
    mins: 3,
    accent: 'text-accent-ai',
    cards: [
      { h: 'PMS is real', b: 'Feeling low, irritable or tearful in the days before your period is common — it’s linked to hormone changes, not a flaw in you.' },
      { h: 'Be gentle with yourself', b: 'Name what you feel, rest, move gently, and talk to someone you trust. Slow breathing (in for 4, out for 6) calms the body quickly.' },
      { h: 'When to get support', b: 'If low mood is severe, lasts most of the month, or affects daily life, that’s worth talking to a doctor or counsellor about — you deserve support.' },
    ],
    quiz: { q: 'A quick way to calm your body is…', options: ['Slow breathing (in 4, out 6)', 'Holding your breath', 'More caffeine'], answer: 0 },
  },
  {
    id: 'pcos',
    emoji: '🧬',
    title: 'PCOS Awareness',
    level: 'Intermediate',
    mins: 4,
    accent: 'text-accent-primary',
    cards: [
      { h: 'What is PCOS?', b: 'Polycystic ovary syndrome is a common hormonal condition. It can cause irregular periods, acne, extra hair growth or weight changes — it varies a lot between people.' },
      { h: 'It’s manageable', b: 'Gentle regular movement, balanced meals and good sleep genuinely help. There are also medical treatments — you’re not meant to figure it out alone.' },
      { h: 'Getting checked', b: 'Diagnosis needs a doctor (often an ultrasound and blood tests). Tracking your cycle here gives them a clear picture to work from.' },
    ],
    quiz: { q: 'PCOS is…', options: ['A common hormonal condition', 'Contagious', 'Always visible'], answer: 0 },
  },
  {
    id: 'endo',
    emoji: '🧫',
    title: 'Endometriosis',
    level: 'Advanced',
    mins: 3,
    accent: 'text-accent-secondary',
    cards: [
      { h: 'What is it?', b: 'Endometriosis is when tissue like the uterus lining grows outside it. It can cause very painful periods and pelvic pain — and it’s often under-recognised.' },
      { h: 'Pain is not “just periods”', b: 'Pain that stops you doing normal things, or that painkillers barely touch, is not something you have to accept. It’s worth investigating.' },
      { h: 'When to see a doctor', b: 'If period pain is severe, worsening, or comes with pain during sex or going to the toilet, please talk to a gynaecologist.' },
    ],
    quiz: { q: 'Severe period pain that disrupts life…', options: ['Should be checked by a doctor', 'Is always normal', 'Means nothing'], answer: 0 },
  },
]

// Myth vs Fact mini-game — swipe/tap whether the statement is a myth or a fact.
export const MYTHS = [
  { s: 'You shouldn’t exercise during your period.', myth: true, why: 'Gentle movement can actually ease cramps and lift your mood. Listen to your body — rest if you need to.' },
  { s: 'You can still get pregnant on your period.', myth: false, why: 'It’s less likely but possible, especially with shorter or irregular cycles. This is a fact.' },
  { s: 'Irregular periods are always dangerous.', myth: true, why: 'Occasional irregularity is common with stress, travel or age. Persistent changes are worth a check-up, though.' },
  { s: 'PMS symptoms are “all in your head”.', myth: true, why: 'PMS is driven by real hormone changes. Your experience is valid.' },
  { s: 'Drinking water can reduce bloating.', myth: false, why: 'Staying hydrated genuinely helps reduce bloating and headaches. Fact!' },
  { s: 'You must avoid cold food during your period.', myth: true, why: 'There’s no medical evidence for this. Eat what feels good and nourishing to you.' },
]

// Daily learning — rotates by day so it varies.
export const DAILY = [
  { tag: 'Fact', text: 'Your cycle length can shift by a few days month to month — that’s completely normal.' },
  { tag: 'Nutrition', text: 'Pairing iron-rich foods with vitamin C (like a squeeze of lemon) helps your body absorb more iron.' },
  { tag: 'Self-care', text: 'A warm compress on your lower belly can relax the muscles that cause cramps.' },
  { tag: 'Fact', text: 'The average period releases only about 30–80 ml of blood across the whole period — less than it feels.' },
  { tag: 'Mind', text: 'Slow breathing — in for four, out for six — calms your nervous system in under a minute.' },
  { tag: 'Fact', text: 'Ovulation usually happens about 14 days before your next period, not on “day 14”.' },
  { tag: 'Self-care', text: 'Feeling extra tired before your period? That’s hormones — an earlier night genuinely helps.' },
]
