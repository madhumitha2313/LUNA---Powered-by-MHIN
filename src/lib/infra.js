/**
 * MIRA cloud infrastructure & SRE (Part 30) — the production-readiness view.
 *
 * A transparent picture of how MIRA is engineered to run reliably for millions:
 * the architecture, the delivery pipeline, a live-feeling status board, SLOs,
 * disaster recovery and the operational posture. In this offline preview the
 * status figures are deterministic illustrative values (stable per day), and
 * feature flags toggle on-device to demonstrate staged rollout.
 */
const FLAGS_KEY = 'mira.flags.v1'
function readFlags() { try { return JSON.parse(localStorage.getItem(FLAGS_KEY)) || null } catch { return null } }
function writeFlags(v) { try { localStorage.setItem(FLAGS_KEY, JSON.stringify(v)) } catch { /* ignore */ } }

// ── High-level architecture (top → bottom layers) ────────────────────────────
export const ARCH_LAYERS = [
  { key: 'archClients', emoji: '📱', nodesKeys: ['archMobile', 'archWeb'] },
  { key: 'archEdge', emoji: '🌐', nodesKeys: ['archGateway', 'archLB', 'archCDN'] },
  { key: 'archServices', emoji: '⚙️', nodesKeys: ['archAuth', 'archAI', 'archBackend'] },
  { key: 'archData', emoji: '🗄️', nodesKeys: ['archFirestore', 'archStorage'] },
  { key: 'archAiLayer', emoji: '🧠', nodesKeys: ['archModels', 'archOcr', 'archAnalytics'] },
  { key: 'archOps', emoji: '📊', nodesKeys: ['archMonitoring', 'archLogging', 'archBackup'] },
]

// ── Cloud stack (grouped) ─────────────────────────────────────────────────────
export const CLOUD_STACK = [
  { key: 'stackFrontend', emoji: '🎨', items: ['Flutter', 'React', 'Next.js'] },
  { key: 'stackBackend', emoji: '🔧', items: ['Firebase', 'Cloud Functions', 'Cloud Run', 'Node.js', 'Python'] },
  { key: 'stackAi', emoji: '🤖', items: ['GPT', 'Gemini', 'Whisper', 'Embeddings'] },
  { key: 'stackStorage', emoji: '💾', items: ['Firestore', 'Firebase Storage', 'Cloud SQL*'] },
  { key: 'stackMonitoring', emoji: '📡', items: ['Crashlytics', 'Perf Monitoring', 'Cloud Logging'] },
  { key: 'stackAnalytics', emoji: '📈', items: ['Firebase Analytics', 'BigQuery*'] },
]

// ── Deployment environments ───────────────────────────────────────────────────
export const ENVIRONMENTS = ['envDev', 'envQa', 'envStaging', 'envBeta', 'envProd']

// ── AI services (scale independently) ─────────────────────────────────────────
export const AI_SERVICES = [
  { id: 'conversation', emoji: '💬', key: 'svcConversation' }, { id: 'vision', emoji: '👁️', key: 'svcVision' },
  { id: 'ocr', emoji: '📄', key: 'svcOcr' }, { id: 'speech', emoji: '🎙️', key: 'svcSpeech' },
  { id: 'recommend', emoji: '✨', key: 'svcRecommend' }, { id: 'embedding', emoji: '🧬', key: 'svcEmbedding' },
  { id: 'twin', emoji: '🧠', key: 'svcTwin' },
]

// ── Live-feeling status board (deterministic per day) ────────────────────────
function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
const SERVICES = [
  { id: 'gateway', key: 'svcGateway', baseLat: 40 }, { id: 'auth', key: 'svcAuth', baseLat: 60 },
  { id: 'conversation', key: 'svcConversation', baseLat: 1100 }, { id: 'ocr', key: 'svcOcr', baseLat: 3200 },
  { id: 'speech', key: 'svcSpeech', baseLat: 800 }, { id: 'twin', key: 'svcTwin', baseLat: 220 },
  { id: 'firestore', key: 'svcFirestore', baseLat: 55 }, { id: 'storage', key: 'svcStorage', baseLat: 90 },
]
export function systemStatus() {
  const day = new Date().toISOString().slice(0, 10)
  const services = SERVICES.map((s) => {
    const h = hash(s.id + day)
    const upt = 99.9 + ((h % 90) / 1000) // 99.90–99.99
    const jitter = ((h >> 4) % 30) / 100
    const lat = Math.round(s.baseLat * (0.9 + jitter))
    return { ...s, status: 'operational', uptime: upt.toFixed(2), latency: lat }
  })
  return { allOk: true, services, updated: new Date() }
}

// ── SRE / SLOs ────────────────────────────────────────────────────────────────
export const SLOS = [
  { key: 'sloAvailability', target: '99.9%', actual: 99.97, pct: 99.97 },
  { key: 'sloLatency', target: '< 3s p95', actual: 1.2, pct: 92 },
  { key: 'sloErrorBudget', target: '0.1%', actual: 0.03, pct: 70 },
  { key: 'sloRecovery', target: '< 15 min', actual: 6, pct: 88 },
]
export const PERF_TARGETS = [
  { key: 'perfLaunch', target: '< 2s', actual: '1.4s', ok: true }, { key: 'perfDashboard', target: '< 2s', actual: '1.1s', ok: true },
  { key: 'perfAi', target: '< 3s', actual: '1.2s', ok: true }, { key: 'perfUpload', target: '< 5s', actual: '2.8s', ok: true },
  { key: 'perfOcr', target: '< 10s', actual: '3.2s', ok: true },
]

