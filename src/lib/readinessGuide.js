/**
 * First Period Readiness Guide generator (MHIN).
 *
 * Produces an age-appropriate, culturally-sensitive, India-localized guide with
 * EXACTLY seven sections, in English / Tamil / Telugu. Warm "older-sister" tone;
 * never scary, clinical, or shaming of any product choice.
 *
 * This is the browser/template engine for the offline preview. When the
 * Anthropic backend is configured, the same inputs can be sent to it for fully
 * generative output; the section contract stays identical.
 */

const RELATIONSHIP_LABEL = {
  en: { sister: 'Older sister', parent: 'Parent', teacher: 'Teacher', ngo: 'NGO worker' },
  ta: { sister: 'அக்கா', parent: 'பெற்றோர்', teacher: 'ஆசிரியர்', ngo: 'தன்னார்வலர்' },
  te: { sister: 'అక్క', parent: 'తల్లిదండ్రులు', teacher: 'ఉపాధ్యాయురాలు', ngo: 'స్వచ్ఛంద సేవకురాలు' },
}

// ── English ──────────────────────────────────────────────────────────────────
function en({ age, relationship, insight }) {
  const area =
    insight && insight !== 'No local data available yet'
      ? `Here is something true about your area: ${insight}. This means many girls near you are going through the very same thing — you are absolutely not alone.`
      : `We don't have specific numbers for your area yet, but here is what is always true: girls all around you — in your street, your school, your town — get their periods too. It is one of the most normal things in the world. You are not alone.`

  const noteByRel = {
    sister:
      'Be her safe person. React calmly and warmly — no teasing, no big fuss. Keep a spare pad or cloth ready, show her once how to use it, and tell her she can always come to you. Your calm makes her calm.',
    parent:
      'Your reaction becomes her memory of this day. Stay warm and matter-of-fact — this is health, not a secret shame. Keep supplies at home, let her rest if she has cramps, and make sure she never has to hide or feel dirty.',
    teacher:
      'Keep spare pads and a clean space in school. Allow washroom breaks without questions, never call attention to a girl on her period, and treat stains or leaks quietly and kindly. A calm classroom keeps girls in school.',
    ngo:
      'Pair this guide with a real kit and a short, friendly session. Use local language, invite questions anonymously, and include mothers where you can. Normalise, don\'t lecture — dignity and supplies together keep girls confident and in school.',
  }

  return {
    languageLabel: 'English',
    title: 'First Period Readiness Guide',
    metaLabel: `For a girl aged ${age} · prepared by her ${RELATIONSHIP_LABEL.en[relationship].toLowerCase()}`,
    sections: [
      {
        heading: '1. What Is a Period?',
        blocks: [
          { type: 'p', text: `At around your age, your body is quietly growing up — and one of the signs is your first period, called menarche.` },
          { type: 'p', text: `Every month, your body gets ready in case it might one day grow a baby (many years from now). When it isn't needed, the soft lining inside comes out slowly as a little blood through your vagina, over a few days. That is a period. It is healthy, natural, and it happens to almost every girl in the world.` },
        ],
      },
      {
        heading: '2. What Will I Feel?',
        blocks: [
          { type: 'p', text: 'A few days before or during your period you might notice:' },
          { type: 'ul', items: ['A dull ache or cramps in your lower tummy', 'Feeling a bit tired or sleepy', 'Slightly sore or fuller breasts', 'A few pimples, or a heavy/bloated feeling', 'Mood changes — feeling extra happy, teary, or annoyed for no clear reason'] },
          { type: 'p', text: 'All of that is completely normal. It settles in a few days.' },
          {
            type: 'callout',
            label: 'Tell a trusted adult or see a doctor if:',
            items: ['You soak through a pad or cloth every 1–2 hours', 'The pain is so bad you cannot do anything, even after rest', 'Bleeding lasts more than 7–8 days', 'You feel very dizzy, weak, or breathless'],
          },
        ],
      },
      {
        heading: "3. What's Normal in Your Area",
        blocks: [{ type: 'p', text: area }],
      },
      {
        heading: '4. Your First Period Kit',
        blocks: [
          { type: 'p', text: 'Keep a small kit ready. Any of these work — choose what is comfortable and easy for you to get. No choice is better or worse than another:' },
          {
            type: 'kit',
            items: [
              { t: 'Disposable sanitary pads', d: 'Available at any medical shop or kirana store, often in small low-cost packs. Easy for beginners and for school.' },
              { t: 'Reusable cloth pads', d: 'Washable and reusable for many months — gentle on the budget over time. Dry them fully in sunlight.' },
              { t: 'Clean, soft cotton cloth', d: 'The traditional option many mothers used. Wash well with soap, dry in bright sunlight, and keep it dry and clean.' },
              { t: 'Menstrual cup', d: 'A soft cup, reusable for years — very economical and eco-friendly. Takes a little practice; good to learn when you feel ready.' },
              { t: 'A small pouch', d: 'Spare underwear, a paper bag or old newspaper to wrap used products, and a little soap — keep it in your school bag, just in case.' },
            ],
          },
        ],
      },
      {
        heading: '5. What To Do When It Happens',
        blocks: [
          {
            type: 'ol',
            items: [
              'Take a slow breath — nothing is wrong. This is your body working exactly right.',
              'Go to the washroom. Place a pad on your underwear, or use a folded clean cloth or your cup.',
              'If you are caught without supplies, fold some tissue or clean cloth in your underwear for now, and tell someone you trust.',
              'Change your pad or cloth every 4–6 hours, more often if the flow is heavy.',
              'Wash your hands. Wrap used pads/cloth in paper before throwing them in a bin — never flush pads.',
              'Drink water and eat normally. For cramps, press a warm cloth or bottle on your lower tummy.',
              'Mark the date somewhere (or in MIRA) so you slowly learn your own rhythm.',
            ],
          },
        ],
      },
      {
        heading: '6. Questions You Might Feel Shy to Ask',
        blocks: [
          {
            type: 'qa',
            items: [
              { q: 'Can other people tell I have my period?', a: 'No. No one can see it. With a pad, cloth, or cup in place, you look and move completely normally. It is your private information to share only if you want to.' },
              { q: 'Can I bathe, play, run and go to school?', a: 'Yes to all of it — a warm bath actually helps you feel fresh and eases cramps. About temple or kitchen customs, families differ; do what feels right for you and talk to a trusted adult. There is nothing dirty about you or your period.' },
              { q: 'Is the blood dirty, or a sign something is wrong?', a: 'Not at all. It is a healthy sign your body is growing well. Over the whole period it is usually only a few spoonfuls, even though it can look like more. It is clean, normal, and nothing to fear.' },
            ],
          },
        ],
      },
    ],
    note: { heading: `A note for you (${RELATIONSHIP_LABEL.en[relationship]})`, text: noteByRel[relationship] },
  }
}

