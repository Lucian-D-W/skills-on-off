import type { InstallRecord, ProjectLinkRecord, ProjectSyncReport, SourceRecord } from '../shared/importTypes'
import type { Pair, SkillMeta } from '../shared/types'
import {
  listInstallRecordsByPairIdAndTag,
  listManagedInstallRecordsByPairIdAndTag,
  replaceInstallRecords,
} from './installRecordRepository'
import { disableSkill, enableSkill } from './fileOps'
import { fetchGithubBranchHeadSha, importGithubArchive } from './githubSource'
import { archiveRemovedManagedSkills, listManagedInstallRecords } from './managementRemovalService'
import { getPair } from './pairRepository'
import { applyGroupTagToSkills, copyImportedSourceToPair, resolveRecordedImportMode } from './projectLinking'
import { getProjectLinkByPairId, getProjectLinkByPairIdAndTag, updateProjectLinkSyncFields } from './projectLinkRepository'
import { inspectProjectGroupSync, repairProjectGroupTargets } from './projectSync'
import { listSkillMetas } from './skillMetaRepository'
import { getSourceById, updateSource } from './sourceRepository'
import { replaceTargetProjectionsForProjectTag } from './targetProjectionRepository'
import { nowEpoch } from './time'
import { listPairTargets } from './targetRegistry'

const AUTO_REMOTE_CHECK_TTL_SECONDS = 15 * 60

interface ProjectSyncContext {
  pair: Pair
  link: ProjectLinkRecord
  source: SourceRecord
  metas: SkillMeta[]
}

function getProjectLink(pairId: number, projectTag?: string): ProjectLinkRecord | null {
  if (projectTag?.trim()) {
    return getProjectLinkByPairIdAndTag(pairId, projectTag.trim())
  }

  return getProjectLinkByPairId(pairId)
}

function loadProjectSyncContext(pairId: number, projectTag?: string): ProjectSyncContext {
  const pair = getPair(pairId)
  if (!pair) {
    throw new Error(`Pair 不存在：${pairId}`)
  }

  const link = getProjectLink(pairId, projectTag)
  if (!link) {
    throw new Error(projectTag ? `找不到 project tag：${projectTag}` : '這個 pair 尚未關聯 GitHub 專案')
  }

  const source = getSourceById(link.sourceId)
  if (!source) {
    throw new Error(`Source 不存在：${link.sourceId}`)
  }

  return {
    pair,
    link,
    source,
    metas: listSkillMetas(pairId),
  }
}

function shouldRefreshRemote(context: ProjectSyncContext, forceRemoteCheck: boolean): boolean {
  if (forceRemoteCheck) return true
  if (!context.link.lastCheckedAt) return true
  if (!context.link.lastRemoteCommitSha) return true
  return nowEpoch() - context.link.lastCheckedAt >= AUTO_REMOTE_CHECK_TTL_SECONDS
}

async function inspectContext(
  context: ProjectSyncContext,
  overrides: Partial<Pick<ProjectSyncReport, 'remoteCommitSha' | 'checkedAt' | 'syncedAt' | 'error' | 'localCommitSha'>> = {}
): Promise<ProjectSyncReport> {
  return inspectProjectGroupSync({
    projectTag: context.link.projectTag,
    sourcePath: context.pair.sourcePath,
    targetPath: context.pair.targetPath,
    metas: context.metas,
    projectionMode: context.pair.projectionMode,
    managedRecords: listManagedInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag).map((record) => ({
      skillName: record.skillName,
      installedAs: record.installedAs,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntriesJson: record.managedEntriesJson,
      metadataJson: record.metadataJson,
    })),
    managedSkillNamesOverride: listManagedInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag).map(
      (record) => record.skillName
    ),
    localCommitSha: overrides.localCommitSha ?? context.source.resolvedCommitSha,
    remoteCommitSha: overrides.remoteCommitSha ?? context.link.lastRemoteCommitSha,
    checkedAt: overrides.checkedAt ?? context.link.lastCheckedAt,
    syncedAt: overrides.syncedAt ?? context.link.lastSyncedAt,
    error: overrides.error ?? context.link.lastSyncError,
  })
}

