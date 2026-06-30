/**
 * Frontend runtime config, sourced from Vite env vars (VITE_*).
 *
 * Only NON-secret, browser-safe values live here:
 *   - Appwrite endpoint + project id + database/collection ids (public by design)
 *   - the URL of our own server functions (which hold the real secrets)
 *
 * Secrets (Anthropic key, Appwrite server API key, STT/TTS keys) NEVER appear in
 * VITE_* vars, because anything prefixed VITE_ is bundled into the client.
 */
export const appwriteConfig = {
  endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  collections: {
    logs: import.meta.env.VITE_APPWRITE_COLLECTION_LOGS || 'logs',
    cycleState: import.meta.env.VITE_APPWRITE_COLLECTION_CYCLE_STATE || 'cycle_state',
    riskFlags: import.meta.env.VITE_APPWRITE_COLLECTION_RISK_FLAGS || 'risk_flags',
  },
}

/** Base URL for our server-side functions (Anthropic proxy, STT/TTS proxy, etc.). */
export const functionsBaseUrl = import.meta.env.VITE_FUNCTIONS_BASE_URL || ''

/** True only when the minimum Appwrite config is present. */
export const isAppwriteConfigured = Boolean(
  appwriteConfig.endpoint && appwriteConfig.projectId && appwriteConfig.databaseId
)
