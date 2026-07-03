/**
 * Frontend runtime config, sourced from Vite env vars (VITE_*) with an optional
 * runtime override saved by the user in Settings (localStorage 'mira.appwrite.v1').
 *
 * Only NON-secret, browser-safe values live here: Appwrite endpoint + project id
 * + database/collection ids (public by design), and the URL of our own server
 * functions (which hold the real secrets). Secrets never appear in VITE_* vars.
 */
function runtimeAppwrite() {
  try {
    if (typeof localStorage === 'undefined') return null
    return JSON.parse(localStorage.getItem('mira.appwrite.v1') || 'null')
  } catch {
    return null
  }
}
const rt = runtimeAppwrite() || {}

export const appwriteConfig = {
  endpoint: rt.endpoint || import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
  projectId: rt.projectId || import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
  databaseId: rt.databaseId || import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  collections: {
    logs: import.meta.env.VITE_APPWRITE_COLLECTION_LOGS || 'logs',
    cycleState: import.meta.env.VITE_APPWRITE_COLLECTION_CYCLE_STATE || 'cycle_state',
    riskFlags: import.meta.env.VITE_APPWRITE_COLLECTION_RISK_FLAGS || 'risk_flags',
  },
}

/** Base URL for our server-side functions (Anthropic proxy, STT/TTS proxy, etc.). */
export const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || ''

/** Enough config for AUTH (account create / session): endpoint + project id. */
export const isAppwriteConfigured = Boolean(appwriteConfig.endpoint && appwriteConfig.projectId)

/** Additionally needs a database id to read/write documents (logs, cycle_state…). */
export const isAppwriteDataConfigured = Boolean(
  appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.databaseId
)
