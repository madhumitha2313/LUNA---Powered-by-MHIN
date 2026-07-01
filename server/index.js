/**
 * LUNA server proxy.
 *
 * This is the ONLY place the secrets live. It exposes three endpoints the
 * browser calls (see src/lib/anthropic.js and src/lib/voice.js):
 *
 *   POST /extract  → Anthropic structured extraction of health fields
 *   POST /stt      → Sarvam AI Tamil speech-to-text
 *   POST /tts      → Sarvam AI Tamil text-to-speech
 *   GET  /health   → liveness + which integrations are configured
 *
 * The Anthropic key and Sarvam key never leave this process; they are never
 * sent to the browser and never written to the database.
 *
 * Run: `cd server && npm install && node index.js` (loads ../.env).
 */
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ── load ../.env (no dotenv dependency) ─────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {
  /* rely on real env */
}

const {
  SERVER_PORT = '8787',
  CORS_ORIGINS = 'http://localhost:5173,http://localhost:4173',
  APP_ANTHROPIC_API_KEY,
  APP_ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001',
  SARVAM_API_KEY,
  SARVAM_LANGUAGE_CODE = 'ta-IN',
  SARVAM_STT_MODEL = 'saarika:v2.5',
  SARVAM_TTS_MODEL = 'bulbul:v2',
  SARVAM_TTS_SPEAKER = 'anushka',
} = process.env

const app = express()
app.use(cors({ origin: CORS_ORIGINS.split(',').map((s) => s.trim()) }))
app.use(express.json({ limit: '1mb' }))
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

// ── health ──────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    integrations: {
      anthropic: Boolean(APP_ANTHROPIC_API_KEY),
      sarvam: Boolean(SARVAM_API_KEY),
    },
  })
})

// ── POST /extract — Anthropic structured extraction ──────────────────────────
const EXTRACTION_SYSTEM = `You extract structured menstrual-health signals from a short spoken check-in.
The user speaks in Tamil (or Tamil-English mix); the transcript may be in Tamil script or romanized.

Return ONLY valid JSON, no prose, matching exactly:
{
  "fields": {
    "flow":    "none|light|medium|heavy|null",
    "pain":    0-10 integer or null,
    "mood":    "short phrase or null",
    "fatigue": "none|mild|moderate|severe|null",
    "stress":  "none|mild|moderate|severe|null",
    "sleep":   "poor|fair|good|null"
  },
  "confidence": 0.0-1.0,
  "followUpQuestion": "a single short clarifying question in Tamil if confidence < 0.6, else null"
}

Rules:
- Only fill a field if the transcript actually supports it; otherwise null. Never guess to fill blanks.
- "confidence" reflects how clearly the transcript maps to the fields overall.
- This is signal extraction, NOT diagnosis. Do not add medical advice or conclusions.`

app.post('/extract', async (req, res) => {
  if (!APP_ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Anthropic not configured' })
  const transcript = (req.body?.transcript || '').toString().slice(0, 4000)
  if (!transcript.trim()) return res.status(400).json({ error: 'transcript required' })

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': APP_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: APP_ANTHROPIC_MODEL,
        max_tokens: 400,
        system: EXTRACTION_SYSTEM,
        messages: [{ role: 'user', content: transcript }],
      }),
    })
    if (!r.ok) {
      const body = await r.text()
      return res.status(502).json({ error: `Anthropic ${r.status}`, detail: body.slice(0, 300) })
    }
    const data = await r.json()
    const text = data.content?.[0]?.text || '{}'
    const parsed = safeJson(text)
    if (!parsed) return res.status(502).json({ error: 'Model did not return valid JSON', raw: text.slice(0, 300) })
    return res.json(parsed)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── POST /guide — First Period Readiness Guide (MHIN) ────────────────────────
// This is the exact MHIN educator prompt; the browser template engine
// (src/lib/readinessGuide.js) is the offline fallback with the same contract.
const GUIDE_SYSTEM = `You are a compassionate menstrual health educator for MHIN (Menstrual Health Intelligence Network). Your job is to generate a First Period Readiness Guide that is age-appropriate, culturally sensitive, and localized for Indian users.

You will receive:
- Age of the girl being prepared (10–14)
- Region/language preference
- Relationship of the requester (older sister, teacher, parent, NGO worker)
- One or two community data insights from the local area (may be empty if unavailable)

Generate a guide with EXACTLY these sections:
1. "What Is a Period?" — simple, non-scary explanation suited to the given age
2. "What Will I Feel?" — physical symptoms, emotional changes, what's normal vs needs attention
3. "What's Normal in Your Area" — incorporate the community data insight here naturally (if no data provided, give general reassurance)
4. "Your First Period Kit" — list 5 locally available, affordable items specific to India (mention both disposable and reusable options without bias)
5. "What To Do When It Happens" — step-by-step, calm instructions
6. "Questions You Might Feel Shy to Ask" — answer 3 common but unspoken questions honestly
7. A short note addressed to the requester (sister/teacher/parent version) explaining how to support her

Rules:
- Never use scary or clinical language for the target age
- Never shame or stigmatize any product choice
- Keep the tone warm, like an older sister explaining to a younger one
- If language preference is Tamil, respond entirely in Tamil
- If language preference is Telugu, respond entirely in Telugu
- Otherwise respond in simple English
- Format output as clean structured text suitable for PDF export and WhatsApp sharing
- Do not add any introduction or closing remarks outside the guide itself`

