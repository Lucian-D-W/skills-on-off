import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/types'
import type { Pair, SkillMeta, SkillTargetPromotionStatus } from '../shared/types'
import type {
  CopyMode,
  GithubImportMode,
  GithubImportPreview,
  InstallRecord,
  PairProjectionMode,
  ProjectLinkRecord,
  ProjectSyncReport,
  SourceRecord,
  TargetRecord,
} from '../shared/importTypes'

const api = {
  // Pairs
  listPairs: (): Promise<Pair[]> => ipcRenderer.invoke(IPC.PAIR_LIST),
  createPair: (name: string, sourcePath: string, targetPath: string, projectionMode: PairProjectionMode): Promise<Pair> =>
    ipcRenderer.invoke(IPC.PAIR_CREATE, name, sourcePath, targetPath, projectionMode),
  updatePair: (id: number, name: string, sourcePath: string, targetPath: string, projectionMode: PairProjectionMode): Promise<Pair> =>
    ipcRenderer.invoke(IPC.PAIR_UPDATE, id, name, sourcePath, targetPath, projectionMode),
  deletePair: (id: number): Promise<void> => ipcRenderer.invoke(IPC.PAIR_DELETE, id),

  // Skills
  scanSkills: (pairId: number, sourcePath: string, targetPath: string) =>
    ipcRenderer.invoke(IPC.SKILL_SCAN, pairId, sourcePath, targetPath),
  enableSkill: (pairId: number, sourcePath: string, targetPath: string, skillName: string) =>
    ipcRenderer.invoke(IPC.SKILL_ENABLE, pairId, sourcePath, targetPath, skillName),
  disableSkill: (pairId: number, targetPath: string, skillName: string) =>
    ipcRenderer.invoke(IPC.SKILL_DISABLE, pairId, targetPath, skillName),
  getSkillTargetPromotionStatus: (pairId: number, skillName: string): Promise<SkillTargetPromotionStatus> =>
    ipcRenderer.invoke(IPC.SKILL_TARGET_PROMOTION_STATUS, pairId, skillName),
  promoteSkillTargetToSource: (pairId: number, skillName: string): Promise<SkillTargetPromotionStatus> =>
    ipcRenderer.invoke(IPC.SKILL_TARGET_PROMOTE_TO_SOURCE, pairId, skillName),

  // Meta
  saveMeta: (
    pairId: number,
    skillName: string,
    note: string,
    projectTags: string,
    funcTags: string,
    customTags: string
  ): Promise<SkillMeta> =>
    ipcRenderer.invoke(IPC.META_SAVE, pairId, skillName, note, projectTags, funcTags, customTags),
  getMeta: (pairId: number, skillName: string): Promise<SkillMeta | null> =>
    ipcRenderer.invoke(IPC.META_GET, pairId, skillName),

  // Sources / GitHub
  listSources: (): Promise<SourceRecord[]> => ipcRenderer.invoke(IPC.SOURCE_LIST),
  previewGithubImport: (url: string): Promise<GithubImportPreview> =>
    ipcRenderer.invoke(IPC.SOURCE_GITHUB_PREVIEW, url),
  importGithubProject: (
    name: string,
    githubUrl: string,
    targetPath: string,
    importMode: GithubImportMode,
    projectionMode: PairProjectionMode
  ): Promise<Pair> =>
    ipcRenderer.invoke(IPC.SOURCE_GITHUB_IMPORT, name, githubUrl, targetPath, importMode, projectionMode),
  importGithubProjectToPair: (
    pairId: number,
    githubUrl: string,
    importMode: GithubImportMode
  ): Promise<{ projectTag: string; importedSkillNames: string[]; link: ProjectLinkRecord }> =>
    ipcRenderer.invoke(IPC.SOURCE_GITHUB_IMPORT_TO_PAIR, pairId, githubUrl, importMode),

  // Project links
  getProjectLink: (pairId: number): Promise<ProjectLinkRecord | null> =>
    ipcRenderer.invoke(IPC.PROJECT_LINK_GET, pairId),
  listProjectLinks: (pairId: number): Promise<ProjectLinkRecord[]> =>
    ipcRenderer.invoke(IPC.PROJECT_LINK_LIST, pairId),
  getProjectLinkByTag: (pairId: number, projectTag: string): Promise<ProjectLinkRecord | null> =>
    ipcRenderer.invoke(IPC.PROJECT_LINK_GET_TAG, pairId, projectTag),
  linkProjectToGithub: (
    pairId: number,
    projectTag: string,
    githubUrl: string,
    skillNames: string[]
  ): Promise<ProjectLinkRecord> =>
    ipcRenderer.invoke(IPC.PROJECT_LINK_GITHUB, pairId, projectTag, githubUrl, skillNames),
  getProjectSyncStatus: (pairId: number, projectTag?: string): Promise<ProjectSyncReport> =>
    ipcRenderer.invoke(IPC.PROJECT_SYNC_STATUS, pairId, projectTag),
  checkProjectSync: (pairId: number, projectTag?: string): Promise<ProjectSyncReport> =>
    ipcRenderer.invoke(IPC.PROJECT_SYNC_CHECK, pairId, projectTag),
  updateProjectSync: (pairId: number, projectTag?: string): Promise<ProjectSyncReport> =>
    ipcRenderer.invoke(IPC.PROJECT_SYNC_UPDATE, pairId, projectTag),
  repairProjectSync: (pairId: number, projectTag?: string): Promise<ProjectSyncReport> =>
    ipcRenderer.invoke(IPC.PROJECT_SYNC_REPAIR, pairId, projectTag),
  listInstallRecords: (pairId: number): Promise<InstallRecord[]> =>
    ipcRenderer.invoke(IPC.INSTALL_RECORD_LIST, pairId),
  removeManagedSkill: (pairId: number, projectTag: string, skillName: string): Promise<void> =>
    ipcRenderer.invoke(IPC.MANAGEMENT_REMOVE_SKILL, pairId, projectTag, skillName),
  removeManagedGroup: (pairId: number, projectTag: string): Promise<void> =>
    ipcRenderer.invoke(IPC.MANAGEMENT_REMOVE_GROUP, pairId, projectTag),

  // Targets
  listTargets: (pairId: number): Promise<TargetRecord[]> =>
    ipcRenderer.invoke(IPC.TARGET_LIST, pairId),
  upsertTarget: (
    pairId: number,
    kind: TargetRecord['kind'],
    rootPath: string,
    layoutVersion: string,
    agentName: string,
    metadataJson: string
  ): Promise<TargetRecord> =>
    ipcRenderer.invoke(IPC.TARGET_UPSERT, pairId, kind, rootPath, layoutVersion, agentName, metadataJson),

  // Folder picker
  pickFolder: (): Promise<string | null> => ipcRenderer.invoke(IPC.PICK_FOLDER)
}

contextBridge.exposeInMainWorld('skillApi', api)

export type SkillApi = typeof api
