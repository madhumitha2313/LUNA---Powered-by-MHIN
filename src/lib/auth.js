/**
 * Real Appwrite Account operations — no mock/local fallback logic lives here.
 * Every export either talks to a real Appwrite project or returns
 * { ok:false, error:'not-configured' } — it never fakes success.
 *
 * `getCurrentUser` returns the logged-in user or null (never throws), so screens
 * can render an honest signed-out / empty state when there's no session.
 *
 * Email verification and password recovery are real: Appwrite sends the actual
 * email through whatever SMTP provider is configured in that project's console
 * (Appwrite Console → Auth → Templates / Settings → SMTP). Nothing here can
 * deliver mail on its own — this is the client-side half of a real, working
 * flow, not a simulation — but it only fires when isAppwriteConfigured is true
 * and that project is actually reachable and configured for Email/Password.
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

/** Where Appwrite should send the visitor back to after they click an emailed link. */
function redirectUrl(route) {
  if (typeof window === 'undefined') return ''
  return window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + '#' + route
}

function appwriteError(err) {
  return { ok: false, code: err?.code, type: err?.type, error: err?.message || 'appwrite-error' }
}

/**
 * Register a real Appwrite account, start a real session, and send a real
 * verification email. This IS the account — there is no separate local
 * password store for accounts created this way.
 *
 * @returns {Promise<{ ok: boolean, user?: object, verificationSent?: boolean, code?: number, type?: string, error?: string }>}
 */
export async function registerAccount({ name, email, password }) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.create(ID.unique(), email, password, name)
    await account.createEmailPasswordSession(email, password)
    const user = await account.get()
    let verificationSent = false
    try {
      await account.createVerification(redirectUrl('/verify-email'))
      verificationSent = true
    } catch {
      /* account exists either way — verification email specifically failed to send */
    }
    return { ok: true, user, verificationSent }
  } catch (err) {
    return appwriteError(err)
  }
}

/** Real email/password login — returns the live Appwrite user (with current emailVerification). */
export async function loginAccount(email, password) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.createEmailPasswordSession(email, password)
    const user = await account.get()
    return { ok: true, user }
  } catch (err) {
    return appwriteError(err)
  }
}

/** Resend the verification email — requires the session created above to still be active. */
export async function resendVerificationEmail() {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.createVerification(redirectUrl('/verify-email'))
    return { ok: true }
  } catch (err) {
    return appwriteError(err)
  }
}

/** Confirm the link the visitor clicked in their inbox (userId + secret from the URL). */
export async function confirmEmailVerification(userId, secret) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.updateVerification(userId, secret)
    return { ok: true }
  } catch (err) {
    return appwriteError(err)
  }
}

/** Forgot password — sends a real recovery email with a link back to /reset-password. */
export async function sendPasswordReset(email) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.createRecovery(email, redirectUrl('/reset-password'))
    return { ok: true }
  } catch (err) {
    return appwriteError(err)
  }
}

/** Confirm the emailed reset link and set the new password (userId + secret from the URL). */
export async function confirmPasswordReset(userId, secret, password) {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  try {
    await account.updateRecovery(userId, secret, password)
    return { ok: true }
  } catch (err) {
    return appwriteError(err)
  }
}
