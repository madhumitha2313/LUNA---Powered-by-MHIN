import { useEffect, useRef } from 'react'
import { isGoogleSignInConfigured, renderGoogleButton } from '../lib/googleAuth'

/**
 * Mounts Google's own "Sign in with Google" button (real widget, real
 * account chooser) when VITE_GOOGLE_CLIENT_ID is configured. Renders nothing
 * and calls `onUnavailable` otherwise, so the caller can show its existing
 * fallback — never a fabricated account list.
 */
export default function GoogleSignInButton({ onProfile, onUnavailable, text = 'continue_with' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!isGoogleSignInConfigured) {
      onUnavailable?.()
      return
    }
    let cancelled = false
    renderGoogleButton(ref.current, {
      text,
      onCredential: (profile) => !cancelled && onProfile?.(profile),
      onUnavailable: (err) => !cancelled && onUnavailable?.(err),
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isGoogleSignInConfigured) return null
  return <div ref={ref} className="flex justify-center" />
}
