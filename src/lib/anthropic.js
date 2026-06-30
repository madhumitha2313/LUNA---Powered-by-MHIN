/**
 * Client-side helper for AI extraction/reasoning (Phase 2, 4, 6, 7).
 *
 * IMPORTANT: this never talks to the Anthropic API directly. The Anthropic key
 * is a secret and must stay server-side, so every call goes through our own
 * server function which holds the key and returns structured JSON. Calling
 * Anthropic from the browser would leak the key into the bundle.
 */
import { functionsBaseUrl } from './config'

/**
 * Extract structured health fields from a free-text (Tamil) transcript.
 * The server prompts Anthropic for strict JSON: flow, pain, mood, fatigue,
 * stress, sleep, plus an overall confidence and any follow-up question needed.
 *
 * @param {string} transcript
 * @returns {Promise<{
 *   fields: Record<string, string|number>,
 *   confidence: number,
 *   followUpQuestion: string|null
 * }>}
 */
export async function extractHealthFields(transcript) {
  const res = await fetch(`${functionsBaseUrl}/extract`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  })
  if (!res.ok) throw new Error(`Extraction failed: ${res.status}`)
  return res.json()
}
