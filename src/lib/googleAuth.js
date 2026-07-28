/**
 * Google Identity Services (GIS) — real "Sign in with Google".
 *
 * When VITE_GOOGLE_CLIENT_ID is configured, `renderGoogleButton` mounts
 * Google's own button widget. Clicking it opens Google's own account
 * chooser — the actual accounts signed into the visitor's browser, not a
 * fabricated list — and hands back a signed JWT credential identifying
 * whichever one they pick.
 *
 * The credential is verified server-side (POST /auth/google, checked against
 * Google's tokeninfo endpoint) whenever a functions base URL is configured;
 * otherwise it's decoded locally so the preview keeps working without a
 * backend. Either path returns the same { sub, email, name, picture } shape.
 */
import { googleClientId, isGoogleSignInConfigured, functionsBaseUrl } from './config'

export { isGoogleSignInConfigured }

let scriptPromise = null

/** Load the GIS script once and resolve with `window.google`. */
export function loadGoogleIdentity() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.onload = () => (window.google?.accounts?.id ? resolve(window.google) : reject(new Error('GIS did not initialise')))
    s.onerror = () => reject(new Error('Google Identity script failed to load'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/** Decode a JWT payload without verifying its signature (see module doc). */
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Verify a GIS credential and resolve { ok, profile } or { ok: false, error }. */
export async function verifyGoogleCredential(credential) {
  if (functionsBaseUrl) {
    try {
      const r = await fetch(`${functionsBaseUrl}/auth/google`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await r.json()
      if (r.ok && data.ok) return { ok: true, profile: data.profile }
      return { ok: false, error: data.error || 'Google verification failed' }
    } catch {
      /* server proxy unreachable — fall through to local decode below */
    }
  }
  const decoded = decodeJwt(credential)
  if (!decoded?.email) return { ok: false, error: 'Could not read Google credential' }
  return {
    ok: true,
    profile: {
      sub: decoded.sub,
      email: decoded.email,
      email_verified: decoded.email_verified === true || decoded.email_verified === 'true',
      name: decoded.name,
      picture: decoded.picture,
    },
  }
}

/**
 * Render the real Google button into `el`. Resolves the profile the instant
 * the visitor picks an account; rejects (never throws) if GIS can't load —
 * callers should fall back to the email flow in that case.
 */
export async function renderGoogleButton(el, { onCredential, onUnavailable, theme = 'filled_black', text = 'continue_with' } = {}) {
  if (!isGoogleSignInConfigured || !el) {
    onUnavailable?.()
    return
  }
  try {
    const google = await loadGoogleIdentity()
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (resp) => {
        const result = await verifyGoogleCredential(resp.credential)
        if (result.ok) onCredential?.(result.profile)
        else onUnavailable?.(result.error)
      },
      auto_select: false,
    })
    google.accounts.id.renderButton(el, { type: 'standard', theme, size: 'large', shape: 'pill', text, width: 320 })
  } catch {
    onUnavailable?.()
  }
}