// ── Multi-region ──────────────────────────────────────────────────────────────
export const REGIONS = [
  { id: 'asia-south', emoji: '🇮🇳', key: 'regIndia', status: 'primary' },
  { id: 'asia-se', emoji: '🌏', key: 'regSeAsia', status: 'active' },
  { id: 'europe', emoji: '🇪🇺', key: 'regEurope', status: 'active' },
  { id: 'us', emoji: '🇺🇸', key: 'regUs', status: 'active' },
  { id: 'me', emoji: '🌍', key: 'regMe', status: 'planned' },
]

// ── CI/CD + release ───────────────────────────────────────────────────────────
export const CICD = ['ciPr', 'ciTests', 'ciSecurity', 'ciBuild', 'ciDev', 'ciIntegration', 'ciStaging', 'ciApproval', 'ciProd', 'ciMonitor']
export const RELEASE = ['relInternal', 'relAlpha', 'relClosedBeta', 'relOpenBeta', 'relRegional', 'relGlobal']
export const CANARY = ['Internal', '1%', '5%', '20%', '50%', '100%']

// ── Feature flags (interactive, on-device) ───────────────────────────────────
export const FEATURE_FLAGS = [
  { id: 'digitalTwin', key: 'ffTwin', on: true }, { id: 'marketplace', key: 'ffMarketplace', on: true },
  { id: 'community', key: 'ffCommunity', on: true }, { id: 'research', key: 'ffResearch', on: true },
  { id: 'voice', key: 'ffVoice', on: true }, { id: 'newUI', key: 'ffNewUi', on: false },
  { id: 'edgeAi', key: 'ffEdgeAi', on: false },
]
export function getFlags() {
  const saved = readFlags() || {}
  return FEATURE_FLAGS.map((f) => ({ ...f, on: saved[f.id] != null ? saved[f.id] : f.on }))
}
export function toggleFlag(id) {
  const cur = getFlags().find((f) => f.id === id)
  const saved = readFlags() || {}
  saved[id] = !cur.on
  writeFlags(saved)
  return getFlags()
}

// ── Resilience ────────────────────────────────────────────────────────────────
export const DR_SCENARIOS = [
  { emoji: '🖥️', key: 'drServer', recoveryKey: 'drServerR' }, { emoji: '🗄️', key: 'drDb', recoveryKey: 'drDbR' },
  { emoji: '☁️', key: 'drCloud', recoveryKey: 'drCloudR' }, { emoji: '🌐', key: 'drNetwork', recoveryKey: 'drNetworkR' },
  { emoji: '🤖', key: 'drAi', recoveryKey: 'drAiR' }, { emoji: '💾', key: 'drStorage', recoveryKey: 'drStorageR' },
]
export const CONTINUITY = ['bcAuth', 'bcEmergency', 'bcRecords', 'bcOffline', 'bcQueue']
export const BACKUP = ['bkDaily', 'bkIncremental', 'bkVersion', 'bkCrossRegion', 'bkVerify', 'bkRetention']
export const OFFLINE = ['ofDashboard', 'ofLogging', 'ofReports', 'ofReminders', 'ofJournal', 'ofSync', 'ofConflict']
export const INCIDENT = ['icDetect', 'icAssess', 'icMitigate', 'icRecover', 'icReview', 'icDocument', 'icImprove']

// ── Ops posture ───────────────────────────────────────────────────────────────
export const OBSERVABILITY = ['obLatency', 'obErrors', 'obTraffic', 'obAiPerf', 'obDb', 'obStorage', 'obCrash', 'obMemory', 'obCpu', 'obNetwork']
export const ALERTS = ['alError', 'alDowntime', 'alDeploy', 'alSecurity', 'alPerf', 'alBackup']
export const SECURITY = ['secHttps', 'secRest', 'secTransit', 'secRbac', 'secSecrets', 'secTokens', 'secRate', 'secWaf', 'secReviews']
export const SCALING = ['scCpu', 'scMemory', 'scAi', 'scApi', 'scQueue', 'scUsers']
export const QUEUE = ['qOcr', 'qReport', 'qNotif', 'qEmail', 'qAnalytics', 'qExport', 'qAiSummary']
export const CACHING = ['caStatic', 'caEducational', 'caMetadata', 'caLocalization', 'caDirectory']
export const COST = ['coSpend', 'coTokens', 'coStorage', 'coBandwidth', 'coDbOps', 'coCache', 'coAutoscale']
export const COMPLIANCE = ['cmPrivacy', 'cmHealthcare', 'cmCerts', 'cmAudit', 'cmConsent', 'cmRetention']
export const FUTURE = ['fuEdge', 'fuOnDevice', 'fuSatellite', 'fu5g', 'fuSmart', 'fuHospital', 'fuResearch', 'fuDeveloper', 'fuOrchestration']
