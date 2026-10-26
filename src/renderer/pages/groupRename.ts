import type { InstallRecord } from '../../shared/importTypes'
import type { SkillItem } from '../../shared/types'

function parseTags(raw: string): string[] {
  return raw
    .split(/[\s,\n]+/)
    .map((value) => value.replace(/^#+/, '').trim())
    .filter(Boolean)
}

export function normalizeSingleGroupTagInput(raw: string): { value: string; error: 'empty' | 'multiple' | null } {
  const tags = parseTags(raw)
  if (tags.length === 0) return { value: '', error: 'empty' }
  if (tags.length > 1) return { value: '', error: 'multiple' }
  return { value: tags[0], error: null }
}

export function replaceGroupTagValue(raw: string, oldTag: string, nextTag: string): string {
  const tags = parseTags(raw)
  const replaced = tags.map((tag) => (tag === oldTag ? nextTag : tag))
  return [...new Set(replaced)].join(' ')
}

export function resolveManagedProjectTagForSkills(
  skills: SkillItem[],
  installRecordMap: Map<string, InstallRecord>
): string | null {
  const managedProjectTags = [...new Set(
    skills
      .map((skill) => installRecordMap.get(skill.name))
      .filter((record): record is InstallRecord => !!record && record.managementState === 'managed')
      .map((record) => record.projectTag)
      .filter(Boolean)
  )]

  return managedProjectTags.length === 1 ? managedProjectTags[0] : null
}
