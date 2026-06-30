#!/usr/bin/env node
/**
 * Provision the LUNA Appwrite data model: three collections with attributes,
 * indexes, and DOCUMENT-LEVEL permissions so a user can only read/write their
 * own documents.
 *
 * Idempotent: existing collections/attributes/indexes (HTTP 409) are skipped,
 * so it's safe to re-run. Dependency-free (Node fetch). Run:
 *   node scripts/appwrite-bootstrap.mjs
 *
 * Requires in .env: VITE_APPWRITE_ENDPOINT, VITE_APPWRITE_PROJECT_ID,
 * VITE_APPWRITE_DATABASE_ID, APPWRITE_API_KEY (server key).
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const raw = readFileSync(join(__dirname, '..', '.env'), 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i)
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
} catch {}

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT
const PROJECT = process.env.VITE_APPWRITE_PROJECT_ID
const KEY = process.env.APPWRITE_API_KEY
const DB = process.env.VITE_APPWRITE_DATABASE_ID

for (const [k, v] of Object.entries({ VITE_APPWRITE_ENDPOINT: ENDPOINT, VITE_APPWRITE_PROJECT_ID: PROJECT, APPWRITE_API_KEY: KEY, VITE_APPWRITE_DATABASE_ID: DB })) {
  if (!v) {
    console.error(`Missing ${k} in .env — cannot bootstrap.`)
    process.exit(1)
  }
}

const H = { 'X-Appwrite-Project': PROJECT, 'X-Appwrite-Key': KEY, 'Content-Type': 'application/json' }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function api(method, path, body) {
  const res = await fetch(`${ENDPOINT}${path}`, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (res.status === 409) return { skipped: true } // already exists
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`${method} ${path} → ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.status === 204 ? {} : res.json()
}

// ── Schema ──────────────────────────────────────────────────────────────────
// Document-level security: any authenticated user may create; per-document
// permissions (set by the client at create time) govern read/update/delete.
const COLLECTION_PERMS = ['create("users")']

const SCHEMA = {
  logs: [
    ['string', 'userId', { size: 64, required: true }],
    ['datetime', 'date', { required: true }],
    ['string', 'flow', { size: 16, required: false }],
    ['integer', 'pain', { required: false, min: 0, max: 10 }],
    ['string', 'mood', { size: 64, required: false }],
    ['integer', 'durationDays', { required: false, min: 0, max: 30 }],
    ['string', 'rawTranscript', { size: 8000, required: false }],
    ['double', 'confidence', { required: false, min: 0, max: 1 }],
    ['string', 'productType', { size: 32, required: false }],
    ['string', 'schoolTag', { size: 64, required: false }],
  ],
  cycle_state: [
    ['string', 'userId', { size: 64, required: true }],
    ['double', 'avgCycleLength', { required: false }],
    ['datetime', 'lastPeriodStart', { required: false }],
    ['datetime', 'predictedNext', { required: false }],
    ['datetime', 'lastUpdated', { required: false }],
  ],
  risk_flags: [
    ['string', 'userId', { size: 64, required: true }],
    ['string', 'type', { size: 64, required: true }],
    ['string', 'severity', { size: 16, required: true }],
    ['string', 'explanation', { size: 2000, required: true }],
    ['datetime', 'createdAt', { required: true }],
  ],
}

const INDEXES = {
  logs: [
    ['idx_userId', ['userId']],
    ['idx_date', ['date']],
    ['idx_schoolTag', ['schoolTag']],
  ],
  cycle_state: [['idx_userId', ['userId']]],
  risk_flags: [['idx_userId', ['userId']]],
}

async function createAttribute(coll, [type, key, opts]) {
  const base = `/databases/${DB}/collections/${coll}/attributes`
  // Appwrite forbids a default on required attributes; we never send one.
  if (type === 'string') return api('POST', `${base}/string`, { key, size: opts.size, required: opts.required })
  if (type === 'integer') return api('POST', `${base}/integer`, { key, required: opts.required, min: opts.min, max: opts.max })
  if (type === 'double') return api('POST', `${base}/float`, { key, required: opts.required, min: opts.min, max: opts.max })
  if (type === 'datetime') return api('POST', `${base}/datetime`, { key, required: opts.required })
  throw new Error(`unknown attr type ${type}`)
}

async function waitForAttributesAvailable(coll, timeoutMs = 30000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const list = await api('GET', `/databases/${DB}/collections/${coll}/attributes`)
    const attrs = list.attributes || []
    if (attrs.length && attrs.every((a) => a.status === 'available')) return true
    await sleep(1200)
  }
  return false
}

async function run() {
  console.log(`\n  Bootstrapping LUNA data model in database "${DB}"\n`)
  for (const [coll, attrs] of Object.entries(SCHEMA)) {
    const made = await api('POST', `/databases/${DB}/collections`, {
      collectionId: coll,
      name: coll,
      permissions: COLLECTION_PERMS,
      documentSecurity: true,
    })
    console.log(`  collection ${coll.padEnd(12)} ${made.skipped ? 'exists ✓' : 'created ✓'}`)

    for (const attr of attrs) {
      const r = await createAttribute(coll, attr)
      console.log(`    · attr ${attr[1].padEnd(16)} ${r.skipped ? 'exists' : 'created'}`)
    }

    // Indexes need attributes 'available' first.
    const ready = await waitForAttributesAvailable(coll)
    if (!ready) {
      console.log(`    ! attributes still processing — re-run later to add indexes for ${coll}`)
      continue
    }
    for (const [key, on] of INDEXES[coll]) {
      const r = await api('POST', `/databases/${DB}/collections/${coll}/indexes`, {
        key,
        type: 'key',
        attributes: on,
      })
      console.log(`    · index ${key.padEnd(16)} ${r.skipped ? 'exists' : 'created'}`)
    }
  }
  console.log('\n  ✓ Bootstrap complete. Document-level permissions are ON (documentSecurity).')
  console.log('    The client sets per-document read/write to the owning user at create time.\n')
}

run().catch((err) => {
  console.error('\n  ✗ Bootstrap failed:', err.message, '\n')
  process.exit(1)
})
