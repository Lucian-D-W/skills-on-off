import type { InstallRecord, ProjectSyncReport } from '../../shared/importTypes'
import type { SkillItem, SkillMeta } from '../../shared/types'
import type { MessageKey } from '../store/i18nMessages'
import type { PairDetailTab } from './pairDetailTabs'

export type TagField = 'projectTags' | 'funcTags' | 'customTags'
export type BatchAction = 'append' | 'replace' | 'remove'

export interface DetailForm {
  note: string
  projectTags: string
  funcTags: string
  customTags: string
}

export const emptyDetailForm: DetailForm = {
  note: '',
  projectTags: '',
  funcTags: '',
  customTags: '',
}

export const TAB_FIELD_MAP: Record<Exclude<PairDetailTab, 'all' | 'enabled'>, TagField> = {
  project: 'projectTags',
  func: 'funcTags',
  custom: 'customTags',
}

type MessageFormatter = (key: MessageKey, vars?: Record<string, string | number>) => string
type MessageLookup = (key: MessageKey) => string

export function parseTags(raw: string): string[] {
  return raw
    .split(/[\s,\n]+/)
    .map((t) => t.replace(/^#+/, '').trim())
    .filter(Boolean)
}

export function formatEpochLabel(value: number, locale: string, fallback: string): string {
  if (!value) return fallback
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value * 1000))
}

export function shortCommit(sha: string, fallback: string): string {
  return sha ? sha.slice(0, 7) : fallback
}

export function updateStateLabel(state: ProjectSyncReport['updateState'], t: MessageFormatter): string {
  switch (state) {
    case 'not-synced':
      return t('noRemoteBaseline')
    case 'update-available':
      return t('githubUpdateAvailable')
    case 'up-to-date':
      return t('upToDateWithGithub')
    case 'error':
      return t('checkFailed')
    default:
      return state
  }
}

export function healthStateLabel(state: ProjectSyncReport['healthState'], t: MessageFormatter): string {
  switch (state) {
    case 'healthy':
      return t('targetHealthy')
    case 'repair-needed':
      return t('targetNeedsRepair')
    case 'error':
      return t('syncStatusError')
    default:
      return state
  }
}

export function installModeLabel(mode: InstallRecord['installMode'], t: MessageLookup): string {
  switch (mode) {
    case 'single-root-skill':
      return t('singleRootSkillRepo')
    case 'multi-skill-repo':
      return t('multiSkillRepo')
    case 'subpath-skill-repo':
      return t('subpathSkillRepo')
    default:
      return mode
  }
}

export function sourceRootKindLabel(kind: InstallRecord['sourceRootKind'], t: MessageLookup): string {
  switch (kind) {
    case 'root-skill':
      return t('repoRootIsSkill')
    case 'nested-skills':
      return t('nestedSkills')
    case 'subpath-skill':
      return t('subpathIsSkill')
    default:
      return kind
  }
}

export function managementStateLabel(state: InstallRecord['managementState'], t: MessageLookup): string {
  switch (state) {
    case 'managed':
      return t('stillManaged')
    case 'removed':
      return t('managementRemoved')
    default:
      return state
  }
}

export function copyModeLabel(copyMode: InstallRecord['copyMode'], t: MessageLookup): string {
  switch (copyMode) {
    case 'directory-copy':
      return t('wholeFolder')
    case 'directory-contents-copy':
      return t('folderContents')
    case 'agent-files-copy':
      return t('commonAgentFiles')
    default:
      return copyMode
  }
}

export function parseManagedEntriesJson(rawJson: string): string[] {
  if (!rawJson.trim()) return []
  try {
    const parsed = JSON.parse(rawJson) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
  } catch {
    return []
  }
}

export function managedEntriesPreview(entries: string[], t: MessageFormatter): string {
  const preview = entries.slice(0, 3).join('、')
  if (entries.length <= 3) return preview
  return t('previewPlusMore', { preview, count: entries.length - 3 })
}

export function normTags(raw: string): string {
  return parseTags(raw).join(' ')
}

export function mergeTags(base: string, extra: string): string {
  const merged = new Set([...parseTags(base), ...parseTags(extra)])
  return [...merged].join(' ')
}

export function removeTags(base: string, removed: string): string {
  const blocked = new Set(parseTags(removed))
  return parseTags(base)
    .filter((tag) => !blocked.has(tag))
    .join(' ')
}

export function groupState(skills: SkillItem[]): 'all-on' | 'all-off' | 'mixed' {
  if (!skills.length) return 'all-off'
  const on = skills.filter((s) => s.enabled).length
  return on === 0 ? 'all-off' : on === skills.length ? 'all-on' : 'mixed'
}

export function buildGroups(skills: SkillItem[], tab: PairDetailTab, uncategorizedLabel: string): Map<string, SkillItem[]> {
  const map = new Map<string, SkillItem[]>()
  if (tab === 'all' || tab === 'enabled') return map

  const field: Record<PairDetailTab, keyof SkillMeta> = {
    project: 'projectTags',
    func: 'funcTags',
    custom: 'customTags',
    all: 'note',
    enabled: 'note',
  }

  for (const skill of skills) {
    if (skill.orphan) continue

    const tags = parseTags((skill.meta?.[field[tab]] as string) ?? '')
    if (!tags.length) {
      const uncategorized = map.get(uncategorizedLabel) ?? []
      uncategorized.push(skill)
      map.set(uncategorizedLabel, uncategorized)
      continue
    }

    for (const tag of tags) {
      const bucket = map.get(tag) ?? []
      bucket.push(skill)
      map.set(tag, bucket)
    }
  }

  return new Map([...map.entries()].sort((a, b) => a[0].localeCompare(b[0])))
}

export function tagFieldLabel(field: TagField, t: MessageLookup): string {
  if (field === 'projectTags') return t('projectTags')
  if (field === 'funcTags') return t('functionTags')
  return t('customTags')
}

export function countTags(skill: SkillItem): number {
  if (!skill.meta) return 0

  return (
    parseTags(skill.meta.projectTags).length +
    parseTags(skill.meta.funcTags).length +
    parseTags(skill.meta.customTags).length
  )
}

export function tagsPreview(skill: SkillItem): string[] {
  if (!skill.meta) return []
  return [
    ...parseTags(skill.meta.projectTags),
    ...parseTags(skill.meta.funcTags),
    ...parseTags(skill.meta.customTags),
  ].slice(0, 3)
}
