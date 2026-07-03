import { createContext, useContext, useState, useCallback } from 'react'

/**
 * Lightweight i18n for MIRA — the 5 launch languages of India + English.
 * Language is chosen in onboarding, persisted, and drives the UI via useT().
 * Missing keys fall back to English, then the key itself.
 */
export const LANGS = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
]

const LANG_KEY = 'mira.lang.v1'
const ONBOARDED_KEY = 'mira.onboarded.v1'

export function getLang() {
  try {
    return localStorage.getItem(LANG_KEY) || 'en'
  } catch {
    return 'en'
  }
}
export function setLangCode(code) {
  try {
    localStorage.setItem(LANG_KEY, code)
  } catch {
    /* ignore */
  }
}
export function isOnboarded() {
  try {
    return localStorage.getItem(ONBOARDED_KEY) === 'true'
  } catch {
    return false
  }
}
export function setOnboarded(v = true) {
  try {
    localStorage.setItem(ONBOARDED_KEY, v ? 'true' : 'false')
  } catch {
    /* ignore */
  }
}

const DICT = {
  en: {
    splashTagline: 'Your health, your voice.',
    langTitle: 'Select your language',
    langSubtitle: "Choose the language you're most comfortable with.",
    nameTitle: 'What should I call you?',
    nameSubtitle: 'This is how Mira will greet you.',
    namePlaceholder: 'Your name',
    birthTitle: 'What year were you born?',
    birthSubtitle: 'Cycles can change over time — this helps us personalise the app.',
    consentTitle: 'You and Mira',
    consentSubtitle:
      'We promise to keep your data safe, secure and private. Please take a moment to know our policies.',
    consentTos: "I agree to Mira's Terms of Service.",
    consentPrivacy: "I have read Mira's Privacy Policy.",
    consentHealth:
      'I agree to Mira processing the health data I choose to share, so it can provide its service.',
    consentError: 'You must agree to our policies so we can provide our service as a health app.',
    signupTitle: 'How would you like to continue?',
    signupSubtitle: 'Create a Mira account so your data is saved and synced.',
    signupGoogle: 'Continue with Google',
    signupEmail: 'Continue with email',
    signupGuest: 'Continue without an account',
    signupHave: 'Already have an account?',
    signin: 'Sign in',
    next: 'Next',
    back: 'Back',
    cont: 'Continue',
    navTalk: 'Talk to Mira',
    navLogin: 'Log in',
    greetMorning: 'Good Morning',
    greetAfternoon: 'Good Afternoon',
    greetEvening: 'Good Evening',
    howFeeling: 'How are you feeling today?',
    tapToTalk: 'Tap to talk to Mira',
  },
  ta: {
    splashTagline: 'உங்கள் ஆரோக்கியம், உங்கள் குரல்.',
    langTitle: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
    langSubtitle: 'உங்களுக்கு வசதியான மொழியைத் தேர்ந்தெடுக்கவும்.',
    nameTitle: 'உங்களை என்ன அழைக்கட்டும்?',
    nameSubtitle: 'இப்படித்தான் மீரா உங்களை வரவேற்கும்.',
    namePlaceholder: 'உங்கள் பெயர்',
    birthTitle: 'நீங்கள் எந்த ஆண்டில் பிறந்தீர்கள்?',
    birthSubtitle: 'காலப்போக்கில் சுழற்சிகள் மாறலாம் — இது ஆப்பை தனிப்பயனாக்க உதவும்.',
    consentTitle: 'நீங்களும் மீராவும்',
    consentSubtitle:
      'உங்கள் தரவை பாதுகாப்பாகவும் தனிப்பட்டதாகவும் வைத்திருப்போம். எங்கள் கொள்கைகளை அறிய சிறிது நேரம் எடுத்துக்கொள்ளுங்கள்.',
    consentTos: 'மீராவின் சேவை விதிமுறைகளுக்கு நான் ஒப்புக்கொள்கிறேன்.',
    consentPrivacy: 'மீராவின் தனியுரிமைக் கொள்கையை நான் படித்துவிட்டேன்.',
    consentHealth: 'நான் பகிரும் ஆரோக்கியத் தரவை மீரா செயலாக்குவதற்கு நான் ஒப்புக்கொள்கிறேன்.',
    consentError: 'ஒரு சுகாதார ஆப்பாக சேவை வழங்க, எங்கள் கொள்கைகளுக்கு நீங்கள் ஒப்புக்கொள்ள வேண்டும்.',
    signupTitle: 'எப்படி தொடர விரும்புகிறீர்கள்?',
    signupSubtitle: 'உங்கள் தரவு சேமிக்கப்பட மீரா கணக்கை உருவாக்குங்கள்.',
    signupGoogle: 'Google உடன் தொடரவும்',
    signupEmail: 'மின்னஞ்சலுடன் தொடரவும்',
    signupGuest: 'கணக்கு இல்லாமல் தொடரவும்',
    signupHave: 'ஏற்கனவே கணக்கு உள்ளதா?',
    signin: 'உள்நுழைக',
    next: 'அடுத்து',
    back: 'பின்',
    cont: 'தொடரவும்',
    navTalk: 'மீராவுடன் பேசு',
    navLogin: 'உள்நுழைக',
    greetMorning: 'காலை வணக்கம்',
    greetAfternoon: 'மதிய வணக்கம்',
    greetEvening: 'மாலை வணக்கம்',
    howFeeling: 'இன்று எப்படி உணர்கிறீர்கள்?',
    tapToTalk: 'மீராவுடன் பேச தட்டவும்',
  },
  hi: {
    splashTagline: 'आपकी सेहत, आपकी आवाज़।',
    langTitle: 'अपनी भाषा चुनें',
    langSubtitle: 'वह भाषा चुनें जिसमें आप सहज हों।',
    nameTitle: 'मैं आपको क्या कहकर बुलाऊँ?',
    nameSubtitle: 'मीरा आपका स्वागत ऐसे ही करेगी।',
    namePlaceholder: 'आपका नाम',
    birthTitle: 'आपका जन्म किस वर्ष हुआ?',
    birthSubtitle: 'समय के साथ चक्र बदल सकते हैं — इससे ऐप को व्यक्तिगत बनाने में मदद मिलती है।',
    consentTitle: 'आप और मीरा',
    consentSubtitle:
      'हम आपके डेटा को सुरक्षित और निजी रखने का वादा करते हैं। कृपया हमारी नीतियों को जानने के लिए कुछ समय लें।',
    consentTos: 'मैं मीरा की सेवा शर्तों से सहमत हूँ।',
    consentPrivacy: 'मैंने मीरा की गोपनीयता नीति पढ़ ली है।',
    consentHealth: 'मैं सहमत हूँ कि मीरा वह स्वास्थ्य डेटा संसाधित करे जिसे मैं साझा करना चुनूँ।',
    consentError: 'एक स्वास्थ्य ऐप के रूप में सेवा देने के लिए आपको हमारी नीतियों से सहमत होना होगा।',
    signupTitle: 'आप कैसे आगे बढ़ना चाहेंगी?',
    signupSubtitle: 'अपना डेटा सहेजने के लिए मीरा खाता बनाएं।',
    signupGoogle: 'Google से जारी रखें',
    signupEmail: 'ईमेल से जारी रखें',
    signupGuest: 'बिना खाते के जारी रखें',
    signupHave: 'पहले से खाता है?',
    signin: 'साइन इन करें',
    next: 'आगे',
    back: 'पीछे',
    cont: 'जारी रखें',
    navTalk: 'मीरा से बात करें',
    navLogin: 'लॉग इन',
    greetMorning: 'सुप्रभात',
    greetAfternoon: 'नमस्ते',
    greetEvening: 'शुभ संध्या',
    howFeeling: 'आज आप कैसा महसूस कर रही हैं?',
    tapToTalk: 'मीरा से बात करने के लिए टैप करें',
  },
  ml: {
    splashTagline: 'നിങ്ങളുടെ ആരോഗ്യം, നിങ്ങളുടെ ശബ്ദം.',
    langTitle: 'നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കുക',
    langSubtitle: 'നിങ്ങൾക്ക് സൗകര്യമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക.',
    nameTitle: 'ഞാൻ നിങ്ങളെ എന്ത് വിളിക്കണം?',
    nameSubtitle: 'മീര നിങ്ങളെ ഇങ്ങനെ വരവേൽക്കും.',
    namePlaceholder: 'നിങ്ങളുടെ പേര്',
    birthTitle: 'നിങ്ങൾ ഏത് വർഷമാണ് ജനിച്ചത്?',
    birthSubtitle: 'കാലക്രമേണ ചക്രങ്ങൾ മാറാം — ഇത് ആപ്പ് വ്യക്തിഗതമാക്കാൻ സഹായിക്കുന്നു.',
    consentTitle: 'നിങ്ങളും മീരയും',
    consentSubtitle:
      'നിങ്ങളുടെ ഡാറ്റ സുരക്ഷിതവും സ്വകാര്യവുമായി സൂക്ഷിക്കുമെന്ന് ഞങ്ങൾ വാഗ്ദാനം ചെയ്യുന്നു. ഞങ്ങളുടെ നയങ്ങൾ അറിയാൻ അൽപസമയം എടുക്കൂ.',
    consentTos: 'മീരയുടെ സേവന നിബന്ധനകൾ ഞാൻ അംഗീകരിക്കുന്നു.',
    consentPrivacy: 'മീരയുടെ സ്വകാര്യതാ നയം ഞാൻ വായിച്ചു.',
    consentHealth: 'ഞാൻ പങ്കിടുന്ന ആരോഗ്യ ഡാറ്റ മീര പ്രോസസ് ചെയ്യുന്നതിന് ഞാൻ സമ്മതിക്കുന്നു.',
    consentError: 'ഒരു ആരോഗ്യ ആപ്പായി സേവനം നൽകാൻ, ഞങ്ങളുടെ നയങ്ങൾ നിങ്ങൾ അംഗീകരിക്കണം.',
    signupTitle: 'എങ്ങനെ തുടരാൻ ആഗ്രഹിക്കുന്നു?',
    signupSubtitle: 'നിങ്ങളുടെ ഡാറ്റ സംരക്ഷിക്കാൻ ഒരു മീര അക്കൗണ്ട് സൃഷ്ടിക്കൂ.',
    signupGoogle: 'Google ഉപയോഗിച്ച് തുടരുക',
    signupEmail: 'ഇമെയിൽ ഉപയോഗിച്ച് തുടരുക',
    signupGuest: 'അക്കൗണ്ട് ഇല്ലാതെ തുടരുക',
    signupHave: 'അക്കൗണ്ട് ഉണ്ടോ?',
    signin: 'സൈൻ ഇൻ',
    next: 'അടുത്തത്',
    back: 'പിന്നോട്ട്',
    cont: 'തുടരുക',
    navTalk: 'മീരയോട് സംസാരിക്കൂ',
    navLogin: 'ലോഗിൻ',
    greetMorning: 'സുപ്രഭാതം',
    greetAfternoon: 'നമസ്കാരം',
    greetEvening: 'ശുഭ സന്ധ്യ',
    howFeeling: 'ഇന്ന് നിങ്ങൾക്ക് എങ്ങനെ തോന്നുന്നു?',
    tapToTalk: 'മീരയോട് സംസാരിക്കാൻ ടാപ്പ് ചെയ്യൂ',
  },
  te: {
    splashTagline: 'మీ ఆరోగ్యం, మీ స్వరం.',
    langTitle: 'మీ భాషను ఎంచుకోండి',
    langSubtitle: 'మీకు సౌకర్యంగా ఉండే భాషను ఎంచుకోండి.',
    nameTitle: 'నేను మిమ్మల్ని ఏమని పిలవాలి?',
    nameSubtitle: 'మీర మిమ్మల్ని ఇలా పలకరిస్తుంది.',
    namePlaceholder: 'మీ పేరు',
    birthTitle: 'మీరు ఏ సంవత్సరంలో పుట్టారు?',
    birthSubtitle: 'కాలక్రమేణా చక్రాలు మారవచ్చు — ఇది యాప్‌ను వ్యక్తిగతం చేయడంలో సహాయపడుతుంది.',
    consentTitle: 'మీరు మరియు మీర',
    consentSubtitle:
      'మీ డేటాను సురక్షితంగా, గోప్యంగా ఉంచుతామని హామీ ఇస్తున్నాము. దయచేసి మా విధానాలను తెలుసుకోవడానికి కొంత సమయం తీసుకోండి.',
    consentTos: 'మీర సేవా నిబంధనలకు నేను అంగీకరిస్తున్నాను.',
    consentPrivacy: 'మీర గోప్యతా విధానాన్ని నేను చదివాను.',
    consentHealth: 'నేను పంచుకునే ఆరోగ్య డేటాను మీర ప్రాసెస్ చేయడానికి నేను అంగీకరిస్తున్నాను.',
    consentError: 'ఆరోగ్య యాప్‌గా సేవ అందించడానికి, మీరు మా విధానాలకు అంగీకరించాలి.',
    signupTitle: 'మీరు ఎలా కొనసాగాలనుకుంటున్నారు?',
    signupSubtitle: 'మీ డేటా సేవ్ అయ్యేలా మీర ఖాతాను సృష్టించండి.',
    signupGoogle: 'Googleతో కొనసాగండి',
    signupEmail: 'ఇమెయిల్‌తో కొనసాగండి',
    signupGuest: 'ఖాతా లేకుండా కొనసాగండి',
    signupHave: 'ఖాతా ఉందా?',
    signin: 'సైన్ ఇన్',
    next: 'తదుపరి',
    back: 'వెనుక',
    cont: 'కొనసాగించు',
    navTalk: 'మీరతో మాట్లాడండి',
    navLogin: 'లాగిన్',
    greetMorning: 'శుభోదయం',
    greetAfternoon: 'నమస్కారం',
    greetEvening: 'శుభ సాయంత్రం',
    howFeeling: 'ఈరోజు మీరు ఎలా అనుభవిస్తున్నారు?',
    tapToTalk: 'మీరతో మాట్లాడటానికి ట్యాప్ చేయండి',
  },
}

const I18nContext = createContext({ lang: 'en', t: (k) => k, setLang: () => {} })

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getLang())
  const change = useCallback((code) => {
    setLangCode(code)
    setLang(code)
  }, [])
  const t = useCallback(
    (key) => DICT[lang]?.[key] ?? DICT.en[key] ?? key,
    [lang]
  )
  return <I18nContext.Provider value={{ lang, t, setLang: change }}>{children}</I18nContext.Provider>
}

export function useT() {
  return useContext(I18nContext)
}
