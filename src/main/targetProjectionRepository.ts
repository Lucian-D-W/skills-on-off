import type { TargetProjectionRecord } from '../shared/importTypes'
import { getDb } from './db'

export interface TargetProjectionInput {
  skillName: string
  sourceRelativePath: string
  targetRelativePath: string
  state: TargetProjectionRecord['state']
  lastProjectedAt: number
  lastSourceVersion: string
  metadataJson: string
}

export function listTargetProjections(targetId: number): TargetProjectionRecord[] {
  return getDb()
    .prepare('SELECT * FROM target_projections WHERE targetId = ? ORDER BY skillName ASC')
    .all(targetId) as TargetProjectionRecord[]
}

export function replaceTargetProjections(targetId: number, projections: TargetProjectionInput[]) {
  const database = getDb()
  const deleteStmt = database.prepare('DELETE FROM target_projections WHERE targetId = ?')
  const insertStmt = database.prepare(`
    INSERT INTO target_projections (
      targetId, skillName, sourceRelativePath, targetRelativePath, state,
      lastProjectedAt, lastSourceVersion, metadataJson
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)

  const run = database.transaction(() => {
    deleteStmt.run(targetId)
    for (const projection of projections) {
      insertStmt.run(
        targetId,
        projection.skillName,
        projection.sourceRelativePath,
        projection.targetRelativePath,
        projection.state,
        projection.lastProjectedAt,
        projection.lastSourceVersion,
        projection.metadataJson
      )
    }
  })

  run()
}

function parseProjectionMetadata(metadataJson: string): Record<string, unknown> {
  try {
    return JSON.parse(metadataJson) as Record<string, unknown>
  } catch {
    return {}
  }
}

export function replaceTargetProjectionsForProjectTag(
  targetId: number,
  projectTag: string,
  projections: TargetProjectionInput[]
) {
  const existing = listTargetProjections(targetId)
  const preserved = existing
    .filter((projection) => parseProjectionMetadata(projection.metadataJson).projectTag !== projectTag)
    .map<TargetProjectionInput>((projection) => ({
      skillName: projection.skillName,
      sourceRelativePath: projection.sourceRelativePath,
      targetRelativePath: projection.targetRelativePath,
      state: projection.state,
      lastProjectedAt: projection.lastProjectedAt,
      lastSourceVersion: projection.lastSourceVersion,
      metadataJson: projection.metadataJson,
    }))

  replaceTargetProjections(targetId, [...preserved, ...projections])
}
