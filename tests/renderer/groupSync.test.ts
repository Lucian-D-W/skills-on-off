import { describe, expect, test } from 'vitest'
import type { SkillItem } from '../../src/shared/types'
import { getDesyncableGroupSkills, getSyncableGroupSkills } from '../../src/renderer/pages/pairDetailGroupSync'

function makeSkill(name: string, overrides: Partial<SkillItem> = {}): SkillItem {
  return {
    name,
    enabled: false,
    orphan: false,
    meta: null,
    ...overrides,
  }
}

describe('getSyncableGroupSkills', () => {
  test('returns only source-backed disabled skills that are not already toggling', () => {
    const skills = [
      makeSkill('a'),
      makeSkill('b', { enabled: true }),
      makeSkill('c', { orphan: true }),
      makeSkill('d'),
    ]

    expect(getSyncableGroupSkills(skills, new Set(['d']))).toEqual([skills[0]])
  })

  test('returns empty array when every skill is already enabled, orphaned, or toggling', () => {
    const skills = [
      makeSkill('a', { enabled: true }),
      makeSkill('b', { orphan: true }),
      makeSkill('c'),
    ]

    expect(getSyncableGroupSkills(skills, new Set(['c']))).toEqual([])
  })
})

describe('getDesyncableGroupSkills', () => {
  test('returns only enabled source-backed skills that are not already toggling', () => {
    const skills = [
      makeSkill('a', { enabled: true }),
      makeSkill('b'),
      makeSkill('c', { orphan: true, enabled: true }),
      makeSkill('d', { enabled: true }),
    ]

    expect(getDesyncableGroupSkills(skills, new Set(['d']))).toEqual([skills[0]])
  })
})
