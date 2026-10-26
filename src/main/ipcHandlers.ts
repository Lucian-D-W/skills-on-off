import fs from 'fs/promises'
import { app, dialog, ipcMain } from 'electron'
import path from 'path'
import { IPC } from '../shared/types'
import { getManagedInstallRecordByPairIdAndSkillName, listInstallRecordsByPairId, listManagedInstallRecordsByPairId } from './installRecordRepository'
import { createPair, deletePair, getPair, listPairs, updatePair } from './pairRepository'
import { getSkillMeta, listSkillMetas, saveSkillMeta } from './skillMetaRepository'
import { scanSkills, enableSkill, disableSkill } from './fileOps'
import { resolveGithubImportPreview } from './githubSource'
import { removeManagedProjectGroup, removeManagedSkill } from './managementRemovalService'
import { getSkillTargetPromotionStatusForPair, promoteSkillTargetToSourceForPair } from './targetPromotionService'
import {
  applyGroupTagToSkills,
  getProjectLink,
  getProjectLinkForTag,
  importProjectIntoPair,
  linkProjectGroupToGithub,
  listProjectLinks,
} from './projectLinking'
import { getProjectSyncStatus, repairProjectSync, updateProjectFromGithub } from './projectSyncService'
import { listRegisteredSources } from './sourceRegistry'
import { ensureDefaultTarget, listPairTargets } from './targetRegistry'
import { upsertTarget } from './targetRepository'
import type { GithubImportMode, PairProjectionMode } from '../shared/importTypes'

