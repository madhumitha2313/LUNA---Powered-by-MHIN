/**
 * Live First Period Readiness Guide generation via the server proxy, which uses
 * the exact MHIN educator prompt + Anthropic (server-side only; the key never
 * reaches the browser). Falls back to the offline template engine
 * (src/lib/readinessGuide.js) when no backend is configured.
 */
import { functionsBaseUrl } from './config'

export const guideApiAvailable = Boolean(functionsBaseUrl)

export async function generateGuideAI({ age, language, relationship, insight }) {
  if (!functionsBaseUrl) throw new Error('backend-not-configured')
  const res = await fetch(`${functionsBaseUrl}/guide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ age, language, relationship, insight }),
  })
  if (!res.ok) throw new Error(`guide generation failed: ${res.status}`)
  const { text } = await res.json()
  return text
}
