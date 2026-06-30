#!/usr/bin/env node
/**
 * Step 0 — Connection verification.
 *
 * Confirms REAL round-trips to Appwrite and the Anthropic API before any
 * feature work begins. Dependency-free (uses Node's built-in fetch), so it
 * runs with `npm run verify:connections` and no install step.
 *
 * Exit code is non-zero if any *configured* check fails, so it can gate CI.
 * Checks whose env is missing are reported as SKIPPED, not failed, so you can
 * run it incrementally as credentials arrive.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// ── tiny .env loader (no dotenv dependency) ─────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
function loadEnv() {
  try {
    const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
      if (!m) continue
      const key = m[1]
      let val = m[2].replace(/^['"]|['"]$/g, '')
      if (!(key in process.env)) process.env[key] = val
    }
  } catch {
    // no .env file — rely on real process env (CI secrets)
  }
}
loadEnv()

const C = {
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

const results = []
const record = (name, status, detail) => results.push({ name, status, detail })

// ── Check 1: Appwrite round-trip ────────────────────────────────────────────
async function checkAppwrite() {
  const endpoint = process.env.VITE_APPWRITE_ENDPOINT
  const project = process.env.VITE_APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY
  const databaseId = process.env.VITE_APPWRITE_DATABASE_ID

  if (!endpoint || !project || !apiKey || !databaseId) {
    return record('Appwrite', 'SKIP', 'missing endpoint/project/APPWRITE_API_KEY/database id')
  }

  try {
    const res = await fetch(`${endpoint}/databases/${databaseId}/collections`, {
      headers: {
        'X-Appwrite-Project': project,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      const body = await res.text()
      return record('Appwrite', 'FAIL', `HTTP ${res.status} — ${body.slice(0, 160)}`)
    }
    const data = await res.json()
    const ids = (data.collections || []).map((c) => c.$id)
    const expected = ['logs', 'cycle_state', 'risk_flags']
    const present = expected.filter((e) => ids.includes(e))
    const missing = expected.filter((e) => !ids.includes(e))
    const detail =
      `${data.total} collection(s); found [${present.join(', ') || 'none of the expected'}]` +
      (missing.length ? `; ${C.yellow(`missing: ${missing.join(', ')}`)}` : '')
    return record('Appwrite', 'PASS', detail)
  } catch (err) {
    return record('Appwrite', 'FAIL', err.message)
  }
}

// ── Check 2: Anthropic round-trip ───────────────────────────────────────────
async function checkAnthropic() {
  const key = process.env.APP_ANTHROPIC_API_KEY
  const model = process.env.APP_ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001'
  if (!key) return record('Anthropic', 'SKIP', 'missing APP_ANTHROPIC_API_KEY')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Reply with the single word: pong' }],
      }),
    })
    if (!res.ok) {
      const body = await res.text()
      return record('Anthropic', 'FAIL', `HTTP ${res.status} — ${body.slice(0, 160)}`)
    }
    const data = await res.json()
    const text = (data.content?.[0]?.text || '').trim()
    return record('Anthropic', 'PASS', `model ${data.model} replied: "${text}"`)
  } catch (err) {
    return record('Anthropic', 'FAIL', err.message)
  }
}

// ── Check 3: Voice provider (pending decision) ──────────────────────────────
async function checkVoice() {
  const provider = process.env.VOICE_PROVIDER
  if (!provider) {
    return record('Voice STT/TTS', 'SKIP', 'provider not selected yet — pending decision')
  }
  // TODO(provider): add a real round-trip once the Tamil provider is configured.
  return record('Voice STT/TTS', 'SKIP', `provider "${provider}" set; round-trip check not implemented yet`)
}

// ── Run ─────────────────────────────────────────────────────────────────────
console.log(C.bold('\n  LUNA · Step 0 — connection verification\n'))

await Promise.all([checkAppwrite(), checkAnthropic(), checkVoice()])

const order = { Appwrite: 0, Anthropic: 1, 'Voice STT/TTS': 2 }
results.sort((a, b) => order[a.name] - order[b.name])

for (const r of results) {
  const tag =
    r.status === 'PASS' ? C.green(' PASS ') : r.status === 'FAIL' ? C.red(' FAIL ') : C.yellow(' SKIP ')
  console.log(`  [${tag}] ${C.bold(r.name.padEnd(14))} ${C.dim(r.detail)}`)
}

const failed = results.filter((r) => r.status === 'FAIL')
const skipped = results.filter((r) => r.status === 'SKIP')
console.log()
if (failed.length) {
  console.log(C.red(`  ✗ ${failed.length} check(s) failed.`) + C.dim(' Fix the above before building features.'))
  process.exit(1)
}
console.log(
  C.green('  ✓ All configured checks passed.') +
    (skipped.length ? C.dim(` (${skipped.length} skipped — fill in credentials to enable.)`) : '')
)
console.log()
