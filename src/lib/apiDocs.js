/**
 * MIRA Developer Platform — the API catalog powering the developer portal
 * (Part 19). Documentation-as-data: endpoints, the standard response envelope,
 * error codes, SDKs, webhook events and the AI-orchestration pipeline. This is
 * a portal/spec surface — it documents the API-first architecture, it doesn't
 * call a live backend.
 */
export const BASE_URL = 'https://api.mira.health'
export const API_VERSION = 'v1'

export const ENDPOINTS = [
  { id: 'login', group: 'Authentication', method: 'POST', path: '/api/v1/auth/login', auth: false, summary: 'Exchange credentials for access + refresh tokens.',
    body: { email: 'ada@example.com', password: '••••••••' },
    data: { userId: 'usr_10482', accessToken: 'eyJhbGci…', refreshToken: 'rt_…', expiresIn: 3600 } },
  { id: 'me', group: 'Authentication', method: 'GET', path: '/api/v1/auth/me', auth: true, summary: 'Get the authenticated user’s profile.',
    data: { userId: 'usr_10482', name: 'Ada', language: 'ta', plan: 'premium' } },
  { id: 'cycleGet', group: 'Cycle', method: 'GET', path: '/api/v1/cycle', auth: true, summary: 'Current cycle stats — phase, day, predictions.',
    data: { cycleDay: 12, phase: 'follicular', nextPeriod: '2026-07-28', ovulation: '2026-07-19', confidence: 0.82 } },
  { id: 'cyclePost', group: 'Cycle', method: 'POST', path: '/api/v1/cycle', auth: true, summary: 'Log a period start date.',
    body: { startDate: '2026-07-14' }, data: { id: 'cyc_88213', startDate: '2026-07-14' } },
  { id: 'moodPost', group: 'Mood', method: 'POST', path: '/api/v1/mood', auth: true, summary: 'Record a mood check-in.',
    body: { moods: ['happy', 'calm'], intensity: 3, note: 'good day' }, data: { id: 'mood_51002', xpAwarded: 10 } },
  { id: 'moodHistory', group: 'Mood', method: 'GET', path: '/api/v1/mood/history', auth: true, summary: 'Mood timeline with trend.',
    data: { count: 42, positivity: 0.71, trend: 'up' } },
  { id: 'chat', group: 'AI Chat', method: 'POST', path: '/api/v1/chat', auth: true, summary: 'Send a message to MIRA (context + RAG applied).',
    body: { message: 'எனக்கு cramps இருக்கு', language: 'ta' },
    data: { reply: '…', intent: 'symptom', knowledge: { topic: 'menstrual_cycle', source: 'WHO educational' }, confidence: 0.9 } },
  { id: 'chatVoice', group: 'AI Chat', method: 'POST', path: '/api/v1/chat/voice', auth: true, summary: 'Transcribe + respond to an audio clip.',
    body: { audio: '<base64>', language: 'ta' }, data: { transcript: '…', reply: '…' } },
  { id: 'reportUpload', group: 'Reports', method: 'POST', path: '/api/v1/reports/upload', auth: true, summary: 'Upload a lab report (multipart).',
    body: { file: '<binary>', type: 'blood' }, data: { id: 'rpt_7781', status: 'queued' } },
  { id: 'reportAnalyze', group: 'Reports', method: 'POST', path: '/api/v1/reports/analyze', auth: true, summary: 'OCR + educational summary (never a diagnosis).',
    body: { reportId: 'rpt_7781' }, data: { values: [{ name: 'Haemoglobin', value: 11.2, unit: 'g/dL', ref: '12–15', flag: 'low' }], summary: '…' } },
  { id: 'recommend', group: 'Recommendation', method: 'GET', path: '/api/v1/recommendations', auth: true, summary: 'Personalized food / wellness / entertainment.',
    data: { food: ['Leafy greens'], wellness: ['4-7-8 breathing'], reason: 'luteal phase + low hydration' } },
  { id: 'emergency', group: 'Emergency', method: 'POST', path: '/api/v1/emergency/share-location', auth: true, summary: 'Create a time-boxed live-location share link.',
    body: { durationMins: 30 }, data: { link: 'https://mira.health/s/AB12', expiresAt: '2026-07-14T18:30:00Z' } },
]

export const ERRORS = [
  ['400', 'Bad Request', 'The request was malformed — check the body.'],
  ['401', 'Unauthorized', 'Missing or invalid token — refresh and retry.'],
  ['403', 'Forbidden', 'Authenticated, but not allowed for this resource.'],
  ['404', 'Not Found', 'No resource at this path or id.'],
  ['409', 'Conflict', 'Duplicate or conflicting state.'],
  ['422', 'Validation Error', 'A field failed validation — see error.fields.'],
  ['429', 'Rate Limit', 'Slow down — retry after the Retry-After header.'],
  ['500', 'Internal Error', 'Something went wrong on our side — retry with backoff.'],
  ['503', 'Service Unavailable', 'Temporary maintenance — retry shortly.'],
]

