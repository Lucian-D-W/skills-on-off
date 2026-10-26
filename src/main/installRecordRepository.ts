import type { InstallRecord } from '../shared/importTypes'
import { getDb } from './db'
import { nowEpoch } from './time'

export interface InstallRecordInput {
  skillName: string
  sourceRelativePath: string
  installedAs: string
  installMode: InstallRecord['installMode']
  installReason: string
  sourceRootKind: InstallRecord['sourceRootKind']
  copyMode: InstallRecord['copyMode']
  containerDirName: string
  managedEntriesJson: string
  isRootSkillWrapped: boolean
  metadataJson: string
}

export function listInstallRecordsByPairId(pairId: number): InstallRecord[] {
  return getDb()
    .prepare('SELECT * FROM install_records WHERE pairId = ? ORDER BY projectTag ASC, installedAs ASC')
    .all(pairId) as InstallRecord[]
}

export function listManagedInstallRecordsByPairId(pairId: number): InstallRecord[] {
  return getDb()
    .prepare("SELECT * FROM install_records WHERE pairId = ? AND managementState = 'managed' ORDER BY projectTag ASC, installedAs ASC")
    .all(pairId) as InstallRecord[]
}

export function listInstallRecordsByPairIdAndTag(pairId: number, projectTag: string): InstallRecord[] {
  return getDb()
    .prepare('SELECT * FROM install_records WHERE pairId = ? AND projectTag = ? ORDER BY installedAs ASC')
    .all(pairId, projectTag) as InstallRecord[]
}

export function listManagedInstallRecordsByPairIdAndTag(pairId: number, projectTag: string): InstallRecord[] {
  return getDb()
    .prepare("SELECT * FROM install_records WHERE pairId = ? AND projectTag = ? AND managementState = 'managed' ORDER BY installedAs ASC")
    .all(pairId, projectTag) as InstallRecord[]
}

export function getManagedInstallRecordByPairIdAndSkillName(pairId: number, skillName: string): InstallRecord | null {
  return (
    (getDb()
      .prepare("SELECT * FROM install_records WHERE pairId = ? AND skillName = ? AND managementState = 'managed' ORDER BY updatedAt DESC LIMIT 1")
      .get(pairId, skillName) as InstallRecord) ?? null
  )
}

export function replaceInstallRecords(
  pairId: number,
  sourceId: number,
  projectTag: string,
  records: InstallRecordInput[]
) {
  const database = getDb()
  const existing = listInstallRecordsByPairIdAndTag(pairId, projectTag)
  const existingBySkillName = new Map(existing.map((record) => [record.skillName, record]))
  const insertStmt = database.prepare(`
    INSERT INTO install_records (
      pairId, sourceId, projectTag, skillName, sourceRelativePath, installedAs,
      installMode, installReason, sourceRootKind, copyMode, containerDirName, managedEntriesJson,
      isRootSkillWrapped, managementState,
      removedAt, removalScope, metadataJson, createdAt, updatedAt
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(pairId, projectTag, skillName) DO UPDATE SET
      sourceId=excluded.sourceId,
      sourceRelativePath=excluded.sourceRelativePath,
      installedAs=excluded.installedAs,
      installMode=excluded.installMode,
      installReason=excluded.installReason,
      sourceRootKind=excluded.sourceRootKind,
      copyMode=excluded.copyMode,
      containerDirName=excluded.containerDirName,
      managedEntriesJson=excluded.managedEntriesJson,
      isRootSkillWrapped=excluded.isRootSkillWrapped,
      metadataJson=excluded.metadataJson,
      updatedAt=excluded.updatedAt
  `)

  const run = database.transaction(() => {
    const now = nowEpoch()
    for (const record of records) {
      const existingRecord = existingBySkillName.get(record.skillName)
      insertStmt.run(
        pairId,
        sourceId,
        projectTag,
        record.skillName,
        record.sourceRelativePath,
        record.installedAs,
        record.installMode,
        record.installReason,
        record.sourceRootKind,
        record.copyMode,
        record.containerDirName,
        record.managedEntriesJson,
        record.isRootSkillWrapped ? 1 : 0,
        existingRecord?.managementState ?? 'managed',
        existingRecord?.removedAt ?? 0,
        existingRecord?.removalScope ?? '',
        record.metadataJson,
        existingRecord?.createdAt ?? now,
        now
      )
    }
  })

  run()
}

export function markInstallRecordRemoved(pairId: number, projectTag: string, skillName: string, removalScope: string) {
  const now = nowEpoch()
  getDb()
    .prepare(`
      UPDATE install_records
      SET managementState = 'removed', removedAt = ?, removalScope = ?, updatedAt = ?
      WHERE pairId = ? AND projectTag = ? AND skillName = ?
    `)
    .run(now, removalScope, now, pairId, projectTag, skillName)
}

export function markInstallRecordsRemovedByProjectTag(pairId: number, projectTag: string, removalScope: string) {
  const now = nowEpoch()
  getDb()
    .prepare(`
      UPDATE install_records
      SET managementState = 'removed', removedAt = ?, removalScope = ?, updatedAt = ?
      WHERE pairId = ? AND projectTag = ? AND managementState = 'managed'
    `)
    .run(now, removalScope, now, pairId, projectTag)
}
