import fs from 'fs/promises'
import path from 'path'
import type { InstallManagementState, InstallRecord } from '../shared/importTypes'
import { disableSkill, isManagedRecordEnabled } from './fileOps'
import { listInstallRecordsByPairIdAndTag, markInstallRecordRemoved, markInstallRecordsRemovedByProjectTag } from './installRecordRepository'
import { getPair } from './pairRepository'
import { getProjectLinkByPairIdAndTag } from './projectLinkRepository'
import { replaceTargetProjectionsForProjectTag } from './targetProjectionRepository'
import { nowEpoch } from './time'
import { listPairTargets } from './targetRegistry'

export interface InstallRecordLike {
  projectTag: string
  skillName: string
  installedAs: string
  managementState: InstallManagementState
  copyMode?: InstallRecord['copyMode']
  containerDirName?: string
  managedEntriesJson?: string
}

export function listManagedInstallRecords<T extends InstallRecordLike>(records: T[]): T[] {
  return records.filter((record) => record.managementState === 'managed')
}

export function buildManagedRemovalArchivePath(sourcePath: string, projectTag: string, installedAs: string): string {
  return path.join(sourcePath, '.removed-managed', projectTag, installedAs)
}

export async function archiveManagedSkillDirectory(sourcePath: string, projectTag: string, installedAs: string): Promise<string> {
  const sourceSkillPath = path.join(sourcePath, installedAs)
  const archivePath = buildManagedRemovalArchivePath(sourcePath, projectTag, installedAs)
  const archiveParent = path.dirname(archivePath)

  await fs.mkdir(archiveParent, { recursive: true })
  await fs.rm(archivePath, { recursive: true, force: true })

  const stat = await fs.stat(sourceSkillPath).catch(() => null)
  if (!stat?.isDirectory()) {
    return archivePath
  }

  await fs.rename(sourceSkillPath, archivePath).catch(async () => {
    await fs.cp(sourceSkillPath, archivePath, { recursive: true, force: true })
    await fs.rm(sourceSkillPath, { recursive: true, force: true })
  })

  return archivePath
}

function toProjectionInput(record: InstallRecord, state: 'active' | 'inactive') {
  return {
    skillName: record.skillName,
    sourceRelativePath: record.sourceRelativePath,
    targetRelativePath: record.copyMode === 'directory-copy' ? record.installedAs : '',
    state,
    lastProjectedAt: nowEpoch(),
    lastSourceVersion: '',
    metadataJson: JSON.stringify({
      projectTag: record.projectTag,
      installMode: record.installMode,
      sourceRootKind: record.sourceRootKind,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntries: JSON.parse(record.managedEntriesJson || '[]'),
      managementState: record.managementState,
    }),
  }
}

async function refreshProjectionLedgerForProject(pairId: number, projectTag: string) {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  const targets = listPairTargets(pair)
  const managedRecords = listManagedInstallRecords(listInstallRecordsByPairIdAndTag(pairId, projectTag))
  const projections = managedRecords.map((record) =>
    toProjectionInput(record, isManagedRecordEnabled(pair.targetPath, record.skillName, record) ? 'active' : 'inactive')
  )

  for (const target of targets) {
    replaceTargetProjectionsForProjectTag(target.id, projectTag, projections)
  }
}

export async function archiveRemovedManagedSkills(sourcePath: string, records: Array<Pick<InstallRecord, 'projectTag' | 'installedAs' | 'managementState'>>) {
  for (const record of records) {
    if (record.managementState !== 'removed') continue
    await archiveManagedSkillDirectory(sourcePath, record.projectTag, record.installedAs)
  }
}

export async function removeManagedSkill(pairId: number, projectTag: string, skillName: string) {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  const record = listManagedInstallRecords(listInstallRecordsByPairIdAndTag(pairId, projectTag)).find(
    (item) => item.skillName === skillName
  )
  if (!record) {
    throw new Error(`找不到仍在管理中的 skill：${skillName}`)
  }

  const disableResult = disableSkill(pair.targetPath, record.skillName, record, {
    projectionMode: pair.projectionMode,
    sourcePath: pair.sourcePath,
  })
  if (!disableResult.ok) {
    throw new Error(disableResult.error ?? `停用 skill 失敗：${record.installedAs}`)
  }

  await archiveManagedSkillDirectory(pair.sourcePath, record.projectTag, record.installedAs)
  markInstallRecordRemoved(pairId, projectTag, skillName, 'single-skill')
  await refreshProjectionLedgerForProject(pairId, projectTag)
}

export async function removeManagedProjectGroup(pairId: number, projectTag: string) {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  const link = getProjectLinkByPairIdAndTag(pairId, projectTag)
  if (!link) {
    throw new Error(`找不到 project tag：${projectTag}`)
  }

  const managedRecords = listManagedInstallRecords(listInstallRecordsByPairIdAndTag(pairId, projectTag))
  for (const record of managedRecords) {
    const normalizedDisableResult = disableSkill(pair.targetPath, record.skillName, record, {
      projectionMode: pair.projectionMode,
      sourcePath: pair.sourcePath,
    })
    if (!normalizedDisableResult.ok) {
      throw new Error(normalizedDisableResult.error ?? `停用 skill 失敗：${record.installedAs}`)
    }
    await archiveManagedSkillDirectory(pair.sourcePath, record.projectTag, record.installedAs)
  }

  markInstallRecordsRemovedByProjectTag(pairId, link.projectTag, 'group')
  await refreshProjectionLedgerForProject(pairId, projectTag)
}