// ── Tamil ────────────────────────────────────────────────────────────────────
function ta({ age, relationship, insight }) {
  const area =
    insight && insight !== 'No local data available yet'
      ? `உங்கள் பகுதியைப் பற்றிய ஒரு உண்மை: ${insight}. அதாவது உங்களைச் சுற்றியுள்ள பல பெண்களும் இதையே அனுபவிக்கிறார்கள் — நீங்கள் தனியாக இல்லை.`
      : `உங்கள் பகுதிக்கான குறிப்பிட்ட தகவல் இன்னும் இல்லை, ஆனால் இது எப்போதும் உண்மை: உங்கள் தெரு, பள்ளி, ஊர் எங்கும் உள்ள பெண்களுக்கும் மாதவிடாய் வருகிறது. இது உலகின் மிக இயல்பான ஒன்று. நீங்கள் தனியாக இல்லை.`

  const noteByRel = {
    sister:
      'அவளுக்கு நம்பகமான தோழியாக இருங்கள். அமைதியாகவும் அன்பாகவும் நடந்துகொள்ளுங்கள் — கிண்டல் வேண்டாம், பெரிதாக்க வேண்டாம். ஒரு பேட் அல்லது துணியை தயாராக வைத்து, எப்படிப் பயன்படுத்துவது என்று ஒருமுறை காட்டுங்கள். உங்கள் அமைதி அவளுக்கும் அமைதி தரும்.',
    parent:
      'இந்த நாளை அவள் எப்படி நினைவில் வைத்திருப்பாள் என்பது உங்கள் எதிர்வினையைப் பொறுத்தது. அமைதியாக, இயல்பாக இருங்கள் — இது ஆரோக்கியம், மறைக்க வேண்டிய வெட்கம் அல்ல. வீட்டில் தேவையானவற்றை வைத்திருங்கள், வலி இருந்தால் ஓய்வு கொடுங்கள்.',
    teacher:
      'பள்ளியில் கூடுதல் பேட்களும் சுத்தமான இடமும் வைத்திருங்கள். கேள்வி கேட்காமல் கழிப்பறைக்குச் செல்ல அனுமதியுங்கள், மாதவிடாய் உள்ள பெண்ணை கவனத்திற்குக் கொண்டுவராதீர்கள். அமைதியான வகுப்பு பெண்களை பள்ளியில் தக்கவைக்கும்.',
    ngo:
      'இந்த வழிகாட்டியுடன் ஒரு உண்மையான கிட்டையும் சிறிய, நட்பான அமர்வையும் இணையுங்கள். உள்ளூர் மொழியில் பேசுங்கள், பெயர் சொல்லாமல் கேள்விகள் கேட்க அனுமதியுங்கள். போதிக்காதீர்கள் — இயல்பாக்குங்கள்; மரியாதையும் பொருட்களும் சேர்ந்தால் பெண்கள் நம்பிக்கையுடன் பள்ளியில் இருப்பார்கள்.',
  }

  return {
    languageLabel: 'தமிழ்',
    title: 'முதல் மாதவிடாய் தயார்நிலை வழிகாட்டி',
    metaLabel: `${age} வயது பெண்ணுக்காக · ${RELATIONSHIP_LABEL.ta[relationship]} தயாரித்தது`,
    sections: [
      {
        heading: '1. மாதவிடாய் என்றால் என்ன?',
        blocks: [
          { type: 'p', text: `உங்கள் வயதில், உங்கள் உடல் மெதுவாக வளர்ந்து வருகிறது — அதன் ஒரு அறிகுறிதான் முதல் மாதவிடாய்.` },
          { type: 'p', text: `ஒவ்வொரு மாதமும் உங்கள் உடல் தயாராகிறது. அது தேவைப்படாதபோது, உள்ளே உள்ள மென்மையான படலம் சில நாட்கள் சிறிது ரத்தமாக வெளியேறுகிறது. அதுதான் மாதவிடாய். இது ஆரோக்கியமானது, இயல்பானது, உலகின் ஏறக்குறைய எல்லாப் பெண்களுக்கும் நிகழ்வது.` },
        ],
      },
      {
        heading: '2. நான் எப்படி உணருவேன்?',
        blocks: [
          { type: 'p', text: 'மாதவிடாய்க்கு முன் அல்லது அந்த நாட்களில் இவை இருக்கலாம்:' },
          { type: 'ul', items: ['அடிவயிற்றில் லேசான வலி அல்லது இழுப்பு', 'சிறிது சோர்வு அல்லது தூக்கம்', 'மார்பகங்களில் லேசான வலி', 'சில பருக்கள் அல்லது வயிறு உப்பிய உணர்வு', 'மனநிலை மாற்றம் — சந்தோஷம், அழுகை அல்லது எரிச்சல்'] },
          { type: 'p', text: 'இவை அனைத்தும் முற்றிலும் இயல்பானவை. சில நாட்களில் சரியாகிவிடும்.' },
          {
            type: 'callout',
            label: 'இவை இருந்தால் ஒரு பெரியவரிடம் அல்லது மருத்துவரிடம் சொல்லுங்கள்:',
            items: ['ஒவ்வொரு 1–2 மணி நேரத்திற்கும் பேட்/துணி முழுவதும் நனைந்தால்', 'ஓய்வுக்குப் பிறகும் எதுவும் செய்ய முடியாத அளவு கடுமையான வலி', 'ரத்தப்போக்கு 7–8 நாட்களுக்கு மேல் நீடித்தால்', 'மயக்கம், மிகுந்த சோர்வு அல்லது மூச்சுத்திணறல்'],
          },
        ],
      },
      { heading: '3. உங்கள் பகுதியில் என்ன இயல்பானது', blocks: [{ type: 'p', text: area }] },
      {
        heading: '4. உங்கள் முதல் மாதவிடாய் கிட்',
        blocks: [
          { type: 'p', text: 'ஒரு சிறிய கிட்டைத் தயாராக வைத்திருங்கள். இவற்றில் எதுவும் சரியே — உங்களுக்கு வசதியானதை, எளிதில் கிடைப்பதைத் தேர்ந்தெடுங்கள். எந்தத் தேர்வும் மற்றொன்றை விட உயர்ந்ததோ தாழ்ந்ததோ அல்ல:' },
          {
            type: 'kit',
            items: [
              { t: 'யூஸ் அண்ட் த்ரோ சானிட்டரி பேட்', d: 'எந்த மருந்துக் கடையிலும் கிராமக் கடையிலும் சிறிய, குறைந்த விலைப் பொட்டலங்களில் கிடைக்கும். தொடக்கத்திற்கும் பள்ளிக்கும் எளிது.' },
              { t: 'மீண்டும் பயன்படுத்தும் துணி பேட்', d: 'கழுவி பல மாதங்கள் பயன்படுத்தலாம் — நாளடைவில் சிக்கனம். வெயிலில் நன்கு உலர்த்தவும்.' },
              { t: 'சுத்தமான மென்மையான பருத்தித் துணி', d: 'பல அம்மாக்கள் பயன்படுத்திய பாரம்பரிய வழி. சோப்பு போட்டுக் கழுவி, வெயிலில் உலர்த்தி, உலர்ந்து சுத்தமாக வைக்கவும்.' },
              { t: 'மென்ஸ்ட்ருவல் கப்', d: 'பல ஆண்டுகள் பயன்படுத்தும் மென்மையான கப் — மிகச் சிக்கனம், சுற்றுச்சூழலுக்கும் நல்லது. கொஞ்சம் பழக்கம் தேவை.' },
              { t: 'ஒரு சிறிய பை', d: 'கூடுதல் உள்ளாடை, பயன்படுத்தியதைச் சுற்ற காகிதம்/பழைய நாளிதழ், சிறிது சோப்பு — பள்ளிப் பையில் வைத்திருங்கள்.' },
            ],
          },
        ],
      },
      {
        heading: '5. அது நடக்கும்போது என்ன செய்வது',
        blocks: [
          {
            type: 'ol',
            items: [
              'மெதுவாக மூச்சு விடுங்கள் — எந்தத் தவறும் இல்லை. உங்கள் உடல் சரியாகச் செயல்படுகிறது.',
              'கழிப்பறைக்குச் செல்லுங்கள். உள்ளாடையில் பேட் வைக்கவும், அல்லது மடித்த சுத்தமான துணி/கப் பயன்படுத்தவும்.',
              'கையில் ஒன்றும் இல்லாவிட்டால், தற்காலிகமாக டிஷ்யூ/சுத்தமான துணியை மடித்து வைத்து, நம்பகமான ஒருவரிடம் சொல்லுங்கள்.',
              'ஒவ்வொரு 4–6 மணி நேரத்திற்கும் பேட்/துணியை மாற்றவும்; அதிகமாக இருந்தால் அடிக்கடி.',
              'கைகளைக் கழுவவும். பயன்படுத்தியதைக் காகிதத்தில் சுற்றி குப்பையில் போடவும் — பேட்டை கழிவறையில் ஊற்ற வேண்டாம்.',
              'தண்ணீர் குடித்து, சரியாகச் சாப்பிடுங்கள். வலிக்கு வெதுவெதுப்பான துணியை அடிவயிற்றில் வைக்கவும்.',
              'தேதியை எங்காவது (அல்லது MIRA-வில்) குறித்து வையுங்கள்.',
            ],
          },
        ],
      },
      {
        heading: '6. கேட்கத் தயங்கும் கேள்விகள்',
        blocks: [
          {
            type: 'qa',
            items: [
              { q: 'எனக்கு மாதவிடாய் என்று மற்றவர்களுக்குத் தெரிந்துவிடுமா?', a: 'இல்லை. யாருக்கும் தெரியாது. பேட்/துணி/கப் வைத்திருந்தால் நீங்கள் இயல்பாகவே இருப்பீர்கள். இது உங்கள் தனிப்பட்ட விஷயம்.' },
              { q: 'குளிக்கலாமா, விளையாடலாமா, பள்ளிக்குப் போகலாமா?', a: 'எல்லாம் செய்யலாம் — வெதுவெதுப்பான குளியல் புத்துணர்ச்சி தந்து வலியையும் குறைக்கும். கோயில்/சமையல் பழக்கவழக்கங்கள் குடும்பத்திற்குக் குடும்பம் மாறுபடும்; உங்களுக்குச் சரியெனத் தோன்றுவதைச் செய்யுங்கள், ஒரு பெரியவரிடம் பேசுங்கள். மாதவிடாயில் அசுத்தம் எதுவும் இல்லை.' },
              { q: 'ரத்தம் அசுத்தமா, ஏதோ தவறின் அறிகுறியா?', a: 'இல்லவே இல்லை. இது உங்கள் உடல் நன்கு வளர்கிறது என்பதற்கான ஆரோக்கியமான அறிகுறி. மொத்தத்தில் சில ஸ்பூன் அளவே இருந்தாலும் அதிகமாகத் தெரியலாம். இது சுத்தமானது, பயப்பட ஒன்றுமில்லை.' },
            ],
          },
        ],
      },
    ],
    note: { heading: `உங்களுக்கு ஒரு குறிப்பு (${RELATIONSHIP_LABEL.ta[relationship]})`, text: noteByRel[relationship] },
  }
}