app.post('/guide', async (req, res) => {
  if (!APP_ANTHROPIC_API_KEY) return res.status(503).json({ error: 'Anthropic not configured' })
  const { age, language, relationship, insight } = req.body || {}
  const userMsg = `Generate a First Period Readiness Guide for:
- Age: ${age ?? 12}
- Language: ${language || 'English'}
- Requester relationship: ${relationship || 'older sister'}
- Community insight: ${(insight && insight.trim()) || 'No local data available yet'}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': APP_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: APP_ANTHROPIC_MODEL,
        max_tokens: 2000,
        system: GUIDE_SYSTEM,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })
    if (!r.ok) {
      const body = await r.text()
      return res.status(502).json({ error: `Anthropic ${r.status}`, detail: body.slice(0, 300) })
    }
    const data = await r.json()
    return res.json({ text: data.content?.[0]?.text || '' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── POST /stt — Sarvam Tamil speech-to-text ──────────────────────────────────
app.post('/stt', upload.single('audio'), async (req, res) => {
  if (!SARVAM_API_KEY) return res.status(503).json({ error: 'Sarvam not configured' })
  if (!req.file) return res.status(400).json({ error: 'audio file required (field "audio")' })

  try {
    const form = new FormData()
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype || 'audio/webm' }), 'capture.webm')
    form.append('model', SARVAM_STT_MODEL)
    form.append('language_code', req.body?.language || SARVAM_LANGUAGE_CODE)

    const r = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY },
      body: form,
    })
    if (!r.ok) {
      const body = await r.text()
      return res.status(502).json({ error: `Sarvam STT ${r.status}`, detail: body.slice(0, 300) })
    }
    const data = await r.json()
    // Sarvam STT returns { transcript, language_code, ... }; confidence isn't
    // always provided, so default to a high value when text is present.
    return res.json({
      transcript: data.transcript || '',
      confidence: typeof data.confidence === 'number' ? data.confidence : data.transcript ? 0.9 : 0,
      languageCode: data.language_code || null,
    })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

// ── POST /tts — Sarvam Tamil text-to-speech ──────────────────────────────────
app.post('/tts', async (req, res) => {
  if (!SARVAM_API_KEY) return res.status(503).json({ error: 'Sarvam not configured' })
  const text = (req.body?.text || '').toString().slice(0, 1500)
  if (!text.trim()) return res.status(400).json({ error: 'text required' })

  try {
    const r = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: { 'api-subscription-key': SARVAM_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        // Sarvam accepts `text` (current) — older deployments used `inputs: [text]`.
        text,
        target_language_code: req.body?.language || SARVAM_LANGUAGE_CODE,
        speaker: SARVAM_TTS_SPEAKER,
        model: SARVAM_TTS_MODEL,
      }),
    })
    if (!r.ok) {
      const body = await r.text()
      return res.status(502).json({ error: `Sarvam TTS ${r.status}`, detail: body.slice(0, 300) })
    }
    const data = await r.json()
    const b64 = data.audios?.[0]
    if (!b64) return res.status(502).json({ error: 'Sarvam TTS returned no audio' })
    // Return the WAV bytes so the browser can play it directly.
    const buf = Buffer.from(b64, 'base64')
    res.setHeader('Content-Type', 'audio/wav')
    return res.send(buf)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
})

function safeJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]*\}/) // tolerate stray prose around the JSON
    if (m) {
      try {
        return JSON.parse(m[0])
      } catch {
        return null
      }
    }
    return null
  }
}

app.listen(Number(SERVER_PORT), () => {
  console.log(`LUNA server proxy on :${SERVER_PORT}`)
  console.log(`  anthropic: ${APP_ANTHROPIC_API_KEY ? 'configured' : 'MISSING'}`)
  console.log(`  sarvam:    ${SARVAM_API_KEY ? 'configured' : 'MISSING'}`)
})
