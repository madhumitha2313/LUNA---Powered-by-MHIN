/**
 * MIRA's conversational brain — tries the real LLM-backed /chat endpoint
 * first (natural, context-aware replies, when a server Anthropic key is
 * configured), and resolves to null on any failure so the caller can fall
 * back to the local rule-based companion (src/lib/miraChat.js). Never throws
 * — a network hiccup should never break the chat, it should just fall back.
 */
import { functionsBaseUrl } from './config'

/**
 * @param {{
 *   history: { role: 'user'|'mira', text: string }[],
 *   emotion: string, styleHint: string,
 *   personaHint?: string, modeHint?: string, lang: string,
 * }} args
 * @returns {Promise<string|null>} the reply text, or null if the LLM path is unavailable
 */
export async function fetchLLMReply({ history, emotion, styleHint, personaHint, modeHint, lang }) {
  if (!functionsBaseUrl) return null

  // Anthropic's Messages API requires the turn list to start on a user turn —
  // drop MIRA's opening greeting and any other leading assistant turns.
  const firstUser = history.findIndex((m) => m.role === 'user')
  if (firstUser === -1) return null
  const turns = history.slice(firstUser).map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', text: m.text }))

  try {
    const res = await fetch(`${functionsBaseUrl}/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: turns, emotion, styleHint, personaHint, modeHint, lang }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = (data.text || '').trim()
    return text || null
  } catch {
    return null
  }
}