// ── Telugu ───────────────────────────────────────────────────────────────────
function te({ age, relationship, insight }) {
  const area =
    insight && insight !== 'No local data available yet'
      ? `మీ ప్రాంతం గురించి ఒక నిజం: ${insight}. అంటే మీ చుట్టూ ఉన్న చాలా అమ్మాయిలు కూడా ఇదే అనుభవిస్తున్నారు — మీరు ఒంటరిగా లేరు.`
      : `మీ ప్రాంతానికి సంబంధించిన నిర్దిష్ట సమాచారం ఇంకా లేదు, కానీ ఇది ఎప్పుడూ నిజం: మీ వీధి, పాఠశాల, ఊరిలోని అమ్మాయిలందరికీ కూడా నెలసరి వస్తుంది. ఇది ప్రపంచంలో అత్యంత సహజమైనది. మీరు ఒంటరిగా లేరు.`

  const noteByRel = {
    sister:
      'ఆమెకు నమ్మకమైన స్నేహితురాలిగా ఉండండి. ప్రశాంతంగా, ప్రేమగా స్పందించండి — ఎగతాళి వద్దు, పెద్దగా చేయవద్దు. ఒక ప్యాడ్ లేదా గుడ్డను సిద్ధంగా ఉంచి, ఎలా వాడాలో ఒకసారి చూపించండి. మీ ప్రశాంతతే ఆమెకు ధైర్యం.',
    parent:
      'ఈ రోజును ఆమె ఎలా గుర్తుంచుకుంటుందో మీ స్పందనపైనే ఆధారపడి ఉంటుంది. ప్రశాంతంగా, సహజంగా ఉండండి — ఇది ఆరోగ్యం, దాచవలసిన సిగ్గు కాదు. ఇంట్లో అవసరమైనవి ఉంచండి, నొప్పి ఉంటే విశ్రాంతి ఇవ్వండి.',
    teacher:
      'పాఠశాలలో అదనపు ప్యాడ్‌లు, శుభ్రమైన స్థలం ఉంచండి. ప్రశ్నలు లేకుండా టాయిలెట్‌కు వెళ్లనివ్వండి, నెలసరిలో ఉన్న అమ్మాయిని అందరి దృష్టికి తీసుకురావద్దు. ప్రశాంతమైన తరగతి అమ్మాయిలను పాఠశాలలో ఉంచుతుంది.',
    ngo:
      'ఈ గైడ్‌తో పాటు ఒక నిజమైన కిట్‌ను, చిన్న స్నేహపూర్వక సెషన్‌ను ఇవ్వండి. స్థానిక భాషలో మాట్లాడండి, పేరు చెప్పకుండా ప్రశ్నలు అడగనివ్వండి. ఉపన్యాసం కాదు — సహజం చేయండి; గౌరవం, వస్తువులు కలిస్తే అమ్మాయిలు ఆత్మవిశ్వాసంతో పాఠశాలలో ఉంటారు.',
  }

  return {
    languageLabel: 'తెలుగు',
    title: 'మొదటి నెలసరి సన్నద్ధత గైడ్',
    metaLabel: `${age} సంవత్సరాల అమ్మాయి కోసం · ${RELATIONSHIP_LABEL.te[relationship]} తయారు చేసినది`,
    sections: [
      {
        heading: '1. నెలసరి అంటే ఏమిటి?',
        blocks: [
          { type: 'p', text: `మీ వయసులో మీ శరీరం నెమ్మదిగా పెద్దదవుతోంది — దానికి ఒక సంకేతమే మొదటి నెలసరి.` },
          { type: 'p', text: `ప్రతి నెలా మీ శరీరం సిద్ధమవుతుంది. అవసరం లేనప్పుడు, లోపల ఉన్న మెత్తని పొర కొన్ని రోజులపాటు కొద్దిగా రక్తంలా బయటకు వస్తుంది. అదే నెలసరి. ఇది ఆరోగ్యకరం, సహజం, ప్రపంచంలోని దాదాపు అందరు అమ్మాయిలకూ జరిగేదే.` },
        ],
      },
      {
        heading: '2. నేను ఎలా అనిపిస్తాను?',
        blocks: [
          { type: 'p', text: 'నెలసరికి ముందు లేదా ఆ రోజుల్లో ఇవి ఉండవచ్చు:' },
          { type: 'ul', items: ['పొత్తికడుపులో తేలికపాటి నొప్పి', 'కొంచెం అలసట లేదా నిద్ర', 'రొమ్ములలో స్వల్ప నొప్పి', 'కొన్ని మొటిమలు లేదా కడుపు ఉబ్బరం', 'మానసిక మార్పులు — సంతోషం, ఏడుపు లేదా చిరాకు'] },
          { type: 'p', text: 'ఇవన్నీ పూర్తిగా సహజం. కొన్ని రోజుల్లో సర్దుకుంటాయి.' },
          {
            type: 'callout',
            label: 'ఇవి ఉంటే పెద్దవారికి లేదా వైద్యురాలికి చెప్పండి:',
            items: ['ప్రతి 1–2 గంటలకు ప్యాడ్/గుడ్డ పూర్తిగా తడిస్తే', 'విశ్రాంతి తర్వాత కూడా ఏమీ చేయలేని తీవ్ర నొప్పి', 'రక్తస్రావం 7–8 రోజులకు మించి కొనసాగితే', 'తల తిరగడం, తీవ్ర అలసట లేదా ఊపిరి ఆడకపోవడం'],
          },
        ],
      },
      { heading: '3. మీ ప్రాంతంలో ఏది సాధారణం', blocks: [{ type: 'p', text: area }] },
      {
        heading: '4. మీ మొదటి నెలసరి కిట్',
        blocks: [
          { type: 'p', text: 'ఒక చిన్న కిట్‌ను సిద్ధంగా ఉంచుకోండి. వీటిలో ఏదైనా మంచిదే — మీకు సౌకర్యంగా, సులభంగా దొరికేది ఎంచుకోండి. ఏ ఎంపికా మరొకదాని కంటే గొప్పదో తక్కువదో కాదు:' },
          {
            type: 'kit',
            items: [
              { t: 'యూజ్ అండ్ త్రో శానిటరీ ప్యాడ్‌లు', d: 'ఏ మెడికల్ షాప్‌లోనైనా, కిరాణా దుకాణంలోనైనా చిన్న, తక్కువ ధర ప్యాక్‌లలో దొరుకుతాయి. మొదట్లో, పాఠశాలకు సులభం.' },
              { t: 'మళ్లీ వాడే గుడ్డ ప్యాడ్‌లు', d: 'ఉతికి చాలా నెలలు వాడవచ్చు — కాలక్రమేణా పొదుపు. ఎండలో బాగా ఆరబెట్టండి.' },
              { t: 'శుభ్రమైన మెత్తని పత్తి గుడ్డ', d: 'చాలా మంది అమ్మలు వాడిన సంప్రదాయ పద్ధతి. సబ్బుతో ఉతికి, ఎండలో ఆరబెట్టి, పొడిగా శుభ్రంగా ఉంచండి.' },
              { t: 'మెన్‌స్ట్రువల్ కప్', d: 'చాలా సంవత్సరాలు వాడే మెత్తని కప్ — చాలా పొదుపు, పర్యావరణానికీ మంచిది. కొంచెం అలవాటు కావాలి.' },
              { t: 'ఒక చిన్న సంచి', d: 'అదనపు లోదుస్తు, వాడినదాన్ని చుట్టడానికి కాగితం/పాత వార్తాపత్రిక, కొంచెం సబ్బు — స్కూల్ బ్యాగ్‌లో ఉంచండి.' },
            ],
          },
        ],
      },
      {
        heading: '5. అది జరిగినప్పుడు ఏం చేయాలి',
        blocks: [
          {
            type: 'ol',
            items: [
              'నెమ్మదిగా ఊపిరి తీసుకోండి — ఏ తప్పూ లేదు. మీ శరీరం సరిగ్గా పని చేస్తోంది.',
              'టాయిలెట్‌కు వెళ్లండి. లోదుస్తుపై ప్యాడ్ పెట్టండి, లేదా మడిచిన శుభ్రమైన గుడ్డ/కప్ వాడండి.',
              'చేతిలో ఏమీ లేకపోతే, తాత్కాలికంగా టిష్యూ/శుభ్రమైన గుడ్డ మడిచి పెట్టి, నమ్మకమైన వారికి చెప్పండి.',
              'ప్రతి 4–6 గంటలకు ప్యాడ్/గుడ్డ మార్చండి; ఎక్కువగా ఉంటే తరచుగా.',
              'చేతులు కడుక్కోండి. వాడినదాన్ని కాగితంలో చుట్టి చెత్తబుట్టలో వేయండి — ప్యాడ్‌ను టాయిలెట్‌లో వేయవద్దు.',
              'నీళ్లు తాగి, మామూలుగా తినండి. నొప్పికి వెచ్చని గుడ్డను పొత్తికడుపుపై పెట్టండి.',
              'తేదీని ఎక్కడైనా (లేదా MIRAలో) గుర్తు పెట్టుకోండి.',
            ],
          },
        ],
      },
      {
        heading: '6. అడగడానికి సిగ్గుపడే ప్రశ్నలు',
        blocks: [
          {
            type: 'qa',
            items: [
              { q: 'నాకు నెలసరి ఉందని ఇతరులకు తెలిసిపోతుందా?', a: 'లేదు. ఎవరికీ కనిపించదు. ప్యాడ్/గుడ్డ/కప్ ఉంటే మీరు మామూలుగానే ఉంటారు. ఇది మీ వ్యక్తిగత విషయం.' },
              { q: 'స్నానం చేయవచ్చా, ఆడవచ్చా, పాఠశాలకు వెళ్లవచ్చా?', a: 'అన్నీ చేయవచ్చు — వెచ్చని స్నానం తాజాదనం ఇచ్చి నొప్పిని తగ్గిస్తుంది. గుడి/వంటగది ఆచారాలు కుటుంబానికి కుటుంబం మారతాయి; మీకు సరైనదని అనిపించింది చేయండి, పెద్దవారితో మాట్లాడండి. నెలసరిలో అపరిశుభ్రత ఏదీ లేదు.' },
              { q: 'రక్తం మురికిదా, ఏదో తప్పు జరిగిందనే సంకేతమా?', a: 'అస్సలు కాదు. ఇది మీ శరీరం బాగా పెరుగుతోందనే ఆరోగ్య సంకేతం. మొత్తంగా కొన్ని స్పూన్‌ల మోతాదే అయినా ఎక్కువగా కనిపించవచ్చు. ఇది శుభ్రం, భయపడాల్సింది ఏమీ లేదు.' },
            ],
          },
        ],
      },
    ],
    note: { heading: `మీ కోసం ఒక మాట (${RELATIONSHIP_LABEL.te[relationship]})`, text: noteByRel[relationship] },
  }
}

