/**
 * MIRA authentication & session management.
 *
 * A complete, production-shaped auth layer. In this offline preview it runs a
 * fully-functional LOCAL provider — accounts are created with SHA-256 + salt
 * password hashing (Web Crypto), duplicate emails are rejected, sessions carry
 * a token and persist across refresh/reopen, and each user's health data is
 * isolated (switching accounts never exposes another user's data). The same
 * surface (signUp / login / logout / currentUser / isAuthenticated) maps 1:1
 * onto Appwrite/Firebase for production — see src/lib/auth.js for the Appwrite
 * path, which this module defers to when a real backend is configured.
 */
import { saveProfile, getProfile } from './localStore'
import { setLangCode, getLang } from './i18n.jsx'
import { isAppwriteConfigured } from './appwrite'
import { registerAndSendVerification, resendVerificationEmail, logout as appwriteLogout } from './auth'

const USERS_KEY = 'mira.users.v1'       // { [email]: userRecord }
const SESSION_KEY = 'mira.session.v1'   // active session
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

// ── crypto helpers ────────────────────────────────────────────────────────────
async function hashPwd(pwd, salt) {
  try {
    const data = new TextEncoder().encode(salt + '::' + pwd)
    const buf = await crypto.subtle.digest('SHA-256', data)
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    // extremely old browser fallback — still salted, never plain text stored
    let h = 0; const s = salt + '::' + pwd
    for (let i = 0; i < s.length; i++) { h = (Math.imul(31, h) + s.charCodeAt(i)) | 0 }
    return 'x' + (h >>> 0).toString(16)
  }
}
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

// ── email verification ────────────────────────────────────────────────────────
// The local record (above) is always the source of truth for whether THIS app
// treats an account as verified — Appwrite (when configured) is the real
// delivery + confirmation mechanism, and flips this same flag on success.
export function isEmailVerified() {
  const session = currentUser()
  if (!session) return false
  const user = getUserRecord(session.email)
  return !!user?.emailVerified
}

/**
 * True only when verification is both required AND actually enforceable: an
 * email/password account, still unverified, where a real verification email
 * is confirmed to have actually gone out (user.verificationEmailSent).
 *
 * Deliberately NOT gated on isAppwriteConfigured alone — this app ships with
 * a baked-in default Appwrite project id (see src/lib/config.js), so that
 * flag is true even when the project has no SMTP/Email-Password set up, or
 * the network can't reach it at all. Gating on the config flag would trap a
 * real visitor behind a block that can never clear. Gating on an actual send
 * having succeeded means the block only ever appears when there is a genuine,
 * working way out of it (open the email, click the link).
 */
export function needsEmailVerification() {
  const session = currentUser()
  if (!session || session.provider !== 'email') return false
  const user = getUserRecord(session.email)
  return !!user && !user.emailVerified && !!user.verificationEmailSent
}

/** Whether a real verification email is known to have been sent for the current session's account. */
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

/** Resend the real verification email (no-op, reported honestly, when Appwrite isn't configured). */
export async function resendVerification() {
  if (!isAppwriteConfigured) return { ok: false, error: 'not-configured' }
  const res = await resendVerificationEmail()
  if (res.ok) {
    const session = currentUser()
    const key = (session?.email || '').trim().toLowerCase()
    const users = read(USERS_KEY, {})
    if (key && users[key]) {
      users[key].verificationEmailSent = true
      write(USERS_KEY, users)
    }
  }
  return res
}

/** "Change email" from the verify screen — discard this still-unverified account so they can re-register. */
export function abandonUnverifiedAccount(email) {
  const key = (email || '').trim().toLowerCase()
  const users = read(USERS_KEY, {})
  if (users[key] && !users[key].emailVerified) {
    delete users[key]
    write(USERS_KEY, users)
  }
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

// ── sign up ───────────────────────────────────────────────────────────────────
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
  const users = read(USERS_KEY, {})
  if (users[email]) errors.email = 'errEmailTaken'
  if (Object.keys(errors).length) return { ok: false, errors }

  const salt = rand(8)
  const user = {
    uid: genUid(), name: form.name.trim(), email, phone: form.phone || '',
    dob: form.dob || '', gender: form.gender || '', language: form.language || 'en',
    provider: 'email', pwd: await hashPwd(form.password, salt), salt,
    createdAt: new Date().toISOString(), lastLogin: null,
    birthYear: form.dob ? new Date(form.dob).getFullYear() : undefined,
    emailVerified: false,
  }
  users[email] = user
  write(USERS_KEY, users)
  if (user.language) { try { setLangCode(user.language) } catch { /* ignore */ } }
  startSession(user, true) // auto-login right after registration

  // Real verification email — best-effort, never blocks account creation.
  // Requires Appwrite configured with Email/Password auth + SMTP set up in
  // its console; this app's own local account (above) is unaffected either way.
  // Recorded on the user so needsEmailVerification() only ever blocks when a
  // real email is confirmed to have actually gone out (see that function).
  let verificationSent = false
  if (isAppwriteConfigured) {
    const res = await registerAndSendVerification({ name: user.name, email, password: form.password })
    verificationSent = res.ok
  }
  const usersNow = read(USERS_KEY, {})
  if (usersNow[email]) {
    usersNow[email].verificationEmailSent = verificationSent
    write(USERS_KEY, usersNow)
  }
  return { ok: true, user, verificationSent }
}

// ── log in ────────────────────────────────────────────────────────────────────
export async function login(form) {
  const email = (form.email || '').trim().toLowerCase()
  const errors = {}
  if (!validateEmail(email)) errors.email = 'errEmailInvalid'
  if (!form.password) errors.password = 'errPwdReq'
  if (Object.keys(errors).length) return { ok: false, errors }
  const users = read(USERS_KEY, {})
  const user = users[email]
  if (!user) return { ok: false, errors: { email: 'errNoAccount' } }
  const pwd = await hashPwd(form.password, user.salt)
  if (pwd !== user.pwd) return { ok: false, errors: { password: 'errPwdWrong' } }
  startSession(user, form.remember !== false)
  if (user.language) { try { setLangCode(user.language) } catch { /* ignore */ } }
  return { ok: true, user }
}

// ── social / phone (future-ready; simulated in preview) ───────────────────────
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
  // Best-effort: end any real Appwrite session too.
  try { await appwriteLogout() } catch { /* ignore */ }
  wipeUserData()          // clear cached user-specific data
  del(SESSION_KEY)        // remove token / session
  del(OWNER_KEY)
}
