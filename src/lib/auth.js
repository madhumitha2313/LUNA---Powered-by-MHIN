/**
 * Minimal auth helpers around the Appwrite Account API.
 *
 * `getCurrentUser` returns the logged-in user or null (never throws), so screens
 * can render an honest signed-out / empty state when there's no session — which
 * is exactly what the static Pages preview shows when no keys are configured.
 *
 * Email verification (below) is real: Appwrite sends the actual email through
 * whatever SMTP provider is configured in that project's console (Appwrite
 * Console → Auth → Templates / Settings → SMTP). Nothing here can deliver mail
 * on its own — this is the client-side half of a real, working flow, not a
 * simulation, but it only fires when isAppwriteConfigured is true.
 */
import { account, isAppwriteConfigured, ID } from './appwrite'

export async function getCurrentUser() {
  if (!isAppwriteConfigured) return null
  try {
    return await account.get()
  } catch {
    return null // no active session
  }
}

export async function logout() {
  if (!isAppwriteConfigured) return
  try {
    await account.deleteSession('current')
  } catch {
    /* already signed out */
  }
}

/** Where Appwrite should send the visitor back to after they click the emailed link. */
function verificationRedirectUrl() {
  if (typeof window === 'undefined') return ''
  return window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + '#/verify-email'
}

/**
 * Register a real Appwrite account and immediately send a real verification
 * email. Best-effort: any failure (network, email already registered on
 * Appwrite's side, SMTP not configured in the console, etc.) is caught and
 * reported rather than thrown, so it never blocks the app's own local
 * account — that stays the source of truth for the app itself.
 *
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function registerAndSendVerification({ name, email, password }) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.create(ID.unique(), email, password, name)
    await account.createEmailPasswordSession(email, password)
    await account.createVerification(verificationRedirectUrl())
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'appwrite-error' }
  }
}

/** Resend the verification email — requires the session created above to still be active. */
export async function resendVerificationEmail() {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.createVerification(verificationRedirectUrl())
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'appwrite-error' }
  }
}

/** Confirm the link the visitor clicked in their inbox (userId + secret from the URL). */
export async function confirmEmailVerification(userId, secret) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.updateVerification(userId, secret)
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'appwrite-error' }
  }
}