const BUILDERS = { English: en, Tamil: ta, Telugu: te }

export function generateGuide({ age = 12, language = 'English', relationship = 'sister', insight = '' } = {}) {
  const build = BUILDERS[language] || en
  return build({ age, relationship, insight: (insight || '').trim() })
}

/** Flatten a guide into plain text for WhatsApp / copy. */
export function guideToText(guide) {
  const lines = [guide.title, guide.metaLabel, '']
  for (const s of guide.sections) {
    lines.push(s.heading)
    for (const b of s.blocks) {
      if (b.type === 'p') lines.push(b.text)
      else if (b.type === 'ul') b.items.forEach((i) => lines.push('• ' + i))
      else if (b.type === 'ol') b.items.forEach((i, n) => lines.push(`${n + 1}. ${i}`))
      else if (b.type === 'kit') b.items.forEach((i) => lines.push(`• ${i.t} — ${i.d}`))
      else if (b.type === 'qa') b.items.forEach((i) => lines.push(`Q: ${i.q}`, `A: ${i.a}`))
      else if (b.type === 'callout') {
        lines.push(b.label)
        b.items.forEach((i) => lines.push('• ' + i))
      }
    }
    lines.push('')
  }
  lines.push(guide.note.heading, guide.note.text, '', '— MIRA · powered by MHIN')
  return lines.join('\n')
}
