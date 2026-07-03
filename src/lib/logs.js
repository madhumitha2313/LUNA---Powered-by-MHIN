/**
 * Data layer for the `logs` collection.
 *
 * Real Appwrite queries under the current user's session. When Appwrite isn't
 * configured, every function resolves to an empty/neutral value so the UI shows
 * honest empty states rather than crashing or inventing data.
 */
import { Query, Permission, Role, ID } from 'appwrite'
import { databases, isAppwriteDataConfigured } from './appwrite'
import { appwriteConfig } from './config'

const DB = appwriteConfig.databaseId
const COLL = appwriteConfig.collections.logs

/** Most-recent logs for a user, newest first. Returns [] when unconfigured. */
export async function getRecentLogs(userId, limit = 10) {
  if (!isAppwriteDataConfigured || !userId) return []
  const res = await databases.listDocuments(DB, COLL, [
    Query.equal('userId', userId),
    Query.orderDesc('date'),
    Query.limit(limit),
  ])
  return res.documents
}

/**
 * Write a validated log. Per-document permissions are pinned to the owning user
 * at create time, which is what enforces "only your own documents" alongside
 * the collection's documentSecurity setting.
 */
export async function createLog(userId, fields) {
  if (!isAppwriteDataConfigured || !userId) throw new Error('Appwrite not configured')
  return databases.createDocument(DB, COLL, ID.unique(), { userId, ...fields }, [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId)),
  ])
}
