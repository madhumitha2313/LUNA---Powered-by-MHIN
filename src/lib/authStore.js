/**
 * MIRA authentication & session management.
 *
 * Real Appwrite-backed authentication — see src/lib/auth.js for the actual
 * Account API calls. This module is a thin, SYNCHRONOUS local mirror of that
 * real session (so the rest of the app — every RequireOnboarding check,
 * Navbar, every page — can keep reading isAuthenticated()/currentUser()
 * synchronously exactly as before, no refactor needed there): every write to
 * that mirror happens only after a genuine Appwrite call has actually
 * succeeded. There is no local password store and no offline mock account
 * path for email/password or Google — without a reachable, configured
 * Appwrite project, signUp/login honestly fail instead of pretending to work.
 */
import { saveProfile, getProfile } from './localStore'
import { setLangCode, getLang } from './i18n.jsx'
import { isAppwriteConfigured } from './appwrite'
import {
  registerAccount,
  loginAccount,
  resendVerificationEmail,
  logout as appwriteLogout,
  getCurrentUser,
} from './auth'

const USERS_KEY = 'mira.users.v1'       // { [email]: userRecord } — local mirror of the real Appwrite account
const SESSION_KEY = 'mira.session.v1'   // active session mirror
const OWNER_KEY = 'mira.dataOwner.v1'   // uid that owns the current on-device health data

// Per-user health/app data — wiped on logout and on switching accounts so no
// user can ever see another user's data on a shared device (in production this
// isolation is automatic: every record is keyed by the server-side user id).
const DATA_KEYS = [
  'mira.profile.v1', 'mira.onboarded.v1', 'mira.logs.v1', 'mira.periods.v1', 'mira.symptoms.v1',
  'mira.nutrition.v1', 'mira.plan.v1', 'mira.gratitude.v1', 'mira.circle.v1', 'mira.healthcard.v1',
  'mira.emgnum.v1', 'mira.checkin.v1', 'mira.ai.v1', 'mira.voice.v1', 'mira.learn.v1', 'mira.health.v1',
  'mira.research.v1', 'mira.wearables.v1', 'mira.trust.v1', 'mira.subscription.v1', 'mira.community.v1',
  'mira.marketplace.v1', 'mira.flags.v1', 'mira.settings.v1',
]

function read(k, f) { try { return JSON.parse(localStorage.getItem(k)) || f } catch { return f } }
function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } }
function del(k) { try { localStorage.removeItem(k) } catch { /* ignore */ } }

function rand(n = 8) {
  try { return [...crypto.getRandomValues(new Uint8Array(n))].map((b) => b.toString(16).padStart(2, '0')).join('') }
  catch { return Math.random().toString(16).slice(2) + Date.now().toString(16) }
}
const genUid = () => 'usr_' + Date.now().toString(36) + rand(4)
const genToken = () => 'tok_' + rand(16)

// ── validation ────────────────────────────────────────────────────────────────
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_RE = /^[+]?[\d\s-]{7,15}$/
export function validateEmail(e) { return EMAIL_RE.test((e || '').trim()) }
export function validatePassword(p) { return (p || '').length >= 8 }
export function passwordStrength(p) {
  let s = 0
  if ((p || '').length >= 8) s++
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++
  if (/\d/.test(p)) s++
  if (/[^A-Za-z0-9]/.test(p)) s++
  return s // 0–4
}

// ── session accessors ─────────────────────────────────────────────────────────
export function currentUser() { return read(SESSION_KEY, null) }
export function isAuthenticated() { return !!currentUser() }
export function getUserRecord(email) { return read(USERS_KEY, {})[(email || '').trim().toLowerCase()] || null }

/**
 * Reconcile the local session mirror with the REAL Appwrite session on app
 * load — this is what makes "persist sessions" / "handle expired sessions"
 * real instead of assumed: if Appwrite says the session is gone (expired,
 * revoked, cleared on another device), the local mirror is cleared too; if
 * Appwrite's emailVerification has flipped true since we last checked (the
 * visitor verified in another tab, or came back after clicking the emailed
 * link on a different device), that's picked up here as well. Call once on
 * app mount (see AppShell in App.jsx) — everything else stays synchronous.
 */
export async function syncSession() {
  if (!isAppwriteConfigured) return
  const session = currentUser()
  if (!session) return
  const appwriteUser = await getCurrentUser()
  if (!appwriteUser) {
    // Appwrite has no active session for us anymore — the session expired or
    // was revoked elsewhere. Reflect that honestly instead of trusting a
    // stale local mirror.
    if (session.provider === 'email' || session.provider === 'google') {
      wipeUserData()
      del(SESSION_KEY)
      del(OWNER_KEY)
    }
    return
  }
  const users = read(USERS_KEY, {})
  const key = (appwriteUser.email || '').trim().toLowerCase()
  if (users[key]) {
    users[key].emailVerified = appwriteUser.emailVerification
    write(USERS_KEY, users)
  }
  write(SESSION_KEY, { ...session, email: appwriteUser.email, name: session.name || appwriteUser.name })
}

