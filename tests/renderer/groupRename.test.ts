import { describe, expect, test } from 'vitest'
import type { InstallRecord } from '../../src/shared/importTypes'
import type { SkillItem } from '../../src/shared/types'
import {
  normalizeSingleGroupTagInput,
  replaceGroupTagValue,
  resolveManagedProjectTagForSkills,
} from '../../src/renderer/pages/groupRename'

function makeSkill(name: string): SkillItem {
  return {
    name,
    enabled: false,
    orphan: false,
    meta: null,
  }
}

function makeInstallRecord(skillName: string, projectTag: string, managementState: InstallRecord['managementState'] = 'managed'): InstallRecord {
  return {
    id: 1,
    pairId: 1,
    sourceId: 1,
    projectTag,
    skillName,
    sourceRelativePath: skillName,
    installedAs: skillName,
    installMode: 'multi-skill-repo',
    installReason: '',
    sourceRootKind: 'nested-skills',
    copyMode: 'directory-copy',
    containerDirName: skillName,
    managedEntriesJson: '[]',
    isRootSkillWrapped: 0,
    managementState,
    removedAt: 0,
    removalScope: '',
    metadataJson: '{}',
    createdAt: 0,
    updatedAt: 0,
  }
}

describe('normalizeSingleGroupTagInput', () => {
  test('normalizes a leading hash away', () => {
    expect(normalizeSingleGroupTagInput('#openai-skills')).toEqual({ value: 'openai-skills', error: null })
  })

  test('rejects blank and multi-tag values', () => {
    expect(normalizeSingleGroupTagInput('   ')).toEqual({ value: '', error: 'empty' })
    expect(normalizeSingleGroupTagInput('openai skills')).toEqual({ value: '', error: 'multiple' })
  })
})

describe('replaceGroupTagValue', () => {
  test('replaces only the matching group tag and preserves other tags', () => {
    expect(replaceGroupTagValue('khazix-skills 写作', 'khazix-skills', 'openai-skills')).toBe('openai-skills 写作')
  })

  test('deduplicates if the target tag already exists', () => {
    expect(replaceGroupTagValue('khazix-skills openai-skills', 'khazix-skills', 'openai-skills')).toBe('openai-skills')
  })
})

describe('resolveManagedProjectTagForSkills', () => {
  test('returns the shared underlying managed projectTag for a renamed group', () => {
    const skills = [makeSkill('a'), makeSkill('b')]
    const installRecordMap = new Map<string, InstallRecord>([
      ['a', makeInstallRecord('a', 'khazix-skills')],
      ['b', makeInstallRecord('b', 'khazix-skills')],
    ])

    expect(resolveManagedProjectTagForSkills(skills, installRecordMap)).toBe('khazix-skills')
  })

  test('returns null when skills map to mixed or missing managed project tags', () => {
    const skills = [makeSkill('a'), makeSkill('b')]
    const installRecordMap = new Map<string, InstallRecord>([
      ['a', makeInstallRecord('a', 'khazix-skills')],
      ['b', makeInstallRecord('b', 'openai-skills')],
    ])

    expect(resolveManagedProjectTagForSkills(skills, installRecordMap)).toBeNull()
  })
})
