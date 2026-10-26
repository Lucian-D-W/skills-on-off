import { describe, expect, test } from 'vitest'
import type { SkillItem, SkillMeta } from '../../src/shared/types'
import {
  buildGroups,
  copyModeLabel,
  countTags,
  groupState,
  healthStateLabel,
  installModeLabel,
  managedEntriesPreview,
  managementStateLabel,
  mergeTags,
  normTags,
  parseManagedEntriesJson,
  parseTags,
  removeTags,
  shortCommit,
  sourceRootKindLabel,
  tagFieldLabel,
  tagsPreview,
  updateStateLabel,
} from '../../src/renderer/pages/pairDetailModel'

function makeSkill(name: string, overrides: Partial<SkillItem> = {}): SkillItem {
  return {
    name,
    enabled: false,
    orphan: false,
    meta: null,
    ...overrides,
  }
}

function makeMeta(overrides: Partial<SkillMeta> = {}): SkillMeta {
  return {
    id: 1,
    pairId: 1,
    skillName: 'skill',
    note: '',
    projectTags: '',
    funcTags: '',
    customTags: '',
    lastTargetPromotedAt: 0,
    ...overrides,
  }
}

const t = (key: string, vars?: Record<string, string | number>) => {
  if (!vars) return key
  return `${key}:${JSON.stringify(vars)}`
}

describe('tag helpers', () => {
  test('parses hashes, commas, whitespace, and blank entries', () => {
    expect(parseTags(' #alpha, beta\n\n#gamma   ')).toEqual(['alpha', 'beta', 'gamma'])
  })

  test('normalizes, merges, deduplicates, and removes tags', () => {
    expect(normTags(' #alpha, beta\n#alpha ')).toBe('alpha beta alpha')
    expect(mergeTags('alpha beta', '#beta gamma')).toBe('alpha beta gamma')
    expect(removeTags('alpha beta gamma', 'beta #missing')).toBe('alpha gamma')
  })
})

describe('group helpers', () => {
  test('detects all-off, all-on, and mixed group state', () => {
    expect(groupState([])).toBe('all-off')
    expect(groupState([makeSkill('a'), makeSkill('b')])).toBe('all-off')
    expect(groupState([makeSkill('a', { enabled: true }), makeSkill('b', { enabled: true })])).toBe('all-on')
    expect(groupState([makeSkill('a', { enabled: true }), makeSkill('b')])).toBe('mixed')
  })

  test('groups by active tab, ignores orphan skills, and adds uncategorized skills', () => {
    const alpha = makeSkill('alpha', { meta: makeMeta({ projectTags: 'tools shared' }) })
    const beta = makeSkill('beta', { meta: makeMeta({ projectTags: 'tools' }) })
    const uncategorized = makeSkill('uncategorized', { meta: makeMeta() })
    const orphan = makeSkill('orphan', { orphan: true, meta: makeMeta({ projectTags: 'tools' }) })

    const groups = buildGroups([alpha, beta, uncategorized, orphan], 'project', 'Uncategorized')

    expect([...groups.keys()]).toEqual(['shared', 'tools', 'Uncategorized'])
    expect(groups.get('tools')?.map((skill) => skill.name)).toEqual(['alpha', 'beta'])
    expect(groups.get('Uncategorized')?.map((skill) => skill.name)).toEqual(['uncategorized'])
  })

  test('returns an empty group map for non-category tabs', () => {
    expect([...buildGroups([makeSkill('a')], 'all', 'Uncategorized').entries()]).toEqual([])
    expect([...buildGroups([makeSkill('a')], 'enabled', 'Uncategorized').entries()]).toEqual([])
  })

  test('counts and previews tags from all tag fields', () => {
    const skill = makeSkill('tagged', {
      meta: makeMeta({
        projectTags: 'project',
        funcTags: 'write review',
        customTags: 'fast extra',
      }),
    })

    expect(countTags(skill)).toBe(5)
    expect(tagsPreview(skill)).toEqual(['project', 'write', 'review'])
    expect(countTags(makeSkill('plain'))).toBe(0)
    expect(tagsPreview(makeSkill('plain'))).toEqual([])
  })
})

describe('managed entries helpers', () => {
  test('parses valid string entries and falls back for invalid JSON or non-arrays', () => {
    expect(parseManagedEntriesJson('["a", "", 3, "b"]')).toEqual(['a', 'b'])
    expect(parseManagedEntriesJson('')).toEqual([])
    expect(parseManagedEntriesJson('{ "a": true }')).toEqual([])
    expect(parseManagedEntriesJson('not json')).toEqual([])
  })

  test('previews up to three managed entries and summarizes the rest', () => {
    expect(managedEntriesPreview(['a', 'b', 'c'], t)).toBe('a、b、c')
    expect(managedEntriesPreview(['a', 'b', 'c', 'd', 'e'], t)).toBe('previewPlusMore:{"preview":"a、b、c","count":2}')
  })
})

describe('label helpers', () => {
  test('maps project sync states to translation keys', () => {
    expect(updateStateLabel('not-synced', t)).toBe('noRemoteBaseline')
    expect(updateStateLabel('update-available', t)).toBe('githubUpdateAvailable')
    expect(updateStateLabel('up-to-date', t)).toBe('upToDateWithGithub')
    expect(updateStateLabel('error', t)).toBe('checkFailed')

    expect(healthStateLabel('healthy', t)).toBe('targetHealthy')
    expect(healthStateLabel('repair-needed', t)).toBe('targetNeedsRepair')
    expect(healthStateLabel('error', t)).toBe('syncStatusError')
  })

  test('maps install, source, management, copy mode, and tag field labels', () => {
    expect(installModeLabel('single-root-skill', t)).toBe('singleRootSkillRepo')
    expect(installModeLabel('multi-skill-repo', t)).toBe('multiSkillRepo')
    expect(installModeLabel('subpath-skill-repo', t)).toBe('subpathSkillRepo')

    expect(sourceRootKindLabel('root-skill', t)).toBe('repoRootIsSkill')
    expect(sourceRootKindLabel('nested-skills', t)).toBe('nestedSkills')
    expect(sourceRootKindLabel('subpath-skill', t)).toBe('subpathIsSkill')

    expect(managementStateLabel('managed', t)).toBe('stillManaged')
    expect(managementStateLabel('removed', t)).toBe('managementRemoved')

    expect(copyModeLabel('directory-copy', t)).toBe('wholeFolder')
    expect(copyModeLabel('directory-contents-copy', t)).toBe('folderContents')
    expect(copyModeLabel('agent-files-copy', t)).toBe('commonAgentFiles')

    expect(tagFieldLabel('projectTags', t)).toBe('projectTags')
    expect(tagFieldLabel('funcTags', t)).toBe('functionTags')
    expect(tagFieldLabel('customTags', t)).toBe('customTags')
  })

  test('formats commit labels', () => {
    expect(shortCommit('abcdef123456', 'none')).toBe('abcdef1')
    expect(shortCommit('', 'none')).toBe('none')
  })
})
