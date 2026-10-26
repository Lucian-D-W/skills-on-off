import type { PairProjectionMode } from './importTypes'

export interface Pair {
  id: number
  name: string
  sourcePath: string
  targetPath: string
  projectionMode: PairProjectionMode
  createdAt: number
}

export interface SkillMeta {
  id: number
  pairId: number
  skillName: string
  note: string
  projectTags: string   // space-separated, no #
  funcTags: string
  customTags: string
  lastTargetPromotedAt: number
}

export interface SkillItem {
  name: string
  enabled: boolean      // derived from target folder scan
  orphan: boolean       // in target but NOT in source
  meta: SkillMeta | null
}

export interface ScanResult {
  skills: SkillItem[]
  error?: string
}

export interface SkillTargetPromotionStatus {
  canPromote: boolean
  targetExists: boolean
  targetDiffersFromSource: boolean
  lastTargetPromotedAt: number
  unsupportedReason: string
}

// IPC channel names
export const IPC = {
  // Pairs
  PAIR_LIST:    'pair:list',
  PAIR_CREATE:  'pair:create',
  PAIR_UPDATE:  'pair:update',
  PAIR_DELETE:  'pair:delete',
  // Skills
  SKILL_SCAN:   'skill:scan',
  SKILL_ENABLE: 'skill:enable',
  SKILL_DISABLE:'skill:disable',
  SKILL_TARGET_PROMOTION_STATUS: 'skill:target-promotion-status',
  SKILL_TARGET_PROMOTE_TO_SOURCE: 'skill:target-promote-to-source',
  // Meta
  META_SAVE:    'meta:save',
  META_GET:     'meta:get',
  // Sources / GitHub
  SOURCE_GITHUB_PREVIEW: 'source:github:preview',
  SOURCE_GITHUB_IMPORT: 'source:github:import',
  SOURCE_GITHUB_IMPORT_TO_PAIR: 'source:github:import-to-pair',
  SOURCE_LIST: 'source:list',
  // Project links
  PROJECT_LINK_GET: 'project-link:get',
  PROJECT_LINK_LIST: 'project-link:list',
  PROJECT_LINK_GET_TAG: 'project-link:get-tag',
  PROJECT_LINK_GITHUB: 'project-link:github',
  PROJECT_SYNC_STATUS: 'project-sync:status',
  PROJECT_SYNC_CHECK: 'project-sync:check',
  PROJECT_SYNC_UPDATE: 'project-sync:update',
  PROJECT_SYNC_REPAIR: 'project-sync:repair',
  INSTALL_RECORD_LIST: 'install-record:list',
  MANAGEMENT_REMOVE_SKILL: 'management:remove-skill',
  MANAGEMENT_REMOVE_GROUP: 'management:remove-group',
  // Targets
  TARGET_LIST: 'target:list',
  TARGET_UPSERT: 'target:upsert',
  // Folder picker
  PICK_FOLDER:  'dialog:pickFolder'
} as const
