export type SourceKind = 'local' | 'github-archive'
export type TargetKind = 'codex' | 'custom-directory'
export type ProjectLinkStatus = 'linked' | 'imported' | 'detached'
export type ProjectionState = 'active' | 'inactive' | 'error'
export type UpdateState = 'not-synced' | 'up-to-date' | 'update-available' | 'error'
export type SyncHealthState = 'healthy' | 'repair-needed' | 'error'
export type InstallMode = 'single-root-skill' | 'multi-skill-repo' | 'subpath-skill-repo' | 'content-repo'
export type SourceRootKind = 'root-skill' | 'nested-skills' | 'subpath-skill' | 'content-root'
export type InstallManagementState = 'managed' | 'removed'
export type CopyMode = 'directory-copy' | 'directory-contents-copy' | 'agent-files-copy'
export type PairProjectionMode = 'directory-copy' | 'directory-contents-copy'
export type GithubImportMode = 'skills-import' | CopyMode

export interface SourceRecord {
  id: number
  kind: SourceKind
  owner: string
  repo: string
  branch: string
  subpath: string
  canonicalUrl: string
  archiveUrl: string
  sourcePath: string
  resolvedCommitSha: string
  etag: string
  metadataJson: string
  lastFetchedAt: number
  createdAt: number
  updatedAt: number
}

export interface ProjectLinkRecord {
  id: number
  pairId: number
  sourceId: number
  sourceKind: SourceKind
  projectTag: string
  status: ProjectLinkStatus
  lastCheckedAt: number
  lastSyncedAt: number
  lastRemoteCommitSha: string
  lastSyncState: string
  lastSyncError: string
  createdAt: number
  updatedAt: number
}

export interface TargetRecord {
  id: number
  pairId: number
  kind: TargetKind
  rootPath: string
  layoutVersion: string
  agentName: string
  metadataJson: string
  createdAt: number
  updatedAt: number
}

export interface TargetProjectionRecord {
  id: number
  targetId: number
  skillName: string
  sourceRelativePath: string
  targetRelativePath: string
  state: ProjectionState
  lastProjectedAt: number
  lastSourceVersion: string
  metadataJson: string
}

export interface InstallRecord {
  id: number
  pairId: number
  sourceId: number
  projectTag: string
  skillName: string
  sourceRelativePath: string
  installedAs: string
  installMode: InstallMode
  installReason: string
  sourceRootKind: SourceRootKind
  copyMode: CopyMode
  containerDirName: string
  managedEntriesJson: string
  isRootSkillWrapped: number
  managementState: InstallManagementState
  removedAt: number
  removalScope: string
  metadataJson: string
  createdAt: number
  updatedAt: number
}

export interface GithubImportRequest {
  url: string
}

export interface GithubImportParsed {
  owner: string
  repo: string
  branch: string
  subpath: string
  canonicalUrl: string
  archiveUrl: string
}

export interface GithubImportPreview extends GithubImportParsed {
  defaultProjectTag: string
  suggestedName: string
  cacheKey: string
}

export interface ProjectUpdateStatus {
  pairId: number
  sourceId: number
  state: UpdateState
  localCommitSha: string
  remoteCommitSha: string
  checkedAt: number
  error: string
}

export interface ProjectSyncReport {
  projectTag: string
  updateState: UpdateState
  healthState: SyncHealthState
  localCommitSha: string
  remoteCommitSha: string
  checkedAt: number
  syncedAt: number
  sourceSkillNames: string[]
  managedSkillNames: string[]
  enabledSkillNames: string[]
  staleSkillNames: string[]
  orphanedTargetSkillNames: string[]
  error: string
}
