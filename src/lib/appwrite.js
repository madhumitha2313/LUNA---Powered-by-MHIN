/**
 * Appwrite Web SDK client (browser-safe).
 *
 * Uses only public config (endpoint + project id) and runs under the logged-in
 * user's session, so document-level permissions apply automatically — a user
 * can only read/write their own documents.
 *
 * Everything is guarded by `isAppwriteConfigured`: when the project isn't
 * configured (e.g. the static Pages preview with no keys), these exports are
 * null and the data layer returns empty results instead of throwing.
 */
import { Client, Account, Databases, ID } from 'appwrite'
import { appwriteConfig, isAppwriteConfigured, isAppwriteDataConfigured } from './config'

let client = null
let account = null
let databases = null

if (isAppwriteConfigured) {
  client = new Client().setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
  account = new Account(client)
  databases = new Databases(client)
}

export { client, account, databases, ID }
export { appwriteConfig, isAppwriteConfigured, isAppwriteDataConfigured }