export function registerHandlers() {
  // ── Pair ──────────────────────────────────────────────────────────
  ipcMain.handle(IPC.PAIR_LIST, () => listPairs())

  ipcMain.handle(IPC.PAIR_CREATE, (_e, name: string, sourcePath: string, targetPath: string, projectionMode: PairProjectionMode = 'directory-copy') =>
    createPair(name, sourcePath, targetPath, projectionMode)
  )

  ipcMain.handle(
    IPC.PAIR_UPDATE,
    (_e, id: number, name: string, sourcePath: string, targetPath: string, projectionMode: PairProjectionMode = 'directory-copy') =>
      updatePair(id, name, sourcePath, targetPath, projectionMode)
  )

  ipcMain.handle(IPC.PAIR_DELETE, (_e, id: number) => deletePair(id))

  // ── Skill scan ────────────────────────────────────────────────────
  ipcMain.handle(IPC.SKILL_SCAN, (_e, pairId: number, sourcePath: string, targetPath: string) => {
    const pair = getPair(pairId)
    const metas = listSkillMetas(pairId)
    const installRecords = listManagedInstallRecordsByPairId(pairId)
    return scanSkills({ sourcePath, targetPath, metas, installRecords, projectionMode: pair?.projectionMode })
  })

  // ── Enable / disable ──────────────────────────────────────────────
  ipcMain.handle(
    IPC.SKILL_ENABLE,
    (_e, pairId: number, sourcePath: string, targetPath: string, skillName: string) => {
      const pair = getPair(pairId)
      return enableSkill(
        sourcePath,
        targetPath,
        skillName,
        getManagedInstallRecordByPairIdAndSkillName(pairId, skillName) ?? undefined,
        { projectionMode: pair?.projectionMode }
      )
    }
  )

  ipcMain.handle(IPC.SKILL_DISABLE, (_e, pairId: number, targetPath: string, skillName: string) => {
    const pair = getPair(pairId)
    return disableSkill(
      targetPath,
      skillName,
      getManagedInstallRecordByPairIdAndSkillName(pairId, skillName) ?? undefined,
      { projectionMode: pair?.projectionMode, sourcePath: pair?.sourcePath }
    )
  })
  ipcMain.handle(IPC.SKILL_TARGET_PROMOTION_STATUS, (_e, pairId: number, skillName: string) =>
    getSkillTargetPromotionStatusForPair(pairId, skillName)
  )
  ipcMain.handle(IPC.SKILL_TARGET_PROMOTE_TO_SOURCE, (_e, pairId: number, skillName: string) =>
    promoteSkillTargetToSourceForPair(pairId, skillName)
  )

  // ── Meta ──────────────────────────────────────────────────────────
  ipcMain.handle(
    IPC.META_SAVE,
    (
      _e,
      pairId: number,
      skillName: string,
      note: string,
      projectTags: string,
      funcTags: string,
      customTags: string
    ) => saveSkillMeta(pairId, skillName, note, projectTags, funcTags, customTags)
  )

  ipcMain.handle(IPC.META_GET, (_e, pairId: number, skillName: string) =>
    getSkillMeta(pairId, skillName)
  )

  // ── Sources / GitHub ──────────────────────────────────────────────
  ipcMain.handle(IPC.SOURCE_LIST, () => listRegisteredSources())
  ipcMain.handle(IPC.SOURCE_GITHUB_PREVIEW, async (_e, url: string) => resolveGithubImportPreview(url))
  ipcMain.handle(
    IPC.SOURCE_GITHUB_IMPORT,
    async (
      _e,
      name: string,
      githubUrl: string,
      targetPath: string,
      importMode: GithubImportMode = 'skills-import',
      projectionMode: PairProjectionMode = 'directory-copy'
    ) => {
      const pairSourcePath = path.join(
        app.getPath('userData'),
        'pair-sources',
        `${Date.now()}-${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'imported'}`
      )
      await fs.mkdir(pairSourcePath, { recursive: true })
      const pair = createPair(name, pairSourcePath, targetPath, projectionMode)
      ensureDefaultTarget(pair)
      await importProjectIntoPair(pair, githubUrl, importMode)
      return pair
    }
  )
  ipcMain.handle(
    IPC.SOURCE_GITHUB_IMPORT_TO_PAIR,
    async (_e, pairId: number, githubUrl: string, importMode: GithubImportMode = 'skills-import') => {
      const pair = getPair(pairId)
      if (!pair) throw new Error(`Pair 不存在：${pairId}`)
      return importProjectIntoPair(pair, githubUrl, importMode)
    }
  )
  
  ipcMain.handle(
    IPC.PROJECT_LINK_GITHUB,
    async (_e, pairId: number, projectTag: string, githubUrl: string, skillNames: string[]) => {
      const pair = getPair(pairId)
      if (!pair) throw new Error(`Pair 不存在：${pairId}`)
      const link = await linkProjectGroupToGithub(pair, projectTag, githubUrl, skillNames)
      if (skillNames.length > 0) {
        applyGroupTagToSkills(pair, skillNames, link.projectTag)
      }
      return link
    }
  )

  // ── Project links ─────────────────────────────────────────────────
  ipcMain.handle(IPC.PROJECT_LINK_GET, (_e, pairId: number) => getProjectLink(pairId))
  ipcMain.handle(IPC.PROJECT_LINK_LIST, (_e, pairId: number) => listProjectLinks(pairId))
  ipcMain.handle(IPC.PROJECT_LINK_GET_TAG, (_e, pairId: number, projectTag: string) =>
    getProjectLinkForTag(pairId, projectTag)
  )
  ipcMain.handle(IPC.PROJECT_SYNC_STATUS, (_e, pairId: number, projectTag?: string) =>
    getProjectSyncStatus(pairId, projectTag, { forceRemoteCheck: false })
  )
  ipcMain.handle(IPC.PROJECT_SYNC_CHECK, (_e, pairId: number, projectTag?: string) =>
    getProjectSyncStatus(pairId, projectTag, { forceRemoteCheck: true })
  )
  ipcMain.handle(IPC.PROJECT_SYNC_UPDATE, (_e, pairId: number, projectTag?: string) =>
    updateProjectFromGithub(pairId, projectTag)
  )
  ipcMain.handle(IPC.PROJECT_SYNC_REPAIR, (_e, pairId: number, projectTag?: string) =>
    repairProjectSync(pairId, projectTag)
  )
  ipcMain.handle(IPC.INSTALL_RECORD_LIST, (_e, pairId: number) => listInstallRecordsByPairId(pairId))
  ipcMain.handle(IPC.MANAGEMENT_REMOVE_SKILL, (_e, pairId: number, projectTag: string, skillName: string) =>
    removeManagedSkill(pairId, projectTag, skillName)
  )
  ipcMain.handle(IPC.MANAGEMENT_REMOVE_GROUP, (_e, pairId: number, projectTag: string) =>
    removeManagedProjectGroup(pairId, projectTag)
  )

  // ── Targets ───────────────────────────────────────────────────────
  ipcMain.handle(IPC.TARGET_LIST, (_e, pairId: number) => {
    const pair = getPair(pairId)
    if (!pair) throw new Error(`Pair 不存在：${pairId}`)
    return listPairTargets(pair)
  })
  ipcMain.handle(
    IPC.TARGET_UPSERT,
    (_e, pairId: number, kind: string, rootPath: string, layoutVersion: string, agentName: string, metadataJson: string) =>
      upsertTarget({ pairId, kind: kind as 'codex' | 'custom-directory', rootPath, layoutVersion, agentName, metadataJson })
  )

  // ── Folder picker ─────────────────────────────────────────────────
  ipcMain.handle(IPC.PICK_FOLDER, async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.canceled ? null : result.filePaths[0]
  })
}