async function persistInspection(
  context: ProjectSyncContext,
  report: ProjectSyncReport,
  overrides: Partial<Pick<ProjectLinkRecord, 'lastCheckedAt' | 'lastSyncedAt' | 'lastRemoteCommitSha' | 'lastSyncError'>> = {}
) {
  updateProjectLinkSyncFields(context.link.id, {
    lastCheckedAt: overrides.lastCheckedAt ?? report.checkedAt,
    lastSyncedAt: overrides.lastSyncedAt ?? report.syncedAt,
    lastRemoteCommitSha: overrides.lastRemoteCommitSha ?? report.remoteCommitSha,
    lastSyncState: report.healthState,
    lastSyncError: overrides.lastSyncError ?? report.error,
  })
}

function persistTargetProjectionLedger(
  context: ProjectSyncContext,
  installRecords: Array<
    Pick<
      InstallRecord,
      'skillName' | 'sourceRelativePath' | 'installedAs' | 'installMode' | 'sourceRootKind' | 'copyMode' | 'containerDirName' | 'managedEntriesJson'
    >
  >,
  activeSkillNames: string[],
  sourceVersion: string
) {
  const targets = listPairTargets(context.pair)
  const projectedAt = nowEpoch()
  const activeSkillSet = new Set(activeSkillNames)
  const projections = installRecords.map((record) => ({
    skillName: record.skillName,
    sourceRelativePath: record.sourceRelativePath,
    targetRelativePath: record.copyMode === 'directory-copy' ? record.installedAs : '',
    state: activeSkillSet.has(record.skillName) ? 'active' as const : 'inactive' as const,
    lastProjectedAt: projectedAt,
    lastSourceVersion: sourceVersion,
    metadataJson: JSON.stringify({
      projectTag: context.link.projectTag,
      installMode: record.installMode,
      sourceRootKind: record.sourceRootKind,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntries: JSON.parse(record.managedEntriesJson || '[]'),
    }),
  }))

  for (const target of targets) {
    replaceTargetProjectionsForProjectTag(
      target.id,
      context.link.projectTag,
      projections
    )
  }
}

export async function getProjectSyncStatus(
  pairId: number,
  projectTag?: string,
  options: { forceRemoteCheck?: boolean } = {}
): Promise<ProjectSyncReport> {
  const context = loadProjectSyncContext(pairId, projectTag)
  const forceRemoteCheck = options.forceRemoteCheck ?? false

  if (!shouldRefreshRemote(context, forceRemoteCheck)) {
    const report = await inspectContext(context)
    await persistInspection(context, report)
    return report
  }

  const checkedAt = nowEpoch()
  try {
    const remoteCommitSha = await fetchGithubBranchHeadSha(context.source.canonicalUrl)
    const report = await inspectContext(context, {
      remoteCommitSha,
      checkedAt,
      error: '',
    })
    await persistInspection(context, report, {
      lastCheckedAt: checkedAt,
      lastRemoteCommitSha: remoteCommitSha,
      lastSyncError: '',
    })
    return report
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const report = await inspectContext(context, {
      checkedAt,
      error: message,
    })
    await persistInspection(context, report, {
      lastCheckedAt: checkedAt,
      lastSyncError: message,
    })
    return report
  }
}