export const SDKS = [
  { name: 'Node.js', emoji: '🟢', install: 'npm i @mira/sdk' },
  { name: 'Python', emoji: '🐍', install: 'pip install mira-health' },
  { name: 'React', emoji: '⚛️', install: 'npm i @mira/react' },
  { name: 'React Native', emoji: '📱', install: 'npm i @mira/react-native' },
  { name: 'Flutter', emoji: '🎯', install: 'flutter pub add mira_sdk' },
  { name: 'Android', emoji: '🤖', install: 'implementation "health.mira:sdk:1.0.0"' },
  { name: 'iOS', emoji: '🍎', install: 'pod "MiraSDK"' },
]

export const WEBHOOKS = [
  ['user.registered', '🌸'], ['cycle.logged', '🩸'], ['mood.updated', '😊'], ['report.uploaded', '📄'],
  ['appointment.created', '📅'], ['reminder.triggered', '🔔'], ['achievement.earned', '🏆'], ['emergency.activated', '🚨'],
]

export const PIPELINE = [
  ['🔐', 'Authentication'], ['🧩', 'Context builder'], ['🧠', 'Memory retrieval'], ['📚', 'Knowledge retrieval (RAG)'],
  ['🔀', 'Model routing'], ['🛡️', 'Safety layer'], ['💡', 'Recommendation engine'], ['📦', 'Response formatter'],
]

export const MODEL_ROUTING = [
  ['Conversation', 'General LLM'], ['OCR summary', 'Vision model'], ['Speech', 'Speech-to-text'],
  ['Translation', 'Translation model'], ['Embeddings', 'Embedding model'], ['Recommendation', 'Internal engine'],
]

export const CHANGELOG = [
  { v: 'v1.8', when: 'Jul 2026', note: 'Added /recommendations and emergency share-location endpoints.' },
  { v: 'v1.7', when: 'Jun 2026', note: 'Webhook signing secrets + delivery logs.' },
  { v: 'v1.6', when: 'May 2026', note: 'Voice chat endpoint; Tamil/Hindi transcription.' },
]

/** Build the standard success envelope for an endpoint's sample data. */
export function envelope(data) {
  return {
    success: true,
    message: 'Operation completed successfully.',
    data,
    meta: { timestamp: '2026-07-14T12:00:00Z', requestId: 'req_a1b2c3d4', version: API_VERSION },
  }
}

/** Generate a code sample for an endpoint in the given language. */
export function codeSample(ep, lang) {
  const url = `${BASE_URL}${ep.path}`
  const hasBody = ep.body && ['POST', 'PUT', 'PATCH'].includes(ep.method)
  const bodyJson = hasBody ? JSON.stringify(ep.body, null, 2) : null
  const authH = ep.auth ? 'Authorization: Bearer $MIRA_TOKEN' : ''
  if (lang === 'curl') {
    return [
      `curl -X ${ep.method} ${url} \\`,
      ep.auth ? `  -H "${authH}" \\` : null,
      hasBody ? `  -H "Content-Type: application/json" \\` : null,
      hasBody ? `  -d '${JSON.stringify(ep.body)}'` : `  ${''}`.trimEnd(),
    ].filter(Boolean).join('\n')
  }
  if (lang === 'js') {
    return [
      `const res = await fetch("${url}", {`,
      `  method: "${ep.method}",`,
      `  headers: {`,
      ep.auth ? `    Authorization: \`Bearer \${MIRA_TOKEN}\`,` : null,
      hasBody ? `    "Content-Type": "application/json",` : null,
      `  },`,
      hasBody ? `  body: JSON.stringify(${bodyJson.replace(/\n/g, '\n  ')}),` : null,
      `});`,
      `const { data } = await res.json();`,
    ].filter(Boolean).join('\n')
  }
  // python
  return [
    `import requests`,
    `res = requests.${ep.method.toLowerCase()}(`,
    `    "${url}",`,
    ep.auth ? `    headers={"Authorization": f"Bearer {MIRA_TOKEN}"},` : null,
    hasBody ? `    json=${bodyJson.replace(/\n/g, '\n    ').replace(/true/g, 'True').replace(/false/g, 'False')},` : null,
    `)`,
    `data = res.json()["data"]`,
  ].filter(Boolean).join('\n')
}
