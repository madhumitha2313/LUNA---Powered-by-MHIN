/**
 * Minimal auth helpers around the Appwrite Account API.
 *
 * `getCurrentUser` returns the logged-in user or null (never throws), so screens
 * can render an honest signed-out / empty state when there's no session — which
 * is exactly what the static Pages preview shows when no keys are configured.
 */
import { account, isAppwriteConfigured } from './appwrite'

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