export async function updateProjectFromGithub(pairId: number, projectTag?: string): Promise<ProjectSyncReport> {
  const context = loadProjectSyncContext(pairId, projectTag)
  const before = await getProjectSyncStatus(pairId, projectTag, { forceRemoteCheck: true })
  const checkedAt = nowEpoch()

  try {
    if (!before.remoteCommitSha) {
      throw new Error('目前無法取得 GitHub 最新 commit，已停止更新')
    }

    const imported = await importGithubArchive(context.source.canonicalUrl)
    const previousManagedRecords = listManagedInstallRecords(
      listInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag)
    )
    const importMode = resolveRecordedImportMode(previousManagedRecords)
    const activeSkillNames = [...before.enabledSkillNames]
    const copied = await copyImportedSourceToPair(imported.sourcePath, context.pair.sourcePath, imported.repo, importMode)
    const importedSkillNames = copied.skillNames

    if (importedSkillNames.length > 0) {
      applyGroupTagToSkills(context.pair, importedSkillNames, context.link.projectTag)
    }
    replaceInstallRecords(context.pair.id, context.link.sourceId, context.link.projectTag, copied.records)
    await archiveRemovedManagedSkills(
      context.pair.sourcePath,
      listInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag)
    )
    const previousManagedRecordMap = new Map(previousManagedRecords.map((record) => [record.skillName, record]))
    const currentManagedRecordMap = new Map(
      listManagedInstallRecords(listInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag)).map((record) => [
        record.skillName,
        record,
      ])
    )

    for (const skillName of activeSkillNames) {
      if (importedSkillNames.includes(skillName)) {
        const result = enableSkill(
          context.pair.sourcePath,
          context.pair.targetPath,
          skillName,
          currentManagedRecordMap.get(skillName),
          { projectionMode: context.pair.projectionMode }
        )
        if (!result.ok) {
          throw new Error(result.error ?? `同步 skill 失敗：${skillName}`)
        }
        continue
      }

      const result = disableSkill(
        context.pair.targetPath,
        skillName,
        previousManagedRecordMap.get(skillName),
        { projectionMode: context.pair.projectionMode, sourcePath: context.pair.sourcePath }
      )
      if (!result.ok) {
        throw new Error(result.error ?? `移除已下線 skill 失敗：${skillName}`)
      }
    }

    updateSource(context.source.id, {
      kind: context.source.kind,
      owner: context.source.owner,
      repo: context.source.repo,
      branch: context.source.branch,
      subpath: context.source.subpath,
      canonicalUrl: context.source.canonicalUrl,
      archiveUrl: context.source.archiveUrl,
      sourcePath: context.pair.sourcePath,
      resolvedCommitSha: before.remoteCommitSha,
      etag: context.source.etag,
      metadataJson: context.source.metadataJson,
      lastFetchedAt: checkedAt,
    })

    const refreshedContext = loadProjectSyncContext(pairId, projectTag)
    const stillActiveSkillNames = activeSkillNames.filter((skillName) => importedSkillNames.includes(skillName))
    const managedRecords = listManagedInstallRecords(
      listInstallRecordsByPairIdAndTag(refreshedContext.pair.id, refreshedContext.link.projectTag)
    )
    persistTargetProjectionLedger(refreshedContext, managedRecords, stillActiveSkillNames, before.remoteCommitSha)
    const report = await inspectContext(refreshedContext, {
      localCommitSha: before.remoteCommitSha,
      remoteCommitSha: before.remoteCommitSha,
      checkedAt,
      syncedAt: checkedAt,
      error: '',
    })
    await persistInspection(refreshedContext, report, {
      lastCheckedAt: checkedAt,
      lastSyncedAt: checkedAt,
      lastRemoteCommitSha: before.remoteCommitSha,
      lastSyncError: '',
    })
    return report
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    updateProjectLinkSyncFields(context.link.id, {
      lastCheckedAt: checkedAt,
      lastSyncState: 'error',
      lastSyncError: message,
    })
    throw error
  }
}

export async function repairProjectSync(pairId: number, projectTag?: string): Promise<ProjectSyncReport> {
  const context = loadProjectSyncContext(pairId, projectTag)
  const current = await getProjectSyncStatus(pairId, projectTag, { forceRemoteCheck: false })
  const syncedAt = nowEpoch()
  const installRecords = listManagedInstallRecordsByPairIdAndTag(context.pair.id, context.link.projectTag)

  const report = await repairProjectGroupTargets({
    projectTag: context.link.projectTag,
    sourcePath: context.pair.sourcePath,
    targetPath: context.pair.targetPath,
    metas: context.metas,
    managedRecords: installRecords.map((record) => ({
      skillName: record.skillName,
      installedAs: record.installedAs,
      copyMode: record.copyMode,
      containerDirName: record.containerDirName,
      managedEntriesJson: record.managedEntriesJson,
      metadataJson: record.metadataJson,
    })),
    managedSkillNamesOverride: installRecords.map((record) => record.skillName),
    activeSkillNames: current.enabledSkillNames,
    localCommitSha: context.source.resolvedCommitSha,
    remoteCommitSha: context.link.lastRemoteCommitSha,
    checkedAt: current.checkedAt,
    syncedAt,
    error: '',
  })

  persistTargetProjectionLedger(
    context,
    installRecords.length > 0
      ? installRecords
      : current.managedSkillNames.map((skillName) => ({
          skillName,
          sourceRelativePath: skillName,
          installedAs: skillName,
          installMode: 'multi-skill-repo' as const,
          sourceRootKind: 'nested-skills' as const,
          copyMode: 'directory-copy' as const,
          containerDirName: skillName,
          managedEntriesJson: '[]',
        })),
    current.enabledSkillNames,
    context.source.resolvedCommitSha
  )
  await persistInspection(context, report, {
    lastCheckedAt: current.checkedAt,
    lastSyncedAt: syncedAt,
    lastRemoteCommitSha: report.remoteCommitSha,
    lastSyncError: '',
  })

  return report
}