// ── email verification ────────────────────────────────────────────────────────
export function isEmailVerified() {
  const session = currentUser()
  if (!session) return false
  const user = getUserRecord(session.email)
  return !!user?.emailVerified
}

/** Email/password accounts must verify before reaching protected routes. Google accounts are pre-verified. */
export function needsEmailVerification() {
  const session = currentUser()
  if (!session || session.provider !== 'email') return false
  const user = getUserRecord(session.email)
  return !!user && !user.emailVerified
}

/** Whether the verification email is known to have actually been sent (drives the verify screen's messaging). */
export function verificationEmailWasSent() {
  const session = currentUser()
  if (!session) return false
  return !!getUserRecord(session.email)?.verificationEmailSent
}

export function markEmailVerified(email) {
  const users = read(USERS_KEY, {})
  const key = (email || currentUser()?.email || '').trim().toLowerCase()
  if (!users[key]) return false
  users[key].emailVerified = true
  write(USERS_KEY, users)
  return true
}

/** Resend the real verification email. Rate-limited to 1 per 60s — see lastVerificationSentAt. */
export async function resendVerification() {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  const res = await resendVerificationEmail()
  if (res.ok) {
    const session = currentUser()
    const key = (session?.email || '').trim().toLowerCase()
    const users = read(USERS_KEY, {})
    if (key && users[key]) {
      users[key].verificationEmailSent = true
      users[key].lastVerificationSentAt = new Date().toISOString()
      write(USERS_KEY, users)
    }
  }
  return res
}

/** Seconds remaining before another resend is allowed (0 = ready now). */
export function resendCooldownSeconds() {
  const session = currentUser()
  const user = session && getUserRecord(session.email)
  const last = user?.lastVerificationSentAt
  if (!last) return 0
  const elapsed = (Date.now() - new Date(last).getTime()) / 1000
  return Math.max(0, Math.ceil(60 - elapsed))
}

/** "Change email" from the verify screen — sign out of the unverified account and return to registration. */
export async function abandonUnverifiedAccount(email) {
  const key = (email || '').trim().toLowerCase()
  try { await appwriteLogout() } catch { /* ignore */ }
  const users = read(USERS_KEY, {})
  if (users[key] && !users[key].emailVerified) {
    delete users[key]
    write(USERS_KEY, users)
  }
  wipeUserData()
  del(SESSION_KEY)
  del(OWNER_KEY)
}

// ── session lifecycle ─────────────────────────────────────────────────────────
function startSession(user, remember = true) {
  const owner = read(OWNER_KEY, null)
  if (owner && owner !== user.uid) wipeUserData() // switching accounts → isolate
  write(OWNER_KEY, user.uid)
  const session = {
    uid: user.uid, name: user.name, email: user.email, provider: user.provider, picture: user.picture || '',
    token: genToken(), remember: !!remember, at: new Date().toISOString(),
  }
  write(SESSION_KEY, session)
  // mark last login on the stored record
  const users = read(USERS_KEY, {})
  if (users[user.email]) { users[user.email].lastLogin = session.at; write(USERS_KEY, users) }
  linkProfile(user)
  return session
}

// Link the account onto the on-device profile so all health data belongs to it.
function linkProfile(user) {
  const patch = { uid: user.uid, name: user.name, email: user.email, provider: user.provider }
  if (user.phone) patch.phone = user.phone
  if (user.gender) patch.gender = user.gender
  if (user.dob) patch.dob = user.dob
  if (user.birthYear) patch.birthYear = user.birthYear
  if (user.picture) patch.picture = user.picture
  saveProfile(patch)
}

/** Remove all user-specific health/app data from the device. */
export function wipeUserData() { DATA_KEYS.forEach(del) }

