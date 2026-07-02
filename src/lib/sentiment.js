/**
 * Emotional sentiment + crisis detection for the voice/chat.
 *
 * Two priorities, in order:
 *  1) CRISIS — any sign of self-harm or wanting to die. This overrides everything
 *     else: respond with warmth and REAL crisis resources, never a casual "fix".
 *  2) LOW MOOD — sadness/anxiety without crisis: acknowledge and comfort, then
 *     gently continue with supportive suggestions.
 *
 * Detection is keyword/phrase based (Tamil + romanized + English). It is designed
 * to err toward showing support: a false positive just shows a caring message and
 * helplines, which is safe.
 */

// India crisis resources (public helplines).
export const HELPLINES = [
  { name: 'KIRAN (Govt of India, 24/7)', number: '18005990019', display: '1800-599-0019' },
  { name: 'Tele-MANAS', number: '14416', display: '14416' },
  { name: 'iCall (TISS)', number: '9152987821', display: '9152987821' },
  { name: 'Emergency', number: '112', display: '112' },
]

const CRISIS_PATTERNS = [
  // English
  /\b(want|wanna|going)\s+to\s+die\b/, /\bkill (myself|me)\b/, /\bend (my life|it all|everything)\b/,
  /\bno (reason|point) (to|in) (live|living)\b/, /\bdon'?t want to (live|be here)\b/,
  /\b(better off|be better) (dead|without me)\b/, /\bsuicid/, /\bself.?harm\b/, /\bhurt myself\b/,
  /\bcan'?t (go on|take it anymore|do this anymore)\b/,
  // Tamil (script)
  /சாக(ணும்|\s*வேண்டும்|லாம்)/, /செத்து(ட|விட)/, /தற்கொலை/, /உயிரை?\s*விட/, /வாழ\s*மாட்டேன்/, /செத்துவிட/,
  // romanized Tamil
  /\bsaaga(num)?\b/, /\bsethidu/, /\bthatkolai\b/, /\buyira?\s*vida\b/, /\bvaazha maatten\b/,
]

const LOW_PATTERNS = [
  /\b(sad|depress|hopeless|worthless|crying|lonely|alone|empty|miserable|down)\b/,
  /\bfeel(ing)? (low|bad|terrible|awful)\b/,
  /சோக/, /வருத்த/, /அழுக/, /தனிமை/, /மனசு\s*சரியில/, /மனம்\s*சரியில/, /பயம்/, /கவலை/,
  /\bvarutham\b/, /\bazhu/, /\bthanima\b/, /\bkavalai\b/,
]

export function detectSentiment(text) {
  const t = (text || '').toLowerCase()
  if (CRISIS_PATTERNS.some((re) => re.test(t))) return 'crisis'
  if (LOW_PATTERNS.some((re) => re.test(t))) return 'low'
  return 'neutral'
}

/** Warm, spoken crisis message (Tamil) + on-screen support content. */
export function crisisResponse() {
  return {
    speech:
      'நீங்கள் சொன்னது எனக்குக் கவலையளிக்கிறது, ஆனால் நீங்கள் தனியாக இல்லை. உங்கள் உயிர் மிகவும் மதிப்புமிக்கது. தயவுசெய்து இப்போதே நீங்கள் நம்பும் ஒருவரிடம் பேசுங்கள். உடனடி உதவிக்கு KIRAN எண் 1800 599 0019 அல்லது அவசர எண் 112 ஐ அழைக்கவும். நீங்கள் தனியாக இதைச் சந்திக்க வேண்டியதில்லை.',
    title: 'நீங்கள் தனியாக இல்லை · You are not alone',
    message:
      'எனக்கு உங்களைப் பற்றி கவலை. நீங்கள் உணர்வது உண்மையானது, ஆனால் இந்த வலி நிரந்தரமானது அல்ல. தயவுசெய்து இப்போதே ஒருவருடன் பேசுங்கள் — ஒரு நண்பர், குடும்பத்தினர், அல்லது கீழே உள்ள ஒரு உதவி எண். (I care about you. Please reach out to someone right now — a trusted person, or one of the helplines below. Help is available and you deserve it.)',
    helplines: HELPLINES,
  }
}

/** A short comforting opener (Tamil) for low mood, before normal suggestions. */
export function comfortOpener() {
  const lines = [
    'நீங்கள் இப்படி உணர்வது புரிகிறது, அது பரவாயில்லை.',
    'கொஞ்சம் கடினமாக இருக்கிறது போல் தெரிகிறது — நான் உங்களுடன் இருக்கிறேன்.',
    'உங்கள் உணர்வுகள் முக்கியம். மெதுவாக மூச்சு விடுங்கள்.',
  ]
  return lines[Math.floor(Math.random() * lines.length)]
}
