import type { TargetRecord } from '../shared/importTypes'
import { getDb } from './db'
import { nowEpoch } from './time'

export interface TargetUpsertInput {
  pairId: number
  kind: TargetRecord['kind']
  rootPath: string
  layoutVersion: string
  agentName: string
  metadataJson: string
}

export function listTargetsByPairId(pairId: number): TargetRecord[] {
  return getDb().prepare('SELECT * FROM targets WHERE pairId = ? ORDER BY id ASC').all(pairId) as TargetRecord[]
}

export function upsertTarget(input: TargetUpsertInput): TargetRecord {
  const database = getDb()
  const now = nowEpoch()
  database.prepare(`
    INSERT INTO targets (pairId, kind, rootPath, layoutVersion, agentName, metadataJson, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pairId, rootPath) DO UPDATE SET
      kind=excluded.kind,
      layoutVersion=excluded.layoutVersion,
      agentName=excluded.agentName,
      metadataJson=excluded.metadataJson,
      updatedAt=excluded.updatedAt
  `).run(
    input.pairId,
    input.kind,
    input.rootPath,
    input.layoutVersion,
    input.agentName,
    input.metadataJson,
    now,
    now
  )

  return getDb()
    .prepare('SELECT * FROM targets WHERE pairId = ? AND rootPath = ?')
    .get(input.pairId, input.rootPath) as TargetRecord
}
