import type { ProjectLinkRecord } from '../shared/importTypes'
import { getDb } from './db'
import { nowEpoch } from './time'

export interface ProjectLinkUpsertInput {
  pairId: number
  sourceId: number
  sourceKind: ProjectLinkRecord['sourceKind']
  projectTag: string
  status: ProjectLinkRecord['status']
  lastCheckedAt?: number
  lastSyncedAt?: number
  lastRemoteCommitSha?: string
  lastSyncState?: string
  lastSyncError?: string
}

export function getProjectLinkByPairId(pairId: number): ProjectLinkRecord | null {
  return (
    (getDb()
      .prepare('SELECT * FROM project_links WHERE pairId = ? ORDER BY updatedAt DESC, id DESC LIMIT 1')
      .get(pairId) as ProjectLinkRecord) ?? null
  )
}

export function listProjectLinksByPairId(pairId: number): ProjectLinkRecord[] {
  return getDb()
    .prepare('SELECT * FROM project_links WHERE pairId = ? ORDER BY projectTag ASC, id ASC')
    .all(pairId) as ProjectLinkRecord[]
}

export function getProjectLinkByPairIdAndTag(pairId: number, projectTag: string): ProjectLinkRecord | null {
  return (
    (getDb()
      .prepare('SELECT * FROM project_links WHERE pairId = ? AND projectTag = ? LIMIT 1')
      .get(pairId, projectTag) as ProjectLinkRecord) ?? null
  )
}

export function upsertProjectLink(input: ProjectLinkUpsertInput): ProjectLinkRecord {
  const database = getDb()
  const now = nowEpoch()
  database.prepare(`
    INSERT INTO project_links (
      pairId, sourceId, sourceKind, projectTag, status, lastCheckedAt, lastSyncedAt,
      lastRemoteCommitSha, lastSyncState, lastSyncError, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pairId, projectTag) DO UPDATE SET
      sourceId=excluded.sourceId,
      sourceKind=excluded.sourceKind,
      projectTag=excluded.projectTag,
      status=excluded.status,
      lastCheckedAt=excluded.lastCheckedAt,
      lastSyncedAt=excluded.lastSyncedAt,
      lastRemoteCommitSha=excluded.lastRemoteCommitSha,
      lastSyncState=excluded.lastSyncState,
      lastSyncError=excluded.lastSyncError,
      updatedAt=excluded.updatedAt
  `).run(
    input.pairId,
    input.sourceId,
    input.sourceKind,
    input.projectTag,
    input.status,
    input.lastCheckedAt ?? 0,
    input.lastSyncedAt ?? 0,
    input.lastRemoteCommitSha ?? '',
    input.lastSyncState ?? 'idle',
    input.lastSyncError ?? '',
    now,
    now
  )
  return getProjectLinkByPairIdAndTag(input.pairId, input.projectTag)!
}

export function updateProjectLinkSyncFields(
  id: number,
  fields: Partial<Pick<ProjectLinkRecord, 'status' | 'lastCheckedAt' | 'lastSyncedAt' | 'lastRemoteCommitSha' | 'lastSyncState' | 'lastSyncError'>>
): ProjectLinkRecord {
  const existing = getDb().prepare('SELECT * FROM project_links WHERE id = ?').get(id) as ProjectLinkRecord | undefined
  if (!existing) {
    throw new Error(`Project link 不存在：${id}`)
  }

  const now = nowEpoch()
  getDb().prepare(`
    UPDATE project_links
    SET status=?, lastCheckedAt=?, lastSyncedAt=?, lastRemoteCommitSha=?, lastSyncState=?, lastSyncError=?, updatedAt=?
    WHERE id=?
  `).run(
    fields.status ?? existing.status,
    fields.lastCheckedAt ?? existing.lastCheckedAt,
    fields.lastSyncedAt ?? existing.lastSyncedAt,
    fields.lastRemoteCommitSha ?? existing.lastRemoteCommitSha,
    fields.lastSyncState ?? existing.lastSyncState,
    fields.lastSyncError ?? existing.lastSyncError,
    now,
    id
  )

  return (getDb().prepare('SELECT * FROM project_links WHERE id = ?').get(id) as ProjectLinkRecord)!
}
