/**
 * Live Health Impact Summary via the server proxy (exact MHIN report-writer
 * prompt + Anthropic, server-side only). Falls back to the offline template
 * engine (src/lib/impactSummary.js) when no backend is configured.
 */
import { functionsBaseUrl } from './config'

export const impactApiAvailable = Boolean(functionsBaseUrl)

export async function generateImpactAI(data) {
  if (!functionsBaseUrl) throw new Error('backend-not-configured')
  const res = await fetch(`${functionsBaseUrl}/impact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`impact generation failed: ${res.status}`)
  const { text } = await res.json()
  return text
}