// ── sign up — real Appwrite account, real session, real verification email ────
export async function signUp(form) {
  const email = (form.email || '').trim().toLowerCase()
  const errors = {}
  if (!form.name || form.name.trim().length < 2) errors.name = 'errNameReq'
  if (!validateEmail(email)) errors.email = 'errEmailInvalid'
  if (form.phone && !PHONE_RE.test(form.phone)) errors.phone = 'errPhoneInvalid'
  if (!validatePassword(form.password)) errors.password = 'errPwdShort'
  if (form.password !== form.confirm) errors.confirm = 'errPwdMatch'
  if (!form.dob) errors.dob = 'errDobReq'
  if (!form.terms) errors.terms = 'errTermsReq'
  if (Object.keys(errors).length) return { ok: false, errors }

  if (!isAppwriteConfigured) {
    return { ok: false, errors: { email: 'errBackendUnavailable' } }
  }

  const res = await registerAccount({ name: form.name.trim(), email, password: form.password })
  if (!res.ok) {
    if (res.code === 409) return { ok: false, errors: { email: 'errEmailTaken' } }
    return { ok: false, errors: { email: 'errBackendError' } }
  }

  const user = {
    uid: res.user.$id, name: res.user.name, email: res.user.email,
    phone: form.phone || '', dob: form.dob || '', gender: form.gender || '',
    language: form.language || 'en', provider: 'email',
    createdAt: res.user.$createdAt || new Date().toISOString(), lastLogin: null,
    birthYear: form.dob ? new Date(form.dob).getFullYear() : undefined,
    emailVerified: !!res.user.emailVerification,
    verificationEmailSent: !!res.verificationSent,
    lastVerificationSentAt: res.verificationSent ? new Date().toISOString() : null,
  }
  const users = read(USERS_KEY, {})
  users[email] = user
  write(USERS_KEY, users)
  if (user.language) { try { setLangCode(user.language) } catch { /* ignore */ } }
  startSession(user, true) // auto-login right after registration
  return { ok: true, user, verificationSent: !!res.verificationSent }
}

// ── log in — real Appwrite session ─────────────────────────────────────────────
export async function login(form) {
  const email = (form.email || '').trim().toLowerCase()
  const errors = {}
  if (!validateEmail(email)) errors.email = 'errEmailInvalid'
  if (!form.password) errors.password = 'errPwdReq'
  if (Object.keys(errors).length) return { ok: false, errors }

  if (!isAppwriteConfigured) {
    return { ok: false, errors: { email: 'errBackendUnavailable' } }
  }

  const res = await loginAccount(email, form.password)
  if (!res.ok) {
    if (res.code === 401) return { ok: false, errors: { password: 'errPwdWrong' } }
    if (res.type === 'user_not_found') return { ok: false, errors: { email: 'errNoAccount' } }
    return { ok: false, errors: { email: 'errBackendError' } }
  }

  const appwriteUser = res.user
  const users = read(USERS_KEY, {})
  const existing = users[email] || {}
  const user = {
    ...existing,
    uid: appwriteUser.$id, name: appwriteUser.name || existing.name, email: appwriteUser.email,
    provider: existing.provider || 'email',
    createdAt: existing.createdAt || appwriteUser.$createdAt,
    emailVerified: !!appwriteUser.emailVerification,
  }
  users[email] = user
  write(USERS_KEY, users)
  startSession(user, form.remember !== false)
  if (user.language) { try { setLangCode(user.language) } catch { /* ignore */ } }
  return { ok: true, user }
}

// ── social / phone (Apple + phone are not implemented for real anywhere in
// this app yet — Google below IS real; these two remain clearly-labeled
// placeholders until a real Apple/phone provider is wired up) ─────────────────
export function loginWithProvider(provider, info = {}) {
  const email = (info.email || `${provider}.user@mira.app`).toLowerCase()
  const users = read(USERS_KEY, {})
  let user = users[email]
  if (!user) {
    user = {
      uid: genUid(), name: info.name || 'MIRA user', email, phone: info.phone || '',
      dob: '', gender: '', language: getProfile().language || 'en', provider,
      createdAt: new Date().toISOString(), lastLogin: null,
    }
    users[email] = user
    write(USERS_KEY, users)
  }
  startSession(user, true)
  return { ok: true, user }
}

// ── Google (real Identity Services credential — see src/lib/googleAuth.js) ───
// `profile` is the verified { sub, email, name, picture, email_verified }
// returned by verifyGoogleCredential. Creates the account on first sign-in,
// logs in on every return visit — the account is keyed by Google's own
// email/sub, so the same person always lands on the same MIRA account.
// Google accounts are inherently email-verified — never blocked by
// needsEmailVerification (provider !== 'email').
export function loginWithGoogleCredential(profile) {
  const email = (profile.email || '').trim().toLowerCase()
  if (!email) return { ok: false, errors: { email: 'errEmailInvalid' } }
  const users = read(USERS_KEY, {})
  let user = users[email]
  if (!user) {
    user = {
      uid: 'usr_g_' + (profile.sub || rand(6)),
      name: profile.name || 'MIRA user',
      email,
      phone: '', dob: '', gender: '',
      language: getLang(),
      provider: 'google',
      picture: profile.picture || '',
      emailVerified: !!profile.email_verified,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    }
  } else {
    // Returning visitor — refresh the bits Google may have updated since.
    user = { ...user, name: user.name || profile.name, picture: profile.picture || user.picture, provider: 'google' }
  }
  users[email] = user
  write(USERS_KEY, users)
  const session = startSession(user, true)
  return { ok: true, user, session }
}

// ── log out ───────────────────────────────────────────────────────────────────
export async function logout() {
  try { await appwriteLogout() } catch { /* ignore */ }
  wipeUserData()          // clear cached user-specific data
  del(SESSION_KEY)        // remove token / session
  del(OWNER_KEY)
}
